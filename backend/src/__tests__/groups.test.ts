import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response } from 'express'
import type { AuthRequest } from '../types/index.js'

vi.mock('../lib/prisma.js', () => ({
  default: {
    group: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    groupMember: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

import prisma from '../lib/prisma.js'
import {
  listGroups,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
} from '../controllers/groups.js'

const USER_ID = 'user-1'
const GROUP_ID = 'group-1'

const mockGroup = {
  id: GROUP_ID,
  name: 'テストグループ',
  createdAt: new Date(),
  updatedAt: new Date(),
  members: [
    {
      id: 'member-1',
      userId: USER_ID,
      groupId: GROUP_ID,
      role: 'owner',
      createdAt: new Date(),
      user: { id: USER_ID, name: 'Alice', email: 'alice@example.com' },
    },
  ],
}

const ownerMember = { id: 'member-1', userId: USER_ID, groupId: GROUP_ID, role: 'owner', createdAt: new Date() }
const regularMember = { id: 'member-2', userId: 'user-2', groupId: GROUP_ID, role: 'member', createdAt: new Date() }

function mockRes(): Response {
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() }
  return res as unknown as Response
}

function mockReq(body: Record<string, unknown> = {}, params: Record<string, string> = {}): AuthRequest {
  return { body, params, user: { userId: USER_ID, email: 'alice@example.com' } } as unknown as AuthRequest
}

beforeEach(() => vi.clearAllMocks())

// ─── listGroups ──────────────────────────────────────────────────────────────
describe('GET /api/v1/groups', () => {
  it('自分が所属するグループ一覧を返す', async () => {
    vi.mocked(prisma.group.findMany).mockResolvedValue([mockGroup])

    const res = mockRes()
    await listGroups(mockReq(), res)

    expect(prisma.group.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { members: { some: { userId: USER_ID } } } }),
    )
    expect(res.json).toHaveBeenCalledWith({ data: [mockGroup] })
  })
})

// ─── createGroup ─────────────────────────────────────────────────────────────
describe('POST /api/v1/groups', () => {
  it('nameが未指定の場合は400を返す', async () => {
    const res = mockRes()
    await createGroup(mockReq({}), res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'name is required' })
  })

  it('グループを作成して201を返す', async () => {
    vi.mocked(prisma.group.create).mockResolvedValue(mockGroup)

    const res = mockRes()
    await createGroup(mockReq({ name: 'テストグループ' }), res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ data: mockGroup })
  })
})

