






<template>
  <n-message-provider>
    <n-dialog-provider>
      <n-notification-provider>
        <n-loading-bar-provider>
          <message-api />
          <n-config-provider :theme="theme">
            <n-layout has-sider>
              <n-layout-sider
                bordered
                :collapsed-width="64"
                width="240"
                show-trigger="bar"
                :collapsed="collapsed"
              >
                <div class="logo">
                  <n-icon size="40" color="#ff2442">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
                    </svg>
                  </n-icon>
                  <span v-if="!collapsed">小红书生成器</span>
                </div>
                <n-menu
                  :collapsed="collapsed"
                  :collapsed-width="64"
                  :collapsed-icon-size="22"
                  :options="menuOptions"
                  :value="activeKey"
                  @update:value="handleMenuSelect"
                />
              </n-layout-sider>
              <n-layout>
                <n-layout-header bordered style="height: 64px; padding: 24px;">
                  <div class="header-content">
                    <h2>小红书文案图文生成工具</h2>
                  </div>
                </n-layout-header>
                <n-layout-content>
                  <div class="content">
                    <generate-page />
                  </div>
                </n-layout-content>
              </n-layout>
            </n-layout>
          </n-config-provider>
        </n-loading-bar-provider>
      </n-notification-provider>
    </n-dialog-provider>
  </n-message-provider>
</template>

<script setup>
import { ref, h } from 'vue'
import { 
  NConfigProvider, 
  darkTheme, 
  lightTheme,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NLoadingBarProvider
} from 'naive-ui'
import { 
  ThunderboltOutlined, 
  FileTextOutlined 
} from '@vicons/antd'
import GeneratePage from './views/Generate.vue'
import MessageApi from './components/MessageApi.vue'

const collapsed = ref(false)
const activeKey = ref('generate')
const theme = ref(lightTheme)

const menuOptions = [
  {
    label: '生成内容',
    key: 'generate',
    icon: () => h(ThunderboltOutlined)
  },
  {
    label: '帮助中心',
    key: 'help',
    icon: () => h(FileTextOutlined)
  }
]

const handleMenuSelect = (key) => {
  activeKey.value = key
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  background: #f5f7fa;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  font-size: 16px;
  font-weight: 600;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-content h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.content {
  padding: 24px;
  min-height: calc(100vh - 128px);
}

:deep(.n-layout-sider) {
  background: white;
  transition: all 0.3s ease;
}

:deep(.n-layout-header) {
  background: white;
  border-bottom: 1px solid #f0f0f0;
}
</style>




