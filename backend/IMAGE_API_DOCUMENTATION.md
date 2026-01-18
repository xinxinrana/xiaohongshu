# 图像生成API文档

## 概述

本文档介绍小红书Agent系统新增的图像生成、图像编辑和图生图功能API。这些功能基于胜算云的doubao-seedream-4.5和qwen-image-edit模型实现。

## API端点基础信息

- **基础URL**: `http://localhost:8099/api`
- **认证方式**: 已内置API Key，无需额外认证
- **请求格式**: JSON
- **响应格式**: JSON

---

## 1. 文生图 (Text-to-Image)

根据文本描述生成图像。

### 请求信息

- **端点**: `POST /image/text-to-image`
- **Content-Type**: `application/json`

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| prompt | string | 是 | - | 图像描述提示词 |
| negative_prompt | string | 否 | "低分辨率、错误、最差质量..." | 负面提示词，描述不希望出现的内容 |
| size | string | 否 | "1664*928" | 图像尺寸 |
| n | number | 否 | 1 | 生成图片数量 |
| prompt_extend | boolean | 否 | true | 是否自动扩展提示词 |
| watermark | boolean | 否 | false | 是否添加水印 |

### 请求示例

```json
{
  "prompt": "一只可爱的橘猫坐在窗台上，阳光洒在它的毛发上，表情愉悦，活泼可爱，逼真准确",
  "negative_prompt": "低分辨率、错误、最差质量、低质量、残缺、多余的手指、比例不良",
  "size": "1664*928",
  "n": 1,
  "prompt_extend": true,
  "watermark": false
}
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "code": "success",
    "message": "",
    "data": {
      "request_id": "20260117190856709700646...",
      "task_id": "",
      "action": "IMAGE_GENERATION",
      "status": "SUBMITTING",
      "fail_reason": "",
      "submit_time": 1768648136,
      "start_time": 0,
      "finish_time": 0,
      "progress": "0%",
      "data": {}
    }
  }
}
```

---

## 2. 图像编辑 (Image Edit)

基于原图和提示词进行图像编辑。

### 请求信息

- **端点**: `POST /image/edit`
- **Content-Type**: `application/json`

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| imageUrl | string | 是 | - | 原始图像URL（需要可公开访问的URL） |
| prompt | string | 是 | - | 编辑指令提示词 |
| negative_prompt | string | 否 | "" | 负面提示词 |
| watermark | boolean | 否 | false | 是否添加水印 |
| seed | number | 否 | 1 | 随机种子，用于复现结果 |

### 请求示例

```json
{
  "imageUrl": "https://dashscope.oss-cn-beijing.aliyuncs.com/images/dog_and_girl.jpeg",
  "prompt": "将图中的人物改为趴姿势，伸手握住狗的前爪",
  "negative_prompt": "",
  "watermark": false,
  "seed": 1
}
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "code": "success",
    "message": "",
    "data": {
      "request_id": "20260117190858834975129...",
      "task_id": "",
      "action": "IMAGE_GENERATION",
      "status": "SUBMITTING",
      "fail_reason": "",
      "submit_time": 1768648138,
      "start_time": 0,
      "finish_time": 0,
      "progress": "0%",
      "data": {}
    }
  }
}
```

---

## 3. 图生图 (Image-to-Image)

基于原图生成风格相似或内容相关的新图像。

### 请求信息

- **端点**: `POST /image/image-to-image`
- **Content-Type**: `application/json`

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| imageUrl | string | 是 | - | 原始图像URL（需要可公开访问的URL） |
| prompt | string | 是 | - | 生成新图像的提示词 |
| negative_prompt | string | 否 | "低分辨率、错误..." | 负面提示词 |
| watermark | boolean | 否 | false | 是否添加水印 |
| seed | number | 否 | 1 | 随机种子 |

### 请求示例

```json
{
  "imageUrl": "https://dashscope.oss-cn-beijing.aliyuncs.com/images/dog_and_girl.jpeg",
  "prompt": "生成一张类似风格的卡通画，保持人物和狗的布局",
  "negative_prompt": "低分辨率、错误、最差质量、低质量、残缺",
  "watermark": false,
  "seed": 1
}
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "code": "success",
    "message": "",
    "data": {
      "request_id": "20260117190900914164062...",
      "task_id": "",
      "action": "IMAGE_GENERATION",
      "status": "SUBMITTING",
      "fail_reason": "",
      "submit_time": 1768648140,
      "start_time": 0,
      "finish_time": 0,
      "progress": "0%",
      "data": {}
    }
  }
}
```

