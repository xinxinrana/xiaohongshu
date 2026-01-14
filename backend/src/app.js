


import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './routes/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}))

app.use(express.json())

app.use('/api', routes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

