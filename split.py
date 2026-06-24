# -*- coding: utf-8 -*-
"""
自动拆分修仙放置游戏 index.html 为模块化结构
+ 应用二次元修真风格
"""
import re
import os
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = r"E:\QClaw-Projects\cultivation-idle-game"
CSS_DIR = os.path.join(BASE, "css")
JS_DIR = os.path.join(BASE, "js")

os.makedirs(CSS_DIR, exist_ok=True)
os.makedirs(JS_DIR, exist_ok=True)

# 读取原文件
with open(os.path.join(BASE, "index.html"), "r", encoding="utf-8") as f:
    content = f.read()

# 提取 CSS
css_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
css_content = css_match.group(1).strip() if css_match else ""

# 提取 JS
js_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
js_content = js_match.group(1).strip() if js_match else ""

# 提取 HTML body（去掉 style 和 script）
html_body = content
html_body = re.sub(r'<style>.*?</style>', '', html_body, flags=re.DOTALL)
html_body = re.sub(r'<script>.*?</script>', '', html_body, flags=re.DOTALL)

# ============================================================
# CSS 拆分 + 二次元修真风格改造
# ============================================================

# base.css - 变量、重置、字体
base_css = """/* ========== base.css - 基础变量与重置 ========== */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    /* 二次元修真配色 */
    --ink-black: #0a0a1a;
    --ink-dark: #1a1a2e;
    --jade: #5fb0a8;
    --jade-light: #7fd0c8;
    --gold: #e8c547;
    --gold-light: #f5d96a;
    --purple: #7b5ea7;
    --purple-light: #9b7ec7;
    --vermillion: #c0392b;
    --spirit-white: #e8f0f0;
    --smoke-gray: #8a8a9a;
    --cyan: #4ecdc4;
    --green: #6ec06e;
    --orange: #e8943c;
    --red: #e74c3c;
    --blue: #4a90e2;
    
    /* 背景色 */
    --bg-dark: var(--ink-black);
    --bg-card: rgba(22, 33, 62, 0.6);
    --bg-lighter: rgba(30, 42, 74, 0.5);
    
    /* 磨砂玻璃 */
    --glass-bg: rgba(95, 176, 168, 0.08);
    --glass-border: rgba(95, 176, 168, 0.2);
    --glass-hover: rgba(95, 176, 168, 0.15);
    
    /* 文字 */
    --text-primary: var(--spirit-white);
    --text-secondary: var(--smoke-gray);
    
    /* 字体 */
    --font-title: 'STKaiti', 'KaiTi', 'Microsoft YaHei', serif;
    --font-body: 'Microsoft YaHei', '微软雅黑', sans-serif;
    
    /* 阴影 */
    --shadow-glow: 0 0 20px rgba(95, 176, 168, 0.3);
    --shadow-gold: 0 0 20px rgba(232, 197, 71, 0.3);
}

body {
    font-family: var(--font-body);
    background: 
        radial-gradient(ellipse at 20% 0%, rgba(95, 176, 168, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(123, 94, 167, 0.08) 0%, transparent 50%),
        linear-gradient(135deg, var(--ink-black) 0%, var(--ink-dark) 100%);
    background-attachment: fixed;
    color: var(--text-primary);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    overflow-x: hidden;
}

/* 仙气粒子背景 */
body::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: 
        radial-gradient(2px 2px at 20% 30%, rgba(232, 197, 71, 0.15), transparent),
        radial-gradient(2px 2px at 60% 70%, rgba(95, 176, 168, 0.15), transparent),
        radial-gradient(1px 1px at 50% 50%, rgba(232, 197, 71, 0.1), transparent),
        radial-gradient(1px 1px at 80% 20%, rgba(123, 94, 167, 0.15), transparent),
        radial-gradient(2px 2px at 30% 80%, rgba(95, 176, 168, 0.1), transparent);
    background-size: 300px 300px;
    background-repeat: repeat;
    pointer-events: none;
    z-index: 0;
    animation: spiritDrift 30s linear infinite;
}
"""

