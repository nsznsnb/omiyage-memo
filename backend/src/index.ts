import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import groupsRouter from './routes/groups.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/groups', groupsRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
