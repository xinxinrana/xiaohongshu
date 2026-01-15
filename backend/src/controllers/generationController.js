





import { GenerationService } from '../services/generationService.js'
import axios from 'axios'

export function generateContent(req, res) {
  try {
    const { keywords, frameworkId } = req.body
    
    if (!keywords || !frameworkId) {
      return res.status(400).json({
        success: false,
        error: 'Keywords and frameworkId are required'
      })
    }
    
    const content = GenerationService.generateContent(keywords, frameworkId)
    
    res.json({
      success: true,
      data: content
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export function generateAnalysis(req, res) {
  try {
    const { content, frameworkId } = req.body
    
    if (!content || !frameworkId) {
      return res.status(400).json({
        success: false,
        error: 'Content and frameworkId are required'
      })
    }
    
    const framework = {
      id: frameworkId,
      name: frameworkId.replace(/框架$/, ''),
      description: '专业的内容框架'
    }
    
    const analysis = GenerationService.generateAnalysis(content, framework)
    
    res.json({
      success: true,
      data: analysis
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 图片下载代理：解决前端下载跨域问题
 */
export async function proxyImage(req, res) {
  const { url } = req.query
  
  if (!url) {
    return res.status(400).send('URL is required')
  }

  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      timeout: 30000
    })

    // 设置响应头，转发原始内容类型
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/png')
    res.setHeader('Access-Control-Allow-Origin', '*')
    
    // 将流管道传输到响应中
    response.data.pipe(res)
  } catch (error) {
    console.error('Proxy image failed:', error.message)
    res.status(500).send('Failed to proxy image')
  }
}





