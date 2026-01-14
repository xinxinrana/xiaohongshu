





import { getAllFrameworkFiles } from '../utils/fileReader.js'

export class FrameworkService {
  static getFrameworkDescriptions() {
    const frameworks = getAllFrameworkFiles()
    
    return frameworks.map(fw => {
      const lines = fw.content.split('\n')
      const title = lines.find(line => line.startsWith('# ') || line.startsWith('## '))?.replace(/#+\s*/, '') || fw.name
      const description = this.extractDescription(fw.content)
      
      return {
        id: fw.name,
        name: fw.name.replace(/框架$/, ''),
        title: title,
        description: description,
        fullContent: fw.content
      }
    })
  }
  
  static extractDescription(content) {
    const descSection = content.slice(0, 500)
    const lines = descSection.split('\n').filter(line => 
      line.trim() && 
      !line.startsWith('#') && 
      !line.startsWith('##') && 
      !line.startsWith('---')
    )
    return lines.slice(0, 3).join(' ').substring(0, 200) || '暂无描述'
  }
  
  static getFrameworkByName(name) {
    const frameworks = this.getFrameworkDescriptions()
    return frameworks.find(fw => fw.id === name || fw.name === name)
  }
  
  static matchFrameworks(keywords) {
    const frameworks = this.getFrameworkDescriptions()
    const keywordSet = new Set(keywords.toLowerCase().split(' '))
    
    return frameworks.map(framework => {
      const content = framework.fullContent.toLowerCase()
      const matchedKeywords = Array.from(keywordSet).filter(kw => content.includes(kw))
      
      return {
        ...framework,
        matchScore: matchedKeywords.length,
        matchedKeywords
      }
    }).sort((a, b) => b.matchScore - a.matchScore)
  }
}




