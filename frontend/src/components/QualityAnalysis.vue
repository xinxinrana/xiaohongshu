











<template>
  <div class="quality-analysis" v-if="analysis">
    <el-card shadow="hover">
      <template #header>
        <h3>🔍 质量分析</h3>
      </template>
      
      <el-alert
        title="为什么这是一篇好文章？"
        type="success"
        :closable="false"
        class="analysis-intro"
      />
      
      <el-collapse v-model="activeNames" accordion>
        <el-collapse-item title="🎣 钩子分析" name="hook">
          <div class="analysis-section">
            <div class="analysis-item">
              <span class="label">钩子类型：</span>
              <el-tag type="primary" size="small">{{ analysis.hook.type }}</el-tag>
            </div>
            <div class="analysis-item">
              <span class="label">有效性：</span>
              <el-tag type="success" size="small">{{ analysis.hook.effectiveness }}</el-tag>
            </div>
            <div class="analysis-item">
              <span class="label">原因：</span>
              <span class="value">{{ analysis.hook.reason }}</span>
            </div>
          </div>
        </el-collapse-item>
        
        <el-collapse-item title="📐 框架原理" name="framework">
          <div class="analysis-section">
            <div class="analysis-item">
              <span class="label">框架名称：</span>
              <el-tag type="info" size="small">{{ analysis.framework.name }}</el-tag>
            </div>
            <el-divider/>
            <h4>优势分析：</h4>
            <ul>
              <li v-for="(strength, index) in analysis.framework.strengths" :key="index">
                {{ strength }}
              </li>
            </ul>
            <el-divider/>
            <p><strong>为什么有效：</strong>{{ analysis.framework.whyEffective }}</p>
          </div>
        </el-collapse-item>
        
        <el-collapse-item title="📝 内容结构" name="structure">
          <div class="analysis-section">
            <div class="analysis-item">
              <span class="label">结构评分：</span>
              <el-rate v-model="structureRate" disabled show-score text-color="#ff9900" />
            </div>
            <el-divider/>
            <div class="analysis-item">
              <span class="label">总分段数：</span>
              <span class="value">{{ analysis.structure.totalSections }}</span>
            </div>
            <div class="analysis-item">
              <span class="label">逻辑清晰：</span>
              <el-icon :color="analysis.structure.hasClearFlow ? '#67c23a' : '#f56c6c'">
                <Select v-if="analysis.structure.hasClearFlow" />
                <Close v-else />
              </el-icon>
            </div>
            <div class="analysis-item">
              <span class="label">互动引导：</span>
              <el-icon :color="analysis.structure.hasInteraction ? '#67c23a' : '#f56c6c'">
                <Select v-if="analysis.structure.hasInteraction" />
                <Close v-else />
              </el-icon>
            </div>
            <p><strong>建议：</strong>{{ analysis.structure.建议 }}</p>
          </div>
        </el-collapse-item>
        
        <el-collapse-item title="💖 吸引力评估" name="appeal">
          <div class="analysis-section">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="appeal-card">
                  <div class="appeal-icon">😊</div>
                  <div class="appeal-title">情感感染</div>
                  <div class="appeal-value">{{ analysis.appeal.emotionScore }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="appeal-card">
                  <div class="appeal-icon">💎</div>
                  <div class="appeal-title">实用价值</div>
                  <div class="appeal-value">{{ analysis.appeal.valueScore }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="appeal-card">
                  <div class="appeal-icon">🎯</div>
                  <div class="appeal-title">行动引导</div>
                  <div class="appeal-value">{{ analysis.appeal.actionScore }}</div>
                </div>
              </el-col>
            </el-row>
            <el-divider/>
            <el-alert
              :title="analysis.appeal.overallRating"
              :description="analysis.appeal.reason"
              type="success"
              :closable="false"
            />
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
import { Select, Close } from '@element-plus/icons-vue'

const props = defineProps({
  analysis: {
    type: Object,
    default: null
  }
})

const activeNames = ref(['hook', 'framework', 'structure', 'appeal'])
const structureRate = ref(5)
</script>

<style scoped>
.quality-analysis {
  max-width: 800px;
  margin: 20px auto;
}

.analysis-intro {
  margin-bottom: 20px;
}

.analysis-section {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.analysis-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  color: #303133;
  margin-right: 8px;
  min-width: 100px;
}

.value {
  color: #606266;
}

.appeal-card {
  text-align: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
}

.appeal-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.appeal-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.appeal-value {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
}

.el-card :deep(.el-card__header) {
  background-color: #ff2442;
  color: white;
}

.el-card :deep(.el-card__header h3) {
  margin: 0;
  font-size: 18px;
}
</style>













