// ==================== pills.js — 丹药系统 ====================

function renderPills() {
    const container = document.getElementById('pillsList');

    container.innerHTML = PILLS.map(pill => {
        const count = playerData.inventory[pill.id] || 0;

        return `
            <div class="pill-card ${count === 0 ? 'empty' : ''}"
                 onclick="${count > 0 ? `usePill(${pill.id})` : ''}">
                <div class="pill-header">
                    <span class="pill-name">${pill.name}</span>
                    <span class="pill-count">×${count}</span>
                </div>
                <div class="pill-effect">${pill.effect}</div>
                <div class="pill-desc">${pill.desc}</div>
            </div>
        `;
    }).join('');
}

function usePill(pillId) {
    const pill = PILLS.find(p => p.id === pillId);
    if (!pill || !playerData.inventory[pillId]) return;

    playerData.inventory[pillId]--;

    if (pill.cultivationBonus) {
        playerData.cultivation += pill.cultivationBonus;
        createFloatingText(`+${pill.cultivationBonus} 修为`, 'gold');
    }

    if (pill.tempComprehension) {
        playerData.tempBuffs.comprehension += pill.tempComprehension;
        setTimeout(() => {
            playerData.tempBuffs.comprehension -= pill.tempComprehension;
            updateUI();
        }, pill.duration * 1000);
        showMessage(`悟性临时提升${pill.tempComprehension},持续${Math.floor(pill.duration / 60)}分钟`, 'success');
    }

    if (pill.permanentTalent) {
        playerData.talent += pill.permanentTalent;
        showMessage(`资质永久提升${pill.permanentTalent}!`, 'success');
        createFloatingText('资质提升!', 'green');
    }

    if (pill.breakthroughBonus) {
        playerData.tempBuffs.breakthrough += pill.breakthroughBonus;
        showMessage(`下一次突破成功率+${pill.breakthroughBonus}%`, 'success');
    }

    playerData.stats.pillsUsed++;
    if (pill.cultivationBonus) {
        playerData.stats.totalCultivation += pill.cultivationBonus;
    }
    checkAchievements();
    updateDailyTaskProgress('pill', 1);

    updateUI();
    renderPills();
    saveGame();
}
