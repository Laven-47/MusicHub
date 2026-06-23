# MusicHub — 项目技术文档

## 1. 概览

MusicHub 是一个基于 Vue 3 构建的音乐发现与试听单页应用（SPA）。它通过 Apple iTunes Search API 获取实时的歌曲、歌手和专辑数据，提供搜索、分页浏览、歌曲详情查看、收藏夹管理以及本地驱动的内容推荐功能。页面底部固定悬浮一个全局试听播放器，支持 30 秒预览音频的播放/暂停与进度拖拽。

## 2. 技术栈

| 类别       | 技术/库                      | 用途                               |
| ---------- | ---------------------------- | ---------------------------------- |
| 框架       | Vue 3 (Composition API)      | 声明式 UI 组件与响应式数据流       |
| 构建工具   | Vite 6                       | 开发服务器、HMR、Rollup 生产打包   |
| 语言       | JavaScript (ESM)             | 全部源码                           |
| 路由       | Vue Router 4                 | 基于 history 模式的路由与懒加载     |
| 状态管理   | Pinia 2                      | 全局音乐状态与用户搜索历史管理     |
| UI 组件库  | Element Plus 2               | 按钮、标签、分页、骨架屏、滑块等   |
| 图标库     | @element-plus/icons-vue      | Element Plus 配套图标               |
| HTTP 请求  | Axios 1.7                    | iTunes API 的封装调用               |
| 样式       | 原生 CSS + CSS 变量          | 全局变量、响应式布局、scoped 样式  |
| 后端/API   | Apple iTunes Search API      | 数据源（搜索、查询）               |
| 运行时     | 原生 <audio> 元素          | 试听音频播放                       |
| 本地持久化 | Web Storage API (localStorage)| 收藏夹数据、搜索历史记录           |

## 3. 项目结构

`
src/
├── main.js                     # 应用入口：挂载 Vue、Pinia、Router、Element Plus
├── App.vue                     # 根组件：顶栏导航 + 全局播放器（MusicPlayer）
├── styles.css                  # 全局样式变量与布局
│
├── api/
│   └── music.js                # iTunes API 封装层
│
├── store/
│   ├── musicStore.js           # 音乐 Pinia store（收藏夹、当前歌曲）
│   └── userStore.js            # 用户 Pinia store（搜索历史）
│
├── router/
│   └── index.js                # 路由配置（6 条路由，全部懒加载）
│
├── utils/
│   ├── format.js               # 格式化工具（时长、封面图尺寸、去重）
│   └── recommendations.js      # 推荐关键词匹配逻辑
│
├── components/
│   ├── SearchBar.vue           # 搜索输入组件
│   ├── MusicCard.vue           # 歌曲卡片组件
│   └── MusicPlayer.vue         # 全局试听播放器组件
│
└── views/
    ├── Home/index.vue           # 首页（热门歌曲/歌手/专辑）
    ├── Search/index.vue         # 搜索页（歌曲/歌手/专辑三面板）
    ├── Detail/index.vue         # 歌曲详情页
    ├── Favorite/index.vue       # 收藏夹页
    ├── Recommend/index.vue      # 推荐页
    └── Player/index.vue         # 播放器页
`

## 4. 各模块实现方式

### 4.1 API 模块 (src/api/music.js)

基于 Axios 实例封装对 iTunes API 的调用：

- 创建 Axios 实例，baseURL 指向 https://itunes.apple.com，超时 12 秒。
- 定义 
ormalizeSong / 
ormalizeArtist / 
ormalizeAlbum 三个归一化函数，将 iTunes 原始响应映射为前端一致的数据结构，并在归一化过程中调用 upscaleArtwork 将 100x100 封面 URL 替换为更高分辨率（300/600）。
- 提供 6 个导出函数：
  - searchSongs(term, limit) — 搜索歌曲，entity=song
  - searchArtists(term, limit) — 搜索歌手，entity=musicArtist
  - searchAlbums(term, limit) — 搜索专辑，entity=album
  - getHomeData() — 首页数据聚合：并行请求 Taylor Swift 的热门歌曲、pop 流派歌手、周杰伦专辑
  - getSongDetail(trackId) — 通过 /lookup 端点按 trackId 获取单曲详情
  - getRecommendations(terms) — 根据多个推荐关键词并行搜索并合并去重

所有搜索均使用 country=CN 参数，结果通过 uniqueByTrackId 去重。

### 4.2 状态管理

#### musicStore.js (Pinia)
- **state**: avorites（收藏歌曲数组）、currentSong（当前播放的歌曲）
- **getters**: avoriteIds（收藏的 trackId 集合，用于快速查找）、avoriteCount
- **actions**: setCurrentSong、isFavorite、	oggleFavorite、emoveFavorite
- **持久化**: 每次收藏/取消操作都同步写入 localStorage('musichub:favorites')，应用启动时从 localStorage 恢复

#### userStore.js (Pinia)
- **state**: searchHistory（搜索关键词数组）
- **actions**: ddSearchHistory — 去重插入，最多保留 8 条；clearSearchHistory
- **持久化**: 同步写入 localStorage('musichub:search-history')

### 4.3 路由 (src/router/index.js)

使用 createWebHistory() 实现 history 模式路由，共 6 条路由，**全部采用动态 import() 懒加载**：

