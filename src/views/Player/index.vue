<template>
  <div>
    <h1 class="page-title">播放页</h1>
    <p class="page-subtitle">使用原生 audio 实现试听播放、暂停和进度条控制。iTunes 预览音频通常为 30 秒片段。</p>

    <section class="player-page">
      <div v-if="musicStore.currentSong" class="now-playing">
        <img
          :src="musicStore.currentSong.artworkUrl600 || musicStore.currentSong.artworkUrl300"
          :alt="musicStore.currentSong.trackName"
        />
        <div>
          <h2>{{ musicStore.currentSong.trackName }}</h2>
          <p>{{ musicStore.currentSong.artistName }}</p>
          <el-button text @click="$router.push(`/song/${musicStore.currentSong.trackId}`)">查看歌曲详情</el-button>
        </div>
      </div>
      <div v-else class="empty-state">
        <div>
          <h3>请选择一首歌</h3>
          <p>在首页、搜索页、收藏夹或推荐页点击播放按钮即可进入试听。</p>
        </div>
      </div>

      <MusicPlayer />
    </section>
  </div>
</template>

<script setup>
import MusicPlayer from '../../components/MusicPlayer.vue'
import { useMusicStore } from '../../store/musicStore'

const musicStore = useMusicStore()
</script>

<style scoped>
.player-page {
  display: grid;
  gap: 22px;
  margin-top: 26px;
}

.now-playing {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 28px;
  align-items: center;
  padding: clamp(20px, 4vw, 38px);
  border: 1px solid var(--line);
  border-radius: 24px;
  background: linear-gradient(135deg, #111827, #253149);
  color: #fff;
  box-shadow: var(--shadow);
}

.now-playing img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 18px;
  object-fit: cover;
}

.now-playing h2 {
  margin: 0;
  font-size: clamp(28px, 4vw, 48px);
  line-height: 1.08;
}

.now-playing p {
  margin: 12px 0 18px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 18px;
}

@media (max-width: 640px) {
  .now-playing {
    grid-template-columns: 1fr;
  }
}
</style>
