// ==================== pills.js — 丹药系统（背包+炼丹炉+品质） ====================

function renderPills() {
    const container = document.getElementById('pillsList');

    // 背包区域
    let backpackHtml = '<div class="info-section" style="margin:0 0 14px 0;padding:14px;">' +
        '<div class="info-title">🎒 丹药背包</div>';

    let hasPills = false;
    backpackHtml += '<div style="display:grid;gap:8px;">';
    PILLS.forEach(pill => {
        const count = playerData.inventory[pill.id] || 0;
        if (count > 0) hasPills = true;

        // 检查品质库存
        let qualityHtml = '';
        PILL_QUALITIES.forEach((q, qi) => {
            const qKey = `${pill.id}_${qi}`;
            const qCount = playerData.pillQualities[qKey] || 0;
            if (qCount > 0) {
                qualityHtml += `<span style="font-size:11px;color:${q.color};margin-right:8px;">${q.name}×${qCount}</span>`;
            }
        });

        backpackHtml += `
            <div class="pill-card ${count === 0 && !qualityHtml ? 'empty' : ''}" 
                 style="${count === 0 && !qualityHtml ? 'opacity:0.5;' : ''}"
                 onclick="${count > 0 ? `usePill(${pill.id}, 0)` : ''}">
                <div class="pill-header">
                    <span class="pill-name">${pill.name}</span>
                    <span class="pill-count">普通×${count}</span>
                </div>
                <div class="pill-effect">${pill.effect}</div>
                <div class="pill-desc">${pill.desc}</div>
                ${qualityHtml ? `<div style="margin-top:4px;">${qualityHtml}</div>` : ''}
                ${qualityHtml ? `<div style="font-size:10px;color:var(--text-secondary);margin-top:4px;">点击品质丹药使用(效果更强)</div>` : ''}
            </div>
        `;
    });
    backpackHtml += '</div></div>';

    // 炼丹炉区域
    const caveLevel = getCaveLevel();
    const alchemyBonus = caveLevel.alchemyBonus * (1 + (playerData.caveUpgrades.alchemy_furnace - 1) * 0.1);
    let alchemyHtml = '<div class="info-section" style="margin:0;padding:14px;">' +
        '<div class="info-title">🔥 炼丹炉</div>' +
        `<div style="text-align:center;margin-bottom:10px;">
            <div style="font-size:36px;">🔥</div>
            <div style="font-size:12px;color:var(--text-secondary);">炼丹效率: ${Math.round(alchemyBonus * 100)}%</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">灵草: ${playerData.herbs} | 灵石: ${formatNumber(playerData.spiritStones)}</div>
        </div>`;

    alchemyHtml += '<div style="display:grid;gap:8px;">';
    ALCHEMY_RECIPES.forEach(recipe => {
        const pill = PILLS.find(p => p.id === recipe.pillId);
        const canCraft = playerData.herbs >= recipe.herbCost && playerData.spiritStones >= recipe.stoneCost;
        const actualRate = Math.min(0.99, recipe.successRate * alchemyBonus);
        alchemyHtml += `
            <div class="alchemy-recipe-card" style="background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:8px;padding:10px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-weight:bold;color:var(--gold);font-size:14px;">${pill.name}</span>
                    <span style="font-size:11px;color:${actualRate >= 0.7 ? 'var(--green)' : actualRate >= 0.4 ? 'var(--gold)' : 'var(--red)'};">
                        成功率 ${Math.round(actualRate * 100)}%
                    </span>
                </div>
                <div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px;">${recipe.desc}</div>
                <div style="font-size:11px;color:var(--cyan);margin-bottom:6px;">
                    消耗: 🌿${recipe.herbCost}灵草 + 💎${recipe.stoneCost}灵石
                </div>
                <button class="btn btn-small ${canCraft ? 'btn-primary' : ''}" 
                    onclick="craftPill(${recipe.id})" ${canCraft ? '' : 'disabled'}
                    style="width:100%;">
                    ${canCraft ? '炼制' : '材料不足'}
                </button>
            </div>
        `;
    });
    alchemyHtml += '</div></div>';

    container.innerHTML = backpackHtml + alchemyHtml;
}

