








<template>
  <div class="generate-page">
    <KeywordInput @analyzed="handleAnalyzed" />
    
    <FrameworkSelector 
      v-if="analysisResult" 
      :frameworks="analysisResult.recommendedFrameworks"
      @selected="handleFrameworkSelected"
    />
    
    <el-card shadow="hover" v-if="selectedFramework" class="generate-action">
      <div class="action-content">
        <p>已选择框架：<el-tag type="success">{{ getFrameworkName(selectedFramework) }}</el-tag></p>
        <el-button 
          type="primary" 
          size="large" 
          @click="handleGenerate"
          :loading="generating"
          class="generate-btn"
        >
          生成内容
        </el-button>
      </div>
    </el-card>
    
    <div v-if="generatedContent" class="content-wrapper">
      <ContentEditor
        :content="generatedContent"
        @regenerate="handleRegenerate"
        @preview="handlePreview"
        @content-change="handleContentChange"
      />
      
      <QualityAnalysis
        v-if="qualityAnalysis"
        :analysis="qualityAnalysis"
      />
      
      <Preview
        v-if="showPreview"
        :content="editedContent"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { generationAPI, frameworkAPI } from '../services/api'
import KeywordInput from '../components/KeywordInput.vue'
import FrameworkSelector from '../components/FrameworkSelector.vue'
import ContentEditor from '../components/ContentEditor.vue'
import QualityAnalysis from '../components/QualityAnalysis.vue'
import Preview from '../components/Preview.vue'

const analysisResult = ref(null)
const selectedFramework = ref('')
const generatedContent = ref(null)
const editedContent = ref(null)
const qualityAnalysis = ref(null)
const generating = ref(false)
const showPreview = ref(false)
const currentKeywords = ref('')

const handleAnalyzed = async (data) => {
  analysisResult.value = data.analysis
  currentKeywords.value = data.keywords
  
  if (analysisResult.value.recommendedFrameworks.length > 0) {
    selectedFramework.value = analysisResult.value.recommendedFrameworks[0].id
  }
}

const handleFrameworkSelected = (frameworkId) => {
  selectedFramework.value = frameworkId
}

const handleGenerate = async () => {
  if (!selectedFramework.value) {
    ElMessage.warning('请先选择一个框架')
    return
  }
  
  generating.value = true
  
  try {
    const response = await generationAPI.generate(
      currentKeywords.value.split(/[,，\s]+/).join(','),
      selectedFramework.value
    )
    
    if (response.data.success) {
      generatedContent.value = response.data.data
      editedContent.value = { ...response.data.data }
      
      await generateQualityAnalysis()
      
      ElMessage.success('内容生成成功！')
    }
  } catch (error) {
    console.error('生成失败:', error)
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

const generateQualityAnalysis = async () => {
  if (!generatedContent.value || !selectedFramework.value) {
    return
  }
  
  try {
    const response = await generationAPI.generateAnalysis(
      editedContent.value,
      selectedFramework.value
    )
    
    if (response.data.success) {
      qualityAnalysis.value = response.data.data
    }
  } catch (error) {
    console.error('生成分析失败:', error)
  }
}

const handleRegenerate = () => {
  handleGenerate()
}

const handlePreview = () => {
  showPreview.value = true
}

const handleContentChange = (content) => {
  editedContent.value = content
}

const getFrameworkName = (frameworkId) => {
  const framework = analysisResult.value?.recommendedFrameworks.find(
    fw => fw.id === frameworkId
  )
  return framework?.name || frameworkId
}
</script>

<style scoped>
.generate-page {
  padding: 20px 0;
}

.generate-action {
  max-width: 800px;
  margin: 20px auto;
}

.action-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.generate-btn {
  padding: 12px 32px;
  font-size: 16px;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
}
</style>





