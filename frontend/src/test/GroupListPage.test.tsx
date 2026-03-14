import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { Group } from '../types'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', name: 'Alice', email: 'alice@example.com' }, logout: vi.fn() }),
}))

vi.mock('../api/groups', () => ({
  listGroups: vi.fn(),
  createGroup: vi.fn(),
}))

import { GroupListPage } from '../pages/GroupListPage'
import * as groupsApi from '../api/groups'

const mockGroups: Group[] = [
  {
    id: 'g1', name: '家族', createdAt: '', updatedAt: '',
    members: [
      { id: 'm1', userId: 'u1', groupId: 'g1', role: 'owner', createdAt: '',
        user: { id: 'u1', name: 'Alice', email: 'alice@example.com' } },
    ],
  },
]

function renderPage() {
  return render(<MemoryRouter><GroupListPage /></MemoryRouter>)
}

beforeEach(() => vi.clearAllMocks())

describe('GroupListPage', () => {
  it('グループ一覧が表示される', async () => {
    vi.mocked(groupsApi.listGroups).mockResolvedValue(mockGroups)
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('家族')).toBeInTheDocument()
    })
    expect(screen.getByText('1人のメンバー')).toBeInTheDocument()
  })

  it('グループが0件のときは空のメッセージが表示される', async () => {
    vi.mocked(groupsApi.listGroups).mockResolvedValue([])
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('まだグループがありません')).toBeInTheDocument()
    })
  })

  it('「グループを作成」ボタンを押すとモーダルが開く', async () => {
    vi.mocked(groupsApi.listGroups).mockResolvedValue([])
    renderPage()

    await waitFor(() => screen.getByText('まだグループがありません'))
    await userEvent.click(screen.getByRole('button', { name: '+ グループを作成' }))

    expect(screen.getByRole('heading', { name: 'グループを作成' })).toBeInTheDocument()
  })

  it('グループを作成するとリストに追加される', async () => {
    const newGroup: Group = {
      id: 'g2', name: '職場', createdAt: '', updatedAt: '',
      members: [{ id: 'm2', userId: 'u1', groupId: 'g2', role: 'owner', createdAt: '',
        user: { id: 'u1', name: 'Alice', email: 'alice@example.com' } }],
    }
    vi.mocked(groupsApi.listGroups).mockResolvedValue([])
    vi.mocked(groupsApi.createGroup).mockResolvedValue(newGroup)
    renderPage()

    await waitFor(() => screen.getByText('まだグループがありません'))
    await userEvent.click(screen.getByRole('button', { name: '+ グループを作成' }))
    await userEvent.type(screen.getByLabelText(/グループ名/), '職場')
    await userEvent.click(screen.getByRole('button', { name: '作成する' }))

    await waitFor(() => {
      expect(screen.getByText('職場')).toBeInTheDocument()
    })
  })
})
