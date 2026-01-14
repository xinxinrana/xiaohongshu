



















<template>
  <n-card title="✨ 智能质量分析" size="large" hoverable v-if="analysis">
    <n-alert type="success" title="深度文案质量诊断" class="mb-4" />
    
    <div v-if="analysis.isRawText" class="raw-analysis-view">
      <n-blockquote>
        <div style="white-space: pre-wrap;">{{ analysis.analysis }}</div>
      </n-blockquote>
    </div>
    
    <n-collapse v-else :default-expanded-names="['hook', 'framework', 'structure', 'platform']">
      <!-- 1. 钩子分析 -->
      <n-collapse-item title="🎣 钩子分析 (Hook Analysis)" name="hook">
        <n-space vertical>
          <n-tag type="primary" size="large" round>{{ analysis.hook.type }}</n-tag>
          <n-space align="center">
            <n-text depth="3">抓住注意力效果：</n-text>
            <n-rate readonly :default-value="analysis.hook.effectiveness === '高' ? 5 : 3" />
          </n-space>
          <n-blockquote>
            {{ analysis.hook.reason }}
          </n-blockquote>
        </n-space>
      </n-collapse-item>
      
      <!-- 2. 框架原理 -->
      <n-collapse-item title="📐 框架原理 (Framework Principles)" name="framework">
        <n-space vertical>
          <n-alert :show-icon="false" type="info">
            使用了 <strong>{{ analysis.framework.name }}</strong>
          </n-alert>
          <n-list bordered>
            <template #header>核心优势</template>
            <n-list-item v-for="(strength, index) in analysis.framework.strengths" :key="index">
              <template #prefix>
                <n-icon color="#18a058">✅</n-icon>
              </template>
              {{ strength }}
            </n-list-item>
          </n-list>
          <n-text depth="2" italic>{{ analysis.framework.whyEffective }}</n-text>
        </n-space>
      </n-collapse-item>
      
      <!-- 3. 内容结构 -->
      <n-collapse-item title="📝 内容结构 (Content Structure)" name="structure">
        <n-space vertical>
          <n-card embedded :bordered="false">
            <n-text strong>逻辑层次分析：</n-text>
            <p>{{ analysis.structure.flowAnalysis }}</p>
          </n-card>
          
          <n-divider title-placement="left">互动引导</n-divider>
          <n-space align="center" justify="space-between">
            <n-tag :type="analysis.structure.hasInteraction ? 'success' : 'warning'">
              {{ analysis.structure.hasInteraction ? '已有互动引导' : '缺少互动引导' }}
            </n-tag>
          </n-space>
          <n-alert v-if="analysis.structure.interactionSuggestion" type="warning" size="small">
            建议：{{ analysis.structure.interactionSuggestion }}
          </n-alert>
        </n-space>
      </n-collapse-item>
      
      <!-- 4. 平台适配 -->
      <n-collapse-item title="💖 平台适配 (Platform Adaptation)" name="platform">
        <n-grid :cols="1" :y-gap="12">
          <n-grid-item>
            <n-statistic label="小红书适配度评分" :value="analysis.platformAdaptation.score">
              <template #suffix>/ 100</template>
            </n-statistic>
          </n-grid-item>
          <n-grid-item>
            <n-space>
              <n-tag
                v-for="(detail, index) in analysis.platformAdaptation.details"
                :key="index"
                type="info"
                size="small"
                variant="outline"
              >
                {{ detail }}
              </n-tag>
            </n-space>
          </n-grid-item>
        </n-grid>
      </n-collapse-item>
    </n-collapse>
  </n-card>
</template>

<script setup>
defineProps({
  analysis: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
n-blockquote {
  margin: 8px 0;
  padding: 8px 12px;
  background-color: #f9f9f9;
  border-left: 4px solid #ff2442;
  font-style: italic;
}
</style>





