<template>
  <div class="product-promotion">
    <div class="promotion-header">
      <div class="title-row">
        <n-icon size="24" color="#ff2442" class="title-icon">
          <gift-outlined />
        </n-icon>
        <n-text strong class="title">精选选品赚钱</n-text>
        <n-tag type="error" size="small" round class="hot-tag">高佣爆款</n-tag>
      </div>
      <n-text depth="3" class="subtitle">选择爆款产品，AI 自动为你生成高转化带货文案</n-text>
    </div>
    
    <div class="product-scroll-container" ref="scrollContainer" @wheel="handleWheel">
      <div class="product-list">
        <n-card
          v-for="product in products"
          :key="product.id"
          class="product-card"
          hoverable
          content-style="padding: 12px;"
          @click="selectProduct(product)"
        >
          <div class="product-content">
            <div class="product-info">
              <n-text strong class="product-name">{{ product.name }}</n-text>
              <n-text depth="3" class="product-desc">{{ product.description }}</n-text>
            </div>
            <div class="product-footer">
              <div class="price-info">
                <span class="label">价格</span>
                <span class="price">¥{{ product.price }}</span>
              </div>
              <div class="commission-info">
                <span class="label">佣金</span>
                <span class="commission">¥{{ product.commission }}</span>
              </div>
            </div>
          </div>
          <template #action>
            <n-button type="primary" secondary block size="small" class="select-btn">
              选择此产品
            </n-button>
          </template>
        </n-card>
        <!-- 占位，防止最后一个卡片阴影被切断 -->
        <div style="width: 40px; flex-shrink: 0;"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { GiftOutlined } from '@vicons/antd'

const emit = defineEmits(['select'])
const scrollContainer = ref(null)

/**
 * 处理鼠标滚轮事件，将垂直滚动转换为横向滚动
 * @param {WheelEvent} e 滚轮事件
 */
const handleWheel = (e) => {
  if (scrollContainer.value) {
    e.preventDefault()
    scrollContainer.value.scrollLeft += e.deltaY
  }
}

/**
 * 模拟选品列表数据 - 扩充到10个产品
 */
const products = [
  {
    id: 1,
    name: '极简陶瓷花瓶',
    description: '北欧简约风，手工打造，适合各种家居环境。',
    price: '89.0',
    commission: '15.5',
    keywords: '极简风陶瓷花瓶, 北欧简约, 家居装饰, 氛围感, 插花器',
    requirements: '突出简约设计感，强调手工品质，建议搭配干花或绿植拍摄。'
  },
  {
    id: 2,
    name: '无线降噪耳机',
    description: '40dB深度降噪，50小时续航，Hi-Fi级音质。',
    price: '299.0',
    commission: '45.0',
    keywords: '无线降噪耳机, 蓝牙耳机, 沉浸式听歌, 办公必备, 高颜值耳机',
    requirements: '突出降噪效果和续航能力，适合学生党 and 通勤族，强调性价比。'
  },
  {
    id: 3,
    name: '复古胶片相机',
    description: '迷你便携，一键成片，自带复古滤镜效果。',
    price: '158.0',
    commission: '22.0',
    keywords: '复古胶片相机, 迷你相机, 记录生活, 拍照出片, 氛围感神器',
    requirements: '强调复古滤镜和便携性，适合旅游和日常记录，主打氛围感。'
  },
  {
    id: 4,
    name: '智能感应夜灯',
    description: '人来即亮，温馨柔光，无需布线，超长续航。',
    price: '45.0',
    commission: '8.5',
    keywords: '智能感应灯, 夜灯, 居家好物, 提升幸福感, 卧室装饰',
    requirements: '突出感应灵敏度和光线柔和度，强调居家安全感和便利性。'
  },
  {
    id: 5,
    name: '便携咖啡冲泡壶',
    description: '法压壶式设计，3分钟速享美味咖啡。',
    price: '128.0',
    commission: '18.0',
    keywords: '便携咖啡壶, 法压壶, 露营必备, 办公室好物, 咖啡爱好者',
    requirements: '突出便携性和操作简单，适合户外露营和办公场景，强调随时随地享受。'
  },
  {
    id: 6,
    name: '多功能护颈枕',
    description: '记忆棉材质，360度环绕支撑，有效缓解颈椎压力。',
    price: '79.0',
    commission: '12.0',
    keywords: '护颈枕, 记忆棉U型枕, 旅行必备, 办公室午休, 颈椎健康',
    requirements: '突出人体工学设计和舒适支撑力，适合长期伏案工作或长途旅行的人群。'
  },
  {
    id: 7,
    name: '桌面空气加湿器',
    description: '超声波静音喷雾，彩色氛围灯，500ml大容量。',
    price: '59.0',
    commission: '9.8',
    keywords: '加湿器, 桌面好物, 空调房必备, 补水加湿, 居家氛围感',
    requirements: '强调静音运行和细腻水雾，适合干燥季节使用，主打提升生活舒适度。'
  },
  {
    id: 8,
    name: '日式和风餐具套装',
    description: '陶瓷烧制，精美釉下彩，提升餐桌仪式感。',
    price: '139.0',
    commission: '25.0',
    keywords: '和风餐具, 日式碗盘, 独居仪式感, 餐桌美学, 家用瓷器',
    requirements: '突出餐具的高颜值和工艺细节，适合热爱下厨和分享生活的博主。'
  },
  {
    id: 9,
    name: '折叠式补光自拍杆',
    description: '自带双补光灯，蓝牙远程控制，360度旋转拍摄。',
    price: '99.0',
    commission: '16.5',
    keywords: '自拍杆, 直播支架, 拍照神器, VLOG必备, 补光灯',
    requirements: '强调补光效果和折叠便携性，适合自拍、直播和短视频拍摄。'
  },
  {
    id: 10,
    name: '智能保温杯',
    description: '轻触显示温度，316不锈钢内胆，长效保温保冷。',
    price: '68.0',
    commission: '10.5',
    keywords: '智能保温杯, 水杯, 养生必备, 职场好物, 礼品首选',
    requirements: '突出测温功能和材质安全，强调长效锁温，适合学生和白领使用。'
  }
]

/**
 * 处理选品点击事件
 * @param {Object} product 选中的产品对象
 */
const selectProduct = (product) => {
  emit('select', {
    keywords: product.keywords,
    specialRequirements: product.requirements
  })
}
</script>

<style scoped>
.product-promotion {
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}

.promotion-header {
  margin-bottom: 16px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.title-icon {
  display: flex;
  align-items: center;
}

.title {
  font-size: 18px;
  background: linear-gradient(45deg, #ff2442, #ff6b81);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hot-tag {
  font-weight: bold;
}

.subtitle {
  font-size: 13px;
  color: #666;
}

.product-scroll-container {
  overflow-x: auto;
  padding-bottom: 12px;
  cursor: grab;
  scroll-behavior: smooth;
  /* 隐藏滚动条但保留滚动功能 */
  scrollbar-width: none; /* Firefox */
}

.product-scroll-container:active {
  cursor: grabbing;
}

.product-scroll-container::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.product-list {
  display: flex;
  gap: 16px;
  width: max-content;
}

.product-card {
  width: 260px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.product-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 36, 66, 0.3);
  box-shadow: 0 12px 24px rgba(255, 36, 66, 0.1) !important;
}

.product-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 140px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-size: 15px;
  color: #333;
}

.product-desc {
  font-size: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px dashed #eee;
}

.price-info, .commission-info {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}

.price {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.commission {
  font-size: 16px;
  color: #ff2442;
  font-weight: bold;
}

.select-btn {
  font-weight: 600;
}
</style>
