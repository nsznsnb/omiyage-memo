import { apiRequest } from './client'
import type { GiftList, GiftItem } from '../types'

export function listGiftLists(groupId?: string): Promise<GiftList[]> {
  const query = groupId ? `?groupId=${groupId}` : ''
  return apiRequest<GiftList[]>(`/gift-lists${query}`)
}

export function createGiftList(name: string, groupId?: string): Promise<GiftList> {
  return apiRequest<GiftList>('/gift-lists', {
    method: 'POST',
    body: JSON.stringify({ name, groupId }),
  })
}

export function getGiftList(id: string): Promise<GiftList> {
  return apiRequest<GiftList>(`/gift-lists/${id}`)
}

export function updateGiftList(id: string, name: string): Promise<GiftList> {
  return apiRequest<GiftList>(`/gift-lists/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
}

export function deleteGiftList(id: string): Promise<void> {
  return apiRequest<void>(`/gift-lists/${id}`, { method: 'DELETE' })
}

export interface GiftItemInput {
  name: string
  price?: number | null
  memo?: string | null
  url?: string | null
}

export function addGiftItem(listId: string, data: GiftItemInput): Promise<GiftItem> {
  return apiRequest<GiftItem>(`/gift-lists/${listId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateGiftItem(listId: string, itemId: string, data: GiftItemInput): Promise<GiftItem> {
  return apiRequest<GiftItem>(`/gift-lists/${listId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteGiftItem(listId: string, itemId: string): Promise<void> {
  return apiRequest<void>(`/gift-lists/${listId}/items/${itemId}`, { method: 'DELETE' })
}