// ─── getGroup ─────────────────────────────────────────────────────────────────
describe('GET /api/v1/groups/:id', () => {
  it('グループが存在しない場合は404を返す', async () => {
    vi.mocked(prisma.group.findUnique).mockResolvedValue(null)

    const res = mockRes()
    await getGroup(mockReq({}, { id: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('メンバーでない場合は403を返す', async () => {
    vi.mocked(prisma.group.findUnique).mockResolvedValue({ ...mockGroup, members: [] })

    const res = mockRes()
    await getGroup(mockReq({}, { id: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('メンバーであればグループ詳細を返す', async () => {
    vi.mocked(prisma.group.findUnique).mockResolvedValue(mockGroup)

    const res = mockRes()
    await getGroup(mockReq({}, { id: GROUP_ID }), res)

    expect(res.json).toHaveBeenCalledWith({ data: mockGroup })
  })
})

// ─── updateGroup ──────────────────────────────────────────────────────────────
describe('PUT /api/v1/groups/:id', () => {
  it('nameが未指定の場合は400を返す', async () => {
    const res = mockRes()
    await updateGroup(mockReq({}, { id: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('メンバーでない場合は404を返す', async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(null)

    const res = mockRes()
    await updateGroup(mockReq({ name: '新しい名前' }, { id: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('ownerでない場合は403を返す', async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(regularMember)

    const res = mockRes()
    await updateGroup(mockReq({ name: '新しい名前' }, { id: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('ownerはグループ名を更新できる', async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(ownerMember)
    vi.mocked(prisma.group.update).mockResolvedValue({ ...mockGroup, name: '新しい名前' })

    const res = mockRes()
    await updateGroup(mockReq({ name: '新しい名前' }, { id: GROUP_ID }), res)

    expect(prisma.group.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: GROUP_ID }, data: { name: '新しい名前' } }),
    )
    expect(res.json).toHaveBeenCalled()
  })
})

// ─── deleteGroup ──────────────────────────────────────────────────────────────
describe('DELETE /api/v1/groups/:id', () => {
  it('ownerでない場合は403を返す', async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(regularMember)

    const res = mockRes()
    await deleteGroup(mockReq({}, { id: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('ownerはグループを削除して204を返す', async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(ownerMember)
    vi.mocked(prisma.group.delete).mockResolvedValue(mockGroup)

    const res = mockRes()
    await deleteGroup(mockReq({}, { id: GROUP_ID }), res)

    expect(prisma.group.delete).toHaveBeenCalledWith({ where: { id: GROUP_ID } })
    expect(res.status).toHaveBeenCalledWith(204)
  })
})

// ─── addMember ────────────────────────────────────────────────────────────────
describe('POST /api/v1/groups/:id/members', () => {
  it('emailが未指定の場合は400を返す', async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(ownerMember)

    const res = mockRes()
    await addMember(mockReq({}, { id: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('存在しないユーザーは404を返す', async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(ownerMember)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = mockRes()
    await addMember(mockReq({ email: 'notfound@example.com' }, { id: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' })
  })

  it('既にメンバーのユーザーは409を返す', async () => {
    vi.mocked(prisma.groupMember.findUnique)
      .mockResolvedValueOnce(ownerMember)   // 権限チェック
      .mockResolvedValueOnce(regularMember) // 重複チェック
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-2', email: 'bob@example.com', name: 'Bob',
      passwordHash: 'hash', createdAt: new Date(), updatedAt: new Date(),
    })

    const res = mockRes()
    await addMember(mockReq({ email: 'bob@example.com' }, { id: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('ownerは新しいメンバーを追加できる', async () => {
    const newUser = {
      id: 'user-3', email: 'carol@example.com', name: 'Carol',
      passwordHash: 'hash', createdAt: new Date(), updatedAt: new Date(),
    }
    const newMemberRecord = {
      id: 'member-3', userId: newUser.id, groupId: GROUP_ID, role: 'member', createdAt: new Date(),
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    }

    vi.mocked(prisma.groupMember.findUnique)
      .mockResolvedValueOnce(ownerMember) // 権限チェック
      .mockResolvedValueOnce(null)        // 重複チェック
    vi.mocked(prisma.user.findUnique).mockResolvedValue(newUser)
    vi.mocked(prisma.groupMember.create).mockResolvedValue(newMemberRecord)

    const res = mockRes()
    await addMember(mockReq({ email: 'carol@example.com' }, { id: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ data: newMemberRecord })
  })
})

// ─── removeMember ─────────────────────────────────────────────────────────────
describe('DELETE /api/v1/groups/:id/members/:memberId', () => {
  it('ownerが自分自身を削除しようとすると400を返す', async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(ownerMember)

    const res = mockRes()
    await removeMember(mockReq({}, { id: GROUP_ID, memberId: USER_ID }), res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Owner cannot remove themselves' })
  })

  it('存在しないメンバーは404を返す', async () => {
    vi.mocked(prisma.groupMember.findUnique)
      .mockResolvedValueOnce(ownerMember) // 権限チェック
      .mockResolvedValueOnce(null)        // 対象メンバー
    const res = mockRes()
    await removeMember(mockReq({}, { id: GROUP_ID, memberId: 'user-99' }), res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Member not found' })
  })

  it('ownerはメンバーを削除して204を返す', async () => {
    vi.mocked(prisma.groupMember.findUnique)
      .mockResolvedValueOnce(ownerMember)  // 権限チェック
      .mockResolvedValueOnce(regularMember) // 対象メンバー
    vi.mocked(prisma.groupMember.delete).mockResolvedValue(regularMember)

    const res = mockRes()
    await removeMember(mockReq({}, { id: GROUP_ID, memberId: 'user-2' }), res)

    expect(prisma.groupMember.delete).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(204)
  })
})
