


import express from 'express'
import * as frameworkController from '../controllers/frameworkController.js'
import * as analysisController from '../controllers/analysisController.js'
import * as generationController from '../controllers/generationController.js'
import * as imageController from '../controllers/imageController.js'
import * as enhancedGenerationController from '../controllers/enhancedGenerationController.js'
import * as agentController from '../controllers/agentController.js'

const router = express.Router()

router.get('/frameworks', frameworkController.getAllFrameworks)
router.get('/frameworks/:name', frameworkController.getFramework)
router.post('/analyze', analysisController.analyzeKeyword)
router.post('/generate', generationController.generateContent)
router.post('/generate/analysis', generationController.generateAnalysis)
router.get('/proxy-image', generationController.proxyImage)

// 图像生成相关路由
router.post('/image/text-to-image', imageController.generateImageFromText)
router.post('/image/edit', imageController.editImage)
router.post('/image/image-to-image', imageController.generateImageFromImage)
router.get('/image/task/:taskId', imageController.queryTaskStatus)

// 图像生成工作台新增路由
router.post('/image/multi-fusion', imageController.generateMultiFusion)
router.post('/image/batch-generation', imageController.generateBatchImages)
router.post('/image/stream-generation', imageController.generateWithStreaming)
router.get('/image/config', imageController.getSupportedConfig)

// 增强版工作流路由
router.post('/enhanced/generate-content', enhancedGenerationController.generateContent)
router.post('/enhanced/generate-prompts', enhancedGenerationController.generatePrompts)
router.post('/enhanced/generate-images', enhancedGenerationController.generateImages)
router.post('/enhanced/edit-content', enhancedGenerationController.editContent)
router.post('/enhanced/optimize-prompts', enhancedGenerationController.optimizePrompts)
router.post('/enhanced/edit-images', enhancedGenerationController.editImages)
router.post('/enhanced/final-analysis', enhancedGenerationController.generateFinalAnalysis)
router.post('/enhanced/full-process', enhancedGenerationController.fullProcess)

// Agent 路由
router.post('/agent/generate', agentController.generateWithAgent)
router.post('/agent/stream', agentController.generateWithStream)
router.get('/agent/history', agentController.getAgentHistory)
router.delete('/agent/history', agentController.clearAgentHistory)
router.get('/agent/memory', agentController.getAllMemory)
router.post('/agent/memory', agentController.createMemory)
router.get('/agent/memory/stats', agentController.getMemoryStats)
router.post('/agent/memory/retrieve', agentController.retrieveMemory)
router.get('/agent/memory/:id', agentController.getMemoryById)
router.put('/agent/memory/:id', agentController.updateMemory)
router.delete('/agent/memory/:id', agentController.deleteMemory)
router.delete('/agent/memory', agentController.clearMemory)

export default router


