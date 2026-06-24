// ==================== artifact.js — 法宝系统 ====================

function renderArtifact() {
    renderEquippedArtifacts();
    renderArtifactInventory();
    renderArtifactMaterials();
    renderArtifactShop();
}

function renderArtifactMaterials() {
    const container = document.getElementById('artifactMaterials');
    document.getElementById('artifactStoneCount').textContent = playerData.spiritStones;
    let html = '';
    ARTIFACT_MATERIALS.forEach(m => {
        const count = playerData.materials[m.id] || 0;
        html += `<div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 8px; text-align: center; min-width: 55px;">
            <div style="font-size: 20px;">${m.icon}</div>
            <div style="font-size: 10px; color: var(--text-secondary);">${m.name}</div>
            <div style="font-size: 11px; color: var(--cyan);">x${count}</div>
        </div>`;
    });
    container.innerHTML = html;
}

function buyRandomMaterial() {
    const cost = 50;
    if (playerData.spiritStones < cost) {
        showToast('灵石不足!');
        return;
    }
    const weights = [50, 30, 15, 4, 1];
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    let materialId = 1;
    for (let i = 0; i < weights.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
            materialId = i + 1;
            break;
        }
    }
    const material = ARTIFACT_MATERIALS.find(m => m.id === materialId);
    playerData.spiritStones -= cost;
    playerData.materials[materialId] = (playerData.materials[materialId] || 0) + 1;
    showToast(`花费50灵石,获得 ${material.icon} ${material.name}!`);
    renderArtifactMaterials();
    updateUI();
}

function renderEquippedArtifacts() {
    const container = document.getElementById('equippedArtifacts');
    let html = '';
    for (let i = 0; i < 3; i++) {
        const artifactId = playerData.equippedArtifacts[i];
        if (artifactId !== null) {
            const artifact = ARTIFACTS.find(a => a.id === artifactId);
            const owned = playerData.ownedArtifacts.find(o => o.artifactId === artifactId);
            const level = owned ? owned.level : 1;
            html += `<div class="artifact-slot equipped" onclick="unequipArtifact(${i})">
                <div class="artifact-icon">${artifact.icon}</div>
                <div style="font-size:10px;color:var(--gold);">Lv.${level}</div>
            </div>`;
        } else {
            html += `<div class="artifact-slot empty-slot" onclick="selectArtifactToEquip(${i})">+</div>`;
        }
    }
    container.innerHTML = html;
}

function selectArtifactToEquip(slot) {
    if (playerData.ownedArtifacts.length === 0) {
        showToast('你还没有法宝,先去商店购买吧!');
        return;
    }
    const available = playerData.ownedArtifacts.filter(o =>
        !playerData.equippedArtifacts.includes(o.artifactId)
    );
    if (available.length === 0) {
        showToast('所有法宝都已装备!');
        return;
    }
    let options = available.map(o => {
        const a = ARTIFACTS.find(art => art.id === o.artifactId);
        return `${a.icon} ${a.name} (Lv.${o.level})`;
    }).join('\n');
    let choice = prompt(`选择要装备的法宝:\n${options}\n\n输入序号(1-${available.length}):`);
    if (choice) {
        const idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < available.length) {
            playerData.equippedArtifacts[slot] = available[idx].artifactId;
            showToast(`已装备 ${ARTIFACTS.find(a => a.id === available[idx].artifactId).name}!`);
            renderEquippedArtifacts();
            updateUI();
        }
    }
}

function unequipArtifact(slot) {
    const artifactId = playerData.equippedArtifacts[slot];
    if (artifactId !== null) {
        const artifact = ARTIFACTS.find(a => a.id === artifactId);
        playerData.equippedArtifacts[slot] = null;
        showToast(`已卸下 ${artifact.name}`);
        renderEquippedArtifacts();
        updateUI();
    }
}

