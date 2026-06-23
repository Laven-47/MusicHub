import { defineStore } from 'pinia'

const FAVORITE_KEY = 'musichub:favorites'

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_KEY) || '[]')
  } catch {
    return []
  }
}

export const useMusicStore = defineStore('music', {
  state: () => ({
    favorites: readFavorites(),
    currentSong: null
  }),
  getters: {
    favoriteIds: (state) => new Set(state.favorites.map((song) => song.trackId)),
    favoriteCount: (state) => state.favorites.length
  },
  actions: {
    setCurrentSong(song) {
      this.currentSong = song
    },
    isFavorite(trackId) {
      return this.favoriteIds.has(trackId)
    },
    toggleFavorite(song) {
      if (!song?.trackId) return

      if (this.isFavorite(song.trackId)) {
        this.favorites = this.favorites.filter((item) => item.trackId !== song.trackId)
      } else {
        this.favorites = [song, ...this.favorites]
      }

      localStorage.setItem(FAVORITE_KEY, JSON.stringify(this.favorites))
    },
    removeFavorite(trackId) {
      this.favorites = this.favorites.filter((song) => song.trackId !== trackId)
      localStorage.setItem(FAVORITE_KEY, JSON.stringify(this.favorites))
    }
  }
})
