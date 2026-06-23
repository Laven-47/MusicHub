<template>
  <div>
    <h1 class="page-title">为你推荐</h1>
    <p class="page-subtitle">
      根据收藏歌曲与搜索记录生成推荐关键词，再通过开放 API 拉取歌曲。示例逻辑：收藏周杰伦时推荐林俊杰、方大同、王力宏。
    </p>

    <section class="recommend-panel">
      <div>
        <strong>当前推荐关键词</strong>
        <div class="recommend-tags">
          <el-tag v-for="term in terms" :key="term" effect="plain">{{ term }}</el-tag>
        </div>
      </div>
      <el-button type="primary" :loading="loading" @click="loadRecommendations">重新推荐</el-button>
    </section>

    <el-skeleton :loading="loading" animated :count="6">
      <template #default>
        <div v-if="songs.length" class="grid section">
          <MusicCard v-for="song in songs" :key="song.trackId" :song="song" />
        </div>
        <div v-else class="empty-state section">
          <div>
            <h3>暂时没有推荐结果</h3>
            <p>先搜索或收藏几首歌曲，MusicHub 会根据你的行为生成更贴近的推荐。</p>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import MusicCard from '../../components/MusicCard.vue'
import { getRecommendations } from '../../api/music'
import { useMusicStore } from '../../store/musicStore'
import { useUserStore } from '../../store/userStore'
import { getRecommendationTerms } from '../../utils/recommendations'

const musicStore = useMusicStore()
const userStore = useUserStore()
const songs = ref([])
const loading = ref(false)

const terms = computed(() =>
  getRecommendationTerms({
    favorites: musicStore.favorites,
    searchHistory: userStore.searchHistory
  })
)

onMounted(loadRecommendations)

async function loadRecommendations() {
  loading.value = true
  try {
    songs.value = await getRecommendations(terms.value)
  } catch (error) {
    ElMessage.error('推荐歌曲加载失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.recommend-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 26px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: 0 14px 42px rgba(40, 55, 85, 0.08);
}

.recommend-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}
</style>
