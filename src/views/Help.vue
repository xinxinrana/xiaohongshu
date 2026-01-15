
<template>
  <div class="help-page">
    <n-card title="帮助中心" :bordered="false">
      <n-space vertical size="large">
        <n-alert title="快速入门" type="info">
          1. 在“一键生成”页面输入您想要创作的关键词。<br>
          2. 点击生成，系统将自动为您匹配风格并生成文案。<br>
          3. 文案生成后，系统会自动调用 AI 绘画接口生成配图。
        </n-alert>
        
        <n-collapse>
          <n-collapse-item title="什么是内容知识库？" name="1">
            <div>内容知识库用于存储您的品牌信息、常用风格或参考资料。在生成文案时，AI 会参考这些背景知识，使生成内容更贴合您的需求。</div>
          </n-collapse-item>
          <n-collapse-item title="如何优化生成效果？" name="2">
            <div>尽量提供具体的关键词，或者在知识库中完善您的品牌调性说明。</div>
          </n-collapse-item>
          <n-collapse-item title="关于图片生成" name="3">
            <div>图片是根据文案内容自动生成的。如果您对图片不满意，可以尝试重新生成文案。</div>
          </n-collapse-item>
        </n-collapse>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { NCard, NSpace, NAlert, NCollapse, NCollapseItem } from 'naive-ui'

/**
 * 帮助中心页面组件
 */
</script>

<style scoped>
.help-page {
  max-width: 800px;
  margin: 0 auto;
}
</style>
