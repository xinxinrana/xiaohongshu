<template>
  <div class="landing-container">
    <!-- 背景眩光装饰 -->
    <div class="glow-bg">
      <div class="glow-1"></div>
      <div class="glow-2"></div>
      <div class="glow-3"></div>
    </div>

    <!-- 顶部导航 -->
    <nav class="navbar">
      <div class="logo">
        <n-icon size="32" color="#ff2442">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
          </svg>
        </n-icon>
        <span class="logo-text">RedNote AI</span>
      </div>
      <div class="nav-links">
        <a href="#features">功能特性</a>
        <a href="#solutions">解决方案</a>
        <n-button round type="primary" @click="enterApp">进入工作台</n-button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <n-badge value="创作即收益" type="error" :offset="[20, 0]">
          <h1 class="main-title">开启 AI 创作<br/><span class="gradient-text">躺赢副业新时代</span></h1>
        </n-badge>
        <p class="hero-subtitle">
          不再为灵感发愁，不再为剪辑烦恼。
          <span class="highlight-text">RedNote AI</span> 深度整合小红书爆款逻辑，
          助您一键生成高质量内容，精准对接高佣爆品，让每一篇笔记都成为您的“数字资产”。
        </p>
        <div class="hero-actions">
          <n-button size="large" type="primary" round class="primary-btn" @click="enterApp">
            开启副业之旅
            <template #icon>
              <n-icon><arrow-right-outlined /></n-icon>
            </template>
          </n-button>
          <n-button size="large" round secondary class="secondary-btn">
            了解赚钱攻略
          </n-button>
        </div>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">¥5k+</span>
            <span class="stat-label">月均副业收入</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">10min</span>
            <span class="stat-label">极速出片</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">100%</span>
            <span class="stat-label">零基础上手</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <!-- 核心卖点卡片 -->
        <div class="floating-card earning-card">
          <div class="earning-header">
            <n-icon size="24" color="#facc15"><dollar-outlined /></n-icon>
            <span>今日预计佣金</span>
          </div>
          <div class="earning-amount">¥864.20</div>
          <div class="earning-tag">+12.5% 较昨日</div>
        </div>

        <div class="floating-card preview-card">
          <div class="card-header">
            <div class="dot red"></div>
            <div class="dot yellow"></div>
            <div class="dot green"></div>
          </div>
          <div class="card-body">
            <div class="skeleton title"></div>
            <div class="skeleton text short"></div>
            <div class="skeleton text long"></div>
            <div class="image-placeholder">
              <div class="ai-generating">
                <div class="scanner"></div>
                <n-icon size="48" color="rgba(255, 36, 66, 0.2)"><picture-outlined /></n-icon>
              </div>
            </div>
          </div>
        </div>
        
        <div class="floating-card mcp-card">
          <div class="mcp-badge">MCP 联网分析中</div>
          <div class="tool-icon"><search-outlined /></div>
          <div class="tool-info">
            <span class="tool-name">全网爆款追踪</span>
            <span class="tool-status">发现 3 个潜力爆品...</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Monetization Section -->
    <section class="monetization-path">
      <div class="glass-container">
        <div class="path-header">
          <h2>简单三步，开启收益转化</h2>
          <p>从内容到美金，我们为您打通全链路</p>
        </div>
        <div class="path-steps">
          <div class="step">
            <div class="step-num">01</div>
            <h4>精选爆品</h4>
            <p>内置高佣产品池，AI 自动匹配适合您的赛道。</p>
          </div>
          <div class="step-arrow">
            <n-icon size="24"><arrow-right-outlined /></n-icon>
          </div>
          <div class="step">
            <div class="step-num">02</div>
            <h4>AI 创作</h4>
            <p>一键生成爆款文案与配图，MCP 实时同步热点。</p>
          </div>
          <div class="step-arrow">
            <n-icon size="24"><arrow-right-outlined /></n-icon>
          </div>
          <div class="step">
            <div class="step-num">03</div>
            <h4>分发获利</h4>
            <p>笔记发布即带货，躺着也能赚取丰厚佣金。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="section-header">
        <h2 class="section-title">不仅仅是创作工具</h2>
        <p class="section-subtitle">更是您的个人 AI 赚钱助手</p>
      </div>
      <div class="feature-grid">
        <div class="feature-item glass-card">
          <div class="feature-icon red"><thunderbolt-outlined /></div>
          <h3>AI 爆款生成器</h3>
          <p>融合千万级爆款笔记基因，生成的每一段话都精准击中用户情绪。</p>
          <div class="feature-tag">核心引擎</div>
        </div>
        <div class="feature-item glass-card">
          <div class="feature-icon blue"><shopping-cart-outlined /></div>
          <h3>选品中心</h3>
          <p>实时监控电商平台高转化商品，助您精准选出“吸金”爆品。</p>
          <div class="feature-tag">高佣必选</div>
        </div>
        <div class="feature-item glass-card">
          <div class="feature-icon gold"><money-collect-outlined /></div>
          <h3>收益加速器</h3>
          <p>通过批量化生产能力，让您的创作规模化，收益实现指数级增长。</p>
          <div class="feature-tag">效率神器</div>
        </div>
        <div class="feature-item glass-card">
          <div class="feature-icon green"><api-outlined /></div>
          <h3>MCP 生态连接</h3>
          <p>无缝集成第三方工具，从搜热搜到抓数据，一切尽在掌握。</p>
          <div class="feature-tag">深度整合</div>
        </div>
      </div>
    </section>

    <!-- Solutions Section -->
    <section id="solutions" class="solutions">
      <div class="solutions-container">
        <div class="solution-card">
          <div class="solution-info">
            <n-badge value="Hot" type="error">
              <span class="solution-tag">全自动工作流</span>
            </n-badge>
            <h2>批量创作，收益翻倍</h2>
            <p>告别单兵作战。我们的批量生成系统支持一键导入关键词，自动匹配素材，流水线式生产爆款笔记。一个人，就是一个矩阵。</p>
            <ul class="solution-list">
              <li><n-icon><check-circle-outlined /></n-icon> 支持 Excel/TXT 批量导入关键词</li>
              <li><n-icon><check-circle-outlined /></n-icon> AI 自动去重，确保每一篇都是原创</li>
              <li><n-icon><check-circle-outlined /></n-icon> 自动配图与风格迁移技术</li>
            </ul>
            <n-button type="primary" secondary round @click="enterApp">立即体验批量生产</n-button>
          </div>
          <div class="solution-visual">
            <div class="visual-mockup batch-mockup">
              <div class="mockup-header">
                <div class="dots"><span></span><span></span><span></span></div>
                <div class="address-bar">batch_generator.ai</div>
              </div>
              <div class="mockup-content">
                <div class="task-item" v-for="i in 3" :key="i">
                  <div class="task-status processing"></div>
                  <div class="task-name">爆款文案 #00{{i}} 生成中...</div>
                  <div class="task-progress"><div class="bar" :style="{width: 40 + i*20 + '%'}"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="solution-card reverse">
          <div class="solution-info">
            <span class="solution-tag blue">智能分析</span>
            <h2>懂用户，更懂算法</h2>
            <p>深度分析您的账号数据与对标博主。AI 自动拆解爆款套路，为您提供精准的选题建议与发布策略。让每一次发布都有迹可循。</p>
            <ul class="solution-list">
              <li><n-icon><check-circle-outlined /></n-icon> 对标博主风格一键拆解</li>
              <li><n-icon><check-circle-outlined /></n-icon> 账号权重诊断与优化建议</li>
              <li><n-icon><check-circle-outlined /></n-icon> 黄金发布时间智能预测</li>
            </ul>
            <n-button type="info" secondary round @click="enterApp">开始账号诊断</n-button>
          </div>
          <div class="solution-visual">
            <div class="visual-mockup analysis-mockup">
              <div class="chart-container">
                <div class="chart-bar" v-for="h in [60, 80, 40, 90, 70, 85]" :key="h" :style="{height: h + '%'}"></div>
              </div>
              <div class="analysis-overlay">
                <div class="analysis-badge">爆款潜力: 98%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="logo">
            <n-icon size="28" color="#ff2442"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/></svg></n-icon>
            <span class="logo-text">RedNote AI</span>
          </div>
          <p>AI 驱动的新一代内容变现平台</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>产品服务</h4>
            <ul>
              <li><a href="#">AI 文案生成</a></li>
              <li><a href="#">批量生产工具</a></li>
              <li><a href="#">高佣选品中心</a></li>
              <li><a href="#">MCP 插件商店</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>帮助与支持</h4>
            <ul>
              <li><a href="#">新手赚钱攻略</a></li>
              <li><a href="#">常见问题解答</a></li>
              <li><a href="#">社区交流群</a></li>
              <li><a href="#">联系我们</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>法律条款</h4>
            <ul>
              <li><a href="#">服务协议</a></li>
              <li><a href="#">隐私政策</a></li>
              <li><a href="#">版权声明</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-copyright">
          © 2026 RedNote AI. 助您轻松开启数字副业之旅。
        </div>
        <div class="footer-social">
          <!-- 社交图标占位 -->
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { 
  ArrowRightOutlined, 
  ThunderboltOutlined, 
  CloudDownloadOutlined, 
  GiftOutlined, 
  SearchOutlined,
  PictureOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  MoneyCollectOutlined,
  ApiOutlined,
  CheckCircleOutlined
} from '@vicons/antd'