function renderArtifactInventory() {
    const container = document.getElementById('artifactInventory');
    if (playerData.ownedArtifacts.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">暂无法宝</div>';
        return;
    }
    let html = '';
    playerData.ownedArtifacts.forEach(owned => {
        const artifact = ARTIFACTS.find(a => a.id === owned.artifactId);
        const isEquipped = playerData.equippedArtifacts.includes(owned.artifactId);
        const upgradeCost = getArtifactUpgradeCost(artifact, owned.level);
        html += `<div class="artifact-card">
            <div class="artifact-icon">${artifact.icon}</div>
            <div class="artifact-info">
                <div class="artifact-name">${artifact.name}</div>
                <div class="artifact-desc">${artifact.desc}</div>
                <div class="artifact-stats">修炼加成: +${Math.round(getArtifactCultivationBonus() * 100)}%</div>
                <div class="artifact-level">等级: ${owned.level} ${isEquipped ? '【已装备】' : ''}</div>
            </div>
            <div class="artifact-actions">
                ${owned.level < 10 ? `
                <button class="btn btn-small" onclick="upgradeArtifact(${artifact.id})"
                    ${playerData.spiritStones >= upgradeCost.spiritStones && (playerData.materials[1] || 0) >= upgradeCost.materials ? '' : 'disabled'}>
                    升级
                </button>
                ` : '<span style="font-size:11px;color:var(--gold);">满级</span>'}
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function getArtifactUpgradeCost(artifact, level) {
    const multiplier = Math.pow(1.5, level - 1);
    return {
        spiritStones: Math.floor(artifact.upgradeCost.spiritStones * multiplier),
        materials: Math.floor(artifact.upgradeCost.materials * multiplier)
    };
}

function getArtifactCultivationBonus() {
    let bonus = 0;
    playerData.equippedArtifacts.forEach(id => {
        if (id !== null) {
            const owned = playerData.ownedArtifacts.find(o => o.artifactId === id);
            if (owned) {
                const artifact = ARTIFACTS.find(a => a.id === id);
                const levelBonus = artifact.effects.cultivationBonus * (1 + (owned.level - 1) * 0.1);
                bonus += levelBonus;
            }
        }
    });
    return bonus;
}

function upgradeArtifact(artifactId) {
    const owned = playerData.ownedArtifacts.find(o => o.artifactId === artifactId);
    if (!owned) return;
    if (owned.level >= 10) {
        showToast('法宝已达最高等级!');
        return;
    }
    const artifact = ARTIFACTS.find(a => a.id === artifactId);
    const cost = getArtifactUpgradeCost(artifact, owned.level);
    if (playerData.spiritStones < cost.spiritStones) {
        showToast('灵石不足!');
        return;
    }
    if ((playerData.materials[1] || 0) < cost.materials) {
        showToast('炼器材料不足!(需要玄铁)');
        return;
    }
    playerData.spiritStones -= cost.spiritStones;
    playerData.materials[1] = (playerData.materials[1] || 0) - cost.materials;
    owned.level++;
    showToast(`${artifact.name} 升级到 Lv.${owned.level}!`);
    renderArtifactInventory();
    renderEquippedArtifacts();
    updateUI();
}

function renderArtifactShop() {
    const container = document.getElementById('artifactShop');
    let html = '';
    ARTIFACTS.forEach(artifact => {
        const owned = playerData.ownedArtifacts.find(o => o.artifactId === artifact.id);
        const canBuy = !owned && playerData.spiritStones >= artifact.price;
        const rarityColor = artifact.rarity === 'legend' ? 'var(--gold)' :
                           artifact.rarity === 'epic' ? 'var(--purple)' : 'var(--blue)';
        html += `<div class="artifact-card">
            <div class="artifact-icon">${artifact.icon}</div>
            <div class="artifact-info">
                <div class="artifact-name" style="color:${rarityColor}">${artifact.name}</div>
                <div class="artifact-desc">${artifact.desc}</div>
                <div class="artifact-stats">修炼加成: +${Math.round(artifact.effects.cultivationBonus * 100)}%</div>
                <div class="artifact-level">${artifact.rarity.toUpperCase()}</div>
            </div>
            <div class="artifact-actions">
                ${owned ?
                    '<span style="font-size:11px;color:var(--green);">已拥有</span>' :
                    `<button class="btn btn-small btn-primary" onclick="buyArtifact(${artifact.id})"
                        ${canBuy ? '' : 'disabled'}>
                        ${artifact.price}灵石
                    </button>`
                }
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function buyArtifact(artifactId) {
    const artifact = ARTIFACTS.find(a => a.id === artifactId);
    if (!artifact) return;
    if (playerData.ownedArtifacts.find(o => o.artifactId === artifactId)) {
        showToast('你已拥有此法宝!');
        return;
    }
    if (playerData.spiritStones < artifact.price) {
        showToast('灵石不足!');
        return;
    }
    playerData.spiritStones -= artifact.price;
    playerData.ownedArtifacts.push({
        artifactId: artifactId,
        level: 1,
        exp: 0
    });
    showToast(`获得 ${artifact.icon} ${artifact.name}!`);
    renderArtifactShop();
    renderArtifactInventory();
    updateUI();
}

function buyArtifactMaterial(materialId) {
    const material = ARTIFACT_MATERIALS.find(m => m.id === materialId);
    if (!material) return;
    if (playerData.spiritStones < material.price) {
        showToast('灵石不足!');
        return;
    }
    playerData.spiritStones -= material.price;
    playerData.materials[materialId] = (playerData.materials[materialId] || 0) + 1;
    showToast(`购买 ${material.icon} ${material.name}!`);
    updateUI();
}
