
<template>
  <div class="analysis-page">
    <n-space vertical size="large">
      <n-card title="小红书账号定位分析" subtitle="深度规划账号人设、受众及内容方向">
        <n-form label-placement="top">
          <n-grid :cols="2" :x-gap="24">
            <n-form-item-gi label="账号昵称">
              <n-input placeholder="输入您的账号名称" />
            </n-form-item-gi>
            <n-form-item-gi label="行业赛道">
              <n-select :options="[
                {label: '美妆护肤', value: 'beauty'},
                {label: '数码科技', value: 'tech'},
                {label: '家居生活', value: 'home'},
                {label: '职场成长', value: 'career'}
              ]" placeholder="选择核心赛道" />
            </n-form-item-gi>
            <n-form-item-gi label="目标受众 (User Persona)">
              <n-input type="textarea" placeholder="例如：18-25岁，对数码产品感兴趣的大学生" />
            </n-form-item-gi>
            <n-form-item-gi label="核心价值/人设 (Identity)">
              <n-input type="textarea" placeholder="例如：专业的数码评测官，用大白话讲硬核科技" />
            </n-form-item-gi>
          </n-grid>
          <n-space justify="end">
            <n-button type="primary" size="large">开始深度定位分析</n-button>
          </n-space>
        </n-form>
      </n-card>

      <n-grid :cols="3" :x-gap="12">
        <n-gi>
          <n-card title="内容支柱 (Content Pillars)" size="small">
            <n-list hoverable clickable>
              <n-list-item>核心评测 (占比 40%)</n-list-item>
              <n-list-item>避坑指南 (占比 30%)</n-list-item>
              <n-list-item>行业资讯 (占比 20%)</n-list-item>
              <n-list-item>粉丝互动 (占比 10%)</n-list-item>
            </n-list>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card title="视觉风格规划" size="small">
            <n-space vertical>
              <n-tag type="info">极简硬核风</n-tag>
              <n-tag type="success">高饱和度封面</n-tag>
              <n-tag type="warning">统一边框样式</n-tag>
            </n-space>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card title="账号成长路线图" size="small">
            <n-timeline>
              <n-timeline-item type="success" title="起号期" content="前30篇内容锁定垂直标签" />
              <n-timeline-item type="info" title="爆发期" content="制造爆款话题，引导粉丝关注" />
              <n-timeline-item type="warning" title="变现期" content="开启商业合作，保持内容平衡" />
            </n-timeline>
          </n-card>
        </n-gi>
      </n-grid>
    </n-space>
  </div>
</template>

<script setup>
import { 
  NCard, NForm, NFormItemGi, NGrid, NGi, NInput, NSelect, 
  NButton, NSpace, NList, NListItem, NTag, NTimeline, NTimelineItem 
} from 'naive-ui'

/**
 * 账号定位分析页面组件
 * 用于展示小红书账号的长期规划和定位建议
 */
</script>

<style scoped>
.analysis-page {
  max-width: 1100px;
  margin: 0 auto;
}
</style>