const emit = defineEmits(['enter'])

/**
 * 进入工作台
 */
const enterApp = () => {
  emit('enter')
}
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
  background: #f8fafc;
  color: #1e293b;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* 背景眩光 */
.glow-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.glow-1 {
  position: absolute;
  top: -10%;
  right: -10%;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, rgba(255, 36, 66, 0.15) 0%, transparent 70%);
  filter: blur(80px);
  animation: float 20s infinite alternate;
}

.glow-2 {
  position: absolute;
  bottom: -10%;
  left: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  filter: blur(80px);
  animation: float 25s infinite alternate-reverse;
}

.glow-3 {
  position: absolute;
  top: 40%;
  left: 30%;
  width: 40%;
  height: 40%;
  background: radial-gradient(circle, rgba(250, 204, 21, 0.1) 0%, transparent 70%);
  filter: blur(80px);
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(5%, 5%) scale(1.1); }
}

/* 导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 80px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -1px;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-links a {
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 15px;
}

.nav-links a:hover {
  color: #ff2442;
  transform: translateY(-1px);
}

/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: center;
  gap: 60px;
  padding: 100px 80px 120px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.main-title {
  font-size: 76px;
  line-height: 1.05;
  font-weight: 900;
  margin-bottom: 28px;
  color: #0f172a;
  letter-spacing: -3px;
}

.gradient-text {
  background: linear-gradient(90deg, #ff2442, #ff6b81, #3b82f6, #ff2442);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine 8s linear infinite;
}

@keyframes shine {
  to { background-position: 300% center; }
}

.hero-subtitle {
  font-size: 22px;
  line-height: 1.6;
  color: #475569;
  margin-bottom: 48px;
  max-width: 620px;
}

.highlight-text {
  color: #ff2442;
  font-weight: 700;
  position: relative;
}

.hero-actions {
  display: flex;
  gap: 20px;
  margin-bottom: 64px;
}

.primary-btn {
  height: 60px !important;
  padding: 0 40px !important;
  font-size: 19px !important;
  font-weight: 700 !important;
  box-shadow: 0 20px 40px -10px rgba(255, 36, 66, 0.4) !important;
  transition: all 0.3s !important;
}

.primary-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(255, 36, 66, 0.5) !important;
}

.secondary-btn {
  height: 60px !important;
  padding: 0 40px !important;
  font-size: 19px !important;
  font-weight: 700 !important;
  background: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
}

.stats {
  display: flex;
  align-items: center;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 36px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 44px;
  background: linear-gradient(to bottom, transparent, #e2e8f0, transparent);
}

/* Hero Visual */
.hero-visual {
  position: relative;
  height: 540px;
}

