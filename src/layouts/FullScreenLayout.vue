

<template>
  <div class="fullscreen-layout">
    <slot></slot>
  </div>
</template>

<script setup>
/**
 * 全屏布局组件
 * 适用于登录页、落地页等需要全屏展示的页面
 */
</script>

<style scoped>
.fullscreen-layout {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>


