<script setup>
// 极简风格 - 无需额外组件
</script>

<template>
  <div id="app">
    <!-- 固定头部 -->
    <header class="app-header">
      <router-link to="/" style="color: white; text-decoration: none;">HN小说</router-link>
    </header>
    
    <!-- 主内容 -->
    <main>
      <router-view></router-view>
    </main>
    
    <!-- 固定底部导航 -->
    <footer class="app-footer">
      <router-link to="/">首页</router-link>
      <router-link to="/rank">排行</router-link>
      <router-link to="/category/all">分类</router-link>
      <router-link to="/search">搜索</router-link>
      <router-link to="/history">历史</router-link>
    </footer>
  </div>
</template>