.floating-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  animation: float-card 6s infinite ease-in-out;
  z-index: 2;
}

@keyframes float-card {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-20px) rotate(1deg); }
}

.preview-card {
  width: 300px;
  padding: 24px;
  top: 40px;
  left: 0;
}

.earning-card {
  width: 220px;
  padding: 20px;
  top: -20px;
  right: 40px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(250, 204, 21, 0.3);
  animation-delay: -1s;
}

.earning-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 8px;
}

.earning-amount {
  font-size: 32px;
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 4px;
}

.earning-tag {
  font-size: 12px;
  color: #10b981;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 8px;
  border-radius: 100px;
  display: inline-block;
}

.ai-generating {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
}

.scanner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, transparent, #ff2442, transparent);
  animation: scan 3s infinite ease-in-out;
  z-index: 1;
  box-shadow: 0 0 15px rgba(255, 36, 66, 0.5);
}

@keyframes scan {
  0%, 100% { top: 0; opacity: 0; }
  10%, 90% { opacity: 1; }
  50% { top: 100%; }
}

/* Monetization Path */
.monetization-path {
  padding: 60px 80px;
  max-width: 1400px;
  margin: 0 auto;
}

.glass-container {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 40px;
  padding: 60px;
  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.05);
}

.path-header {
  text-align: center;
  margin-bottom: 60px;
}

