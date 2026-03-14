import type { Response } from 'express'
import prisma from '../lib/prisma.js'
import type { AuthRequest } from '../types/index.js'

// 自分が所属するグループ一覧
export async function listGroups(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId

  const groups = await prisma.group.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json({ data: groups })
}

// グループ作成（作成者がownerになる）
export async function createGroup(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { name } = req.body as { name?: string }

  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  const group = await prisma.group.create({
    data: {
      name,
      members: {
        create: { userId, role: 'owner' },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  res.status(201).json({ data: group })
}

// グループ詳細取得
export async function getGroup(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { id } = req.params

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  if (!group) {
    res.status(404).json({ error: 'Group not found' })
    return
  }

  const isMember = group.members.some((m) => m.userId === userId)
  if (!isMember) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  res.json({ data: group })
}

// グループ名更新（ownerのみ）
export async function updateGroup(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { id } = req.params
  const { name } = req.body as { name?: string }

  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId: id } },
  })

  if (!member) {
    res.status(404).json({ error: 'Group not found' })
    return
  }
  if (member.role !== 'owner') {
    res.status(403).json({ error: 'Only owner can update the group' })
    return
  }

  const group = await prisma.group.update({
    where: { id },
    data: { name },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  res.json({ data: group })
}

// グループ削除（ownerのみ）
export async function deleteGroup(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { id } = req.params

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId: id } },
  })

  if (!member) {
    res.status(404).json({ error: 'Group not found' })
    return
  }
  if (member.role !== 'owner') {
    res.status(403).json({ error: 'Only owner can delete the group' })
    return
  }

  await prisma.group.delete({ where: { id } })

  res.status(204).send()
}

// メンバー追加（ownerのみ）
export async function addMember(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { id } = req.params
  const { email } = req.body as { email?: string }

  if (!email) {
    res.status(400).json({ error: 'email is required' })
    return
  }

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId: id } },
  })

  if (!member) {
    res.status(404).json({ error: 'Group not found' })
    return
  }
  if (member.role !== 'owner') {
    res.status(403).json({ error: 'Only owner can add members' })
    return
  }

  const targetUser = await prisma.user.findUnique({ where: { email } })
  if (!targetUser) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const existing = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: targetUser.id, groupId: id } },
  })
  if (existing) {
    res.status(409).json({ error: 'User is already a member' })
    return
  }

  const newMember = await prisma.groupMember.create({
    data: { userId: targetUser.id, groupId: id, role: 'member' },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  res.status(201).json({ data: newMember })
}

// メンバー削除（ownerのみ、自分自身は削除不可）
export async function removeMember(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { id, memberId } = req.params

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId: id } },
  })

  if (!member) {
    res.status(404).json({ error: 'Group not found' })
    return
  }
  if (member.role !== 'owner') {
    res.status(403).json({ error: 'Only owner can remove members' })
    return
  }
  if (memberId === userId) {
    res.status(400).json({ error: 'Owner cannot remove themselves' })
    return
  }

  const target = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: memberId, groupId: id } },
  })
  if (!target) {
    res.status(404).json({ error: 'Member not found' })
    return
  }

  await prisma.groupMember.delete({
    where: { userId_groupId: { userId: memberId, groupId: id } },
  })

  res.status(204).send()
}
