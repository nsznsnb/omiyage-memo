import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { Group } from '../types'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', name: 'Alice', email: 'alice@example.com' }, logout: vi.fn() }),
}))

vi.mock('../api/groups', () => ({
  getGroup: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroup: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

import { GroupDetailPage } from '../pages/GroupDetailPage'
import * as groupsApi from '../api/groups'

const ownerGroup: Group = {
  id: 'g1', name: '家族', createdAt: '', updatedAt: '',
  members: [
    { id: 'm1', userId: 'u1', groupId: 'g1', role: 'owner', createdAt: '',
      user: { id: 'u1', name: 'Alice', email: 'alice@example.com' } },
    { id: 'm2', userId: 'u2', groupId: 'g1', role: 'member', createdAt: '',
      user: { id: 'u2', name: 'Bob', email: 'bob@example.com' } },
  ],
}

function renderPage(groupId = 'g1') {
  return render(
    <MemoryRouter initialEntries={[`/groups/${groupId}`]}>
      <Routes>
        <Route path="/groups/:id" element={<GroupDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('GroupDetailPage', () => {
  it('グループ名とメンバー一覧が表示される', async () => {
    vi.mocked(groupsApi.getGroup).mockResolvedValue(ownerGroup)
    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '家族' })).toBeInTheDocument()
      expect(screen.getByText('alice@example.com')).toBeInTheDocument()
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })
  })

  it('ownerはメンバー追加フォームを見ることができる', async () => {
    vi.mocked(groupsApi.getGroup).mockResolvedValue(ownerGroup)
    renderPage()

    await waitFor(() => screen.getByText('メンバーを追加'))
    expect(screen.getByPlaceholderText('メールアドレスを入力')).toBeInTheDocument()
  })

  it('ownerはメンバーを追加できる', async () => {
    const updatedGroup: Group = {
      ...ownerGroup,
      members: [
        ...ownerGroup.members,
        { id: 'm3', userId: 'u3', groupId: 'g1', role: 'member', createdAt: '',
          user: { id: 'u3', name: 'Carol', email: 'carol@example.com' } },
      ],
    }
    vi.mocked(groupsApi.getGroup)
      .mockResolvedValueOnce(ownerGroup)
      .mockResolvedValueOnce(updatedGroup)
    vi.mocked(groupsApi.addMember).mockResolvedValue(updatedGroup.members[2])
    renderPage()

    await waitFor(() => screen.getByText('メンバーを追加'))
    await userEvent.type(screen.getByPlaceholderText('メールアドレスを入力'), 'carol@example.com')
    await userEvent.click(screen.getByRole('button', { name: '追加' }))

    await waitFor(() => {
      expect(groupsApi.addMember).toHaveBeenCalledWith('g1', 'carol@example.com')
    })
  })

  it('ownerは編集・削除ボタンを見ることができる', async () => {
    vi.mocked(groupsApi.getGroup).mockResolvedValue(ownerGroup)
    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
      // 「削除」ボタンはグループ削除用とメンバー削除用の2つが存在する
      expect(screen.getAllByRole('button', { name: '削除' })).toHaveLength(2)
    })
  })

  it('グループ名を編集できる', async () => {
    vi.mocked(groupsApi.getGroup).mockResolvedValue(ownerGroup)
    vi.mocked(groupsApi.updateGroup).mockResolvedValue({ ...ownerGroup, name: '大家族' })
    renderPage()

    // 編集ボタンは複数の「削除」ボタンがある中で「編集」は1つ
    await waitFor(() => screen.getByRole('button', { name: '編集' }))
    await userEvent.click(screen.getByRole('button', { name: '編集' }))
    const input = screen.getByRole('textbox', { name: /グループ名/ })
    await userEvent.clear(input)
    await userEvent.type(input, '大家族')
    await userEvent.click(screen.getByRole('button', { name: '変更する' }))

    await waitFor(() => {
      expect(groupsApi.updateGroup).toHaveBeenCalledWith('g1', '大家族')
    })
  })
})
