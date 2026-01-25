# 图像生成工作台实施计划

## 概述
为小红书智能创作工具添加独立的图像生成工作台，包括后端API升级（多图融合、批量生成、流式输出）和前端工作台页面开发。

---

## 任务1：后端图像生成接口升级

### 1.1 模型配置确认
**状态**: 已确认配置正确
- `backend/.env`: `VOLCENGINE_MODEL=doubao-seedream-4-5-251128` ✓
- `backend/src/services/imageService.js`: 使用环境变量配置 ✓

### 1.2 新增API接口

#### Service层 - `backend/src/services/imageService.js`

**新增方法1: 多图融合生成**
```javascript
static async generateImageFromMultipleImages(prompt, imageUrls, options = {})
```
- 参数: `prompt`, `imageUrls` (2-14张), `options` (size, resolution, max_images, watermark)
- 调用火山引擎多图融合端点
- 返回融合后的图像URL

**新增方法2: 批量图像生成**
```javascript
static async generateBatchImages(prompt, referenceImages, options = {})
```
- 参数: `prompt`, `referenceImages` (0-5张), `options` (max_images 1-15, size, resolution)
- 支持并发/顺序生成模式
- 返回图像URL数组和统计信息

**新增方法3: 流式图像生成**
```javascript
static async generateImageWithStream(prompt, options = {}, streamCallback)
```
- 启用 `stream: true` 参数
- 使用 axios `responseType: 'stream'`
- 解析SSE格式数据，通过回调实时返回进度

**新增辅助方法: 参数验证**
```javascript
static _validateGenerationParams(params)
```
- 统一验证尺寸、分辨率、数量、URL格式

#### Controller层 - `backend/src/controllers/imageController.js`

**新增端点:**
| 方法 | 路径 | 功能 |
|------|------|------|
| `generateMultiFusion` | POST `/api/image/multi-fusion` | 多图融合生成 |
| `generateBatchImages` | POST `/api/image/batch-generation` | 批量图像生成 |
| `generateWithStreaming` | POST `/api/image/stream-generation` | 流式图像生成(SSE) |

#### 路由配置 - `backend/src/routes/index.js`

新增三条路由注册。

### 1.3 支持的参数配置

**图像尺寸** (8种预设):
- `1664x928` (默认横屏)
- `1024x1024` (正方形)
- `720x1280` (竖屏9:16)
- `1280x720` (横屏16:9)
- `768x1344`, `1344x768`, `832x1216`, `1216x832`

**清晰度**: `2K`, `4K`

**生成数量**: 1-15张

**超时配置**:
- 文生图: 60秒
- 图生图: 180秒
- 多图融合: 240秒
- 批量/流式: 300秒

---

## 任务2：前端图像生成工作台页面

### 2.1 文件结构

```
src/
├── views/
│   └── ImageWorkbench.vue          # 主页面组件 (新建)
├── components/
│   └── image-workbench/            # 子组件目录 (新建)
│       ├── ImageUploadArea.vue     # 参考图上传区
│       ├── ParameterPanel.vue      # 参数控制面板
│       ├── PromptInput.vue         # 提示词输入区
│       ├── ImageGallery.vue        # 图像展示区(瀑布流)
│       └── ModeSelector.vue        # 模式选择器
├── services/
│   └── api.js                      # 新增图像生成API方法
└── App.vue                         # 添加导航入口
```

### 2.2 App.vue 修改

**导入新组件:**
```javascript
import ImageWorkbenchPage from './views/ImageWorkbench.vue'
import { PictureOutlined } from '@vicons/antd'
```

**添加侧边栏按钮** (第58行后):
```vue
<n-button quaternary circle size="large" @click="activeKey = 'image-workbench'">
  <template #icon><n-icon size="24"><picture-outlined /></n-icon></template>
</n-button>
```

**添加页面条件渲染** (第94行后):
```vue
<image-workbench-page v-else-if="activeKey === 'image-workbench'" />
```

**添加菜单选项**:
```javascript
{ label: '图像生成工具', key: 'image-workbench', icon: () => h(PictureOutlined) }
```

### 2.3 ImageWorkbench.vue 主页面结构

```
+------------------------------------------------------------------+
|  顶部标题区: "图像生成工作台"                                      |
+------------------------------------------------------------------+
|  模式选择 | 参数控制栏                                            |
|  [自动][故事书][连环画] | [2K/4K] [比例] [尺寸] [张数: 1-15]      |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------+  +--------------------------------------+    |
|  | 参考图上传区      |  |  图像展示区 (瀑布流布局)              |    |
|  | - 拖拽上传       |  |  - 生成的图像网格                     |    |
|  | - 点击选择       |  |  - 预览/下载/删除操作                 |    |
|  | - 多图预览       |  |  - 生成进度指示                       |    |
|  +------------------+  +--------------------------------------+    |
|                                                                    |
+------------------------------------------------------------------+
|  底部提示词输入区 (固定)                                           |
|  [模板库] [负面提示词] [输入框...] [生成按钮]                      |
+------------------------------------------------------------------+
```

### 2.4 核心功能实现

**参考图上传区 (ImageUploadArea.vue)**:
- 使用 `n-upload` 组件，支持多文件
- 拖拽上传 + 点击选择
- 图片预览网格，支持删除
- 文件转Base64处理
- 大小限制: 10MB/张

**参数控制面板 (ParameterPanel.vue)**:
- 清晰度切换: `n-radio-group` (2K/4K)
- 比例选择: `n-select` (1:1, 3:4, 4:3, 9:16, 16:9等)
- 尺寸输入: 宽度x高度联动
- 生成数量: `n-slider` + `n-input-number` (1-15)

