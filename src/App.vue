






<template>
  <n-message-provider>
    <n-dialog-provider>
      <n-notification-provider>
        <n-loading-bar-provider>
          <message-api />
          <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
            <!-- 首页 Landing -->
            <transition name="fade">
              <landing-page v-if="showLanding" @enter="showLanding = false" />
              
              <!-- 工作台 Workbench -->
              <div v-else class="app-container">
                <!-- 背景眩光装饰 -->
                <div class="glow-bg">
                  <div class="glow-1"></div>
                  <div class="glow-2"></div>
                  <div class="glow-3"></div>
                </div>
                
                <n-layout has-sider class="main-layout">
                  <n-layout-sider
                    bordered
                    :collapsed-width="80"
                    :width="80"
                    :collapsed="true"
                    class="glass-sider slim-sidebar"
                  >
                    <div class="logo-container" @click="showLanding = true">
                      <div class="logo-icon-mini">
                        <n-icon size="24" color="#ff4d4f">
                          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
                          </svg>
                        </n-icon>
                      </div>
                    </div>
                    
                    <div class="sidebar-actions">
                      <n-button quaternary circle size="large" @click="activeKey = 'generate'" :active="activeKey === 'generate'">
                        <template #icon><n-icon size="24"><thunderbolt-outlined /></n-icon></template>
                      </n-button>
                      <n-button quaternary circle size="large" @click="activeKey = 'agent-workbench'" :active="activeKey === 'agent-workbench'">
                        <template #icon><n-icon size="24"><bulb-outlined /></n-icon></template>
                      </n-button>
                      <n-button quaternary circle size="large" @click="activeKey = 'image-workbench'" :active="activeKey === 'image-workbench'">
                        <template #icon><n-icon size="24"><picture-outlined /></n-icon></template>
                      </n-button>
                      <n-button quaternary circle size="large" @click="activeKey = 'batch'" :active="activeKey === 'batch'">
                        <template #icon><n-icon size="24"><cloud-download-outlined /></n-icon></template>
                      </n-button>
                      <n-button quaternary circle size="large" @click="activeKey = 'knowledge'" :active="activeKey === 'knowledge'">
                        <template #icon><n-icon size="24"><book-outlined /></n-icon></template>
                      </n-button>
                      <n-button quaternary circle size="large" @click="activeKey = 'analysis'" :active="activeKey === 'analysis'">
                        <template #icon><n-icon size="24"><bar-chart-outlined /></n-icon></template>
                      </n-button>
                    </div>

                    <div class="sidebar-bottom">
                      <n-button quaternary circle size="large" @click="activeKey = 'settings'">
                        <template #icon><n-icon size="24"><setting-outlined /></n-icon></template>
                      </n-button>
                      <n-avatar round size="small" src="/2026115204749.png" class="sidebar-avatar" />
                    </div>
                  </n-layout-sider>
                  
                  <n-layout class="content-layout">
                    <n-layout-header class="glass-header transparent-header">
                      <div class="header-content">
                        <div class="header-left">
                        </div>
                        <div class="header-center">
                        </div>
                        <div class="header-right">
                          <n-button round type="primary" color="#1e1b4b" size="small">
                            <template #icon><n-icon><sparkles-icon /></n-icon></template>
                            Upgrade
                          </n-button>
                        </div>
                      </div>
                    </n-layout-header>
                    
                    <n-layout-content class="workbench-content" :native-scrollbar="false">
                      <div class="page-transition-container">
                        <transition name="fade-slide" mode="out-in">
                          <div :key="activeKey" class="view-wrapper">
                            <generate-page v-if="activeKey === 'generate'" />
                            <agent-workbench-page v-else-if="activeKey === 'agent-workbench'" />
                            <image-workbench-page v-else-if="activeKey === 'image-workbench'" />
                            <batch-generate-page v-else-if="activeKey === 'batch'" />
                            <knowledge-base-page v-else-if="activeKey === 'knowledge'" />
                            <help-page v-else-if="activeKey === 'help'" />
                            <settings-page v-else-if="activeKey === 'settings'" />
                            <account-analysis-page v-else-if="activeKey === 'analysis'" />
                          </div>
                        </transition>
                      </div>
                    </n-layout-content>
                  </n-layout>
                </n-layout>
              </div>
            </transition>
          </n-config-provider>
        </n-loading-bar-provider>
      </n-notification-provider>
    </n-dialog-provider>
  </n-message-provider>
</template>

<script setup>
import { ref, h, computed } from 'vue'
import { 
  NConfigProvider, 
  lightTheme,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NLoadingBarProvider,
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NIcon,
  NAvatar,
  NButton
} from 'naive-ui'
import { 
  ThunderboltOutlined, 
  FileTextOutlined,
  BookOutlined,
  SettingOutlined,
  BarChartOutlined,
  CloudDownloadOutlined,
  PictureOutlined,
  BulbOutlined
} from '@vicons/antd'

