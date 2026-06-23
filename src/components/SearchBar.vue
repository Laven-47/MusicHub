<template>
  <el-form class="search-bar" @submit.prevent="submit">
    <el-input
      v-model="keyword"
      size="large"
      clearable
      placeholder="搜索歌曲、歌手、专辑，例如：周杰伦、林俊杰、Taylor Swift"
      @keyup.enter="submit"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
    <el-button size="large" type="primary" :loading="loading" @click="submit">搜索</el-button>
  </el-form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search'])
const keyword = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    keyword.value = value
  }
)

function submit() {
  const value = keyword.value.trim()
  emit('update:modelValue', value)
  emit('search', value)
}
</script>

<style scoped>
.search-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  width: 100%;
}

@media (max-width: 560px) {
  .search-bar {
    grid-template-columns: 1fr;
  }
}
</style>
