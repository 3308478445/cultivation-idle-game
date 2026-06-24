// ==================== cave.js — 洞府系统 ====================

function renderCave() {
    renderCaveInfo();
    renderHerbGarden();
    renderCaveUpgrades();
}

function renderCaveInfo() {
    const caveLevel = getCaveLevel();
    document.getElementById('caveLevel').textContent = `Lv.${caveLevel.level}`;
    document.getElementById('caveProsperity').textContent = playerData.caveProsperity;
    const nextLevel = CAVE_LEVELS[caveLevel.level] || CAVE_LEVELS[CAVE_LEVELS.length - 1];
    const expNeeded = nextLevel.expRequired;
    document.getElementById('caveExp').textContent = playerData.caveExp;
    document.getElementById('caveExpMax').textContent = expNeeded;
    const progress = Math.min(100, Math.floor((playerData.caveExp / expNeeded) * 100));
    document.getElementById('caveExpBar').style.width = progress + '%';
    const alchemyBonus = caveLevel.alchemyBonus * (1 + (playerData.caveUpgrades.alchemy_furnace - 1) * 0.1);
    document.getElementById('alchemyEfficiency').textContent = `${Math.round(alchemyBonus * 100)}% 效率`;
    document.getElementById('herbCount').textContent = playerData.herbs;
}

function getCaveLevel() {
    let level = 1;
    for (let i = CAVE_LEVELS.length - 1; i >= 0; i--) {
        if (playerData.caveExp >= CAVE_LEVELS[i].expRequired) {
            level = i + 1;
            break;
        }
    }
    return { level, config: CAVE_LEVELS[level - 1] };
}

function addCaveExp(amount) {
    playerData.caveExp += amount;
    playerData.caveProsperity += Math.floor(amount / 10);

    const caveLevel = getCaveLevel();
    const oldMaxPlots = CAVE_LEVELS[caveLevel.level - 2]?.maxPlots || 2;
    const newMaxPlots = caveLevel.config.maxPlots;
    if (newMaxPlots > oldMaxPlots) {
        showToast(`洞府升级到 Lv.${caveLevel.level}! 获得新地块!`);
        while (playerData.cavePlots.length < newMaxPlots) {
            playerData.cavePlots.push({ herbId: null, plantedAt: null, readyAt: null, herbLevel: 1 });
        }
    }
}

function renderHerbGarden() {
    const container = document.getElementById('herbGarden');
    const caveLevel = getCaveLevel();
    let html = '';
    playerData.cavePlots.forEach((plot, idx) => {
        if (plot.herbId === null) {
            html += `<div class="herb-plot-card" style="opacity:0.6;">
                <div class="herb-plot-icon">⬜</div>
                <div class="herb-plot-info">
                    <div class="herb-plot-name">空地块 #${idx + 1}</div>
                    <div class="herb-plot-status">点击种植灵草</div>
                </div>
                <div><button class="btn btn-small" onclick="plantHerb(${idx})">🌱 种植</button></div>
            </div>`;
        } else {
            const herb = HERBS.find(h => h.id === plot.herbId);
            const now = Date.now();
            const remaining = Math.max(0, plot.readyAt - now);
            const isReady = remaining === 0;
            const progress = Math.min(100, 100 - (remaining / (herb.growTime * 1000)) * 100);
            html += `<div class="herb-plot-card" ${isReady ? 'style="border:2px solid var(--gold);"' : ''}>
                <div class="herb-plot-icon">${isReady ? '✨' : herb.icon}</div>
                <div class="herb-plot-info">
                    <div class="herb-plot-name" style="color:${herb.color}">${herb.name}</div>
                    <div class="herb-plot-status">${isReady ? '<span style="color:var(--gold);">✓ 可收获!</span>' : `生长中... ${Math.ceil(remaining/1000)}秒`}</div>
                    ${!isReady ? `<div class="herb-plot-progress"><div class="progress-bar" style="height:4px;"><div class="progress-fill" style="width:${progress}%;background:${herb.color};"></div></div></div>` : ''}
                </div>
                <div>${isReady ? `<button class="btn btn-small btn-primary" onclick="harvestHerb(${idx})">收获</button>` : '<span style="font-size:11px;color:var(--text-secondary);">等待中</span>'}</div>
            </div>`;
        }
    });
    container.innerHTML = html;
    const buyBtn = document.getElementById('buyPlotBtn');
    if (playerData.cavePlots.length >= caveLevel.config.maxPlots) {
        buyBtn.textContent = `已达上限 (${caveLevel.config.maxPlots}块)`;
        buyBtn.disabled = true;
        buyBtn.style.opacity = '0.5';
    } else {
        buyBtn.textContent = `开垦新地块 (200灵石)`;
        buyBtn.disabled = false;
        buyBtn.style.opacity = '1';
    }
}