---

## 4. 查询任务状态

查询图像生成/编辑任务的执行状态。

### 请求信息

- **端点**: `GET /image/task/:taskId`
- **方法**: GET

### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| taskId | string | 是 | 任务ID（从前面的响应中获取request_id或task_id） |

### 请求示例

```bash
GET /image/task/20260117190856709700646...
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "code": "success",
    "message": "",
    "data": {
      "request_id": "20260117190856709700646...",
      "task_id": "task_xxx",
      "action": "IMAGE_GENERATION",
      "status": "SUCCESS",
      "fail_reason": "",
      "submit_time": 1768648136,
      "start_time": 1768648137,
      "finish_time": 1768648145,
      "progress": "100%",
      "data": {
        "image_url": "https://..."
      }
    }
  }
}
```

---

## 任务状态说明

| 状态 | 说明 |
|------|------|
| SUBMITTING | 任务提交中 |
| PENDING | 任务等待中 |
| PROCESSING | 任务处理中 |
| SUCCESS | 任务成功完成 |
| FAILED | 任务失败 |

---

## 错误响应

当请求失败时，API会返回以下格式的错误响应：

```json
{
  "success": false,
  "error": "错误信息描述"
}
```

### 常见错误

| HTTP状态码 | 错误信息 | 说明 |
|-----------|---------|------|
| 400 | 提示词不能为空 | 必填参数缺失 |
| 400 | 图像URL不能为空 | 图像URL参数缺失 |
| 500 | 图像生成失败: ... | 服务端错误 |

---

## 使用示例

### 使用curl测试

```bash
# 文生图
curl -X POST http://localhost:8099/api/image/text-to-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一只可爱的橘猫",
    "size": "1664*928"
  }'

# 图像编辑
curl -X POST http://localhost:8099/api/image/edit \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "prompt": "将背景改为蓝天白云"
  }'

# 图生图
curl -X POST http://localhost:8099/api/image/image-to-image \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "prompt": "生成卡通风格"
  }'

# 查询任务状态
curl http://localhost:8099/api/image/task/{taskId}
```

### 使用Node.js测试

系统提供了完整的测试脚本：

```bash
# 运行所有测试
cd backend
node test-image-api.js

# 查询任务状态
node test-image-api.js <taskId>
```

---

## 技术架构

### 服务层 (imageService.js)

提供三个核心方法：
- `generateImageFromText(prompt, options)` - 文生图
- `editImage(imageUrl, prompt, options)` - 图像编辑
- `generateImageFromImage(imageUrl, prompt, options)` - 图生图
- `queryTaskStatus(taskId)` - 查询任务状态

### 控制器层 (imageController.js)

提供四个API端点控制器：
- `generateImageFromText` - 处理文生图请求
- `editImage` - 处理图像编辑请求
- `generateImageFromImage` - 处理图生图请求
- `queryTaskStatus` - 处理任务状态查询

### 路由配置 (routes/index.js)

新增路由：
- `POST /image/text-to-image`
- `POST /image/edit`
- `POST /image/image-to-image`
- `GET /image/task/:taskId`

---

## 注意事项

1. **图像URL要求**: 用于编辑和图生图的图像URL必须是可公开访问的，建议使用CDN链接
2. **异步处理**: 图像生成是异步操作，需要通过任务ID查询最终结果
3. **超时设置**: API调用超时时间为60秒
4. **模型选择**: 
   - 文生图使用 `bytedance/doubao-seedream-4.5`
   - 图像编辑和图生图使用 `ali/qwen-image-edit`
5. **最小化改动**: 新功能通过独立的service和controller实现，不影响现有文案生成功能

---

## 集成建议

### 前端集成步骤

1. 在 `frontend/src/services/api.js` 中添加新的API调用方法
2. 创建图像编辑和图生图的UI组件
3. 实现任务状态轮询机制
4. 提供图片上传功能（可使用OSS等）
5. 展示生成的图像结果

### 示例代码

```javascript
// 在api.js中添加
export const imageApi = {
  textToImage: (data) => axios.post('/image/text-to-image', data),
  editImage: (data) => axios.post('/image/edit', data),
  imageToImage: (data) => axios.post('/image/image-to-image', data),
  queryTask: (taskId) => axios.get(`/image/task/${taskId}`)
}
```

---

## 更新日志

- **2026-01-17**: 初版发布，实现文生图、图像编辑、图生图三大功能
