




import { FrameworkService } from '../services/frameworkService.js'

export function getAllFrameworks(req, res) {
  try {
    const frameworks = FrameworkService.getFrameworkDescriptions()
    res.json({
      success: true,
      data: frameworks
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export function getFramework(req, res) {
  try {
    const { name } = req.params
    const framework = FrameworkService.getFrameworkByName(name)
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        error: 'Framework not found'
      })
    }
    
    res.json({
      success: true,
      data: framework
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
 


