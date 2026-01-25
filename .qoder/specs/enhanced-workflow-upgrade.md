# 增强版工作流升级方案

## 概述
对增强版工作流进行五项核心升级：图生图功能完善、参数控制工具栏、并行处理优化、广告标语生成功能、前端功能开关。

---

## 一、需求分析

### 1.1 图生图功能集成
- **当前状态**：单张参考图支持
- **目标**：支持多张参考图（1-6张）混合风格生成
- **关键点**：用户可上传多张图片，豆包4.5可融合多图风格
- **用户确认**：限制1-6张，避免上传时间过长

### 1.2 参数控制工具栏
- **尺寸选择**：8种预设尺寸（1664x928, 1024x1024, 720x1280等）
- **清晰度**：2K / 4K
- **生成张数**：1-15张（当前固定3张）
- **负面提示词**：可选输入

### 1.3 并行处理优化
- **当前流程**：文案编辑→提示词优化→图像重生成（顺序执行）
- **目标流程**：
  ```
  用户反馈 → 拆分
  ├─ GLM-4.7-A → editContent() (文案修改)
  └─ GLM-4.7-B → optimizeImagePrompts() (提示词优化)
  
  Promise.all([文案, 提示词]) → 合并 → 豆包4.5生成图像
  ```
- **预期收益**：修改迭代时间缩短30-50%

### 1.4 广告标语图像生成
- **功能**：在生成图像中直接渲染文字（标题、标语、品牌名）
- **技术支持**：Seedream 4.5原生支持typography和dense text rendering
- **实现方式**：提示词驱动（用户确认），无需后处理，简单高效
- **配置项**：文字内容、字体风格、颜色、位置、排版

### 1.5 前端功能开关
- **开关位置**：输入框内展开面板（用户确认）
- **交互方式**：点击设置图标展开参数面板，保持界面简洁
- **开启时**：显示文字配置选项，生成带标语的图像
- **关闭时**：正常生成流程

---

## 二、技术设计

### 2.1 后端服务层修改

#### 文件：`backend/src/services/enhancedGenerationService.js`

**方法签名调整**：
```javascript
// 原方法
static async generateImages(prompts, uploadedImageUrl = null)

// 新方法签名
static async generateImages(prompts, options = {})
// options: {
//   uploadedImages: string[],      // 多图支持（Base64或URL数组）
//   size: '1664x928',              // 尺寸
//   count: 3,                       // 生成张数 1-15
//   quality: '2K',                  // 清晰度 2K/4K
//   negativePrompt: '',             // 负面提示词
//   enableSlogan: false,            // 是否启用广告标语
//   sloganConfig: {                 // 标语配置
//     text: '',                     // 文字内容
//     fontStyle: '粗体现代',         // 字体风格
//     color: '高对比色',             // 颜色
//     position: '上方居中',          // 位置
//     layout: '单行横排'             // 排版
//   }
// }
```

**新增辅助方法**：
```javascript
static buildSloganPrompt(basePrompt, sloganConfig) {
  // 将广告标语配置融入提示词
  // Seedream 4.5 原生支持文字渲染
}
```

**并行处理在前端实现**：后端保持独立方法，前端使用Promise.all并行调用。

#### 文件：`backend/src/controllers/enhancedGenerationController.js`

**修改方法**：
- `generateImages()` - 接收新参数结构
- `editImages()` - 接收新参数结构

**新增参数验证**：
- 尺寸范围验证
- 张数范围验证（1-15）
- 多图数量限制（最多6张）
- Base64大小检查（单张<10MB）

### 2.2 前端组件修改

#### 文件：`src/components/KeywordInput.vue`

**新增状态**：
```javascript
const imageSettings = ref({
  size: '1664x928',
  quality: '2K',
  count: 3,
  negativePrompt: '',
  enableSlogan: false,
  sloganConfig: {
    text: '',
    fontStyle: '粗体现代',
    color: '自动对比色',
    position: '上方居中',
    layout: '单行横排'
  }
})

const uploadedImages = ref([])  // 多图支持，替换原 uploadedImageUrl
```

**UI新增**：
- 设置按钮（齿轮图标）展开/收起设置面板
- 尺寸选择器（n-select或n-radio-group）
- 清晰度切换（n-switch）
- 生成张数滑块（n-slider + n-input-number）
- 广告标语开关（n-switch）
- 标语配置面板（条件渲染）
- 多图上传组件（n-upload multiple）

