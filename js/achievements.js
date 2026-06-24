// ==================== achievements.js — 成就系统（24个，含隐藏，永久加成） ====================

function checkAchievements() {
    ACHIEVEMENTS.forEach(ach => {
        if (playerData.achievements.includes(ach.id)) return;
        if (ach.hidden && !ach.condition(playerData)) return; // 隐藏成就不提前检查
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
    // 永久属性加成
    if (ach.reward.permBonus) {
        const bonus = ach.reward.permBonus;
        if (bonus.cultivationSpeed) {
            playerData.achievementBonuses.cultivationSpeed = (playerData.achievementBonuses.cultivationSpeed || 0) + bonus.cultivationSpeed;
        }
        if (bonus.talent) {
            playerData.achievementBonuses.talent = (playerData.achievementBonuses.talent || 0) + bonus.talent;
            playerData.talent += bonus.talent;
        }
        if (bonus.comprehension) {
            playerData.achievementBonuses.comprehension = (playerData.achievementBonuses.comprehension || 0) + bonus.comprehension;
        }
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

    if (window.audioManager) audioManager.play('achievement');

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
    const total = ACHIEVEMENTS.filter(a => !a.hidden).length + playerData.achievements.filter(id => ACHIEVEMENTS.find(a => a.id === id)?.hidden).length;
    const displayTotal = ACHIEVEMENTS.length;

    const categories = {
        cultivation: { name: '修炼', icon: '📈', unlocked: 0, total: 0 },
        breakthrough: { name: '境界', icon: '🔮', unlocked: 0, total: 0 },
        pills: { name: '丹药', icon: '💊', unlocked: 0, total: 0 },
        encounter: { name: '奇遇', icon: '📜', unlocked: 0, total: 0 },
        wealth: { name: '财富', icon: '💰', unlocked: 0, total: 0 }
    };

    ACHIEVEMENTS.forEach(ach => {
        if (categories[ach.category]) {
            categories[ach.category].total++;
            if (playerData.achievements.includes(ach.id)) {
                categories[ach.category].unlocked++;
            }
        }
    });

    // 徽章网格墙
    container.innerHTML = `
        <div class="achievement-summary">
            <div class="achievement-progress">
                <span class="progress-text">已解锁 ${unlocked}/${displayTotal}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(unlocked/displayTotal*100).toFixed(1)}%"></div>
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
        <div class="achievement-wall">
            ${ACHIEVEMENTS.map(ach => {
                const isUnlocked = playerData.achievements.includes(ach.id);
                const isHidden = ach.hidden && !isUnlocked;
                const icon = isHidden ? '❓' : ach.icon;
                const name = isHidden ? '隐藏成就' : ach.name;
                const desc = isHidden ? '???' : ach.desc;

                let rewardText = '';
                if (ach.reward.spiritStones) rewardText = `+${ach.reward.spiritStones}灵石`;
                if (ach.reward.pill) rewardText = `+${ach.reward.pill.count}个${PILLS.find(p=>p.id===ach.reward.pill.id)?.name || '丹药'}`;
                if (ach.reward.permBonus) {
                    const b = ach.reward.permBonus;
                    if (b.cultivationSpeed) rewardText += ` 修炼+${Math.round(b.cultivationSpeed*100)}%`;
                    if (b.talent) rewardText += ` 资质+${b.talent}`;
                    if (b.comprehension) rewardText += ` 悟性+${b.comprehension}`;
                }

                return `
                    <div class="achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}" 
                         style="${isUnlocked ? '' : 'filter:grayscale(1);opacity:0.5;'}">
                        <div class="badge-icon">${icon}</div>
                        <div class="badge-info">
                            <div class="badge-name">${name}</div>
                            <div class="badge-desc">${desc}</div>
                            ${rewardText && !isHidden ? `<div class="badge-reward">${rewardText}</div>` : ''}
                        </div>
                        <div class="badge-status">${isUnlocked ? '✅' : '🔒'}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}
