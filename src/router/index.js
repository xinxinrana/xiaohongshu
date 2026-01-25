




import { createRouter, createWebHistory } from 'vue-router'
import Generate from '../views/Generate.vue'
import AgentWorkbench from '../views/AgentWorkbench.vue'

const routes = [
  {
    path: '/',
    name: 'Generate',
    component: Generate
  },
  {
    path: '/agent-workbench',
    name: 'AgentWorkbench',
    component: AgentWorkbench
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router