# layout.css - 布局
layout_css = """/* ========== layout.css - 布局与标签栏 ========== */
.game-container {
    max-width: 520px;
    width: 100%;
    background: var(--bg-card);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 0 1px var(--glass-border),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    position: relative;
    z-index: 1;
}

/* 云纹装饰边框 */
.game-container::before {
    content: '';
    position: absolute;
    top: -1px; left: -1px; right: -1px; bottom: -1px;
    border-radius: 20px;
    background: linear-gradient(135deg, 
        rgba(95, 176, 168, 0.3) 0%, 
        rgba(232, 197, 71, 0.15) 50%, 
        rgba(123, 94, 167, 0.3) 100%);
    z-index: -1;
}

/* 标签栏 */
.tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    background: var(--glass-bg);
    padding: 6px;
    border-radius: 14px;
    border: 1px solid var(--glass-border);
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
}

.tabs::-webkit-scrollbar { display: none; }

.tab {
    flex: 0 0 auto;
    padding: 10px 14px;
    text-align: center;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    position: relative;
    min-width: 50px;
}

.tab:hover {
    background: var(--glass-hover);
    color: var(--text-primary);
}

.tab.active {
    background: linear-gradient(135deg, var(--jade), var(--purple));
    color: white;
    box-shadow: 0 4px 12px rgba(95, 176, 168, 0.3);
}

.tab-content {
    display: none;
    animation: fadeInUp 0.4s ease;
}

.tab-content.active {
    display: block;
}

.header {
    text-align: center;
    margin-bottom: 20px;
}

.title {
    font-family: var(--font-title);
    font-size: 28px;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
    letter-spacing: 4px;
}

.realm-badge {
    display: inline-block;
    padding: 6px 20px;
    background: linear-gradient(135deg, var(--purple), var(--jade));
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 2px 12px rgba(123, 94, 167, 0.3);
    letter-spacing: 2px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
}

.stat-card {
    background: var(--glass-bg);
    backdrop-filter: blur(8px);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    padding: 14px;
    text-align: center;
    transition: all 0.3s;
}

.stat-card:hover {
    background: var(--glass-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
}

.stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 6px;
}

.stat-value {
    font-size: 22px;
    font-weight: bold;
}

.stat-value.gold { color: var(--gold); }
.stat-value.blue { color: var(--blue); }
.stat-value.green { color: var(--green); }
.stat-value.purple { color: var(--purple-light); }

.info-section {
    background: var(--glass-bg);
    backdrop-filter: blur(8px);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 14px;
}

.info-title {
    font-size: 14px;
    color: var(--jade-light);
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    font-size: 13px;
}

.info-item {
    display: flex;
    justify-content: space-between;
}

.info-item span:first-child {
    color: var(--text-secondary);
}
"""

