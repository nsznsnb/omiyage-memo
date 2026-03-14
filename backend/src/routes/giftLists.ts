import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  listGiftLists,
  createGiftList,
  getGiftList,
  updateGiftList,
  deleteGiftList,
} from '../controllers/giftLists.js'
import { addGiftItem, updateGiftItem, deleteGiftItem } from '../controllers/giftItems.js'

const router = Router()

router.use(authenticate)

// GiftList CRUD
router.get('/', listGiftLists)
router.post('/', createGiftList)
router.get('/:id', getGiftList)
router.put('/:id', updateGiftList)
router.delete('/:id', deleteGiftList)

// GiftItem (リスト配下)
router.post('/:listId/items', addGiftItem)
router.put('/:listId/items/:itemId', updateGiftItem)
router.delete('/:listId/items/:itemId', deleteGiftItem)

export default router
