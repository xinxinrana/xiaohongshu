# 完善 Agent 功能与前端展示优化计划

我将参考已验证的 "增强模式" (Enhanced Mode) 逻辑，对 Agent 进行全方位升级，确保 LLM 稳定、支持无图文生图，并在前端实现高级预览。

## 1. 后端 LLM 与 Agent 核心逻辑升级

### 1.1 统一 LLM 核心 ("Enhanced Mode" 标准)
- **目标**：解决 Agent 调用 LLM 失败的问题，复用增强模式的稳定性。
- **行动**：
    - 重构 `backend/src/agents/base/BaseLLM.js`，使其底层调用逻辑与 `aiService.js` (增强模式使用的服务) 保持一致。
    - 确保 `glmLLM` 使用相同的 API 端点、Header 和超时设置，保证 "真" AI 的稳定响应。
    - 优化 `imagePromptTool.js`，移除"假提示词"兜底，直接调用修复后的 LLM 生成高质量提示词。

### 1.2 全面解锁图像生成能力 (参考 EnhancedGenerationService)
- **目标**：实现智能化的文生图与图生图自动切换。
- **行动**：
    - 修改 `backend/src/agents/xiaohongshuAgent.js` 的 `planExecution`，默认包含配图生成步骤。
    - 在 `execute` 方法中引入增强模式的判断逻辑：
        - **无参考图**：自动切换为 `text-to-image` 模式，使用 AI 生成的提示词直接生成图片。
        - **有参考图**：保持 `image-to-image` 模式，使用参考图进行风格迁移。
    - **参数强制**：设置 `count: 3`，确保每次生成 3 张精美配图。

### 1.3 记忆与上下文强化
- **目标**：让 Agent "记住" 上下文。
- **行动**：在 `xiaohongshuAgent.js` 中，确保检索到的历史记忆被显式注入到 LLM 的 Prompt 中，提升内容连贯性。

## 2. 前端 Agent 工作台重构 (Agent Workbench)

### 2.1 集成高级预览组件
- **目标**：实现 "所见即所得" 的双端预览体验。
- **行动**：
    - 修改 `src/views/AgentWorkbench.vue`，引入 `src/components/Preview.vue` 组件。
    - 移除旧版简陋的列表展示，替换为包含 **手机/电脑双端切换** 的实时预览区域。
    - 确保预览组件能正确解析并展示 Agent 生成的 3 张图片和文案。

### 2.2 图片下载与交互
- **目标**：提供完整的作品交付体验。
- **行动**：
    - 复用 `Preview.vue` 内置的图片下载功能（基于后端代理）。
    - 确保用户可以点击预览图查看大图并保存。

## 3. 执行步骤

1.  **LLM 修复**：重构 `BaseLLM.js` 对齐增强模式配置；清理 `imagePromptTool.js` 兜底逻辑。
2.  **Agent 升级**：修改 `xiaohongshuAgent.js` 实现智能图文生成逻辑 (文生图/图生图自动切换)。
3.  **前端改造**：重写 `AgentWorkbench.vue` 的结果展示区，集成 `Preview` 组件。
4.  **验证**：执行一次无图输入测试，确认生成 3 张图片且前端预览正常。
