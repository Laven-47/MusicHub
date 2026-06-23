<template>
  <section :class="['music-player', { 'music-player--compact': compact }]">
    <div v-if="song" class="music-player__info">
      <img :src="song.artworkUrl100" :alt="song.trackName" />
      <div>
        <strong>{{ song.trackName }}</strong>
        <span>{{ song.artistName }}</span>
      </div>
    </div>
    <div v-else class="music-player__info">
      <div class="music-player__placeholder">♪</div>
      <div>
        <strong>还没有选择歌曲</strong>
        <span>在歌曲卡片点击播放即可试听</span>
      </div>
    </div>

    <div class="music-player__controls">
      <el-button circle :disabled="!song?.previewUrl" @click="toggle">
        <el-icon><VideoPause v-if="playing" /><VideoPlay v-else /></el-icon>
      </el-button>

      <el-slider
        v-model="progress"
        :disabled="!song?.previewUrl"
        :show-tooltip="false"
        :min="0"
        :max="duration || 30"
        @change="seek"
      />
      <span class="music-player__time">{{ currentLabel }} / {{ durationLabel }}</span>
    </div>

    <audio
      ref="audioRef"
      :src="song?.previewUrl"
      @timeupdate="syncProgress"
      @loadedmetadata="syncDuration"
      @ended="playing = false"
    />
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useMusicStore } from '../store/musicStore'

defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})

const musicStore = useMusicStore()
const audioRef = ref(null)
const playing = ref(false)
const progress = ref(0)
const duration = ref(0)

const song = computed(() => musicStore.currentSong)
const currentLabel = computed(() => formatSeconds(progress.value))
const durationLabel = computed(() => formatSeconds(duration.value || 30))

watch(
  () => song.value?.trackId,
  async () => {
    playing.value = false
    progress.value = 0
    duration.value = 0
    await nextTick()
    if (audioRef.value) audioRef.value.load()
  }
)

async function toggle() {
  if (!song.value?.previewUrl) {
    ElMessage.warning('这首歌暂无试听片段')
    return
  }

  if (playing.value) {
    audioRef.value.pause()
    playing.value = false
    return
  }

  await audioRef.value.play()
  playing.value = true
}

function seek(value) {
  if (!audioRef.value) return
  audioRef.value.currentTime = value
}

function syncProgress(event) {
  progress.value = event.target.currentTime
}

function syncDuration(event) {
  duration.value = event.target.duration || 30
}

function formatSeconds(value) {
  const total = Math.max(0, Math.floor(value || 0))
  const minutes = Math.floor(total / 60)
  const seconds = String(total % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
</script>

<style scoped>
.music-player {
  display: grid;
  grid-template-columns: minmax(220px, 0.8fr) minmax(240px, 1.2fr);
  gap: 18px;
  align-items: center;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.music-player--compact {
  position: fixed;
  right: 24px;
  bottom: 20px;
  left: 24px;
  z-index: 30;
  max-width: 920px;
  margin: 0 auto;
  padding: 12px 14px;
  border-radius: 16px;
}

.music-player__info {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.music-player__info img,
.music-player__placeholder {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  object-fit: cover;
}

.music-player__placeholder {
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 24px;
  background: linear-gradient(135deg, var(--blue), var(--accent));
}

.music-player__info strong,
.music-player__info span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.music-player__info strong {
  font-size: 15px;
}

.music-player__info span {
  margin-top: 5px;
  color: var(--muted);
  font-size: 13px;
}

.music-player__controls {
  display: grid;
  grid-template-columns: auto minmax(120px, 1fr) 78px;
  gap: 12px;
  align-items: center;
}

.music-player__time {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  text-align: right;
}

@media (max-width: 720px) {
  .music-player,
  .music-player--compact {
    grid-template-columns: 1fr;
    right: 12px;
    left: 12px;
  }
}
</style>