**事件emit**：
```javascript
emit('imagesUploaded', uploadedImages.value)
emit('settingsChanged', imageSettings.value)
```

#### 文件：`src/views/Generate.vue`

**状态新增**：
```javascript
const uploadedImages = ref([])
const imageSettings = ref({...})
```

**并行处理实现**（handleEdit方法）：
```javascript
const handleEdit = async (editData) => {
  // 并行执行文案编辑和提示词优化
  const [contentResult, promptsResult] = await Promise.all([
    enhancedAPI.editContent(
      generatedContent.value.content,
      editData.contentFeedback,
      streamCallback  // 文案流式输出
    ),
    enhancedAPI.optimizePrompts(
      currentPrompts.value,
      editData.imageFeedback,
      editData.referenceImages  // 多图支持
    )
  ])
  
  // 合并结果后生成图像
  const imagesResult = await enhancedAPI.editImages(
    promptsResult.data.prompts,
    {
      uploadedImages: editData.referenceImages,
      ...imageSettings.value
    }
  )
}
```

#### 文件：`src/components/SatisfactionModal.vue`

**表单拆分**：
- 文案反馈输入框（原有）
- 图像反馈输入框（原有）
- 新参考图上传区（新增，支持多张）

**数据结构**：
```javascript
const feedbackData = ref({
  contentFeedback: '',
  imageFeedback: '',
  referenceImages: []  // 新增：多图数组
})
```

### 2.3 API服务扩展

#### 文件：`src/services/api.js`

**enhancedAPI对象修改**：

```javascript
// generateImages 参数扩展
async generateImages(prompts, options = {}) {
  return api.post('/enhanced/generate-images', {
    prompts,
    uploadedImages: options.uploadedImages,
    size: options.size,
    count: options.count,
    quality: options.quality,
    negativePrompt: options.negativePrompt,
    enableSlogan: options.enableSlogan,
    sloganConfig: options.sloganConfig
  })
}

// editImages 参数扩展
async editImages(optimizedPrompts, options = {}) {
  return api.post('/enhanced/edit-images', {
    optimizedPrompts,
    ...options
  })
}
```

---

## 三、广告标语提示词框架

### 3.1 核心模板

基于Seedream 4.5的typography能力设计：

```javascript
const sloganPromptTemplate = (basePrompt, config) => {
  if (!config.enabled || !config.text) return basePrompt
  
  const textInstruction = `
【文字渲染需求】
- 在图像中清晰呈现文字："${config.text}"
- 文字风格：${config.fontStyle}，专业设计感
- 文字颜色：${config.color}，与背景形成鲜明对比
- 文字位置：${config.position}
- 文字排版：${config.layout}，字号醒目易读
- 整体要求：文字与画面和谐融合，具有商业广告效果，文字清晰可辨认
`
  return `${basePrompt}\n${textInstruction}`
}
```

### 3.2 预设样式模板

提供常用广告标语样式：

| 模板名称 | fontStyle | color | position | layout |
|---------|-----------|-------|----------|--------|
| 小红书标题 | 粗体圆润 | 白色带阴影 | 上方三分之一 | 居中横排 |
| 电商促销 | 粗体冲击 | 红色/黄色 | 居中偏上 | 大号单行 |
| 品牌宣传 | 优雅衬线 | 金色/深色 | 下方三分之一 | 居中多行 |
| 极简海报 | 细体现代 | 黑色/白色 | 居中 | 大号单行 |

---

## 四、数据流向

### 4.1 初始生成流程（保持不变）

```
用户输入 → generateContent() → generateImagePrompts() → generateImages()
                                                              ↓
                                                    应用imageSettings参数
                                                              ↓
                                                    Doubao-Seedream-4.5
```

### 4.2 修改迭代流程（并行优化）

```
用户反馈（文案+图像+新参考图）
         ↓
    ┌────┴────┐
    ↓         ↓
 GLM-4.7-A  GLM-4.7-B
 文案修改   提示词优化
    ↓         ↓
    └────┬────┘
         ↓
   Promise.all()
         ↓
   合并结果 + imageSettings
         ↓
   Doubao-Seedream-4.5
   生成N张图像
```

