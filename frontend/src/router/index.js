




import { createRouter, createWebHistory } from 'vue-router'
import Generate from '../views/Generate.vue'

const routes = [
  {
    path: '/',
    name: 'Generate',
    component: Generate
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router



