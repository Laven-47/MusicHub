import axios from 'axios'
import { uniqueByTrackId, upscaleArtwork } from '../utils/format'

const client = axios.create({
  baseURL: 'https://itunes.apple.com',
  timeout: 12000
})

function normalizeSong(item) {
  return {
    trackId: item.trackId,
    trackName: item.trackName,
    artistId: item.artistId,
    artistName: item.artistName,
    collectionId: item.collectionId,
    collectionName: item.collectionName,
    artworkUrl100: item.artworkUrl100,
    artworkUrl300: upscaleArtwork(item.artworkUrl100, 300),
    artworkUrl600: upscaleArtwork(item.artworkUrl100, 600),
    previewUrl: item.previewUrl,
    trackTimeMillis: item.trackTimeMillis,
    primaryGenreName: item.primaryGenreName,
    releaseDate: item.releaseDate,
    country: item.country,
    trackViewUrl: item.trackViewUrl,
    collectionViewUrl: item.collectionViewUrl
  }
}

function normalizeArtist(item) {
  return {
    artistId: item.artistId,
    artistName: item.artistName,
    primaryGenreName: item.primaryGenreName,
    artistLinkUrl: item.artistLinkUrl
  }
}

function normalizeAlbum(item) {
  return {
    collectionId: item.collectionId,
    collectionName: item.collectionName,
    artistName: item.artistName,
    artworkUrl100: item.artworkUrl100,
    artworkUrl300: upscaleArtwork(item.artworkUrl100, 300),
    releaseDate: item.releaseDate,
    primaryGenreName: item.primaryGenreName,
    collectionViewUrl: item.collectionViewUrl
  }
}

export async function searchSongs(term, limit = 48) {
  const { data } = await client.get('/search', {
    params: {
      term,
      media: 'music',
      entity: 'song',
      country: 'CN',
      limit
    }
  })

  return uniqueByTrackId((data.results || []).map(normalizeSong))
}

export async function searchArtists(term, limit = 20) {
  const { data } = await client.get('/search', {
    params: {
      term,
      media: 'music',
      entity: 'musicArtist',
      country: 'CN',
      limit
    }
  })

  return (data.results || []).map(normalizeArtist)
}

export async function searchAlbums(term, limit = 24) {
  const { data } = await client.get('/search', {
    params: {
      term,
      media: 'music',
      entity: 'album',
      country: 'CN',
      limit
    }
  })

  return (data.results || []).map(normalizeAlbum)
}

export async function getHomeData() {
  const [songs, artists, albums] = await Promise.all([
    searchSongs('Taylor Swift', 8),
    searchArtists('pop', 8),
    searchAlbums('周杰伦', 8)
  ])

  return { songs, artists, albums }
}

export async function getSongDetail(trackId) {
  const { data } = await client.get('/lookup', {
    params: {
      id: trackId,
      country: 'CN'
    }
  })

  const song = (data.results || []).find((item) => item.wrapperType === 'track')
  return song ? normalizeSong(song) : null
}

export async function getRecommendations(terms = []) {
  const batches = await Promise.all(terms.map((term) => searchSongs(term, 8)))
  return uniqueByTrackId(batches.flat()).slice(0, 18)
}
