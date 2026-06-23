<template>
  <el-card class="music-card" shadow="hover" :body-style="{ padding: '0' }">
    <RouterLink class="cover-link" :to="`/song/${song.trackId}`">
      <img :src="song.artworkUrl300 || song.artworkUrl100" :alt="song.trackName" loading="lazy" />
    </RouterLink>

    <div class="music-card__body">
      <RouterLink class="music-card__title" :to="`/song/${song.trackId}`">
        {{ song.trackName }}
      </RouterLink>
      <p>{{ song.artistName }}</p>
      <p class="album">{{ song.collectionName || song.primaryGenreName }}</p>

      <div class="music-card__meta">
        <el-tag size="small" effect="plain">{{ formatDuration(song.trackTimeMillis) }}</el-tag>
        <span>{{ song.primaryGenreName || 'Music' }}</span>
      </div>

      <div class="music-card__actions">
        <el-button circle :type="isPlaying ? 'success' : 'primary'" @click="play">
          <el-icon><VideoPlay /></el-icon>
        </el-button>
        <el-button circle :type="favorite ? 'danger' : 'default'" @click="toggle">
          <el-icon><StarFilled v-if="favorite" /><Star v-else /></el-icon>
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, StarFilled, VideoPlay } from '@element-plus/icons-vue'
import { useMusicStore } from '../store/musicStore'
import { formatDuration } from '../utils/format'

const props = defineProps({
  song: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const musicStore = useMusicStore()

const favorite = computed(() => musicStore.isFavorite(props.song.trackId))
const isPlaying = computed(() => musicStore.currentSong?.trackId === props.song.trackId)

function toggle() {
  musicStore.toggleFavorite(props.song)
  ElMessage.success(favorite.value ? '已收藏' : '已取消收藏')
}

function play() {
  musicStore.setCurrentSong(props.song)
  router.push('/player')
}
</script>

<style scoped>
.music-card {
  overflow: hidden;
  height: 100%;
  border: 1px solid rgba(221, 227, 236, 0.9);
  border-radius: 16px;
}

.cover-link {
  display: block;
  aspect-ratio: 1;
  background: var(--surface-soft);
}

.cover-link img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.24s ease;
}

.music-card:hover img {
  transform: scale(1.035);
}

.music-card__body {
  padding: 15px;
}

.music-card__title {
  display: -webkit-box;
  min-height: 44px;
  overflow: hidden;
  color: var(--text);
  font-size: 16px;
  font-weight: 750;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.music-card p {
  margin: 8px 0 0;
  overflow: hidden;
  color: var(--muted);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.music-card .album {
  color: #8b93a3;
  font-size: 13px;
}

.music-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
  color: var(--muted);
  font-size: 12px;
}

.music-card__actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
</style>
