


import { createApp, h } from 'vue'
import naive from 'naive-ui'
import router from './router'
import App from './App.vue'
import './assets/base.css'

const app = createApp(App)
app.use(naive)
app.use(router)
app.mount('#app')