# components.css - 组件
components_css = """/* ========== components.css - 组件样式 ========== */

/* 进度条 */
.progress-section { margin-bottom: 20px; }

.progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
}

.progress-bar {
    height: 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    border: 1px solid var(--glass-border);
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--jade), var(--purple));
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px;
    position: relative;
    overflow: hidden;
}

.progress-fill::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: progressShine 2s linear infinite;
}

.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: bold;
}

/* 按钮 */
.action-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.btn {
    flex: 1;
    padding: 14px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    font-family: var(--font-body);
}

.btn::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transition: left 0.5s;
}

.btn:hover::before { left: 100%; }

.btn-cultivate {
    background: linear-gradient(135deg, var(--jade), var(--purple));
    color: white;
    box-shadow: 0 4px 12px rgba(95, 176, 168, 0.3);
}

.btn-cultivate:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(95, 176, 168, 0.4);
}

.btn-breakthrough {
    background: linear-gradient(135deg, var(--gold), var(--orange));
    color: #1a1a2e;
    box-shadow: 0 4px 12px rgba(232, 197, 71, 0.3);
}

.btn-breakthrough:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(232, 197, 71, 0.4);
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background: linear-gradient(135deg, var(--jade), var(--jade-light));
    color: white;
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
}

.btn-small {
    padding: 6px 12px;
    font-size: 12px;
    flex: none;
}

/* 自动修炼开关 */
.auto-cultivate-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 14px;
}

.toggle-switch {
    width: 48px;
    height: 24px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    transition: background 0.3s;
}

.toggle-switch.active {
    background: var(--jade);
}

.toggle-switch::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
}

.toggle-switch.active::after {
    transform: translateX(24px);
}

/* 消息框 */
.message {
    text-align: center;
    padding: 12px;
    background: var(--glass-bg);
    border-radius: 10px;
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 14px;
}

.message.success { color: var(--green); }
.message.fail { color: var(--red); }

/* 功法卡片 */
.skills-section, .pills-section, .shop-section { margin-top: 14px; }

.skill-card, .pill-card, .shop-item {
    background: var(--glass-bg);
    backdrop-filter: blur(8px);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.skill-card:hover, .pill-card:hover, .shop-item:hover {
    background: var(--glass-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
}

.skill-card:active, .pill-card:active, .shop-item:active {
    transform: scale(0.98);
}

.skill-card.equipped {
    border-color: var(--purple-light);
    background: rgba(123, 94, 167, 0.12);
    box-shadow: 0 0 12px rgba(123, 94, 167, 0.2);
}

.skill-header, .pill-header, .shop-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.skill-name, .pill-name, .shop-item-name {
    font-weight: bold;
    font-size: 15px;
}

.skill-type {
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 10px;
    background: var(--purple);
}

.skill-effect, .pill-effect {
    font-size: 13px;
    color: var(--green);
    margin-bottom: 4px;
}

.skill-desc, .pill-desc, .shop-item-desc {
    font-size: 12px;
    color: var(--text-secondary);
}

.skill-cost, .shop-item-price {
    font-size: 12px;
    color: var(--gold);
    margin-top: 6px;
}

.pill-count {
    font-size: 14px;
    color: var(--cyan);
}

/* 背包格子 */
.inventory-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 14px;
}

.inventory-slot {
    aspect-ratio: 1;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
}

.inventory-slot:hover {
    background: var(--glass-hover);
    box-shadow: var(--shadow-glow);
}

.inventory-slot.empty { opacity: 0.5; }

.inventory-slot .icon {
    font-size: 20px;
    margin-bottom: 4px;
}

.inventory-slot .count {
    position: absolute;
    bottom: 4px;
    right: 4px;
    font-size: 10px;
    background: rgba(0, 0, 0, 0.6);
    padding: 1px 4px;
    border-radius: 4px;
}

/* 浮动文字 */
.floating-text {
    position: fixed;
    pointer-events: none;
    font-size: 16px;
    font-weight: bold;
    animation: floatUp 1s ease-out forwards;
    z-index: 1000;
}

/* 奇遇系统 */
.encounter-category { margin-bottom: 16px; }
.encounter-category-title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.encounter-list { font-size: 12px; color: var(--text-secondary); }
.encounter-history-item {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.encounter-history-item:last-child { border-bottom: none; }
.encounter-time { font-size: 11px; color: var(--text-secondary); }

/* 弹窗 */
.encounter-modal {
    display: none;
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    z-index: 2000;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease;
}

.encounter-modal.active { display: flex; }

.encounter-modal-content {
    background: var(--bg-card);
    backdrop-filter: blur(16px);
    border-radius: 20px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    border: 2px solid var(--purple-light);
    box-shadow: 0 8px 32px rgba(123, 94, 167, 0.3);
    animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.encounter-modal-icon { font-size: 64px; margin-bottom: 16px; }
.encounter-modal-title {
    font-family: var(--font-title);
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 12px;
    color: var(--gold);
}
.encounter-modal-desc {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 16px;
    line-height: 1.6;
}
.encounter-modal-effect {
    font-size: 16px;
    padding: 12px;
    background: var(--glass-bg);
    border-radius: 10px;
    margin-bottom: 16px;
}
.encounter-modal-effect.positive { color: var(--green); }
.encounter-modal-effect.negative { color: var(--red); }
.encounter-modal-effect.neutral { color: var(--cyan); }

.encounter-modal-btn {
    padding: 12px 32px;
    background: linear-gradient(135deg, var(--purple), var(--jade));
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
}

.encounter-modal-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(123, 94, 167, 0.4);
}

.encounter-glow { animation: encounterGlow 1s ease infinite; }

/* 成就系统 */
.achievements-container { max-height: 500px; overflow-y: auto; }
.achievement-summary { text-align: center; margin-bottom: 16px; }
.achievement-progress {
    background: var(--glass-bg);
    border-radius: 12px;
    padding: 12px;
}
.achievement-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
}
.category-badge {
    display: flex;
    gap: 6px;
    background: var(--glass-bg);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
}
.achievement-list { display: grid; gap: 10px; }
.achievement-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--glass-bg);
    border-radius: 12px;
    border: 1px solid var(--glass-border);
    transition: all 0.3s;
}
.achievement-card.unlocked {
    border-color: var(--gold);
    background: rgba(232, 197, 71, 0.1);
    box-shadow: 0 0 12px rgba(232, 197, 71, 0.15);
}
.achievement-card.locked { opacity: 0.6; }
.achievement-card .achievement-icon { font-size: 32px; width: 48px; text-align: center; }
.achievement-card .achievement-info { flex: 1; }
.achievement-card .achievement-name { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
.achievement-card .achievement-desc { font-size: 12px; color: var(--text-secondary); }
.achievement-card .achievement-reward { font-size: 11px; color: var(--gold); margin-top: 4px; }
.achievement-card .achievement-status { font-size: 20px; }

/* 成就通知 */
.achievement-notification {
    position: fixed;
    top: 20px; right: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(232, 197, 71, 0.2), rgba(232, 148, 60, 0.2));
    backdrop-filter: blur(12px);
    border: 2px solid var(--gold);
    border-radius: 14px;
    box-shadow: 0 4px 20px rgba(232, 197, 71, 0.3);
    z-index: 9999;
    animation: slideIn 0.5s ease-out, fadeOut 0.5s ease-in 2.5s forwards;
}
.achievement-notification .achievement-icon { font-size: 36px; }
.achievement-notification .achievement-title { font-size: 12px; color: var(--gold); }
.achievement-notification .achievement-name { font-size: 16px; font-weight: bold; }

/* 宗门 */
.sect-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 10px;
    transition: all 0.3s;
}
.sect-card:hover {
    background: var(--glass-hover);
    transform: translateY(-2px);
}
.sect-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}
.sect-card-name { font-size: 16px; font-weight: bold; color: var(--gold); }
.sect-card-level { font-size: 12px; color: var(--text-secondary); }
.sect-card-info { font-size: 12px; color: var(--text-secondary); }
.sect-task-card {
    background: var(--glass-bg);
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.sect-task-info { flex: 1; }
.sect-task-name { font-size: 14px; margin-bottom: 4px; }
.sect-task-desc { font-size: 11px; color: var(--text-secondary); }

/* 法宝 */
.artifact-slot {
    width: 60px; height: 60px;
    border: 2px dashed rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: all 0.3s;
}
.artifact-slot:hover {
    border-color: var(--gold);
    background: rgba(232, 197, 71, 0.1);
}
.artifact-slot.equipped {
    border: 2px solid var(--gold);
    background: rgba(232, 197, 71, 0.15);
    box-shadow: var(--shadow-gold);
}
.artifact-slot .artifact-icon { font-size: 28px; }
.artifact-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s;
}
.artifact-card:hover {
    background: var(--glass-hover);
    box-shadow: var(--shadow-gold);
}
.artifact-icon { font-size: 32px; width: 48px; text-align: center; }
.artifact-info { flex: 1; }
.artifact-name { font-size: 14px; font-weight: bold; color: var(--gold); margin-bottom: 4px; }
.artifact-desc { font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; }
.artifact-stats { font-size: 11px; color: var(--cyan); }
.artifact-level { font-size: 11px; color: var(--purple-light); }
.artifact-actions { display: flex; flex-direction: column; gap: 4px; }

/* 灵兽 */
.beast-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.3s;
}
.beast-card:hover {
    background: var(--glass-hover);
    border-color: var(--glass-border);
    box-shadow: var(--shadow-glow);
}
.beast-icon { font-size: 36px; width: 50px; text-align: center; }
.beast-info { flex: 1; }
.beast-name { font-size: 14px; font-weight: bold; color: var(--gold); margin-bottom: 4px; }
.beast-level { font-size: 11px; color: var(--purple-light); margin-bottom: 4px; }
.beast-desc { font-size: 11px; color: var(--text-secondary); }
.beast-effect { font-size: 11px; color: var(--cyan); margin-top: 4px; }
.beast-exp-bar {
    width: 100%; height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    margin-top: 4px;
    overflow: hidden;
}
.beast-exp-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--purple), var(--gold));
    border-radius: 2px;
    transition: width 0.3s;
}
.beast-action-btns { display: flex; gap: 4px; }

/* 洞府 */
.cave-upgrade-card, .herb-plot-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s;
}
.cave-upgrade-card:hover, .herb-plot-card:hover {
    background: var(--glass-hover);
}
.cave-upgrade-icon, .herb-plot-icon { font-size: 28px; width: 40px; text-align: center; }
.cave-upgrade-info, .herb-plot-info { flex: 1; }
.cave-upgrade-name, .herb-plot-name { font-size: 13px; font-weight: bold; color: var(--gold); margin-bottom: 2px; }
.cave-upgrade-desc, .herb-plot-status { font-size: 11px; color: var(--text-secondary); }
.cave-upgrade-level { font-size: 10px; color: var(--purple-light); }

/* 剧情 */
.story-chapter-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s;
}
.story-chapter-card:hover {
    background: var(--glass-hover);
    transform: translateX(4px);
}
.story-chapter-card.unlocked { border-color: rgba(232, 197, 71, 0.3); }
.story-chapter-card.current {
    border-color: var(--gold);
    background: linear-gradient(135deg, rgba(232,197,71,0.1), rgba(232,197,71,0.02));
    box-shadow: var(--shadow-gold);
}
.story-chapter-icon { font-size: 32px; width: 50px; text-align: center; }
.story-chapter-info { flex: 1; }
.story-chapter-title { font-size: 14px; font-weight: bold; color: var(--gold); margin-bottom: 2px; }
.story-chapter-desc { font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; }
.story-chapter-progress { font-size: 10px; color: var(--cyan); }
.story-chapter-badge { font-size: 18px; }
.story-content-box {
    padding: 15px;
    background: linear-gradient(135deg, rgba(232,197,71,0.08), rgba(123,94,167,0.05));
    border-radius: 12px;
    border: 1px solid rgba(232,197,71,0.2);
}
.story-content-title {
    font-family: var(--font-title);
    font-size: 16px;
    font-weight: bold;
    color: var(--gold);
    margin-bottom: 8px;
    text-align: center;
}
.story-content-text {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.8;
    text-indent: 2em;
}
.story-unlock-hint {
    font-size: 11px;
    color: var(--text-secondary);
    text-align: center;
    padding: 20px;
}

/* 输入框 */
input[type="text"], input[type="password"] {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid var(--glass-border);
    background: var(--glass-bg);
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s;
}
input[type="text"]:focus, input[type="password"]:focus {
    border-color: var(--jade);
}

a { color: var(--jade-light); }
"""

