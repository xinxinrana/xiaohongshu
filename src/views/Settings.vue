
<template>
  <div class="settings-page">
    <n-card title="工具集成与自动化配置" :bordered="false">
      <n-tabs type="line" animated>
        <!-- 发布渠道配置 -->
        <n-tab-pane name="channels" tab="发布渠道集成">
          <n-alert title="说明" type="info" class="mb-4">
            配置自动化发布渠道，文案生成后可一键同步至对应平台。
          </n-alert>
          <n-space vertical size="large">
            <n-card title="小红书 API (官方/第三方)" size="small" bordered>
              <n-form label-placement="left" :label-width="120">
                <n-form-item label="API Endpoint">
                  <n-input placeholder="https://api.xiaohongshu.com/..." />
                </n-form-item>
                <n-form-item label="Access Token">
                  <n-input type="password" show-password-on="mousedown" placeholder="输入您的访问令牌" />
                </n-form-item>
                <n-space justify="end">
                  <n-button type="primary" secondary>保存配置</n-button>
                  <n-button type="success">测试连接</n-button>
                </n-space>
              </n-form>
            </n-card>

            <n-card title="抖音/TikTok 开放平台" size="small" bordered>
              <n-form label-placement="left" :label-width="120">
                <n-form-item label="Client Key">
                  <n-input placeholder="输入 Client Key" />
                </n-form-item>
                <n-form-item label="Client Secret">
                  <n-input type="password" show-password-on="mousedown" placeholder="输入 Client Secret" />
                </n-form-item>
                <n-space justify="end">
                  <n-button type="primary" secondary>保存配置</n-button>
                  <n-button type="success" disabled>等待授权</n-button>
                </n-space>
              </n-form>
            </n-card>
          </n-space>
        </n-tab-pane>

        <!-- 外部工具配置 -->
        <n-tab-pane name="tools" tab="外部工具链">
          <n-space vertical size="large">
            <n-card title="内容审核工具 (敏感词检测)" size="small" bordered>
              <n-form label-placement="left" :label-width="120">
                <n-form-item label="服务商">
                  <n-select :options="[
                    { label: '阿里云内容安全', value: 'aliyun' },
                    { label: '百度云内容审核', value: 'baidu' },
                    { label: '腾讯云天御', value: 'tencent' }
                  ]" placeholder="选择审核服务商" />
                </n-form-item>
                <n-form-item label="API Key">
                  <n-input placeholder="输入 API Key" />
                </n-form-item>
                <n-space justify="end">
                  <n-switch>
                    <template #checked>生成后自动审核</template>
                    <template #unchecked>手动审核</template>
                  </n-switch>
                </n-space>
              </n-form>
            </n-card>

            <n-card title="数据分析与回流" size="small" bordered>
              <n-form label-placement="left" :label-width="120">
                <n-form-item label="Webhook URL">
                  <n-input placeholder="https://your-server.com/webhook" />
                </n-form-item>
                <n-text depth="3">配置 Webhook 后，每篇文案的生成数据和图片 URL 将自动推送到您的服务器。</n-text>
              </n-form>
            </n-card>
          </n-space>
        </n-tab-pane>

        <!-- 系统设置 -->
        <n-tab-pane name="system" tab="系统设置">
          <n-form label-placement="left" :label-width="120">
            <n-form-item label="自动保存">
              <n-switch default-value />
            </n-form-item>
            <n-form-item label="生成后动作">
              <n-checkbox-group>
                <n-space>
                  <n-checkbox value="copy">自动复制到剪贴板</n-checkbox>
                  <n-checkbox value="download">自动下载图片</n-checkbox>
                  <n-checkbox value="notify">生成完成后系统通知</n-checkbox>
                </n-space>
              </n-checkbox-group>
            </n-form-item>
            <n-divider title-placement="left">自动化频率</n-divider>
            <n-form-item label="自动更新频率">
              <n-select :options="[
                {label: '每 2 小时', value: '2h'},
                {label: '每天一次', value: '1d'},
                {label: '每周三次', value: '3w'},
                {label: '手动触发', value: 'manual'}
              ]" default-value="manual" />
            </n-form-item>
          </n-form>
        </n-tab-pane>

        <!-- 模型配置 -->
        <n-tab-pane name="models" tab="模型引擎配置">
          <n-space vertical size="large">
            <n-alert title="模型适配" type="info">
              支持切换不同的底层 AI 模型，以适应不同的文案创作需求。
            </n-alert>
            <n-form label-placement="left" :label-width="120">
            <n-form-item label="默认文案模型">
              <n-select :options="[
                {label: 'bigmodel / GLM-4.7', value: 'bigmodel/glm-4.7'},
                {label: 'bigmodel / GLM-4.6', value: 'bigmodel/glm-4.6'},
                {label: 'bigmodel / GLM-4.6 Thinking', value: 'bigmodel/glm-4.6-thinking'},
                {label: 'bigmodel / GLM-4.5', value: 'bigmodel/glm-4.5'},
                {label: 'bigmodel / GLM-4.5 Thinking', value: 'bigmodel/glm-4.5-thinking'},
                {label: 'bigmodel / GLM-4.5-AirX Thinking', value: 'bigmodel/glm-4.5-airx-thinking'},
                {label: 'bigmodel / GLM-4.5-X Thinking', value: 'bigmodel/glm-4.5-x-thinking'},
                {label: 'bigmodel / GLM-4.5-Air Thinking', value: 'bigmodel/glm-4.5-air-thinking'}
              ]" default-value="bigmodel/glm-4.7" />
            </n-form-item>
              <n-form-item label="模型温度 (Creativity)">
                <n-slider :default-value="0.7" :step="0.1" :min="0" :max="1" />
              </n-form-item>
              <n-form-item label="最大生成长度">
                <n-input-number :default-value="2000" :step="100" />
              </n-form-item>
              <n-space justify="end">
                <n-button type="primary">保存模型设置</n-button>
              </n-space>
            </n-form>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { 
  NCard, NTabs, NTabPane, NForm, NFormItem, NInput, 
  NButton, NSpace, NAlert, NSelect, NSwitch, NCheckbox, NCheckboxGroup, NText,
  NDivider, NSlider, NInputNumber
} from 'naive-ui'

/**
 * 集成配置页面组件
 * 用于展示外部 API、自动化发布渠道和工具链的配置界面
 */
</script>

<style scoped>
.settings-page {
  max-width: 900px;
  margin: 0 auto;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>
