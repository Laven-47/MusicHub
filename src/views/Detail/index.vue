<template>
  <div>
    <el-skeleton :loading="loading" animated :rows="8">
      <template #default>
        <section v-if="song" class="detail">
          <img class="detail__cover" :src="song.artworkUrl600 || song.artworkUrl300" :alt="song.trackName" />
          <div class="detail__content">
            <el-tag effect="plain">{{ song.primaryGenreName || 'Music' }}</el-tag>
            <h1>{{ song.trackName }}</h1>
            <p class="detail__artist">{{ song.artistName }}</p>

            <dl class="detail__list">
              <div>
                <dt>所属专辑</dt>
                <dd>{{ song.collectionName || '暂无专辑信息' }}</dd>
              </div>
              <div>
                <dt>歌曲时长</dt>
                <dd>{{ formatDuration(song.trackTimeMillis) }}</dd>
              </div>
              <div>
                <dt>发行时间</dt>
                <dd>{{ song.releaseDate ? song.releaseDate.slice(0, 10) : '未知' }}</dd>
              </div>
              <div>
                <dt>歌手 ID</dt>
                <dd>{{ song.artistId || '-' }}</dd>
              </div>
            </dl>

            <div class="detail__actions">
              <el-button type="primary" size="large" @click="play">播放试听</el-button>
              <el-button size="large" :type="isFavorite ? 'danger' : 'default'" @click="toggleFavorite">
                {{ isFavorite ? '取消收藏' : '收藏歌曲' }}
              </el-button>
              <el-button v-if="song.trackViewUrl" size="large" tag="a" :href="song.trackViewUrl" target="_blank">
                iTunes 页面
              </el-button>
            </div>
          </div>
        </section>

        <div v-else class="empty-state">
          <div>
            <h3>没有找到这首歌</h3>
            <p>请返回搜索页选择其他歌曲。</p>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSongDetail } from '../../api/music'
import { useMusicStore } from '../../store/musicStore'
import { formatDuration } from '../../utils/format'

const route = useRoute()
const router = useRouter()
const musicStore = useMusicStore()
const song = ref(null)
const loading = ref(false)

const isFavorite = computed(() => song.value && musicStore.isFavorite(song.value.trackId))

onMounted(loadDetail)
watch(() => route.params.id, loadDetail)

async function loadDetail() {
  loading.value = true
  try {
    song.value = await getSongDetail(route.params.id)
  } catch (error) {
    ElMessage.error('歌曲详情加载失败')
  } finally {
    loading.value = false
  }
}

function toggleFavorite() {
  musicStore.toggleFavorite(song.value)
  ElMessage.success(isFavorite.value ? '已收藏' : '已取消收藏')
}

function play() {
  musicStore.setCurrentSong(song.value)
  router.push('/player')
}
</script>

<style scoped>
.detail {
  display: grid;
  grid-template-columns: minmax(240px, 410px) minmax(0, 1fr);
  gap: clamp(24px, 5vw, 56px);
  align-items: center;
  padding: clamp(22px, 5vw, 48px);
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.detail__cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 22px;
  object-fit: cover;
  box-shadow: 0 28px 64px rgba(24, 32, 51, 0.22);
}

.detail__content h1 {
  margin: 18px 0 8px;
  font-size: clamp(30px, 5vw, 56px);
  line-height: 1.04;
}

.detail__artist {
  margin: 0;
  color: var(--muted);
  font-size: 20px;
}

.detail__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 28px 0;
}

.detail__list div {
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #fbfcfe;
}

.detail__list dt {
  color: var(--muted);
  font-size: 13px;
}

.detail__list dd {
  margin: 6px 0 0;
  overflow-wrap: anywhere;
  font-weight: 700;
}

.detail__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 780px) {
  .detail {
    grid-template-columns: 1fr;
  }

  .detail__list {
    grid-template-columns: 1fr;
  }
}
</style>
