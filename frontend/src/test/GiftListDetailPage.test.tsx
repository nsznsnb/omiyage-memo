import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { GiftList } from '../types'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', name: 'Alice', email: 'alice@example.com' }, logout: vi.fn() }),
}))

vi.mock('../api/giftLists', () => ({
  getGiftList: vi.fn(),
  updateGiftList: vi.fn(),
  deleteGiftList: vi.fn(),
  addGiftItem: vi.fn(),
  updateGiftItem: vi.fn(),
  deleteGiftItem: vi.fn(),
}))

vi.mock('../api/groups', () => ({
  listGroups: vi.fn().mockResolvedValue([]),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

import { GiftListDetailPage } from '../pages/GiftListDetailPage'
import * as giftListsApi from '../api/giftLists'

const mockList: GiftList = {
  id: 'l1', name: 'クリスマスリスト', groupId: null, userId: 'u1',
  createdAt: '', updatedAt: '',
  items: [
    { id: 'i1', name: 'ぬいぐるみ', price: 3000, memo: 'かわいいやつ', url: null, giftListId: 'l1', createdAt: '', updatedAt: '' },
    { id: 'i2', name: 'ゲーム', price: null, memo: null, url: 'https://example.com', giftListId: 'l1', createdAt: '', updatedAt: '' },
  ],
}

function renderPage(listId = 'l1') {
  return render(
    <MemoryRouter initialEntries={[`/gift-lists/${listId}`]}>
      <Routes>
        <Route path="/gift-lists/:id" element={<GiftListDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('GiftListDetailPage', () => {
  it('リスト名とアイテム一覧が表示される', async () => {
    vi.mocked(giftListsApi.getGiftList).mockResolvedValue(mockList)
    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'クリスマスリスト' })).toBeInTheDocument()
    })
    expect(screen.getByText('ぬいぐるみ')).toBeInTheDocument()
    expect(screen.getByText('ゲーム')).toBeInTheDocument()
    expect(screen.getByText('¥3,000')).toBeInTheDocument()
    expect(screen.getByText('かわいいやつ')).toBeInTheDocument()
    expect(screen.getByText('https://example.com')).toBeInTheDocument()
  })

  it('アイテムが0件のときは空のメッセージが表示される', async () => {
    vi.mocked(giftListsApi.getGiftList).mockResolvedValue({ ...mockList, items: [] })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('まだアイテムがありません')).toBeInTheDocument()
    })
  })

  it('「アイテムを追加」ボタンを押すとモーダルが開く', async () => {
    vi.mocked(giftListsApi.getGiftList).mockResolvedValue(mockList)
    renderPage()

    await waitFor(() => screen.getByText('ぬいぐるみ'))
    await userEvent.click(screen.getByRole('button', { name: '+ アイテムを追加' }))

    expect(screen.getByRole('heading', { name: 'アイテムを追加' })).toBeInTheDocument()
  })

  it('アイテムを追加するとリストに追加される', async () => {
    const newItem = {
      id: 'i3', name: '本', price: 1500, memo: null, url: null,
      giftListId: 'l1', createdAt: '', updatedAt: '',
    }
    vi.mocked(giftListsApi.getGiftList).mockResolvedValue({ ...mockList, items: [] })
    vi.mocked(giftListsApi.addGiftItem).mockResolvedValue(newItem)
    renderPage()

    await waitFor(() => screen.getByText('まだアイテムがありません'))
    await userEvent.click(screen.getByRole('button', { name: '最初のアイテムを追加する' }))
    await userEvent.type(screen.getByLabelText(/アイテム名/), '本')
    await userEvent.click(screen.getByRole('button', { name: '追加する' }))

    await waitFor(() => {
      expect(screen.getByText('本')).toBeInTheDocument()
    })
  })

  it('アイテムの編集ボタンを押すと編集モーダルが開く', async () => {
    vi.mocked(giftListsApi.getGiftList).mockResolvedValue(mockList)
    renderPage()

    await waitFor(() => screen.getByText('ぬいぐるみ'))
    await userEvent.click(screen.getByRole('button', { name: 'ぬいぐるみを編集' }))

    expect(screen.getByRole('heading', { name: 'アイテムを編集' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('ぬいぐるみ')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('かわいいやつ')).toBeInTheDocument()
  })

  it('アイテムを更新するとリストが更新される', async () => {
    const updatedItem = { ...mockList.items[0], name: 'ぬいぐるみ（大）' }
    vi.mocked(giftListsApi.getGiftList).mockResolvedValue(mockList)
    vi.mocked(giftListsApi.updateGiftItem).mockResolvedValue(updatedItem)
    renderPage()

    await waitFor(() => screen.getByText('ぬいぐるみ'))
    await userEvent.click(screen.getByRole('button', { name: 'ぬいぐるみを編集' }))

    const input = screen.getByDisplayValue('ぬいぐるみ')
    await userEvent.clear(input)
    await userEvent.type(input, 'ぬいぐるみ（大）')
    await userEvent.click(screen.getByRole('button', { name: '変更する' }))

    await waitFor(() => {
      expect(screen.getByText('ぬいぐるみ（大）')).toBeInTheDocument()
    })
  })

  it('リスト名を編集できる', async () => {
    vi.mocked(giftListsApi.getGiftList).mockResolvedValue(mockList)
    vi.mocked(giftListsApi.updateGiftList).mockResolvedValue({ ...mockList, name: '冬のリスト' })
    renderPage()

    await waitFor(() => screen.getByRole('heading', { name: 'クリスマスリスト' }))
    await userEvent.click(screen.getByRole('button', { name: '編集' }))

    const input = screen.getByDisplayValue('クリスマスリスト')
    await userEvent.clear(input)
    await userEvent.type(input, '冬のリスト')
    await userEvent.click(screen.getByRole('button', { name: '変更する' }))

    await waitFor(() => {
      expect(giftListsApi.updateGiftList).toHaveBeenCalledWith('l1', '冬のリスト')
    })
  })

  it('個人リストは「個人リスト」と表示される', async () => {
    vi.mocked(giftListsApi.getGiftList).mockResolvedValue(mockList)
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('個人リスト')).toBeInTheDocument()
    })
  })

  it('グループリストは「グループリスト」と表示される', async () => {
    vi.mocked(giftListsApi.getGiftList).mockResolvedValue({ ...mockList, groupId: 'g1', userId: null })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('グループリスト')).toBeInTheDocument()
    })
  })
})
