// ==================== ui.js — UI渲染、switchTab、showMessage、floatingText等 ====================

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');

    if (tabName === 'skills') renderSkills();
    if (tabName === 'pills') renderPills();
    if (tabName === 'shop') renderShop();
    if (tabName === 'encounter') renderEncounter();
    if (tabName === 'achievements') renderAchievements();
    if (tabName === 'sect') renderSect();
    if (tabName === 'artifact') renderArtifact();
    if (tabName === 'beast') renderBeast();
    if (tabName === 'cave') renderCave();
    if (tabName === 'story') renderStory();
}

function updateUI() {
    document.getElementById('realmBadge').textContent = REALMS[playerData.realm - 1].name;
    document.getElementById('cultivationValue').textContent = formatNumber(playerData.cultivation);
    document.getElementById('spiritValue').textContent = `${Math.floor(playerData.spirit)}/${playerData.maxSpirit}`;
    document.getElementById('talentValue').textContent = playerData.talent.toFixed(2);
    document.getElementById('comprehensionValue').textContent = getTotalComprehension().toFixed(2);

    const nextRealm = REALMS[playerData.realm];
    if (nextRealm) {
        const progress = (playerData.cultivation / nextRealm.requiredCultivation) * 100;
        document.getElementById('progressFill').style.width = `${Math.min(100, progress)}%`;
        document.getElementById('progressPercent').textContent = `${Math.min(100, progress).toFixed(1)}%`;
        document.getElementById('progressText').textContent =
            `${formatNumber(playerData.cultivation)} / ${formatNumber(nextRealm.requiredCultivation)}`;
    } else {
        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('progressPercent').textContent = '已满级';
        document.getElementById('progressText').textContent = '已达最高境界';
    }

    document.getElementById('cultivationSpeed').textContent = `${getCultivationGain()}/秒`;
    document.getElementById('spiritRecovery').textContent = `${getSpiritRecovery()}/秒`;
    document.getElementById('spiritStones').textContent = formatNumber(playerData.spiritStones);
    document.getElementById('daoHeart').textContent = `+${playerData.failedBreakthroughs * 5}%`;

    checkBreakthroughAvailability();
}

function showMessage(text, type = '') {
    const box = document.getElementById('messageBox');
    box.textContent = text;
    box.className = 'message ' + type;
}

function createFloatingText(text, color = 'gold') {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.textContent = text;
    el.style.color = color === 'gold' ? '#e8c547' :
                    color === 'purple' ? '#7b5ea7' :
                    color === 'green' ? '#5fb0a8' : '#c0392b';
    el.style.left = Math.random() * 300 + 100 + 'px';
    el.style.top = '300px';
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1000);
}

function showToast(text) {
    showMessage(text, '');
}
