






# 使用示例

本文档提供了各种常见场景的完整代码示例。

## 目录

- [登录页面](#登录页面)
- [仪表板](#仪表板)
- [资源列表](#资源列表)
- [表单页面](#表单页面)
- [个人资料页](#个人资料页)

## 登录页面

使用 `CenterLayout` 创建一个居中的登录表单：

```vue
<template>
  <CenterLayout max-width="400px">
    <Card>
      <div class="text-center" style="margin-bottom: 2rem">
        <h1 class="text-3xl font-bold">欢迎回来</h1>
        <p class="text-sm" style="color: var(--color-text-secondary); margin-top: 0.5rem">
          登录以继续使用
        </p>
      </div>

      <form @submit.prevent="handleLogin">
        <div style="display: flex; flex-direction: column; gap: 1rem">
          <Input
            v-model="form.email"
            type="email"
            label="邮箱"
            placeholder="your@email.com"
            prefix-icon="📧"
            required
            :error="errors.email"
          />

          <Input
            v-model="form.password"
            type="password"
            label="密码"
            placeholder="输入密码"
            prefix-icon="🔒"
            required
            :error="errors.password"
          />

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="form.remember" />
              <span class="text-sm">记住我</span>
            </label>
            <a href="#" class="text-sm" style="color: var(--color-primary-500)">
              忘记密码？
            </a>
          </div>

          <Button type="submit" block :loading="loading">
            登录
          </Button>

          <div class="text-center text-sm">
            还没有账号？
            <a href="#" style="color: var(--color-primary-500)">立即注册</a>
          </div>
        </div>
      </form>
    </Card>
  </CenterLayout>
</template>

<script setup>
import { ref } from 'vue'
import CenterLayout from '@/layouts/CenterLayout.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const form = ref({
  email: '',
  password: '',
  remember: false
})

const errors = ref({
  email: '',
  password: ''
})

const loading = ref(false)

async function handleLogin() {
  // 验证
  errors.value = {
    email: '',
    password: ''
  }

  if (!form.value.email) {
    errors.value.email = '请输入邮箱'
    return
  }

  if (!form.value.password) {
    errors.value.password = '请输入密码'
    return
  }

  // 提交
  loading.value = true
  try {
    // API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('登录成功', form.value)
  } finally {
    loading.value = false
  }
}
</script>
```

## 仪表板

使用 `DefaultLayout` 创建一个带侧边栏的仪表板：

```vue
<template>
  <DefaultLayout
    title="仪表板"
    :show-sidebar="true"
  >
    <template #sidebar-content>
      <nav class="flex flex-col gap-2">
        <a
          v-for="item in menuItems"
          :key="item.id"
          :href="item.href"
          class="nav-item"
          :class="{ active: currentRoute === item.id }"
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </a>
      </nav>
    </template>

    <template #header-right>
      <Button variant="ghost" size="sm">
        🔔
      </Button>
      <Button variant="ghost" size="sm">
        👤
      </Button>
    </template>

    <div class="container-fluid">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style="margin-bottom: 2rem">
        <Card
          v-for="stat in stats"
          :key="stat.id"
          hoverable
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm" style="color: var(--color-text-secondary); margin-bottom: 0.5rem">
                {{ stat.label }}
              </div>
              <div class="text-3xl font-bold">{{ stat.value }}</div>
            </div>
            <div class="text-4xl">{{ stat.icon }}</div>
          </div>
          <div class="text-sm" style="margin-top: 0.5rem; color: var(--color-success-500)">
            ↑ {{ stat.change }}% 较上月
          </div>
        </Card>
      </div>

      <!-- 图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="访问趋势">
          <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary)">
            图表区域
          </div>
        </Card>

        <Card title="最新活动">
          <div class="flex flex-col gap-3">
            <div
              v-for="activity in activities"
              :key="activity.id"
              class="flex items-start gap-3"
              style="padding: 0.75rem; border-radius: var(--radius-md); background: var(--color-bg-secondary)"
            >
              <div class="text-2xl">{{ activity.icon }}</div>
              <div class="flex-1">
                <div class="font-medium">{{ activity.title }}</div>
                <div class="text-sm" style="color: var(--color-text-secondary)">
                  {{ activity.time }}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const currentRoute = ref('dashboard')

const menuItems = [
  { id: 'dashboard', label: '仪表板', icon: '📊', href: '#dashboard' },
  { id: 'users', label: '用户管理', icon: '👥', href: '#users' },
  { id: 'products', label: '产品管理', icon: '📦', href: '#products' },
  { id: 'orders', label: '订单管理', icon: '🛒', href: '#orders' },
  { id: 'settings', label: '设置', icon: '⚙️', href: '#settings' }
]

const stats = [
  { id: 1, label: '总用户', value: '12,345', icon: '👥', change: 12.5 },
  { id: 2, label: '总收入', value: '¥89,234', icon: '💰', change: 8.2 },
  { id: 3, label: '订单数', value: '1,234', icon: '🛒', change: 15.3 },
  { id: 4, label: '访问量', value: '45,678', icon: '📈', change: 22.1 }
]

const activities = [
  { id: 1, icon: '✅', title: '新订单 #1234 已完成', time: '5分钟前' },
  { id: 2, icon: '👤', title: '新用户 John Doe 注册', time: '15分钟前' },
  { id: 3, icon: '💬', title: '收到新评论', time: '1小时前' },
  { id: 4, icon: '📦', title: '产品库存更新', time: '2小时前' }
]
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.nav-item:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  font-weight: 500;
}
</style>
```

## 资源列表

创建一个带搜索和过滤的资源列表：

```vue
<template>
  <DefaultLayout title="用户管理">
    <div class="container">
      <Card>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold">用户列表</h2>
            <Button @click="showAddDialog = true">
              ➕ 添加用户
            </Button>
          </div>
        </template>

        <!-- 搜索和筛选 -->
        <div class="flex gap-4" style="margin-bottom: 1.5rem">
          <Input
            v-model="searchQuery"
            placeholder="搜索用户..."
            clearable
            prefix-icon="🔍"
            style="flex: 1"
          />
          <Button variant="outline">
            🔽 筛选
          </Button>
        </div>

        <!-- 表格 -->
        <div class="table-container">
          <table class="resource-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>姓名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.id }}</td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar">{{ user.name.charAt(0) }}</div>
                    <span>{{ user.name }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge">{{ user.role }}</span>
                </td>
                <td>
                  <span class="status-badge" :class="user.status">
                    {{ user.status === 'active' ? '激活' : '禁用' }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <Button size="sm" variant="ghost">编辑</Button>
                    <Button size="sm" variant="ghost">删除</Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="flex justify-between items-center" style="margin-top: 1.5rem">
          <div class="text-sm" style="color: var(--color-text-secondary)">
            显示 1-10 / 共 100 条
          </div>
          <div class="flex gap-2">
            <Button size="sm" variant="outline">上一页</Button>
            <Button size="sm" variant="outline">下一页</Button>
          </div>
        </div>
      </Card>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const searchQuery = ref('')
const showAddDialog = ref(false)

const users = ref([
  { id: 1, name: '张三', email: 'zhang@example.com', role: '管理员', status: 'active' },
  { id: 2, name: '李四', email: 'li@example.com', role: '用户', status: 'active' },
  { id: 3, name: '王五', email: 'wang@example.com', role: '用户', status: 'inactive' },
  // 更多用户...
])

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  return users.value.filter(user =>
    user.name.includes(searchQuery.value) ||
    user.email.includes(searchQuery.value)
  )
})
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}

.resource-table {
  width: 100%;
  border-collapse: collapse;
}

.resource-table th,
.resource-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
}

.resource-table th {
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
}

.resource-table tbody tr:hover {
  background: var(--color-bg-secondary);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-primary-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  font-size: var(--font-size-sm);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.status-badge.active {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.status-badge.inactive {
  background: var(--color-gray-200);
  color: var(--color-gray-700);
}
</style>
```

这些示例涵盖了常见的Web应用场景。你可以根据需要修改和扩展它们。






