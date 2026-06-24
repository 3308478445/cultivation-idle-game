// ==================== story.js — 剧情系统 ====================

function renderStory() {
    renderCurrentRealmStory();
    renderStoryList();
}

function renderCurrentRealmStory() {
    const container = document.getElementById('currentRealmStory');
    const currentRealm = REALMS[playerData.realm];
    const story = REALM_STORIES.find(s => s.realmId === playerData.realm + 1) || REALM_STORIES[REALM_STORIES.length - 1];
    const isRead = playerData.readStories.includes(story.realmId);
    const isUnlocked = playerData.cultivation >= story.unlockCultivation;

    if (!isUnlocked) {
        container.innerHTML = `
            <div style="text-align:center;padding:15px;">
                <div style="font-size:40px;margin-bottom:8px;opacity:0.3;">🔒</div>
                <div style="font-size:14px;color:var(--text-secondary);">境界未到,剧情未解锁</div>
                <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">${story.progressHint}</div>
            </div>
        `;
        return;
    }

    let actionBtn = '';
    if (!isRead) {
        actionBtn = `<button class="btn btn-primary" onclick="readStory(${story.realmId})" style="margin-top:10px;">📖 阅读剧情</button>`;
    } else {
        actionBtn = `<button class="btn" onclick="readStory(${story.realmId})" style="margin-top:10px;">📜 重温剧情</button>`;
    }

    container.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
            <div style="font-size:36px;">${story.icon}</div>
            <div>
                <div style="font-size:14px;font-weight:bold;color:var(--gold);">${story.title}</div>
                <div style="font-size:12px;color:var(--text-secondary);">${story.subtitle} · ${isRead ? '<span style="color:var(--green);">已阅读</span>' : '<span style="color:var(--cyan);">未阅读</span>'}</div>
            </div>
        </div>
        <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;margin-bottom:8px;">
            ${story.story.replace(/\n/g, '<br>')}
        </div>
        ${actionBtn}
    `;
}

function renderStoryList() {
    const container = document.getElementById('storyList');
    const progress = document.getElementById('storyProgress');
    const unlockedCount = REALM_STORIES.filter(s => playerData.cultivation >= s.unlockCultivation).length;
    progress.textContent = `(${unlockedCount}/${REALM_STORIES.length} 已解锁)`;

    let html = '';
    REALM_STORIES.forEach((story, idx) => {
        const isUnlocked = playerData.cultivation >= story.unlockCultivation;
        const isRead = playerData.readStories.includes(story.realmId);
        const isCurrent = playerData.realm + 1 === story.realmId;

        if (!isUnlocked) {
            html += `<div class="story-chapter-card" style="opacity:0.4;cursor:default;">
                <div class="story-chapter-icon">🔒</div>
                <div class="story-chapter-info">
                    <div class="story-chapter-title">第${idx + 1}章</div>
                    <div class="story-chapter-desc">${story.desc} · ${story.subtitle}</div>
                    <div class="story-chapter-progress">需 ${story.unlockCultivation.toLocaleString()} 修为解锁</div>
                </div>
                <div class="story-chapter-badge">⏳</div>
            </div>`;
        } else {
            const cardClass = isCurrent ? 'current' : (isRead ? 'unlocked' : '');
            const badge = isCurrent ? '🔥' : (isRead ? '✅' : '📜');
            const clickAction = isRead ?
                `onclick="showStoryModal(${story.realmId})"` :
                `onclick="readStory(${story.realmId})"`;
            html += `<div class="story-chapter-card ${cardClass}" ${clickAction}>
                <div class="story-chapter-icon">${story.icon}</div>
                <div class="story-chapter-info">
                    <div class="story-chapter-title">${story.title} ${isCurrent ? '<span style="color:var(--red);font-size:10px;">当前</span>' : ''}</div>
                    <div class="story-chapter-desc">${story.desc} · ${isRead ? '<span style="color:var(--green);">已阅读</span>' : '<span style="color:var(--cyan);">未阅读</span>'}</div>
                    ${isRead ? '<div class="story-chapter-progress">点击重温</div>' : '<div class="story-chapter-progress">点击阅读</div>'}
                </div>
                <div class="story-chapter-badge">${badge}</div>
            </div>`;
        }
    });
    container.innerHTML = html;
}

function readStory(realmId) {
    const story = REALM_STORIES.find(s => s.realmId === realmId);
    if (!story) return;
    if (!playerData.readStories.includes(realmId)) {
        playerData.readStories.push(realmId);
        const rewardCultivation = Math.floor(story.unlockCultivation * 0.05) || 100;
        playerData.cultivation += rewardCultivation;
        playerData.stats.totalCultivation += rewardCultivation;
        showToast(`📖 阅读剧情奖励: +${rewardCultivation}修为!`);
    }
    showStoryModal(realmId);
    checkAchievements();
    updateUI();
}

function showStoryModal(realmId) {
    const story = REALM_STORIES.find(s => s.realmId === realmId);
    if (!story) return;
    const container = document.getElementById('encounterModal');
    const content = container.querySelector('.encounter-modal-content');
    content.style.maxWidth = '500px';
    document.getElementById('encounterIcon').textContent = story.icon;
    document.getElementById('encounterTitle').textContent = story.title;
    document.getElementById('encounterDesc').innerHTML = `<div style="font-size:13px;line-height:1.8;color:var(--text-primary);text-align:justify;">${story.story.replace(/\n\n/g, '<br><br>')}</div>`;
    document.getElementById('encounterEffect').textContent = story.subtitle + ' · ' + story.desc;
    const btn = document.getElementById('encounterModal').querySelector('.encounter-modal-btn');
    btn.textContent = '关闭';
    btn.onclick = closeEncounterModal;
    container.style.display = 'flex';
}

function checkNewStoryUnlock() {
    REALM_STORIES.forEach(story => {
        if (playerData.cultivation >= story.unlockCultivation && !playerData.readStories.includes(story.realmId)) {
            const prevUnlocked = REALM_STORIES.some(s =>
                s.unlockCultivation < story.unlockCultivation &&
                playerData.cultivation >= s.unlockCultivation
            );
            if (prevUnlocked || story.unlockCultivation === 0) {
                showToast(`📜 新章节解锁: ${story.icon} ${story.title}!`);
            }
        }
    });
}
