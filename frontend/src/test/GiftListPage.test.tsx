import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { GiftList } from '../types'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', name: 'Alice', email: 'alice@example.com' }, logout: vi.fn() }),
}))

vi.mock('../api/giftLists', () => ({
  listGiftLists: vi.fn(),
  createGiftList: vi.fn(),
}))

vi.mock('../api/groups', () => ({
  listGroups: vi.fn().mockResolvedValue([]),
}))

import { GiftListPage } from '../pages/GiftListPage'
import * as giftListsApi from '../api/giftLists'

const mockLists: GiftList[] = [
  {
    id: 'l1', name: 'クリスマスリスト', groupId: null, userId: 'u1',
    createdAt: '', updatedAt: '', items: [],
  },
  {
    id: 'l2', name: '家族へのプレゼント', groupId: 'g1', userId: null,
    createdAt: '', updatedAt: '',
    items: [
      { id: 'i1', name: 'ぬいぐるみ', price: 3000, memo: null, url: null, giftListId: 'l2', createdAt: '', updatedAt: '' },
    ],
  },
]

function renderPage() {
  return render(<MemoryRouter><GiftListPage /></MemoryRouter>)
}

beforeEach(() => vi.clearAllMocks())

describe('GiftListPage', () => {
  it('リスト一覧が表示される', async () => {
    vi.mocked(giftListsApi.listGiftLists).mockResolvedValue(mockLists)
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('クリスマスリスト')).toBeInTheDocument()
    })
    expect(screen.getByText('家族へのプレゼント')).toBeInTheDocument()
    expect(screen.getByText('個人リスト · 0件')).toBeInTheDocument()
    expect(screen.getByText('グループリスト · 1件')).toBeInTheDocument()
  })

  it('リストが0件のときは空のメッセージが表示される', async () => {
    vi.mocked(giftListsApi.listGiftLists).mockResolvedValue([])
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('まだリストがありません')).toBeInTheDocument()
    })
  })

  it('「リストを作成」ボタンを押すとモーダルが開く', async () => {
    vi.mocked(giftListsApi.listGiftLists).mockResolvedValue([])
    renderPage()

    await waitFor(() => screen.getByText('まだリストがありません'))
    await userEvent.click(screen.getByRole('button', { name: '+ リストを作成' }))

    expect(screen.getByRole('heading', { name: 'リストを作成' })).toBeInTheDocument()
  })

  it('リストを作成するとリストに追加される', async () => {
    const newList: GiftList = {
      id: 'l3', name: '誕生日リスト', groupId: null, userId: 'u1',
      createdAt: '', updatedAt: '', items: [],
    }
    vi.mocked(giftListsApi.listGiftLists).mockResolvedValue([])
    vi.mocked(giftListsApi.createGiftList).mockResolvedValue(newList)
    renderPage()

    await waitFor(() => screen.getByText('まだリストがありません'))
    await userEvent.click(screen.getByRole('button', { name: '+ リストを作成' }))
    await userEvent.type(screen.getByLabelText(/リスト名/), '誕生日リスト')
    await userEvent.click(screen.getByRole('button', { name: '作成する' }))

    await waitFor(() => {
      expect(screen.getByText('誕生日リスト')).toBeInTheDocument()
    })
  })

  it('APIエラー時にエラーメッセージが表示される', async () => {
    vi.mocked(giftListsApi.listGiftLists).mockRejectedValue(new Error('ネットワークエラー'))
    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('ネットワークエラー')
    })
  })
})
