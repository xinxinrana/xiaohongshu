


import { analyzeKeywords } from '../services/keywordService.js'

export async function analyzeKeyword(req, res) {
  try {
    const { keywords } = req.body
    
    if (!keywords) {
      return res.status(400).json({
        success: false,
        error: 'Keywords are required'
      })
    }
    
    const analysis = await analyzeKeywords(keywords)
    
    res.json({
      success: true,
      data: analysis
    })
  } catch (error) {
    console.error('分析失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}






