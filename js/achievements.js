// ==================== achievements.js — 成就系统 ====================

function checkAchievements() {
    ACHIEVEMENTS.forEach(ach => {
        if (playerData.achievements.includes(ach.id)) return;
        if (ach.condition(playerData)) {
            playerData.achievements.push(ach.id);
            pendingAchievements.push(ach);
            applyAchievementReward(ach);
        }
    });
    if (pendingAchievements.length > 0) {
        showAchievementNotification();
    }
}

function applyAchievementReward(ach) {
    if (ach.reward.spiritStones) {
        playerData.spiritStones += ach.reward.spiritStones;
    }
    if (ach.reward.pill) {
        const pillId = ach.reward.pill.id;
        const count = ach.reward.pill.count;
        playerData.inventory[pillId] = (playerData.inventory[pillId] || 0) + count;
    }
}

function showAchievementNotification() {
    if (pendingAchievements.length === 0) return;
    const ach = pendingAchievements.shift();

    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${ach.icon}</div>
        <div class="achievement-text">
            <div class="achievement-title">成就解锁!</div>
            <div class="achievement-name">${ach.name}</div>
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);

    if (pendingAchievements.length > 0) {
        setTimeout(showAchievementNotification, 3500);
    }
}

function renderAchievements() {
    const container = document.getElementById('achievementsList');
    if (!container) return;

    const unlocked = playerData.achievements.length;
    const total = ACHIEVEMENTS.length;

    const categories = {
        cultivation: { name: '修炼', icon: '📈', unlocked: 0, total: 0 },
        breakthrough: { name: '境界', icon: '🔮', unlocked: 0, total: 0 },
        pills: { name: '丹药', icon: '💊', unlocked: 0, total: 0 },
        encounter: { name: '奇遇', icon: '📜', unlocked: 0, total: 0 },
        wealth: { name: '财富', icon: '💰', unlocked: 0, total: 0 }
    };

    ACHIEVEMENTS.forEach(ach => {
        categories[ach.category].total++;
        if (playerData.achievements.includes(ach.id)) {
            categories[ach.category].unlocked++;
        }
    });

    container.innerHTML = `
        <div class="achievement-summary">
            <div class="achievement-progress">
                <span class="progress-text">已解锁 ${unlocked}/${total}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(unlocked/total*100).toFixed(1)}%"></div>
                </div>
            </div>
        </div>
        <div class="achievement-categories">
            ${Object.values(categories).map(cat => `
                <div class="category-badge">
                    <span>${cat.icon} ${cat.name}</span>
                    <span>${cat.unlocked}/${cat.total}</span>
                </div>
            `).join('')}
        </div>
        <div class="achievement-list">
            ${ACHIEVEMENTS.map(ach => {
                const isUnlocked = playerData.achievements.includes(ach.id);
                let rewardText = '';
                if (ach.reward.spiritStones) rewardText = `+${ach.reward.spiritStones}灵石`;
                if (ach.reward.pill) rewardText = `+${ach.reward.pill.count}个${PILLS.find(p=>p.id===ach.reward.pill.id)?.name || '丹药'}`;
                return `
                    <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-icon">${ach.icon}</div>
                        <div class="achievement-info">
                            <div class="achievement-name">${ach.name}</div>
                            <div class="achievement-desc">${ach.desc}</div>
                            ${rewardText ? `<div class="achievement-reward">奖励: ${rewardText}</div>` : ''}
                        </div>
                        <div class="achievement-status">${isUnlocked ? '✅' : '🔒'}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}
