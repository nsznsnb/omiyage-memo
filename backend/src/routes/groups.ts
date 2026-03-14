import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  listGroups,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
} from '../controllers/groups.js'

const router = Router()

router.use(authenticate)

router.get('/', listGroups)
router.post('/', createGroup)
router.get('/:id', getGroup)
router.put('/:id', updateGroup)
router.delete('/:id', deleteGroup)
router.post('/:id/members', addMember)
router.delete('/:id/members/:memberId', removeMember)

export default router