| 路径         | 名称          | 页面视图              |
| ------------ | ------------- | --------------------- |
| /          | home          | Home/index.vue        |
| /search    | search        | Search/index.vue      |
| /song/:id  | song-detail   | Detail/index.vue      |
| /favorite  | favorite      | Favorite/index.vue    |
| /recommend | recommend     | Recommend/index.vue   |
| /player    | player        | Player/index.vue      |

scrollBehavior 在每次路由切换时滚动到页面顶部。

### 4.4 工具函数

#### ormat.js
- ormatDuration(ms) — 将毫秒转为 m:ss 格式
- upscaleArtwork(url, size) — 将 iTunes 默认的 100x100 封面 URL 替换为目标尺寸（300/600）
- uniqueByTrackId(items) — 基于 trackId 去重

#### ecommendations.js
- getRecommendationTerms({ favorites, searchHistory }) — 基于收藏歌曲和搜索历史，匹配预设的推荐规则（如收藏周杰伦 → 推荐林俊杰、方大同、王力宏），无匹配时回退到历史关键词或默认热门关键词

### 4.5 组件

#### SearchBar.vue
- 支持 -model 双向绑定
- 采用 el-form + el-input + el-button 组合
- 支持回车提交和按钮点击提交
- 暴露 search 事件，父组件监听后执行搜索逻辑

#### MusicCard.vue
- 使用 el-card 展示歌曲封面、标题、歌手、专辑、时长、流派
- 两个按钮：播放（设置 currentSong 并跳转播放页）和收藏（调用 musicStore.toggleFavorite）
- 封面图使用 loading="lazy" 懒加载
- 根据 currentSong 判断当前播放状态，实时切换按钮样式

#### MusicPlayer.vue
- 全局试听播放器，在 App.vue 中作为全局组件使用
- 通过 compact prop 控制布局（首页为固定底部悬浮样式）
- 使用原生 <audio> 元素播放 iTunes 提供的 30 秒预览音频（previewUrl）
- 监听 	imeupdate、loadedmetadata、ended 事件同步进度
- 进度条使用 el-slider 实现，支持拖拽跳转
- 监听 currentSong 变化自动重置播放状态并重新加载音频

### 4.6 页面视图

#### **首页** (Home/index.vue)
- **Hero 区域**: 左侧为品牌文案与行动按钮，右侧为深色背景的热门歌曲预览 Board（取搜索结果前 3 首）
- **热门歌曲**: 使用 MusicCard 网格展示，el-skeleton 加载骨架屏
- **热门歌手**: 卡片布局，首字母头像 + 搜索作品按钮
- **热门专辑**: 封面图 + 名称 + 歌手网格展示
- 所有数据通过 getHomeData() 在 onMounted 时一次性并行加载

#### **搜索页** (Search/index.vue)
- 顶部 SearchBar 组件，附带搜索历史标签（可点击复用）
- 三面板 el-tabs：歌曲 / 歌手 / 专辑
- **歌曲面板**: 分页展示（每页 12 首），使用 el-pagination
- 搜索时三个接口（songs / artists / albums）并行调用
- URL 查询参数 ?q= 同步路由，支持通过 URL 直接搜索
- 同步 ddSearchHistory 到 userStore

#### **歌曲详情页** (Detail/index.vue)
- 通过 oute.params.id 调用 getSongDetail(trackId) 获取单曲数据
- 展示 600px 封面图、流派标签、曲名、歌手
- 信息列表：所属专辑、时长、发行日期、歌手 ID
- 三个按钮：播放试听、收藏/取消收藏、跳转 iTunes 页面
- 监听 oute.params.id 变化，切换歌曲时重新加载

#### **收藏夹页** (Favorite/index.vue)
- 展示 musicStore.favorites 列表，使用 MusicCard 网格
- 空状态提示引导用户搜索收藏
- 统计已收藏数量，提供跳转推荐页按钮

#### **推荐页** (Recommend/index.vue)
- 基于收藏和搜索历史计算出推荐关键词（getRecommendationTerms）
- 展示当前关键词标签
- 根据关键词并行搜索歌曲合并去重，最多返回 18 首
- 支持一键"重新推荐"

#### **播放器页** (Player/index.vue)
- 展示当前歌曲大封面 + 大标题
- 当前无歌曲时显示空状态提示
- 内嵌 MusicPlayer 组件（不带 compact，全尺寸展示）

## 5. API 调用清单

所有 API 共用 https://itunes.apple.com 基址和 Axios 实例。

### GET /search

| 参数      | 说明                       |
| --------- | -------------------------- |
| 	erm    | 搜索关键词                 |
| media   | 固定为 music             |
| country | 固定为 CN                |
| entity  | song / musicArtist / lbum |
| limit   | 返回条数上限               |

调用场景：
- searchSongs(term, 48) — 搜索页/推荐页获取歌曲
- searchArtists(term, 20) — 首页/搜索页获取歌手
- searchAlbums(term, 24) — 首页/搜索页获取专辑
- getHomeData() 内部 — 并行调用 3 次搜索（Taylor Swift / pop / 周杰伦）
- getRecommendations(terms) 内部 — 遍历关键词并行调用

### GET /lookup

| 参数      | 说明         |
| --------- | ------------ |
| id      | trackId      |
| country | CN         |

调用场景：
- getSongDetail(trackId) — 详情页单曲查询

## 6. 数据流示意

`
用户操作 → Vue 组件 → Pinia Store / API 模块
                           ├── Axios → iTunes API → 归一化 → 响应式数据
                           └── localStorage ←→ 持久化（收藏/历史）
→ 组件 re-render → DOM 更新