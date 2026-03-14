import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response } from 'express'
import type { AuthRequest } from '../types/index.js'

vi.mock('../lib/prisma.js', () => ({
  default: {
    giftList: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    giftItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    groupMember: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import prisma from '../lib/prisma.js'
import {
  listGiftLists,
  createGiftList,
  getGiftList,
  updateGiftList,
  deleteGiftList,
} from '../controllers/giftLists.js'
import { addGiftItem, updateGiftItem, deleteGiftItem } from '../controllers/giftItems.js'

const USER_ID = 'user-1'
const LIST_ID = 'list-1'
const ITEM_ID = 'item-1'
const GROUP_ID = 'group-1'

const mockItem = {
  id: ITEM_ID, name: '東京ばな奈', price: 1080, memo: '定番', url: null,
  giftListId: LIST_ID, createdAt: new Date(), updatedAt: new Date(),
}
const mockList = {
  id: LIST_ID, name: 'お菓子リスト', userId: USER_ID, groupId: null,
  createdAt: new Date(), updatedAt: new Date(), items: [mockItem],
}
const mockGroupList = {
  ...mockList, id: 'list-g1', userId: null, groupId: GROUP_ID, items: [],
}

function mockRes(): Response {
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() }
  return res as unknown as Response
}

function mockReq(
  body: Record<string, unknown> = {},
  params: Record<string, string> = {},
  query: Record<string, string> = {},
): AuthRequest {
  return { body, params, query, user: { userId: USER_ID, email: 'alice@example.com' } } as unknown as AuthRequest
}

beforeEach(() => vi.clearAllMocks())

// ─── listGiftLists ────────────────────────────────────────────────────────────
describe('GET /api/v1/gift-lists', () => {
  it('groupIdなしの場合、個人+所属グループのリストを返す', async () => {
    vi.mocked(prisma.groupMember.findMany).mockResolvedValue([])
    vi.mocked(prisma.giftList.findMany).mockResolvedValue([mockList])

    const res = mockRes()
    await listGiftLists(mockReq(), res)

    expect(res.json).toHaveBeenCalledWith({ data: [mockList] })
  })

  it('groupId指定時、メンバーでない場合は403を返す', async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(null)

    const res = mockRes()
    await listGiftLists(mockReq({}, {}, { groupId: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('groupId指定時、メンバーであればグループのリストを返す', async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
      id: 'm1', userId: USER_ID, groupId: GROUP_ID, role: 'member', createdAt: new Date(),
    })
    vi.mocked(prisma.giftList.findMany).mockResolvedValue([mockGroupList])

    const res = mockRes()
    await listGiftLists(mockReq({}, {}, { groupId: GROUP_ID }), res)

    expect(res.json).toHaveBeenCalledWith({ data: [mockGroupList] })
  })
})

// ─── createGiftList ───────────────────────────────────────────────────────────
describe('POST /api/v1/gift-lists', () => {
  it('nameが未指定の場合は400を返す', async () => {
    const res = mockRes()
    await createGiftList(mockReq({}), res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('個人リストを作成して201を返す', async () => {
    vi.mocked(prisma.giftList.create).mockResolvedValue(mockList)

    const res = mockRes()
    await createGiftList(mockReq({ name: 'お菓子リスト' }), res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ data: mockList })
  })

  it('非メンバーがグループリストを作成しようとすると403を返す', async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(null)

    const res = mockRes()
    await createGiftList(mockReq({ name: 'リスト', groupId: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('グループメンバーはグループリストを作成できる', async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
      id: 'm1', userId: USER_ID, groupId: GROUP_ID, role: 'member', createdAt: new Date(),
    })
    vi.mocked(prisma.giftList.create).mockResolvedValue(mockGroupList)

    const res = mockRes()
    await createGiftList(mockReq({ name: 'グループリスト', groupId: GROUP_ID }), res)

    expect(res.status).toHaveBeenCalledWith(201)
  })
})

// ─── getGiftList ──────────────────────────────────────────────────────────────
describe('GET /api/v1/gift-lists/:id', () => {
  it('存在しないリストは404を返す', async () => {
    vi.mocked(prisma.giftList.findUnique).mockResolvedValue(null)

    const res = mockRes()
    await getGiftList(mockReq({}, { id: LIST_ID }), res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('アクセス権がない場合は403を返す', async () => {
    // 他人の個人リスト
    vi.mocked(prisma.giftList.findUnique).mockResolvedValue({
      ...mockList, userId: 'other-user', groupId: null,
    })

    const res = mockRes()
    await getGiftList(mockReq({}, { id: LIST_ID }), res)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('自分のリストは取得できる', async () => {
    vi.mocked(prisma.giftList.findUnique).mockResolvedValue(mockList)

    const res = mockRes()
    await getGiftList(mockReq({}, { id: LIST_ID }), res)

    expect(res.json).toHaveBeenCalledWith({ data: mockList })
  })
})

// ─── updateGiftList ───────────────────────────────────────────────────────────
describe('PUT /api/v1/gift-lists/:id', () => {
  it('nameが未指定の場合は400を返す', async () => {
    const res = mockRes()
    await updateGiftList(mockReq({}, { id: LIST_ID }), res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('アクセス権がある場合はリスト名を更新できる', async () => {
    vi.mocked(prisma.giftList.findUnique).mockResolvedValue(mockList)
    vi.mocked(prisma.giftList.update).mockResolvedValue({ ...mockList, name: '新しい名前' })

    const res = mockRes()
    await updateGiftList(mockReq({ name: '新しい名前' }, { id: LIST_ID }), res)

    expect(prisma.giftList.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: LIST_ID }, data: { name: '新しい名前' } }),
    )
  })
})

// ─── deleteGiftList ───────────────────────────────────────────────────────────
describe('DELETE /api/v1/gift-lists/:id', () => {
  it('アクセス権がある場合は削除して204を返す', async () => {
    vi.mocked(prisma.giftList.findUnique).mockResolvedValue(mockList)
    vi.mocked(prisma.giftList.delete).mockResolvedValue(mockList)

    const res = mockRes()
    await deleteGiftList(mockReq({}, { id: LIST_ID }), res)

    expect(prisma.giftList.delete).toHaveBeenCalledWith({ where: { id: LIST_ID } })
    expect(res.status).toHaveBeenCalledWith(204)
  })
})

// ─── addGiftItem ──────────────────────────────────────────────────────────────
describe('POST /api/v1/gift-lists/:listId/items', () => {
  it('nameが未指定の場合は400を返す', async () => {
    vi.mocked(prisma.giftList.findUnique).mockResolvedValue(mockList)

    const res = mockRes()
    await addGiftItem(mockReq({}, { listId: LIST_ID }), res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('リストが存在しない場合は404を返す', async () => {
    vi.mocked(prisma.giftList.findUnique).mockResolvedValue(null)

    const res = mockRes()
    await addGiftItem(mockReq({ name: '新アイテム' }, { listId: LIST_ID }), res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('アクセス権があればアイテムを追加して201を返す', async () => {
    vi.mocked(prisma.giftList.findUnique).mockResolvedValue(mockList)
    vi.mocked(prisma.giftItem.create).mockResolvedValue(mockItem)

    const res = mockRes()
    await addGiftItem(
      mockReq({ name: '東京ばな奈', price: 1080, memo: '定番' }, { listId: LIST_ID }),
      res,
    )

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ data: mockItem })
  })
})

// ─── updateGiftItem ───────────────────────────────────────────────────────────
describe('PUT /api/v1/gift-lists/:listId/items/:itemId', () => {
  it('アイテムが別リストに属する場合は404を返す', async () => {
    vi.mocked(prisma.giftList.findUnique).mockResolvedValue(mockList)
    vi.mocked(prisma.giftItem.findUnique).mockResolvedValue({
      ...mockItem, giftListId: 'other-list',
    })

    const res = mockRes()
    await updateGiftItem(
      mockReq({ name: '更新名' }, { listId: LIST_ID, itemId: ITEM_ID }),
      res,
    )

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('正常にアイテムを更新できる', async () => {
    vi.mocked(prisma.giftList.findUnique).mockResolvedValue(mockList)
    vi.mocked(prisma.giftItem.findUnique).mockResolvedValue(mockItem)
    vi.mocked(prisma.giftItem.update).mockResolvedValue({ ...mockItem, name: '更新後' })

    const res = mockRes()
    await updateGiftItem(
      mockReq({ name: '更新後', price: 2000 }, { listId: LIST_ID, itemId: ITEM_ID }),
      res,
    )

    expect(prisma.giftItem.update).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalled()
  })
})

// ─── deleteGiftItem ───────────────────────────────────────────────────────────
describe('DELETE /api/v1/gift-lists/:listId/items/:itemId', () => {
  it('アイテムを削除して204を返す', async () => {
    vi.mocked(prisma.giftList.findUnique).mockResolvedValue(mockList)
    vi.mocked(prisma.giftItem.findUnique).mockResolvedValue(mockItem)
    vi.mocked(prisma.giftItem.delete).mockResolvedValue(mockItem)

    const res = mockRes()
    await deleteGiftItem(mockReq({}, { listId: LIST_ID, itemId: ITEM_ID }), res)

    expect(prisma.giftItem.delete).toHaveBeenCalledWith({ where: { id: ITEM_ID } })
    expect(res.status).toHaveBeenCalledWith(204)
  })
})
