


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

// 增加请求体大小限制，支持大图片上传（Base64编码的图片通常很大）
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use('/api', routes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