.path-header h2 {
  font-size: 40px;
  font-weight: 800;
  margin-bottom: 16px;
  color: #0f172a;
}

.path-header p {
  font-size: 18px;
  color: #64748b;
}

.path-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.step {
  flex: 1;
  text-align: center;
  padding: 30px;
  border-radius: 24px;
  transition: all 0.3s;
}

.step:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(-5px);
}

.step-num {
  font-size: 48px;
  font-weight: 900;
  color: rgba(255, 36, 66, 0.1);
  margin-bottom: -20px;
}

.step h4 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1e293b;
}

.step p {
  color: #64748b;
  line-height: 1.6;
}

.step-arrow {
  color: #cbd5e1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: translateX(0); opacity: 0.5; }
  50% { transform: translateX(10px); opacity: 1; }
}

/* Features Section */
.features {
  padding: 120px 80px;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: 52px;
  font-weight: 900;
  margin-bottom: 20px;
  letter-spacing: -1px;
}

.section-subtitle {
  font-size: 20px;
  color: #64748b;
  font-weight: 500;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.feature-item {
  padding: 48px 36px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.feature-item:hover {
  transform: translateY(-15px);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.08);
  border-color: rgba(255, 36, 66, 0.2);
}

.glass-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 32px;
}

.feature-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 32px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}