function craftPill(recipeId) {
    const recipe = ALCHEMY_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;

    if (playerData.herbs < recipe.herbCost) {
        showMessage('灵草不足！', 'fail');
        return;
    }
    if (playerData.spiritStones < recipe.stoneCost) {
        showMessage('灵石不足！', 'fail');
        return;
    }

    const caveLevel = getCaveLevel();
    const alchemyBonus = caveLevel.alchemyBonus * (1 + (playerData.caveUpgrades.alchemy_furnace - 1) * 0.1);
    const actualRate = Math.min(0.99, recipe.successRate * alchemyBonus);

    playerData.herbs -= recipe.herbCost;
    playerData.spiritStones -= recipe.stoneCost;

    if (Math.random() < actualRate) {
        // 成功 - 随机品质
        const qualityRoll = Math.random();
        let qualityIndex = 0;
        if (qualityRoll > 0.95) qualityIndex = 3; // 极品 5%
        else if (qualityRoll > 0.80) qualityIndex = 2; // 上品 15%
        else if (qualityRoll > 0.50) qualityIndex = 1; // 中品 30%
        else qualityIndex = 0; // 下品 50%

        const quality = PILL_QUALITIES[qualityIndex];
        const qKey = `${recipe.pillId}_${qualityIndex}`;
        playerData.pillQualities[qKey] = (playerData.pillQualities[qKey] || 0) + 1;

        playerData.stats.alchemySuccess++;
        addCaveExp(20);

        showMessage(`炼制成功！获得${quality.name}${PILLS.find(p => p.id === recipe.pillId).name}！`, 'success');
        createFloatingText(`${quality.name}丹药!`, qualityIndex >= 2 ? 'gold' : 'green');
        if (window.audioManager) audioManager.play('click');
    } else {
        showMessage('炼丹失败...材料损失', 'fail');
        createFloatingText('炼丹失败', 'red');
    }

    updateUI();
    renderPills();
    saveGame();
}

function usePill(pillId, qualityIndex) {
    const pill = PILLS.find(p => p.id === pillId);
    if (!pill) return;

    const quality = PILL_QUALITIES[qualityIndex];
    const mult = quality.multiplier;
    const qKey = `${pillId}_${qualityIndex}`;

    if (qualityIndex > 0) {
        if (!playerData.pillQualities[qKey]) {
            showMessage('没有该品质的丹药！', 'fail');
            return;
        }
        playerData.pillQualities[qKey]--;
    } else {
        if (!playerData.inventory[pillId]) {
            showMessage('没有该丹药！', 'fail');
            return;
        }
        playerData.inventory[pillId]--;
    }

    if (window.audioManager) audioManager.play('click');

    if (pill.cultivationBonus) {
        const gain = Math.floor(pill.cultivationBonus * mult);
        playerData.cultivation += gain;
        playerData.stats.totalCultivation += gain;
        createFloatingText(`+${gain} 修为 (${quality.name})`, 'gold');
    }

    if (pill.tempComprehension) {
        const bonus = pill.tempComprehension * mult;
        playerData.tempBuffs.comprehension += bonus;
        setTimeout(() => {
            playerData.tempBuffs.comprehension -= bonus;
            updateUI();
        }, pill.duration * 1000);
        showMessage(`悟性临时提升${bonus.toFixed(2)},持续${Math.floor(pill.duration / 60)}分钟 (${quality.name})`, 'success');
    }

    if (pill.permanentTalent) {
        const bonus = pill.permanentTalent * mult;
        playerData.talent += bonus;
        showMessage(`资质永久提升${bonus.toFixed(3)}! (${quality.name})`, 'success');
        createFloatingText('资质提升!', 'green');
    }

    if (pill.breakthroughBonus) {
        const bonus = Math.floor(pill.breakthroughBonus * mult);
        playerData.tempBuffs.breakthrough += bonus;
        showMessage(`下一次突破成功率+${bonus}% (${quality.name})`, 'success');
    }

    playerData.stats.pillsUsed++;
    checkAchievements();
    updateDailyTaskProgress('pill', 1);

    updateUI();
    renderPills();
    saveGame();
}
