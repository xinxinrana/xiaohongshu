




# 开发指南

本指南将帮助你快速上手使用本框架进行Web开发。

## 目录

- [开始新项目](#开始新项目)
- [创建页面](#创建页面)
- [使用组件](#使用组件)
- [自定义主题](#自定义主题)
- [构建发布](#构建发布)

## 开始新项目

### 1. 克隆或使用模板

如果你已经有了这个框架，跳过此步骤。否则：

```bash
git clone <repository-url>
cd <project-name>
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

打开浏览器访问 http://localhost:8001

## 创建页面

### 步骤1：选择布局

根据页面需求选择合适的布局：

```vue
<!-- views/MyPage.vue -->
<template>
  <!-- 使用默认布局 -->
  <DefaultLayout title="我的页面">
    <!-- 页面内容 -->
  </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
</script>
```

### 步骤2：添加内容

使用容器和工具类组织内容：

```vue
<template>
  <DefaultLayout title="我的页面">
    <div class="container">
      <!-- 使用卡片展示内容 -->
      <Card title="欢迎">
        <p>这是我的第一个页面</p>
      </Card>
    </div>
  </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import Card from '@/components/ui/Card.vue'
</script>
```

### 步骤3：添加交互

```vue
<template>
  <DefaultLayout title="表单页面">
    <div class="container">
      <Card title="用户信息">
        <form @submit.prevent="handleSubmit">
          <Input
            v-model="form.name"
            label="姓名"
            required
          />
          <Input
            v-model="form.email"
            type="email"
            label="邮箱"
            required
          />
          <Button type="submit" :loading="loading">
            提交
          </Button>
        </form>
      </Card>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const form = ref({
  name: '',
  email: ''
})
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    // 处理表单提交
    console.log('表单数据:', form.value)
  } finally {
    loading.value = false
  }
}
</script>
```

## 使用组件

### 组件导入

有两种方式导入组件：

#### 方式1：按需导入（推荐）

```vue
<script setup>
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
</script>
```

#### 方式2：全局注册

在 `main.js` 中：

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import UI from '@/components/ui'

const app = createApp(App)
app.use(UI)
app.mount('#app')
```

然后在任何组件中直接使用：

```vue
<template>
  <Button>Click me</Button>
  <Card title="Card">Content</Card>
</template>
```

### 常见组件用法

#### 列表展示

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <Card
      v-for="item in items"
      :key="item.id"
      :title="item.title"
      hoverable
      clickable
      @click="handleClick(item)"
    >
      <p>{{ item.description }}</p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button size="sm" variant="ghost">查看</Button>
          <Button size="sm">编辑</Button>
        </div>
      </template>
    </Card>
  </div>
</template>
```

#### 表单验证

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <Input
      v-model="form.username"
      label="用户名"
      :error="errors.username"
      required
      @blur="validateUsername"
    />
    
    <Input
      v-model="form.password"
      type="password"
      label="密码"
      :error="errors.password"
      required
      @blur="validatePassword"
    />
    
    <Button type="submit" :disabled="!isValid">
      登录
    </Button>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'

const form = ref({
  username: '',
  password: ''
})

const errors = ref({
  username: '',
  password: ''
})

const isValid = computed(() => {
  return form.value.username &&
         form.value.password &&
         !errors.value.username &&
         !errors.value.password
})

function validateUsername() {
  if (!form.value.username) {
    errors.value.username = '请输入用户名'
  } else if (form.value.username.length < 3) {
    errors.value.username = '用户名至少3个字符'
  } else {
    errors.value.username = ''
  }
}

function validatePassword() {
  if (!form.value.password) {
    errors.value.password = '请输入密码'
  } else if (form.value.password.length < 6) {
    errors.value.password = '密码至少6个字符'
  } else {
    errors.value.password = ''
  }
}

function handleSubmit() {
  validateUsername()
  validatePassword()
  
  if (isValid.value) {
    console.log('提交表单:', form.value)
  }
}
</script>
```

## 自定义主题

### 方法1：修改CSS变量

在你的组件或全局CSS中覆盖变量：

```css
:root {
  /* 自定义主色调 */
  --color-primary-500: #8b5cf6;
  --color-primary-600: #7c3aed;
  
  /* 自定义间距 */
  --spacing-base: 1.5rem;
  
  /* 自定义圆角 */
  --radius-base: 8px;
}
```

### 方法2：修改主题配置

编辑 `src/config/theme.js`：

```javascript
export const theme = {
  colors: {
    primary: {
      500: '#8b5cf6',  // 改成你想要的颜色
      600: '#7c3aed',
      // ...
    },
    // ...
  },
  // ...
}
```

然后重新生成CSS变量文件。

### 方法3：创建主题变体

创建新的CSS文件 `src/assets/theme-dark.css`：

```css
.theme-dark {
  --color-primary-500: #a78bfa;
  --color-bg-primary: #1f2937;
  --color-text-primary: #f9fafb;
  /* ... */
}
```

在代码中切换主题：

```javascript
document.documentElement.classList.add('theme-dark')
```

## 构建发布

### 开发环境

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `dist/` 目录。

### 预览生产版本

```bash
pnpm preview
```

### 部署

#### 部署到静态服务器

将 `dist/` 目录的内容上传到你的服务器即可。

#### 部署到Vercel

```bash
vercel
```

#### 部署到Netlify

```bash
netlify deploy --prod --dir=dist
```

## 常见问题

### Q: 如何添加路由？

A: 安装 Vue Router：

```bash
pnpm add vue-router
```

创建 `src/router/index.js`：

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue')
  },
  // 更多路由...
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

在 `main.js` 中使用：

```javascript
import router from './router'

app.use(router)
```

### Q: 如何添加状态管理？

A: 安装 Pinia：

```bash
pnpm add pinia
```

创建 store 并在 `main.js` 中使用。

### Q: 如何添加图标？

A: 推荐使用 unplugin-icons：

```bash
pnpm add -D unplugin-icons
```

或者使用 emoji、SVG或图标字体。

### Q: 如何优化性能？

A: 

1. 使用懒加载组件
2. 使用虚拟滚动处理大列表
3. 优化图片（使用 WebP、懒加载）
4. 使用代码分割
5. 启用 Gzip 压缩

## 下一步

- 查看 [API文档](./API.md) 了解详细的组件API
- 查看 [示例](../examples/) 了解更多使用场景
- 加入社区讨论和反馈




