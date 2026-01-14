




import fs from 'fs'
import path from 'path'

export function readFrameworkFile(filename) {
  const frameworkDir = path.join(process.cwd(), '..')
  const filePath = path.join(frameworkDir, `${filename}.md`)
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return content
  } catch (error) {
    // Try current directory as fallback
    const fallbackPath = path.join(process.cwd(), `${filename}.md`)
    try {
      const content = fs.readFileSync(fallbackPath, 'utf-8')
      return content
    } catch (fallbackError) {
      console.error(`Error reading framework file ${filename}:`, error, fallbackError)
      return null
    }
  }
}

export function getAllFrameworkFiles() {
  const frameworkFiles = [
    'AIDA模型框架',
    'SCQA模型框架',
    '黄金圈法则框架',
    '小红书爆款框架',
    '情感共鸣框架',
    '干货分享框架',
    '种草推荐框架',
    '生活方式分享框架'
  ]
  
  return frameworkFiles.map(filename => ({
    name: filename,
    content: readFrameworkFile(filename)
  })).filter(item => item.content !== null)
}



