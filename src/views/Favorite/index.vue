<template>
  <div>
    <h1 class="page-title">我的收藏夹</h1>
    <p class="page-subtitle">收藏数据通过 Pinia 管理，并同步保存到 localStorage，刷新页面后依然保留。</p>

    <div class="toolbar">
      <span class="text-muted">已收藏 {{ musicStore.favoriteCount }} 首歌曲</span>
      <el-button :disabled="!musicStore.favoriteCount" @click="$router.push('/recommend')">根据收藏推荐</el-button>
    </div>

    <div v-if="musicStore.favorites.length" class="grid">
      <MusicCard v-for="song in musicStore.favorites" :key="song.trackId" :song="song" />
    </div>

    <div v-else class="empty-state">
      <div>
        <h3>收藏夹还是空的</h3>
        <p>去搜索页或首页收藏几首歌曲，推荐系统会根据你的收藏生成相似歌曲列表。</p>
        <el-button type="primary" @click="$router.push('/search')">去搜索</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import MusicCard from '../../components/MusicCard.vue'
import { useMusicStore } from '../../store/musicStore'

const musicStore = useMusicStore()
</script>