---

## 五、实施计划

### 阶段1：参数控制工具栏（优先级：高）

**修改文件**：
- `src/components/KeywordInput.vue` - 添加设置面板UI
- `src/views/Generate.vue` - 状态管理和参数传递
- `backend/src/services/enhancedGenerationService.js` - generateImages()参数支持
- `backend/src/controllers/enhancedGenerationController.js` - 参数接收和验证

**任务**：
1. KeywordInput添加设置按钮和面板
2. 实现尺寸选择器（8种预设）
3. 实现清晰度切换
4. 实现生成张数滑块（1-15）
5. 后端generateImages支持动态参数
6. 测试不同参数组合

### 阶段2：并行处理优化（优先级：高）

**修改文件**：
- `src/views/Generate.vue` - handleEdit方法改造
- `src/components/SatisfactionModal.vue` - 反馈表单拆分

**任务**：
1. 修改handleEdit使用Promise.all
2. SatisfactionModal拆分文案和图像反馈区域
3. 确保流式输出与并行处理兼容
4. 性能测试对比

### 阶段3：多图上传支持（优先级：中）

**修改文件**：
- `src/components/KeywordInput.vue` - 多图上传组件
- `src/components/SatisfactionModal.vue` - 多图上传
- `backend/src/services/enhancedGenerationService.js` - 多图处理逻辑

**任务**：
1. KeywordInput改为支持多图上传
2. 前端图片预览和管理
3. 后端多图融合逻辑
4. 大小和数量限制

### 阶段4：广告标语功能（优先级：中）

**修改文件**：
- `src/components/KeywordInput.vue` - 标语配置面板
- `backend/src/services/enhancedGenerationService.js` - buildSloganPrompt方法

**任务**：
1. 添加广告标语开关
2. 实现标语配置面板（文字、样式、颜色、位置）
3. 实现buildSloganPrompt提示词模板
4. 测试文字渲染效果
5. 提供预设样式模板

### 阶段5：UI优化与测试（优先级：低）

**任务**：
1. 设置面板动画优化
2. 移动端适配
3. 参数预设保存功能
4. 端到端测试
5. 性能测试

---

## 六、关键文件清单

| 文件路径 | 修改内容 |
|---------|---------|
| `backend/src/services/enhancedGenerationService.js` | generateImages参数扩展、buildSloganPrompt方法、多图支持 |
| `backend/src/controllers/enhancedGenerationController.js` | 参数接收、验证、传递 |
| `src/views/Generate.vue` | 并行处理、状态管理、参数传递 |
| `src/components/KeywordInput.vue` | 设置面板、多图上传、标语配置 |
| `src/components/SatisfactionModal.vue` | 反馈拆分、多图上传 |
| `src/services/api.js` | API参数扩展 |

---

## 七、验证方案

### 功能测试
```bash
# 启动服务
cd backend && npm run dev
npm run dev

# 测试场景
1. 参数控制：测试所有尺寸、清晰度、张数组合
2. 并行处理：对比顺序执行和并行执行的耗时
3. 多图上传：测试1-5张参考图的融合效果
4. 广告标语：测试不同文字长度和样式的渲染效果
```

### 性能测试
- 并行处理时间缩短比例
- 多图上传时内存占用
- 广告标语文字清晰度

### 兼容性测试
- 旧版工作流（普通模式）不受影响
- 历史记录正确保存新参数
- 移动端UI适配

---

## 八、技术风险与应对

### 风险1：并行处理时流式输出冲突
**应对**：文案编辑使用流式输出，提示词优化使用非流式返回，分区展示

### 风险2：多图Base64过大
**应对**：前端压缩图片、限制单图2MB、总数最多5张

### 风险3：广告标语文字不清晰
**应对**：优化提示词模板、提供重新生成按钮、考虑后处理备选方案

### 风险4：参数过多导致UI复杂
**应对**：默认折叠高级设置、提供预设模板、智能推荐

---

## 九、预期成果

1. **用户体验提升**：修改迭代时间缩短30-50%
2. **功能丰富化**：支持多图融合、自定义参数、广告标语
3. **创作效率提升**：一次生成多张不同尺寸的图像
4. **商业价值**：直接生成带文字的广告素材，减少后期设计