**提示词输入区 (PromptInput.vue)**:
- 主提示词: `n-input` textarea
- 负面提示词: 可展开输入
- 模板库: 预设提示词快捷选择
- 生成按钮: 带loading状态

**图像展示区 (ImageGallery.vue)**:
- CSS Grid 瀑布流布局
- 图片卡片: 悬停显示操作按钮
- 操作: 预览(n-image)、下载、删除、编辑
- 空状态提示

### 2.5 API服务扩展 - `src/services/api.js`

```javascript
// 图像工作台API
export const imageWorkbenchAPI = {
  // 文生图
  textToImage: (data) => axios.post('/api/image/text-to-image', data),
  
  // 图生图
  imageToImage: (data) => axios.post('/api/image/image-to-image', data),
  
  // 多图融合
  multiFusion: (data) => axios.post('/api/image/multi-fusion', data),
  
  // 批量生成
  batchGeneration: (data) => axios.post('/api/image/batch-generation', data),
  
  // 流式生成 (SSE)
  streamGeneration: async (data, onProgress) => {
    const response = await fetch('/api/image/stream-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    // SSE解析逻辑...
  }
}
```

### 2.6 状态管理

```javascript
// ImageWorkbench.vue 核心状态
const state = reactive({
  // 模式
  currentMode: 'auto', // auto | storybook | comic
  
  // 参数
  params: {
    size: '2K',
    ratio: '9:16',
    resolution: '720x1280',
    count: 4
  },
  
  // 参考图
  referenceImages: [], // { id, file, preview, base64 }[]
  
  // 提示词
  prompt: '',
  negativePrompt: '',
  
  // 生成结果
  generatedImages: [], // { id, url, prompt, timestamp }[]
  
  // 状态
  isGenerating: false,
  progress: 0
})
```

---

## 关键文件清单

### 需要修改的文件:
| 文件路径 | 修改内容 |
|---------|---------|
| `backend/src/services/imageService.js` | 新增3个生成方法+验证方法 |
| `backend/src/controllers/imageController.js` | 新增3个控制器方法 |
| `backend/src/routes/index.js` | 注册3条新路由 |
| `src/App.vue` | 添加导航入口和页面渲染 |
| `src/services/api.js` | 新增imageWorkbenchAPI对象 |

### 需要新建的文件:
| 文件路径 | 说明 |
|---------|------|
| `src/views/ImageWorkbench.vue` | 主页面组件 (~400行) |
| `src/components/image-workbench/ImageUploadArea.vue` | 上传组件 (~150行) |
| `src/components/image-workbench/ParameterPanel.vue` | 参数面板 (~200行) |
| `src/components/image-workbench/PromptInput.vue` | 提示词输入 (~180行) |
| `src/components/image-workbench/ImageGallery.vue` | 图像展示 (~250行) |
| `src/components/image-workbench/ModeSelector.vue` | 模式选择 (~80行) |

---

## 实施顺序

### 阶段1: 后端API (优先)
1. 修改 `imageService.js` - 新增多图融合方法
2. 修改 `imageService.js` - 新增批量生成方法
3. 修改 `imageService.js` - 新增流式生成方法
4. 修改 `imageController.js` - 新增3个控制器
5. 修改 `routes/index.js` - 注册路由

### 阶段2: 前端基础
6. 新建 `ImageWorkbench.vue` 主页面框架
7. 修改 `App.vue` 添加导航入口
8. 新建 `ModeSelector.vue` 模式选择器
9. 新建 `ParameterPanel.vue` 参数面板

### 阶段3: 前端核心功能
10. 新建 `ImageUploadArea.vue` 上传组件
11. 新建 `PromptInput.vue` 提示词输入
12. 新建 `ImageGallery.vue` 图像展示
13. 扩展 `api.js` 添加API方法

### 阶段4: 集成测试
14. 测试后端API接口
15. 测试前端页面功能
16. 端到端流程验证

---

## 验证方案

### 后端API测试
```bash
# 启动后端服务
cd backend && npm run dev

# 测试文生图
curl -X POST http://localhost:8099/api/image/text-to-image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"一只可爱的猫咪","size":"1024x1024"}'

# 测试多图融合
curl -X POST http://localhost:8099/api/image/multi-fusion \
  -H "Content-Type: application/json" \
  -d '{"prompt":"融合风格","imageUrls":["url1","url2"],"size":"2K"}'

# 测试批量生成
curl -X POST http://localhost:8099/api/image/batch-generation \
  -H "Content-Type: application/json" \
  -d '{"prompt":"春天风景","max_images":4,"size":"2K"}'
```

### 前端功能测试
```bash
# 启动前端服务
npm run dev

# 浏览器访问 http://localhost:8001
# 1. 点击侧边栏"图像生成工具"图标
# 2. 验证页面正常渲染
# 3. 测试参考图上传功能
# 4. 测试参数选择功能
# 5. 输入提示词并点击生成
# 6. 验证生成结果展示
```

### 完整流程验证
1. 上传2张参考图
2. 选择"自动"模式，4K清晰度，生成4张
3. 输入提示词"小红书风格产品图"
4. 点击生成，观察进度显示
5. 验证生成的4张图片正确展示
6. 测试图片预览、下载、删除功能

---

## 技术注意事项

1. **火山引擎API同步返回**: 无需轮询任务状态，直接获取结果
2. **Base64大小限制**: 单张图片不超过10MB
3. **Express body限制**: 已配置50MB，支持多图上传
4. **SSE流式响应**: 需设置正确的响应头和nginx配置
5. **CORS配置**: 确保前后端端口一致(8001/8099)
6. **错误处理**: 统一使用 `{ success, data/error }` 格式
