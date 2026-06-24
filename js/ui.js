// ==================== ui.js — UI渲染、switchTab、showMessage、floatingText、太极图 ====================

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    if (event && event.target) event.target.classList.add('active');
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
    // 境界徽章 - 用图片
    const realmBadge = document.getElementById('realmBadge');
    if (realmBadge) {
        const realm = REALMS[playerData.realm - 1];
        const realmImg = `realm_${realm.shortName}.png`;
        realmBadge.innerHTML = `<img src="${realmImg}" alt="${realm.name}" style="width:48px;height:48px;vertical-align:middle;" onerror="this.style.display='none';this.nextElementSibling.style.display='inline';"><span style="display:none;font-size:14px;">${getFullRealmName()}</span>`;
    }

    document.getElementById('cultivationValue').textContent = formatNumber(playerData.cultivation);
    document.getElementById('spiritValue').textContent = `${Math.floor(playerData.spirit)}/${playerData.maxSpirit}`;
    document.getElementById('talentValue').textContent = playerData.talent.toFixed(2);
    document.getElementById('comprehensionValue').textContent = getTotalComprehension().toFixed(2);

    // 境界名称显示
    const realmNameEl = document.getElementById('realmNameDisplay');
    if (realmNameEl) {
        realmNameEl.textContent = getFullRealmName();
    }

    // 修为数字
    const cultivationNumEl = document.getElementById('cultivationNum');
    if (cultivationNumEl) {
        const nextSub = getSubLevelCultivation(playerData.realm, playerData.subLevel);
        cultivationNumEl.textContent = `${formatNumber(playerData.cultivation)} / ${formatNumber(nextSub)}`;
    }

    // 进度条
    const nextSub = getSubLevelCultivation(playerData.realm, playerData.subLevel);
    const prevSub = getSubLevelCultivation(playerData.realm, playerData.subLevel - 1);
    const range = nextSub - prevSub;
    const current = playerData.cultivation - prevSub;
    const percent = range > 0 ? Math.min(100, (current / range) * 100) : 0;

    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = `${percent}%`;
    const progressPercent = document.getElementById('progressPercent');
    if (progressPercent) progressPercent.textContent = `${percent.toFixed(1)}%`;
    const progressText = document.getElementById('progressText');
    if (progressText) progressText.textContent = `${formatNumber(playerData.cultivation)} / ${formatNumber(nextSub)}`;

    document.getElementById('cultivationSpeed').textContent = `${getCultivationGain()}/秒`;
    document.getElementById('spiritRecovery').textContent = `${getSpiritRecovery()}/秒`;
    document.getElementById('spiritStones').textContent = formatNumber(playerData.spiritStones);
    document.getElementById('daoHeart').textContent = `+${playerData.failedBreakthroughs * 5}%`;

    // 自动修炼开关
    const autoToggle = document.getElementById('autoToggle');
    if (autoToggle) autoToggle.classList.toggle('active', playerData.autoCultivate);

    checkBreakthroughAvailability();
    updateTaijiProgress();
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
    const taiji = document.getElementById('taijiContainer');
    if (taiji) {
        const rect = taiji.getBoundingClientRect();
        el.style.left = (rect.left + rect.width / 2 - 30) + 'px';
        el.style.top = (rect.top + rect.height / 2) + 'px';
    } else {
        el.style.left = Math.random() * 300 + 100 + 'px';
        el.style.top = '300px';
    }
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1000);
}

function showToast(text) {
    showMessage(text, '');
}

// 分享功能
function shareResult() {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, 800);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    // 边框
    ctx.strokeStyle = '#e8c547';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 560, 760);

    // 标题
    ctx.fillStyle = '#e8c547';
    ctx.font = 'bold 36px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('修仙放置游戏', 300, 80);

    // 境界
    ctx.fillStyle = '#7b5ea7';
    ctx.font = 'bold 28px "Microsoft YaHei", sans-serif';
    ctx.fillText(getFullRealmName(), 300, 140);

    // 太极图装饰
    ctx.save();
    ctx.translate(300, 280);
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.fillStyle = '#e8c547';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a1a';
    ctx.fill();
    // 太极阴阳
    ctx.beginPath();
    ctx.arc(0, 0, 75, Math.PI / 2, Math.PI * 3 / 2);
    ctx.fillStyle = '#e8f0f0';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -37.5, 37.5, Math.PI / 2, Math.PI * 3 / 2);
    ctx.fillStyle = '#0a0a1a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 37.5, 37.5, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = '#e8f0f0';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -37.5, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a1a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 37.5, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#e8f0f0';
    ctx.fill();
    ctx.restore();

    // 数据
    ctx.fillStyle = '#e8f0f0';
    ctx.font = '20px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'left';
    let y = 430;
    const lines = [
        `修为: ${formatNumber(playerData.cultivation)}`,
        `累计修为: ${formatNumber(playerData.stats.totalCultivation)}`,
        `灵石: ${formatNumber(playerData.spiritStones)}`,
        `资质: ${playerData.talent.toFixed(2)}`,
        `悟性: ${getTotalComprehension().toFixed(2)}`,
        `奇遇次数: ${playerData.stats.total}`,
        `成就解锁: ${playerData.achievements.length}/${ACHIEVEMENTS.length}`,
        `游戏时长: ${formatTime(playerData.stats.playTime || 0)}`,
    ];
    lines.forEach(line => {
        ctx.fillText(line, 80, y);
        y += 35;
    });

    // 底部
    ctx.fillStyle = '#5fb0a8';
    ctx.font = '16px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('— 修仙路漫漫,吾将上下而求索 —', 300, 740);

    // 下载
    const link = document.createElement('a');
    link.download = `修仙成果_${getFullRealmName()}_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    showMessage('分享卡片已保存！', 'success');
}

// 静音切换
function toggleMute() {
    playerData.muted = !playerData.muted;
    const btn = document.getElementById('muteBtn');
    if (btn) btn.textContent = playerData.muted ? '🔇' : '🔊';
    saveGame();
}
