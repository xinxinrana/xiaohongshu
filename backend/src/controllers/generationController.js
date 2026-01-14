





import { GenerationService } from '../services/generationService.js'

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





