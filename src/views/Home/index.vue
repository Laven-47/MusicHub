<template>
  <div>
    <section class="hero">
      <div>
        <h1 class="page-title">发现、收藏、试听你喜欢的音乐</h1>
        <p class="page-subtitle">
          MusicHub 使用开放音乐 API 获取歌曲、歌手和专辑数据，支持搜索分页、歌曲详情、收藏夹、本地推荐和试听播放。
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="$router.push('/search')">开始搜索</el-button>
          <el-button size="large" @click="$router.push('/recommend')">查看推荐</el-button>
        </div>
      </div>

      <div class="hero-board" aria-label="热门歌曲预览">
        <div v-for="song in featuredSongs" :key="song.trackId" class="hero-board__row">
          <img :src="song.artworkUrl100" :alt="song.trackName" />
          <div>
            <strong>{{ song.trackName }}</strong>
            <span>{{ song.artistName }}</span>
          </div>
          <el-button circle size="small" @click="play(song)">
            <el-icon><VideoPlay /></el-icon>
          </el-button>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <div>
          <h2>热门歌曲</h2>
          <p>来自 iTunes 开放接口的实时音乐数据</p>
        </div>
        <el-button text @click="loadHomeData">刷新</el-button>
      </div>
      <el-skeleton :loading="loading" animated :count="4">
        <template #default>
          <div class="grid">
            <MusicCard v-for="song in songs" :key="song.trackId" :song="song" />
          </div>
        </template>
      </el-skeleton>
    </section>

    <section class="section">
      <div class="section__head">
        <div>
          <h2>热门歌手</h2>
          <p>快速进入歌手搜索，继续探索相似作品</p>
        </div>
      </div>
      <div class="artist-grid">
        <el-card v-for="artist in artists" :key="artist.artistId" class="artist-card" shadow="hover">
          <div class="artist-card__avatar">{{ artist.artistName.slice(0, 1) }}</div>
          <strong>{{ artist.artistName }}</strong>
          <span>{{ artist.primaryGenreName || 'Music' }}</span>
          <el-button size="small" text @click="goSearch(artist.artistName)">搜索作品</el-button>
        </el-card>
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <div>
          <h2>热门专辑</h2>
          <p>卡片布局展示专辑封面、歌手和流派信息</p>
        </div>
      </div>
      <div class="grid album-grid">
        <el-card v-for="album in albums" :key="album.collectionId" class="album-card" shadow="hover">
          <img :src="album.artworkUrl300 || album.artworkUrl100" :alt="album.collectionName" />
          <strong>{{ album.collectionName }}</strong>
          <span>{{ album.artistName }}</span>
          <small>{{ album.primaryGenreName || 'Album' }}</small>
        </el-card>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'
import { getHomeData } from '../../api/music'
import MusicCard from '../../components/MusicCard.vue'
import { useMusicStore } from '../../store/musicStore'

const router = useRouter()
const musicStore = useMusicStore()
const loading = ref(false)
const songs = ref([])
const artists = ref([])
const albums = ref([])

const featuredSongs = computed(() => songs.value.slice(0, 3))

onMounted(loadHomeData)

async function loadHomeData() {
  loading.value = true
  try {
    const data = await getHomeData()
    songs.value = data.songs
    artists.value = data.artists
    albums.value = data.albums
  } catch (error) {
    ElMessage.error('首页音乐数据加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function play(song) {
  musicStore.setCurrentSong(song)
  router.push('/player')
}

function goSearch(keyword) {
  router.push({ path: '/search', query: { q: keyword } })
}
</script>

<style scoped>
.artist-card :deep(.el-card__body) {
  display: grid;
  justify-items: start;
  gap: 8px;
}

.artist-card__avatar {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 16px;
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--blue), var(--green));
}

.artist-card strong,
.album-card strong {
  display: -webkit-box;
  overflow: hidden;
  color: var(--text);
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.artist-card span,
.album-card span,
.album-card small {
  color: var(--muted);
  font-size: 13px;
}

.album-card :deep(.el-card__body) {
  display: grid;
  gap: 8px;
}

.album-card img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  object-fit: cover;
}
</style>