# animations.css
animations_css = """/* ========== animations.css - 动画特效 ========== */

/* 淡入上滑 */
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* 淡入 */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* 上滑 */
@keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

/* 右滑入 */
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

/* 淡出 */
@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

/* 浮动文字 */
@keyframes floatUp {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-50px); }
}

/* 进度条流光 */
@keyframes progressShine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

/* 修炼呼吸光效 */
@keyframes breathe {
    0%, 100% { box-shadow: 0 4px 12px rgba(95, 176, 168, 0.3); }
    50% { box-shadow: 0 4px 24px rgba(95, 176, 168, 0.6); }
}

.btn-cultivate { animation: breathe 3s ease-in-out infinite; }

/* 突破金光爆发 */
@keyframes goldenBurst {
    0% { box-shadow: 0 0 0 0 rgba(232, 197, 71, 0.5); }
    50% { box-shadow: 0 0 30px 10px rgba(232, 197, 71, 0.4); }
    100% { box-shadow: 0 0 0 0 rgba(232, 197, 71, 0); }
}

/* 奇遇发光 */
@keyframes encounterGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(123, 94, 167, 0.5); }
    50% { box-shadow: 0 0 40px rgba(123, 94, 167, 0.8); }
}

/* 仙气粒子飘浮 */
@keyframes spiritDrift {
    0% { background-position: 0 0; }
    100% { background-position: 300px 300px; }
}

/* 卡片悬浮光晕 */
@keyframes cardGlow {
    0%, 100% { box-shadow: 0 0 0 rgba(95, 176, 168, 0); }
    50% { box-shadow: 0 0 16px rgba(95, 176, 168, 0.3); }
}
"""

