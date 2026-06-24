// ==================== beast.js — 灵兽系统 ====================

function renderBeast() {
    renderBeastHouse();
    renderBeastShop();
}

function renderBeastHouse() {
    const container = document.getElementById('beastHouse');
    if (playerData.ownedBeasts.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">还没有灵兽,去野外捕捉吧!</div>';
        return;
    }

    let html = '';
    playerData.ownedBeasts.forEach(owned => {
        const beast = SPIRIT_BEASTS.find(b => b.id === owned.beastId);
        const isActive = playerData.equippedBeast === owned.beastId;
        const expForNext = getBeastExpForLevel(owned.level + 1, beast);
        const expProgress = expForNext > 0 ? Math.floor((owned.exp / expForNext) * 100) : 100;
        const affectionLevel = getBeastAffectionLevel(owned.affection);
        const effectDesc = getBeastEffectDesc(beast, owned.level, affectionLevel.effect);
        const rarityColor = beast.rarity === 'legend' ? 'var(--gold)' :
                           beast.rarity === 'epic' ? 'var(--purple)' :
                           beast.rarity === 'rare' ? 'var(--blue)' : 'var(--text-primary)';
        html += `<div class="beast-card" ${isActive ? 'style="border:2px solid var(--gold);background:rgba(255,215,0,0.1);"' : ''}>
            <div class="beast-icon">${beast.icon}</div>
            <div class="beast-info">
                <div class="beast-name" style="color:${rarityColor}">${owned.name || beast.name}</div>
                <div class="beast-level">等级 ${owned.level}/${beast.maxLevel} | ${beast.rarity.toUpperCase()} | 好感: ${affectionLevel.name}</div>
                <div class="beast-desc">${beast.desc}</div>
                <div class="beast-effect">${effectDesc}</div>
                ${owned.level < beast.maxLevel ? `
                <div class="beast-exp-bar">
                    <div class="beast-exp-fill" style="width:${expProgress}%;"></div>
                </div>
                <div style="font-size:10px;color:var(--text-secondary);">经验: ${owned.exp}/${expForNext}</div>
                ` : '<div style="font-size:10px;color:var(--gold);">已达满级!</div>'}
            </div>
            <div class="beast-action-btns">
                ${isActive ?
                    '<span style="font-size:11px;color:var(--gold);">战斗中</span>' :
                    `<button class="btn btn-small" onclick="setActiveBeast(${owned.beastId})">出战</button>`
                }
                <button class="btn btn-small" onclick="feedBeast(${owned.beastId})" style="padding:4px 8px;font-size:11px;">🍼好感</button>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function getBeastExpForLevel(level, beast) {
    return Math.floor(beast.baseExp * Math.pow(beast.expToLevel / 10, level - 1));
}

function getBeastAffectionLevel(affection) {
    for (let i = BEAST_AFFECTION_LEVELS.length - 1; i >= 0; i--) {
        if (affection >= BEAST_AFFECTION_LEVELS[i].threshold) {
            return BEAST_AFFECTION_LEVELS[i];
        }
    }
    return BEAST_AFFECTION_LEVELS[0];
}

function getBeastEffectDesc(beast, level, affectionMult) {
    const base = beast.baseEffect;
    const levelBonus = 1 + (level - 1) * 0.1;
    const total = affectionMult * levelBonus;
    let desc = '';
    if (base.type === 'cultivationSpeed') desc = `修炼速度 +${Math.round((base.value * total) * 100)}%`;
    else if (base.type === 'spiritRegen') desc = `灵气回复 +${Math.round((base.value * total) * 100)}%`;
    else if (base.type === 'maxSpirit') desc = `灵气上限 +${Math.round((base.value * total) * 100)}%`;
    else if (base.type === 'breakthroughBonus') desc = `突破成功率 +${Math.round((base.value * total) * 100)}%`;
    else if (base.type === 'talent') desc = `资质 +${(base.value * total).toFixed(2)}`;
    else if (base.type === 'comprehension') desc = `悟性 +${(base.value * total).toFixed(2)}`;
    else if (base.type === 'attack') desc = `攻击 +${Math.round(base.value * total)}`;
    if (base.spiritRegen) desc += ` | 灵气回复 +${Math.round((base.spiritRegen * total) * 100)}%`;
    return desc;
}

function setActiveBeast(beastId) {
    const owned = playerData.ownedBeasts.find(o => o.beastId === beastId);
    if (!owned) return;
    playerData.equippedBeast = beastId;
    showToast(`${(owned.name || SPIRIT_BEASTS.find(b => b.id === beastId).name)} 开始出战!`);
    renderBeastHouse();
}

function feedBeast(beastId) {
    const owned = playerData.ownedBeasts.find(o => o.beastId === beastId);
    if (!owned) return;
    const affectionLevel = getBeastAffectionLevel(owned.affection);
    if (affectionLevel.level >= BEAST_AFFECTION_LEVELS.length) {
        showToast('好感度已达最高!');
        return;
    }
    const cost = 20;
    if (playerData.spiritStones < cost) {
        showToast('灵石不足!(需要20灵石)');
        return;
    }
    playerData.spiritStones -= cost;
    owned.affection += 10;
    const newLevel = getBeastAffectionLevel(owned.affection);
    showToast(`好感度 +10! 好感等级: ${newLevel.name}`);
    renderBeastHouse();
    updateUI();
}

function addBeastExp(amount) {
    if (playerData.equippedBeast === null) return;
    const owned = playerData.ownedBeasts.find(o => o.beastId === playerData.equippedBeast);
    if (!owned) return;
    const beast = SPIRIT_BEASTS.find(b => b.id === owned.beastId);
    if (owned.level >= beast.maxLevel) return;
    owned.exp += amount;
    const expForNext = getBeastExpForLevel(owned.level + 1, beast);
    if (owned.exp >= expForNext) {
        owned.level++;
        owned.exp -= expForNext;
        showToast(`${owned.name || beast.name} 升级到 Lv.${owned.level}!`);
    }
}

function getBeastCultivationBonus() {
    if (playerData.equippedBeast === null) return 0;
    const owned = playerData.ownedBeasts.find(o => o.beastId === playerData.equippedBeast);
    if (!owned) return 0;
    const beast = SPIRIT_BEASTS.find(b => b.id === owned.beastId);
    const affectionLevel = getBeastAffectionLevel(owned.affection);
    const levelBonus = 1 + (owned.level - 1) * 0.1;
    const mult = affectionLevel.effect * levelBonus;
    return (beast.baseEffect.value || 0) * mult;
}

function getBeastSpiritRegenBonus() {
    if (playerData.equippedBeast === null) return 0;
    const owned = playerData.ownedBeasts.find(o => o.beastId === playerData.equippedBeast);
    if (!owned) return 0;
    const beast = SPIRIT_BEASTS.find(b => b.id === owned.beastId);
    if (!beast.baseEffect.spiritRegen) return 0;
    const affectionLevel = getBeastAffectionLevel(owned.affection);
    const levelBonus = 1 + (owned.level - 1) * 0.1;
    return beast.baseEffect.spiritRegen * affectionLevel.effect * levelBonus;
}

function goWildBeast() {
    const cost = 50;
    if (playerData.spirit < cost) {
        showToast('灵气不足!(需要50灵气)');
        return;
    }
    playerData.spirit -= cost;
    const weights = { normal: 50, rare: 35, epic: 12, legend: 3 };
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    let rarity = 'normal';
    for (const [r, w] of Object.entries(weights)) {
        rand -= w;
        if (rand <= 0) { rarity = r; break; }
    }
    const beastsOfRarity = SPIRIT_BEASTS.filter(b => b.rarity === rarity);
    currentWildBeast = beastsOfRarity[Math.floor(Math.random() * beastsOfRarity.length)];
    const baseChance = { normal: 60, rare: 40, epic: 25, legend: 15 }[rarity];
    const comprehensionBonus = Math.floor((playerData.comprehension - 1) * 20);
    const captureChance = Math.min(85, baseChance + comprehensionBonus);
    document.getElementById('wildBeastIcon').textContent = currentWildBeast.icon;
    document.getElementById('wildBeastName').textContent = currentWildBeast.name;
    document.getElementById('wildBeastInfo').textContent = `等级 1 | ${currentWildBeast.rarity.toUpperCase()}`;
    document.getElementById('wildBeastDesc').textContent = currentWildBeast.desc;
    document.getElementById('captureChance').textContent = captureChance + '%';
    document.getElementById('captureProgressBar').style.width = captureChance + '%';
    document.getElementById('beastCaptureModal').style.display = 'flex';
    renderBeastShop();
    updateUI();
}

function attemptCapture() {
    if (!currentWildBeast) return;
    const cost = 100;
    if (playerData.spiritStones < cost) {
        showToast('灵石不足!(需要100灵石)');
        return;
    }
    playerData.spiritStones -= cost;
    const baseChance = { normal: 60, rare: 40, epic: 25, legend: 15 }[currentWildBeast.rarity];
    const comprehensionBonus = Math.floor((playerData.comprehension - 1) * 20);
    const captureChance = Math.min(85, baseChance + comprehensionBonus);
    const roll = Math.random() * 100;
    if (roll < captureChance) {
        const owned = {
            beastId: currentWildBeast.id,
            level: 1,
            exp: 0,
            affection: 0,
            name: ''
        };
        playerData.ownedBeasts.push(owned);
        showToast(`捕捉成功! 获得 ${currentWildBeast.icon} ${currentWildBeast.name}!`);
        closeBeastModal();
        renderBeastHouse();
    } else {
        showToast('捕捉失败!...灵兽逃跑了!');
        closeBeastModal();
    }
}

function closeBeastModal() {
    document.getElementById('beastCaptureModal').style.display = 'none';
    currentWildBeast = null;
}

function buyBeast(beastId) {
    const beast = SPIRIT_BEASTS.find(b => b.id === beastId);
    if (!beast) return;
    if (playerData.ownedBeasts.find(o => o.beastId === beastId)) {
        showToast('你已拥有此灵兽!');
        return;
    }
    if (playerData.spiritStones < beast.price) {
        showToast('灵石不足!');
        return;
    }
    playerData.spiritStones -= beast.price;
    playerData.ownedBeasts.push({
        beastId: beastId,
        level: 1,
        exp: 0,
        affection: 20,
        name: ''
    });
    showToast(`购买成功! 获得 ${beast.icon} ${beast.name}!`);
    renderBeastHouse();
    renderBeastShop();
    updateUI();
}

function renderBeastShop() {
    const container = document.getElementById('beastShop');
    let html = '';
    SPIRIT_BEASTS.forEach(beast => {
        const owned = playerData.ownedBeasts.find(o => o.beastId === beast.id);
        const canBuy = !owned && playerData.spiritStones >= beast.price;
        const rarityColor = beast.rarity === 'legend' ? 'var(--gold)' :
                           beast.rarity === 'epic' ? 'var(--purple)' :
                           beast.rarity === 'rare' ? 'var(--blue)' : 'var(--text-primary)';
        html += `<div class="beast-card">
            <div class="beast-icon">${beast.icon}</div>
            <div class="beast-info">
                <div class="beast-name" style="color:${rarityColor}">${beast.name}</div>
                <div class="beast-level">${beast.rarity.toUpperCase()} | 最高${beast.maxLevel}级</div>
                <div class="beast-desc">${beast.desc}</div>
                <div class="beast-effect">${getBeastEffectDesc(beast, 1, 1.0)}</div>
            </div>
            <div>
                ${owned ?
                    '<span style="font-size:11px;color:var(--green);">已拥有</span>' :
                    `<button class="btn btn-small btn-primary" onclick="buyBeast(${beast.id})" ${canBuy ? '' : 'disabled'}>
                        ${beast.price}灵石
                    </button>`
                }
            </div>
        </div>`;
    });
    container.innerHTML = html;
}
