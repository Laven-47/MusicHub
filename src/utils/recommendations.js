const rules = [
  { match: ['周杰伦', 'jay chou'], terms: ['林俊杰', '方大同', '王力宏'] },
  { match: ['林俊杰', 'jj lin'], terms: ['周杰伦', '孙燕姿', '五月天'] },
  { match: ['taylor swift'], terms: ['Ed Sheeran', 'Olivia Rodrigo', 'Ariana Grande'] },
  { match: ['五月天', 'mayday'], terms: ['告五人', '苏打绿', '八三夭'] },
  { match: ['陈奕迅', 'eason chan'], terms: ['张学友', '李荣浩', '薛之谦'] }
]

const fallbackTerms = ['Taylor Swift', '周杰伦', '林俊杰']

export function getRecommendationTerms({ favorites = [], searchHistory = [] } = {}) {
  const signals = [
    ...favorites.map((song) => `${song.artistName || ''} ${song.trackName || ''}`),
    ...searchHistory
  ]
    .join(' ')
    .toLowerCase()

  const matched = rules.find((rule) =>
    rule.match.some((keyword) => signals.includes(keyword.toLowerCase()))
  )

  if (matched) return matched.terms

  const cleanHistory = searchHistory.map((item) => item.trim()).filter(Boolean)
  return cleanHistory.length ? cleanHistory.slice(0, 3) : fallbackTerms
}