# responsive.css - 从原文件提取移动端适配
responsive_match = re.search(r'(/\* =+ 移动端适配 =+ \*/.*?)(/\* 触摸反馈 \*/.*?)\n\s*\n', css_content, re.DOTALL)
responsive_css = "/* ========== responsive.css - 移动端适配 ========== */\n\n"
if responsive_match:
    responsive_css += responsive_match.group(0)
else:
    # 手动提取 @media 块
    media_blocks = re.findall(r'@media[^{]+\{[^}]*(?:\{[^}]*\}[^}]*)*\}', css_content)
    responsive_css += "\n\n".join(media_blocks)

# 写入 CSS 文件
css_files = {
    "base.css": base_css,
    "layout.css": layout_css,
    "components.css": components_css,
    "animations.css": animations_css,
    "responsive.css": responsive_css,
}

for name, content in css_files.items():
    path = os.path.join(CSS_DIR, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✅ css/{name} ({len(content)} bytes)")

# ============================================================
# JS 拆分 - 按函数归属拆分
# ============================================================

# 由于 JS 逻辑复杂且互相引用，我们按系统模块拆分
# 每个文件包裹在独立作用域中，但保持全局函数名

# 提取所有函数定义和变量声明
# 策略：按注释分隔符 "// ===========" 来拆分

# 先找出所有 "// =====..." 分隔的区域
js_sections = re.split(r'\n\s*// =+\s*(.+?)\s*=+\s*\n', js_content)

# js_sections[0] 是头部（配置数据），后面交替是 section_name + section_content
print(f"\n  JS 分段数: {len(jsx_sections := js_sections)}")

# 写入 core.js - 配置数据 + 核心函数
# 我们用更简单的方式：按已知的函数名归属拆分

# 实际上，最安全的方式是保持 JS 在一个文件中，但做模块化注释
# 因为函数之间有大量闭包和全局变量依赖

# 让我们把 JS 拆分为：core.js（所有数据和核心逻辑）+ ui.js（渲染函数）
# 这样既实现了分离，又不会破坏依赖

# 找出 switchTab 及之后的 UI 渲染函数
switch_tab_pos = js_content.find('function switchTab(')

if switch_tab_pos > 0:
    # core 部分：配置数据 + 游戏逻辑
    core_js = js_content[:switch_tab_pos]
    # ui 部分：UI 渲染和交互
    ui_js = js_content[switch_tab_pos:]
else:
    core_js = js_content
    ui_js = ""

# 写入 JS 文件
js_files = {
    "core.js": core_js.strip(),
    "ui.js": ui_js.strip(),
}

for name, content in js_files.items():
    path = os.path.join(JS_DIR, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✅ js/{name} ({len(content)} bytes)")

# ============================================================
# 重写 index.html
# ============================================================

# 提取 body 内容
body_match = re.search(r'<body>(.*?)</body>', html_body, re.DOTALL)
body_content = body_match.group(1).strip() if body_match else ""

new_html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>修仙放置游戏 v0.9</title>
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/layout.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/animations.css">
    <link rel="stylesheet" href="css/responsive.css">
</head>
<body>
""" + body_content + """
    <script src="js/core.js"></script>
    <script src="js/ui.js"></script>
</body>
</html>
"""

html_path = os.path.join(BASE, "index_modular.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(new_html)
print(f"\n  ✅ index_modular.html ({len(new_html)} bytes)")

print("\n" + "=" * 50)
print("🎉 模块化拆分完成！")
print(f"📁 目录: {BASE}")
print("=" * 50)
