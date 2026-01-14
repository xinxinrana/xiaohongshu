




import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const frameworkAPI = {
  getAll() {
    return api.get('/frameworks')
  },
  getByName(name) {
    return api.get(`/frameworks/${name}`)
  }
}

export const analysisAPI = {
  analyze(keywords) {
    return api.post('/analyze', { keywords })
  }
}

export const generationAPI = {
  generate(keywords, frameworkId) {
    return api.post('/generate', { keywords, frameworkId })
  },
  generateAnalysis(content, frameworkId) {
    return api.post('/generate/analysis', { content, frameworkId })
  }
}

export default api


