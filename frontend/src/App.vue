



<template>
  <div id="app">
    <el-container>
      <el-header style="background-color: #ff2442; color: white; line-height: 80px;">
        <div class="header-content">
          <h1 style="margin: 0; font-size: 26px;">
            📝 小红书文案图文生成工具
          </h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">
            基于AI和爆款框架，快速生成高质量小红书图文内容
          </p>
        </div>
      </el-header>
      <el-main>
        <generate-page />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import GeneratePage from './views/Generate.vue'
</script>

<style>
#app {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.el-header {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.el-main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>


