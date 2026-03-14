import { apiRequest } from './client'
import type { Group, GroupMember } from '../types'

export function listGroups(): Promise<Group[]> {
  return apiRequest<Group[]>('/groups')
}

export function createGroup(name: string): Promise<Group> {
  return apiRequest<Group>('/groups', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function getGroup(id: string): Promise<Group> {
  return apiRequest<Group>(`/groups/${id}`)
}

export function updateGroup(id: string, name: string): Promise<Group> {
  return apiRequest<Group>(`/groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
}

export function deleteGroup(id: string): Promise<void> {
  return apiRequest<void>(`/groups/${id}`, { method: 'DELETE' })
}

export function addMember(groupId: string, email: string): Promise<GroupMember> {
  return apiRequest<GroupMember>(`/groups/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function removeMember(groupId: string, memberId: string): Promise<void> {
  return apiRequest<void>(`/groups/${groupId}/members/${memberId}`, { method: 'DELETE' })
}
