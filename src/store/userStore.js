import { defineStore } from 'pinia'

const HISTORY_KEY = 'musichub:search-history'

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    searchHistory: readHistory()
  }),
  actions: {
    addSearchHistory(keyword) {
      const value = keyword.trim()
      if (!value) return
      this.searchHistory = [value, ...this.searchHistory.filter((item) => item !== value)].slice(0, 8)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.searchHistory))
    },
    clearSearchHistory() {
      this.searchHistory = []
      localStorage.removeItem(HISTORY_KEY)
    }
  }
})
