
/**
 * UI组件库入口文件
 * 统一导出所有UI组件
 */

import Button from './Button.vue'
import Card from './Card.vue'
import Input from './Input.vue'

// 导出单个组件
export { Button, Card, Input }

// 导出安装函数（用于全局注册）
export default {
  install(app) {
    app.component('Button', Button)
    app.component('Card', Card)
    app.component('Input', Input)
  }
}