// 自定义图标组件
const SparklesIcon = () => h('svg', { viewBox: '0 0 24 24', width: '16', height: '16' }, [
  h('path', { fill: 'currentColor', d: 'M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z' })
])
import GeneratePage from './views/Generate.vue'
import BatchGeneratePage from './views/BatchGenerate.vue'
import KnowledgeBasePage from './views/KnowledgeBase.vue'
import HelpPage from './views/Help.vue'
import SettingsPage from './views/Settings.vue'
import AccountAnalysisPage from './views/AccountAnalysis.vue'
import LandingPage from './views/Landing.vue'
import MessageApi from './components/MessageApi.vue'
import ImageWorkbenchPage from './views/ImageWorkbench.vue'
import AgentWorkbenchPage from './views/AgentWorkbench.vue'

// 状态管理
const collapsed = ref(false)
const activeKey = ref('generate')
const showLanding = ref(true)
const theme = ref(lightTheme)

/**
 * Naive UI 全局主题覆盖配置
 * 定义了符合现代审美的圆角、主色调（淡蓝）和辅助色（微红）
 */
const themeOverrides = {
  common: {
    primaryColor: '#3b82f6',
    primaryColorHover: '#60a5fa',
    primaryColorPressed: '#2563eb',
    primaryColorSuppl: '#3b82f6',
    borderRadius: '12px',
    cardColor: 'rgba(255, 255, 255, 0.7)',
    modalColor: 'rgba(255, 255, 255, 0.8)',
    popoverColor: 'rgba(255, 255, 255, 0.9)',
  },
  Layout: {
    siderColor: 'rgba(255, 255, 255, 0.4)',
    headerColor: 'rgba(255, 255, 255, 0.4)',
    color: 'transparent'
  },
  Menu: {
    itemHeight: '48px',
    borderRadius: '8px',
    itemColorActive: 'rgba(59, 130, 246, 0.1)',
    itemColorActiveHover: 'rgba(59, 130, 246, 0.15)',
    itemTextColorActive: '#3b82f6',
    itemIconColorActive: '#3b82f6'
  },
  Card: {
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
  },
  Button: {
    borderRadiusMedium: '10px',
    fontWeight: '500'
  },
  Input: {
    borderRadius: '10px'
  },
  Scrollbar: {
    color: 'rgba(0, 0, 0, 0.08)',
    colorHover: 'rgba(0, 0, 0, 0.15)',
    width: '6px',
    height: '6px',
    borderRadius: '10px'
  }
}

const menuOptions = [
  {
    label: '一键生成',
    key: 'generate',
    icon: () => h(ThunderboltOutlined)
  },
  {
    label: '智能创作',
    key: 'agent-workbench',
    icon: () => h(BulbOutlined)
  },
  {
    label: '图像工作台',
    key: 'image-workbench',
    icon: () => h(PictureOutlined)
  },
  {
    label: '批量生成',
    key: 'batch',
    icon: () => h(CloudDownloadOutlined)
  },
  {
    label: '内容知识库',
    key: 'knowledge',
    icon: () => h(BookOutlined)
  },
  {
    label: '账号定位分析',
    key: 'analysis',
    icon: () => h(BarChartOutlined)
  },
  {
    label: '帮助中心',
    key: 'help',
    icon: () => h(FileTextOutlined)
  },
  {
    label: '集成配置',
    key: 'settings',
    icon: () => h(SettingOutlined)
  }
]

const currentTitle = computed(() => {
  const option = menuOptions.find(opt => opt.key === activeKey.value)
  return option ? option.label : ''
})

/**
 * 切换菜单处理函数
 * @param {string} key 选中的菜单项 key
 */
const handleMenuSelect = (key) => {
  activeKey.value = key
}
</script>

<style>
/* 全局基础样式 */
html {
  scroll-behavior: smooth;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  /* 允许首页滚动，工作台内部由 app-container 锁定 */
  overflow-x: hidden;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #f0f4f8;
}

/* 应用容器与背景眩光 */
.app-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #f8fafc;
}

.glow-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.glow-1 {
  position: absolute;
  top: -10%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%);
  filter: blur(60px);
  animation: float 20s infinite alternate;
}

.glow-2 {
  position: absolute;
  bottom: -5%;
  left: -5%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 77, 79, 0.1) 0%, rgba(255, 77, 79, 0) 70%);
  filter: blur(50px);
  animation: float 15s infinite alternate-reverse;
}

.glow-3 {
  position: absolute;
  top: 30%;
  left: 20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0) 70%);
  filter: blur(40px);
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(50px, 50px) scale(1.1); }
}

/* 布局样式重构 */
.main-layout {
  height: 100vh;
  background: transparent !important;
  z-index: 1;
}

.glass-sider.slim-sidebar {
  background: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.3) !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
}

.logo-container {
  margin-bottom: 40px;
  cursor: pointer;
}

.logo-icon-mini {
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.1);
}

.sidebar-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.sidebar-avatar {
  border: 2px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.glass-header.transparent-header {
  height: 64px;
  background: transparent !important;
  border-bottom: none !important;
  backdrop-filter: none !important;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
}

.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.workbench-content {
  padding: 0 40px 40px 40px !important;
  background: transparent !important;
}

.view-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.view-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

/* 全局组件样式优化 */
.n-card {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

.n-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.n-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}
</style>




