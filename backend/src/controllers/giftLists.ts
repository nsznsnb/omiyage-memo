import type { Response } from 'express'
import prisma from '../lib/prisma.js'
import type { AuthRequest } from '../types/index.js'

// アクセス権チェック: 自分のリスト or 所属グループのリスト
async function canAccess(userId: string, listId: string): Promise<boolean> {
  const list = await prisma.giftList.findUnique({
    where: { id: listId },
    select: { userId: true, groupId: true },
  })
  if (!list) return false
  if (list.userId === userId) return true
  if (list.groupId) {
    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId: list.groupId } },
    })
    return !!member
  }
  return false
}

// GiftList一覧（groupId or userId クエリで絞り込み）
export async function listGiftLists(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { groupId } = req.query as { groupId?: string }

  if (groupId) {
    // グループのリスト: グループメンバーのみ
    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    })
    if (!member) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    const lists = await prisma.giftList.findMany({
      where: { groupId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ data: lists })
    return
  }

  // 個人リスト + 所属グループのリスト
  const memberGroups = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true },
  })
  const groupIds = memberGroups.map((m) => m.groupId)

  const lists = await prisma.giftList.findMany({
    where: {
      OR: [
        { userId },
        { groupId: { in: groupIds } },
      ],
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ data: lists })
}

// GiftList作成
export async function createGiftList(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { name, groupId } = req.body as { name?: string; groupId?: string }

  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  if (groupId) {
    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    })
    if (!member) {
      res.status(403).json({ error: 'You are not a member of this group' })
      return
    }
  }

  const list = await prisma.giftList.create({
    data: {
      name,
      groupId: groupId ?? null,
      userId: groupId ? null : userId,
    },
    include: { items: true },
  })

  res.status(201).json({ data: list })
}

// GiftList詳細（アイテム含む）
export async function getGiftList(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { id } = req.params

  const list = await prisma.giftList.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!list) {
    res.status(404).json({ error: 'GiftList not found' })
    return
  }

  const accessible = await canAccess(userId, id)
  if (!accessible) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  res.json({ data: list })
}

// GiftList更新（名前のみ）
export async function updateGiftList(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { id } = req.params
  const { name } = req.body as { name?: string }

  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  const accessible = await canAccess(userId, id)
  if (!accessible) {
    res.status(404).json({ error: 'GiftList not found' })
    return
  }

  const list = await prisma.giftList.update({
    where: { id },
    data: { name },
    include: { items: true },
  })

  res.json({ data: list })
}

// GiftList削除
export async function deleteGiftList(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { id } = req.params

  const accessible = await canAccess(userId, id)
  if (!accessible) {
    res.status(404).json({ error: 'GiftList not found' })
    return
  }

  await prisma.giftList.delete({ where: { id } })
  res.status(204).send()
}
