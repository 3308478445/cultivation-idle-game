# 修仙放置游戏 — 模块化拆分 + 二次元修真风格改造

## 任务概述
将单文件 `index.html`（约4560行）拆分为模块化结构，同时应用二次元修真风格。

## 完成时间
2026-06-25 00:30

## 目标目录结构（已创建）
```
E:\QClaw-Projects\cultivation-idle-game\
├── index.html              ← 入口（HTML结构 + 引用外部CSS/JS）
├── css/
│   ├── base.css            ← CSS变量、重置、body、字体（二次元修真配色）
│   ├── layout.css          ← 游戏容器、标签栏、页面布局
│   ├── components.css      ← 按钮、卡片、进度条、弹窗
│   ├── animations.css      ← 动画特效（呼吸光、突破金光、浮动文字等）
│   └── responsive.css      ← 移动端适配
├── js/
│   ├── core.js             ← 游戏核心：数据定义、playerData、存档、loadGame、saveGame、游戏主循环
│   ├── cultivation.js      ← 修炼、突破、自动修炼
│   ├── skills.js           ← 功法系统
│   ├── pills.js            ← 丹药系统
│   ├── shop.js             ← 商店系统
│   ├── encounter.js        ← 奇遇系统
│   ├── achievements.js     ← 成就系统
│   ├── sect.js             ← 宗门系统
│   ├── artifact.js         ← 法宝系统
│   ├── beast.js            ← 灵兽系统
│   ├── cave.js             ← 洞府系统
│   ├── story.js            ← 剧情系统
│   ├── cloud.js            ← 存档管理（导出/导入 + GitHub云同步）
│   └── ui.js               ← UI渲染、switchTab、showMessage、floatingText等
└── assets/                 ← 图片素材目录（已有）
```

## 二次元修真风格改造要点

### 配色（base.css :root）
- `--ink-black: #0a0a1a` — 墨黑主背景
- `--ink-dark: #1a1a2e` — 玄青渐变
- `--jade: #5fb0a8` — 玉青主色调
- `--gold: #e8c547` — 鎏金
- `--purple: #7b5ea7` — 紫灵
- `--vermillion: #c0392b` — 朱砂
- `--spirit-white: #e8f0f0` — 灵白文字
- `--smoke-gray: #8a8a9a` — 烟灰副文字
- `--glass-bg` / `--glass-border` / `--card-bg` — 磨砂玻璃效果

### 字体
- 标题: `'STKaiti', 'KaiTi', 'Microsoft YaHei'` — 楷体
- 正文: `'Microsoft YaHei'` — 雅黑

### 动画特效（animations.css）
1. `@keyframes breathe` — 修炼按钮呼吸光效
2. `@keyframes goldenBurst` — 突破金光爆发
3. `@keyframes tabSlide` — 标签切换动画
4. `@keyframes cardGlow` — 卡片悬浮光晕
5. `@keyframes spiritFloat` — 仙气粒子飘浮
6. `@keyframes progressShine` — 进度条流光
7. `@keyframes badgePulse` — 境界徽章脉动
8. `@keyframes encounterGlow` — 奇遇弹窗光效

### 组件风格
- 卡片: 磨砂玻璃 + 微光边框 + 圆角
- 按钮: 渐变填充 + 光泽动画 + 悬浮放大 + 呼吸光效
- 进度条: 渐变填充 + 流光动画
- 弹窗: 淡入 + 上滑 + 毛玻璃背景
- 标签栏: 底部金光指示条

## 关键约束验证
- ✅ 所有 JS 函数名和变量名保持不变
- ✅ 所有 HTML id 保持不变
- ✅ 所有游戏逻辑和数值保持不变
- ✅ 只改 UI 外观和交互体验
- ✅ 文件编码 UTF-8（无 BOM）
- ✅ JS 加载顺序: core → cultivation → skills → pills → shop → encounter → achievements → sect → artifact → beast → cave → story → cloud → ui
- ✅ HTML onclick 函数引用全部在 JS 文件中定义
