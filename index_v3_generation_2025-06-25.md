# index_v3.html 生成完成

## 任务目标
基于 index_modular.html 完整结构和内容，重写为"一念逍遥水墨国风"版 index_v3.html。

## 完成内容

### 文件位置
`E:\QClaw-Projects\cultivation-idle-game\index_v3.html` (62867 bytes)

### 保留资源
- 所有5个 external CSS：css/base.css, css/layout.css, css/components.css, css/animations.css, css/responsive.css
- 所有15个 JS 文件：core.js, cultivation.js, skills.js, pills.js, shop.js, encounter.js, achievements.js, sect.js, artifact.js, beast.js, cave.js, story.js, cloud.js, audio.js, ui.js

### 新布局结构

**顶栏**（fixed top, z-1000）：左侧境界徽章+境界名，右侧灵石+静音+修炼速度

**城镇场景 #townScene**（默认显示）：
- 水墨山峦背景（CSS radial-gradient模拟远山云雾）
- 5个横向scroll建筑卡片：天机阁📖、镇妖塔🗼、论剑台⚔️、坊市🏪、秘境🌌

**洞府场景 #caveScene**（默认隐藏）：
- 修炼主面板（含 stats-grid, progress-section, action-buttons, info-section + autoToggle）
- 6个洞府房间 2×3 grid：修炼室🧘、炼丹房🔥、炼器室⚒️、药圃🌿、灵兽园🐉、聚灵阵✨

**消息栏**：固定于底栏上方（fixed bottom above nav）

**底部导航**（fixed bottom）：城镇🏘️、洞府🏠、行囊🎒、宗门📜

### 11个子面板（panel-overlay + 右滑入动画）
- #skillsPanel（功法阁，含 skillsList, skillSlots）
- #pillsPanel（丹药阁，含 pillsList）
- #shopPanel（灵石商店，含 shopList, shopSpiritStones）
- #encounterPanel（奇遇录，含 recentEncounters, encounterStats, stat_*/totalEncounters）
- #achievementsPanel（成就系统，含 achievementsList）
- #sectPanel（宗门系统，含 sectInfo/sectNoSect/sectList/sectShopList/sectDailyTasks 及所有宗门子元素）
- #artifactPanel（法宝系统，含 equippedArtifacts/artifactInventory/artifactMaterials/artifactStoneCount/artifactShop）
- #beastPanel（灵兽系统，含 beastHouse/beastShop）
- #cavePanel（洞府系统，含 caveLevel/caveProsperity/caveExp/caveExpMax/caveExpBar/herbGarden/alchemyFurnace/herbCount/caveUpgrade/alchemyEfficiency/buyPlotBtn）
- #storyPanel（剧情，含 currentRealmStory/storyList/storyProgress）
- #cloudPanel（云同步，含 githubToken/tokenStatus/autoSyncToggle/gistInfoSection/gistLink/syncStatus）
- #cultivationPanel（修炼室详情 + 存档管理）

### 2个模态弹窗
- #encounterModal（奇遇触发弹窗）
- #beastCaptureModal（灵兽捕捉弹窗）

### 内联CSS
主题色：墨黑#0a0a1a, 玉青#5fb0a8, 鎏金#e8c547, 宣纸米白#f5f0e8
字体：STKaiti / KaiTi / 楷体 / Microsoft YaHei

关键类：.yinian-app, .yinian-header, .scene/.town-scene/.cave-scene, .panel-overlay, .panel-header-v3, .panel-body-v3, .building-card, .room-card, .yinian-nav, .yinian-msg

### 内联JS
- switchScene(scene)：场景切换+高亮导航按钮
- openPanel(name)：打开面板并触发对应render函数
- closePanel()：关闭所有面板
- syncCultivationPanel()：修炼面板属性同步
- toggleMute()：静音切换
- toggleAutoCultivation()：自动修炼开关
- MutationObserver：兼容原版JS对模态弹窗的display操作，自动添加active类

### 关键设计决策
- 所有原版 DOM ID 完整保留，JS 文件无需修改
- 城镇/townScene 默认显示（class="active"），洞府默认隐藏
- 面板用 position:fixed + max-width:500px + left:50% transform 居中，匹配移动端
- 所有面板、弹窗、场景切换通过 class 控制显示隐藏
- 兼容原版 JS 对 encounterModal 的 style.display 操作（MutationObserver 桥接）
