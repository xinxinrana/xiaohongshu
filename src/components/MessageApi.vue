<script setup>
import { useMessage, useDialog, useNotification, useLoadingBar } from 'naive-ui'

/**
 * 将 Naive UI 的 API 注入到 window 对象，以便在非组件中使用
 */
window.$message = useMessage()
window.$dialog = useDialog()
window.$notification = useNotification()
window.$loadingBar = useLoadingBar()
</script>

<template>
  <div v-if="false"></div>
</template>