.dot { width: 8px; height: 8px; border-radius: 50%; }
.red { background: #ff5f57; }
.yellow { background: #febc2e; }
.green { background: #28c840; }

.skeleton {
  background: #f1f5f9;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton.title { height: 20px; width: 60%; }
.skeleton.text { height: 12px; }
.skeleton.text.short { width: 40%; }
.skeleton.text.long { width: 90%; }

.image-placeholder {
  height: 140px;
  background: #f8fafc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e2e8f0;
}

.mcp-card {
  width: 240px;
  padding: 16px;
  right: 0;
  top: 100px;
  animation-delay: -2s;
}

.mcp-badge {
  font-size: 10px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 4px 8px;
  border-radius: 100px;
  display: inline-block;
  margin-bottom: 12px;
}

.tool-icon {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 12px;
}

.tool-name { display: block; font-weight: 600; font-size: 14px; }
.tool-status { display: block; font-size: 12px; color: #64748b; }

.income-card {
  width: 200px;
  padding: 20px;
  bottom: 40px;
  left: 100px;
  animation-delay: -4s;
}

.income-title { font-size: 12px; color: #64748b; margin-bottom: 4px; }
.income-value { font-size: 24px; font-weight: 800; color: #ff2442; margin-bottom: 16px; }

.income-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 60px;
}

.bar {
  flex: 1;
  background: rgba(255, 36, 66, 0.2);
  border-radius: 4px;
  transition: height 0.3s;
}

.bar:last-child {
  background: #ff2442;
}

/* Features Section */
.features {
  padding: 120px 80px;
  max-width: 1440px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 18px;
  color: #64748b;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.feature-item {
  padding: 40px 32px;
  text-align: center;
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateY(-10px);
  background: white;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.05);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 24px;
}

.feature-icon.red { background: linear-gradient(135deg, rgba(255, 36, 66, 0.2) 0%, rgba(255, 36, 66, 0.05) 100%); color: #ff2442; }
.feature-icon.blue { background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%); color: #3b82f6; }
.feature-icon.gold { background: linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(250, 204, 21, 0.05) 100%); color: #ca8a04; }
.feature-icon.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%); color: #10b981; }

.feature-tag {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  background: rgba(100, 116, 139, 0.1);
  padding: 2px 8px;
  border-radius: 100px;
  display: inline-block;
  margin-top: 16px;
}

.feature-item h3 {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 16px;
  color: #1e293b;
}

.feature-item p {
  color: #64748b;
  line-height: 1.7;
  font-size: 15px;
}

.mcp-card {
  width: 260px;
  padding: 20px;
  right: 0;
  top: 140px;
  animation-delay: -2s;
  background: rgba(255, 255, 255, 0.7);
}

.mcp-badge {
  font-size: 11px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 4px 12px;
  border-radius: 100px;
  display: inline-block;
  margin-bottom: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.tool-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 16px;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.tool-name { display: block; font-weight: 700; font-size: 15px; color: #1e293b; }
.tool-status { display: block; font-size: 13px; color: #64748b; margin-top: 2px; }

/* Footer */
.footer {
  padding: 80px 80px 40px;
  background: white;
  border-top: 1px solid #f1f5f9;
  position: relative;
  z-index: 1;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.footer-brand p {
  color: #64748b;
  margin-top: 12px;
  font-size: 15px;
}

.footer-links {
  display: flex;
  gap: 80px;
}

.link-group h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1e293b;
}

.link-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-group li {
  margin-bottom: 12px;
}

.link-group a {
  text-decoration: none;
  color: #64748b;
  transition: color 0.3s;
  font-size: 14px;
}

.link-group a:hover {
  color: #ff2442;
}

.footer-bottom {
  max-width: 1400px;
  margin: 60px auto 0;
  padding-top: 30px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-copyright {
  color: #94a3b8;
  font-size: 14px;
}

/* Solutions Section */
.solutions {
  padding: 120px 80px;
  max-width: 1400px;
  margin: 0 auto;
}

.solutions-container {
  display: flex;
  flex-direction: column;
  gap: 120px;
}

.solution-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 80px;
}

.solution-card.reverse {
  direction: rtl;
}

.solution-card.reverse .solution-info {
  direction: ltr;
}

.solution-info h2 {
  font-size: 48px;
  font-weight: 800;
  margin: 20px 0;
  color: #0f172a;
}

.solution-info p {
  font-size: 18px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 32px;
}

.solution-tag {
  font-size: 13px;
  font-weight: 700;
  color: #ff2442;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.solution-tag.blue { color: #3b82f6; }

.solution-list {
  list-style: none;
  padding: 0;
  margin-bottom: 40px;
}

.solution-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  color: #475569;
  font-weight: 500;
}

.solution-list .n-icon {
  color: #10b981;
  font-size: 20px;
}

.solution-visual {
  position: relative;
}

.visual-mockup {
  background: white;
  border-radius: 24px;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
  height: 400px;
}

.mockup-header {
  height: 40px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.dots { display: flex; gap: 6px; }
.dots span { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; }

.address-bar {
  background: white;
  height: 24px;
  flex: 1;
  border-radius: 6px;
  font-size: 11px;
  color: #94a3b8;
  display: flex; 
  align-items: center;
  padding: 0 12px;
  border: 1px solid #f1f5f9;
}

.mockup-content {
  padding: 24px;
}

.task-item {
  margin-bottom: 24px;
}

.task-name { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.task-progress { height: 6px; background: #f1f5f9; border-radius: 100px; overflow: hidden; }
.task-progress .bar { height: 100%; background: #3b82f6; border-radius: 100px; transition: width 1s; }

.analysis-mockup {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 12px;
  padding: 40px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 8px 8px 0 0;
  transition: height 1s;
}

.analysis-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}

.analysis-badge {
  background: rgba(16, 185, 129, 0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 100px;
  font-weight: 800;
  box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);
  backdrop-filter: blur(10px);
}

@media (max-width: 1024px) {
  .hero, .solutions, .features, .monetization-path {
    padding: 60px 24px;
  }
  
  .hero { grid-template-columns: 1fr; text-align: center; }
  .hero-subtitle { margin-left: auto; margin-right: auto; }
  .hero-actions { justify-content: center; }
  .stats { justify-content: center; }
  .hero-visual { display: none; }
  
  .solution-card { grid-template-columns: 1fr; gap: 40px; }
  .solution-card.reverse { direction: ltr; }
  
  .feature-grid { grid-template-columns: repeat(2, 1fr); }
  
  .path-steps { flex-direction: column; }
  .step-arrow { transform: rotate(90deg); margin: 20px 0; }
}

@media (max-width: 640px) {
  .feature-grid { grid-template-columns: 1fr; }
  .main-title { font-size: 48px; }
}
</style>
