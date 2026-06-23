<template>
  <div>
    <h1 class="page-title">音乐搜索</h1>
    <p class="page-subtitle">搜索歌曲、歌手、专辑，结果会按歌曲分页展示，并写入本地搜索记录用于推荐。</p>

    <div class="search-panel">
      <SearchBar v-model="keyword" :loading="loading" @search="handleSearch" />
      <div v-if="userStore.searchHistory.length" class="history">
        <span>搜索记录</span>
        <el-tag
          v-for="item in userStore.searchHistory"
          :key="item"
          class="history__tag"
          effect="plain"
          @click="handleSearch(item)"
        >
          {{ item }}
        </el-tag>
        <el-button text size="small" @click="userStore.clearSearchHistory()">清空</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="result-tabs">
      <el-tab-pane label="歌曲" name="songs">
        <div class="toolbar">
          <span class="text-muted">共 {{ songs.length }} 首，当前第 {{ page }} 页</span>
          <el-pagination
            v-if="songs.length > pageSize"
            v-model:current-page="page"
            background
            layout="prev, pager, next"
            :page-size="pageSize"
            :total="songs.length"
          />
        </div>

        <el-skeleton :loading="loading" animated :count="6">
          <template #default>
            <div v-if="pagedSongs.length" class="grid">
              <MusicCard v-for="song in pagedSongs" :key="song.trackId" :song="song" />
            </div>
            <div v-else class="empty-state">
              <div>
                <h3>输入关键词开始搜索</h3>
                <p>可以试试：周杰伦、林俊杰、Taylor Swift。iTunes API 会返回可试听的歌曲片段。</p>
              </div>
            </div>
          </template>
        </el-skeleton>
      </el-tab-pane>

      <el-tab-pane label="歌手" name="artists">
        <div class="artist-grid">
          <el-card v-for="artist in artists" :key="artist.artistId" class="simple-card" shadow="hover">
            <strong>{{ artist.artistName }}</strong>
            <span>{{ artist.primaryGenreName || 'Music Artist' }}</span>
            <el-button size="small" type="primary" plain @click="handleSearch(artist.artistName)">查看歌曲</el-button>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="专辑" name="albums">
        <div class="grid">
          <el-card v-for="album in albums" :key="album.collectionId" class="album-card" shadow="hover">
            <img :src="album.artworkUrl300 || album.artworkUrl100" :alt="album.collectionName" />
            <strong>{{ album.collectionName }}</strong>
            <span>{{ album.artistName }}</span>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SearchBar from '../../components/SearchBar.vue'
import MusicCard from '../../components/MusicCard.vue'
import { searchAlbums, searchArtists, searchSongs } from '../../api/music'
import { useUserStore } from '../../store/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const keyword = ref(String(route.query.q || ''))
const loading = ref(false)
const songs = ref([])
const artists = ref([])
const albums = ref([])
const page = ref(1)
const pageSize = 12
const activeTab = ref('songs')

const pagedSongs = computed(() => {
  const start = (page.value - 1) * pageSize
  return songs.value.slice(start, start + pageSize)
})

watch(
  () => route.query.q,
  (value) => {
    if (value && value !== keyword.value) handleSearch(String(value))
  }
)

onMounted(() => {
  if (keyword.value) handleSearch(keyword.value)
})

async function handleSearch(value) {
  const term = value.trim()
  if (!term) return

  keyword.value = term
  page.value = 1
  loading.value = true
  userStore.addSearchHistory(term)
  router.replace({ path: '/search', query: { q: term } })

  try {
    const [songResults, artistResults, albumResults] = await Promise.all([
      searchSongs(term, 60),
      searchArtists(term, 20),
      searchAlbums(term, 24)
    ])
    songs.value = songResults
    artists.value = artistResults
    albums.value = albumResults
  } catch (error) {
    ElMessage.error('搜索失败，请检查网络后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.search-panel {
  margin-top: 26px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: 0 14px 42px rgba(40, 55, 85, 0.08);
}

.history {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
  color: var(--muted);
  font-size: 14px;
}

.history__tag {
  cursor: pointer;
}

.result-tabs {
  margin-top: 24px;
}

.simple-card :deep(.el-card__body) {
  display: grid;
  gap: 10px;
}

.simple-card span,
.album-card span {
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
