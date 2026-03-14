import type { Response } from 'express'
import prisma from '../lib/prisma.js'
import type { AuthRequest } from '../types/index.js'

// リストへのアクセス権チェック
async function canAccessList(userId: string, listId: string): Promise<boolean> {
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

// アイテム追加
export async function addGiftItem(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { listId } = req.params
  const { name, price, memo, url } = req.body as {
    name?: string
    price?: number
    memo?: string
    url?: string
  }

  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  const accessible = await canAccessList(userId, listId)
  if (!accessible) {
    res.status(404).json({ error: 'GiftList not found' })
    return
  }

  const item = await prisma.giftItem.create({
    data: {
      name,
      price: price ?? null,
      memo: memo ?? null,
      url: url ?? null,
      giftListId: listId,
    },
  })

  res.status(201).json({ data: item })
}

// アイテム更新
export async function updateGiftItem(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { listId, itemId } = req.params
  const { name, price, memo, url } = req.body as {
    name?: string
    price?: number | null
    memo?: string | null
    url?: string | null
  }

  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  const accessible = await canAccessList(userId, listId)
  if (!accessible) {
    res.status(404).json({ error: 'GiftList not found' })
    return
  }

  const existing = await prisma.giftItem.findUnique({ where: { id: itemId } })
  if (!existing || existing.giftListId !== listId) {
    res.status(404).json({ error: 'GiftItem not found' })
    return
  }

  const item = await prisma.giftItem.update({
    where: { id: itemId },
    data: { name, price, memo, url },
  })

  res.json({ data: item })
}

// アイテム削除
export async function deleteGiftItem(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { listId, itemId } = req.params

  const accessible = await canAccessList(userId, listId)
  if (!accessible) {
    res.status(404).json({ error: 'GiftList not found' })
    return
  }

  const existing = await prisma.giftItem.findUnique({ where: { id: itemId } })
  if (!existing || existing.giftListId !== listId) {
    res.status(404).json({ error: 'GiftItem not found' })
    return
  }

  await prisma.giftItem.delete({ where: { id: itemId } })
  res.status(204).send()
}