function plantHerb(plotIdx) {
    const plot = playerData.cavePlots[plotIdx];
    if (plot.herbId !== null) { showToast('已有灵草!'); return; }
    const herb = HERBS[0];
    const now = Date.now();
    plot.herbId = herb.id;
    plot.plantedAt = now;
    plot.readyAt = now + herb.growTime * 1000;
    plot.herbLevel = 1;
    showToast(`种植了 ${herb.icon} ${herb.name}!`);
    renderHerbGarden();
    if (!window.herbInterval) window.herbInterval = setInterval(checkHerbs, 1000);
}

function harvestHerb(plotIdx) {
    const plot = playerData.cavePlots[plotIdx];
    if (plot.herbId === null) return;
    const herb = HERBS.find(h => h.id === plot.herbId);
    const herbGardenBonus = 1 + (playerData.caveUpgrades.herb_garden - 1) * 0.1;
    const amount = Math.floor(herb.cultivation * herbGardenBonus);
    playerData.cultivation += amount;
    playerData.herbs++;
    playerData.stats.totalCultivation += amount;
    addCaveExp(10);
    showToast(`收获 ${herb.icon} ${herb.name}! +${amount}修为!`);
    plot.herbId = null; plot.plantedAt = null; plot.readyAt = null;
    renderHerbGarden(); renderCaveInfo(); checkAchievements(); updateUI();
}

function checkHerbs() {
    const now = Date.now();
    let changed = false;
    playerData.cavePlots.forEach(plot => {
        if (plot.herbId !== null && plot.readyAt !== null && now >= plot.readyAt) changed = true;
    });
    if (changed) renderHerbGarden();
}

function buyHerbPlot() {
    const cost = 200;
    if (playerData.spiritStones < cost) { showToast('灵石不足!'); return; }
    const caveLevel = getCaveLevel();
    if (playerData.cavePlots.length >= caveLevel.config.maxPlots) { showToast('已达上限!'); return; }
    playerData.spiritStones -= cost;
    playerData.cavePlots.push({ herbId: null, plantedAt: null, readyAt: null, herbLevel: 1 });
    addCaveExp(20);
    showToast('开垦了新地块!');
    renderHerbGarden(); updateUI();
}

function renderCaveUpgrades() {
    const container = document.getElementById('caveUpgrade');
    let html = '';
    CAVE_UPGRADES.forEach(upgrade => {
        const currentLevel = playerData.caveUpgrades[upgrade.id] || 1;
        const isMax = currentLevel >= upgrade.maxLevel;
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, currentLevel - 1));
        const canUpgrade = !isMax && playerData.spiritStones >= cost;
        html += `<div class="cave-upgrade-card">
            <div class="cave-upgrade-icon">${upgrade.icon}</div>
            <div class="cave-upgrade-info">
                <div class="cave-upgrade-name">${upgrade.name}</div>
                <div class="cave-upgrade-desc">${upgrade.desc}</div>
                <div class="cave-upgrade-level">${isMax ? '已满级' : `Lv.${currentLevel} -> ${upgrade.effectDesc(currentLevel + 1)}`}</div>
            </div>
            <div>${isMax ? '<span style="font-size:11px;color:var(--gold);">满级</span>' :
                `<button class="btn btn-small btn-primary" onclick="upgradeCave('${upgrade.id}')" ${canUpgrade?'':'disabled'}>${cost}灵石</button>`}</div>
        </div>`;
    });
    container.innerHTML = html;
}

function upgradeCave(upgradeId) {
    const upgrade = CAVE_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    const currentLevel = playerData.caveUpgrades[upgradeId] || 1;
    if (currentLevel >= upgrade.maxLevel) { showToast('已满级!'); return; }
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, currentLevel - 1));
    if (playerData.spiritStones < cost) { showToast('灵石不足!'); return; }
    playerData.spiritStones -= cost;
    playerData.caveUpgrades[upgradeId]++;
    addCaveExp(cost / 10);
    showToast(`${upgrade.icon} ${upgrade.name} 升级到 Lv.${currentLevel + 1}!`);
    renderCaveUpgrades(); renderCaveInfo(); updateUI();
}

function alchemyQuickRefine() {
    if (playerData.herbs < 3) { showToast('灵草不足!(需要3个灵草)'); return; }
    playerData.herbs -= 3;
    const caveLevel = getCaveLevel();
    const alchemyBonus = caveLevel.alchemyBonus * (1 + (playerData.caveUpgrades.alchemy_furnace - 1) * 0.1);
    const pillPool = PILLS.filter(p => p.quality === 'normal' || p.quality === 'good');
    const pill = pillPool[Math.floor(Math.random() * pillPool.length)];
    playerData.inventory[pill.id] = (playerData.inventory[pill.id] || 0) + 1;
    addCaveExp(15);
    showToast(`炼制成功! 获得 ${pill.icon} ${pill.name}!`);
    renderCaveInfo(); updateUI();
}

function getCaveSpiritBonus() {
    const caveLevel = getCaveLevel();
    const spiritPoolBonus = (playerData.caveUpgrades.spirit_pool - 1) * 0.05;
    return caveLevel.config.spiritBonus + spiritPoolBonus;
}

function getCaveSpiritStoneBonus() {
    return (playerData.caveUpgrades.treasure_room - 1) * 0.08;
}
