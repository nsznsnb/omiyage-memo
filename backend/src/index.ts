import 'dotenv/config'
import 'express-async-errors'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import groupsRouter from './routes/groups.js'
import giftListsRouter from './routes/giftLists.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/groups', groupsRouter)
app.use('/api/v1/gift-lists', giftListsRouter)

// グローバルエラーハンドラー
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
