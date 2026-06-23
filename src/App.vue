<template>
  <el-config-provider namespace="el">
    <div class="app-shell">
      <header class="app-header">
        <RouterLink class="brand" to="/" aria-label="MusicHub 首页">
          <span class="brand__mark">M</span>
          <span>
            <strong>MusicHub</strong>
            <small>收藏与推荐平台</small>
          </span>
        </RouterLink>

        <nav class="main-nav">
          <RouterLink to="/">首页</RouterLink>
          <RouterLink to="/search">搜索</RouterLink>
          <RouterLink to="/favorite">收藏夹</RouterLink>
          <RouterLink to="/recommend">推荐</RouterLink>
          <RouterLink to="/player">播放页</RouterLink>
        </nav>
      </header>

      <main class="app-main">
        <RouterView />
      </main>

      <MusicPlayer compact />
    </div>
  </el-config-provider>
</template>

<script setup>
import MusicPlayer from './components/MusicPlayer.vue'
</script>
