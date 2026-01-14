


import express from 'express'
import * as frameworkController from '../controllers/frameworkController.js'
import * as analysisController from '../controllers/analysisController.js'
import * as generationController from '../controllers/generationController.js'

const router = express.Router()

router.get('/frameworks', frameworkController.getAllFrameworks)
router.get('/frameworks/:name', frameworkController.getFramework)
router.post('/analyze', analysisController.analyzeKeyword)
router.post('/generate', generationController.generateContent)
router.post('/generate/analysis', generationController.generateAnalysis)

export default router


