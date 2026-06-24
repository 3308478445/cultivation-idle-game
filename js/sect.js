// ==================== sect.js — 宗门系统 ====================

function renderSect() {
    const hasSect = playerData.sectId !== null;
    document.getElementById('sectInfo').style.display = hasSect ? 'block' : 'none';
    document.getElementById('sectNoSect').style.display = hasSect ? 'none' : 'block';

    if (hasSect) {
        const sect = getSectById(playerData.sectId);
        if (sect) {
            document.getElementById('sectName').textContent = sect.name;
            document.getElementById('sectMembers').textContent = sect.memberCount || 1;
            document.getElementById('sectLevel').textContent = sect.level;
            document.getElementById('sectContrib').textContent = playerData.sectContrib;
            const contribNeed = 1000;
            document.getElementById('sectContribNeed').textContent = contribNeed;
            document.getElementById('sectContribBar').style.width =
                Math.min(100, (playerData.sectContrib % contribNeed / contribNeed * 100)) + '%';
        }
        renderSectShop();
        renderDailyTasks();
    } else {
        renderSectList();
    }
}

function getSectById(sectId) {
    return PREDEFINED_SECTS.find(s => s.id === sectId);
}

function renderSectList() {
    const container = document.getElementById('sectList');
    container.innerHTML = PREDEFINED_SECTS.map(sect => `
        <div class="sect-card">
            <div class="sect-card-header">
                <span class="sect-card-name">${sect.name}</span>
                <span class="sect-card-level">Lv.${sect.level}</span>
            </div>
            <div class="sect-card-info">${sect.desc}</div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px;">
                <span style="color: var(--text-secondary);">成员: ${sect.memberCount}</span>
                <button class="btn btn-primary" onclick="joinSect('${sect.id}')" style="padding: 6px 12px; font-size: 12px;">
                    加入
                </button>
            </div>
        </div>
    `).join('');
}

function joinSect(sectId) {
    if (playerData.sectId !== null) {
        showMessage('你已经在宗门中了！', 'fail');
        return;
    }
    playerData.sectId = sectId;
    playerData.sectContrib = 0;
    playerData.sectDailyTasks = {};
    playerData.sectLastResetDate = getToday();

    const sect = getSectById(sectId);
    showMessage(`成功加入 ${sect.name}！`, 'success');
    createFloatingText(`加入宗门: ${sect.name}`, 'gold');

    saveGame();
    renderSect();
}

function createSect() {
    const nameInput = document.getElementById('sectCreateName');
    const name = nameInput.value.trim();

    if (!name) {
        showMessage('请输入宗门名称！', 'fail');
        return;
    }

    if (name.length < 2 || name.length > 8) {
        showMessage('宗门名称长度需在2-8字之间！', 'fail');
        return;
    }

    if (playerData.spiritStones < 5000) {
        showMessage('灵石不足！需要5000灵石', 'fail');
        return;
    }

    playerData.spiritStones -= 5000;
    playerData.sectContrib += 500;

    const newSect = {
        id: 'custom_' + Date.now(),
        name: name,
        level: 1,
        memberCount: 1,
        desc: '玩家创建的宗门',
        isCustom: true
    };

    PREDEFINED_SECTS.unshift(newSect);

    playerData.sectId = newSect.id;
    playerData.sectDailyTasks = {};
    playerData.sectLastResetDate = getToday();

    showMessage(`宗门「${name}」创建成功！`, 'success');
    createFloatingText('宗门创建成功！', 'gold');

    saveGame();
    renderSect();
    updateUI();
}

function leaveSect() {
    if (playerData.sectId === null) return;
    if (!confirm('确定要离开宗门吗？')) return;

    playerData.sectId = null;
    playerData.sectContrib = 0;
    playerData.sectDailyTasks = {};

    showMessage('已离开宗门', '');
    saveGame();
    renderSect();
}

function renderSectShop() {
    const container = document.getElementById('sectShopList');
    container.innerHTML = SECT_SHOP_ITEMS.map(item => `
        <div class="shop-item" onclick="buySectItem('${item.id}')">
            <div class="shop-item-header">
                <span class="shop-item-name">${item.name}</span>
                <span class="shop-item-price">${item.price} 贡献</span>
            </div>
            <div class="shop-item-desc">${item.desc}</div>
        </div>
    `).join('');
}

function buySectItem(itemId) {
    if (playerData.sectId === null) {
        showMessage('请先加入宗门！', 'fail');
        return;
    }

    const item = SECT_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (playerData.sectContrib < item.price) {
        showMessage('贡献不足！', 'fail');
        return;
    }

    playerData.sectContrib -= item.price;

    switch (item.effect.type) {
        case 'cultivation':
            playerData.cultivation += item.effect.value;
            playerData.stats.totalCultivation += item.effect.value;
            createFloatingText(`+${item.effect.value}修为`, 'gold');
            break;
        case 'breakthrough':
            playerData.tempBuffs.breakthrough += item.effect.value;
            showMessage(`突破成功率+${item.effect.value}%`, 'success');
            break;
        case 'talent':
            playerData.talent += item.effect.value;
            showMessage(`资质+${item.effect.value}`, 'success');
            createFloatingText('资质提升！', 'green');
            break;
        case 'spiritBoost':
            playerData.tempBuffs.spiritBoost = (playerData.tempBuffs.spiritBoost || 0) + item.effect.duration;
            showMessage('灵气恢复加速生效中！', 'success');
            break;
        case 'comprehension':
            playerData.tempBuffs.comprehension += item.effect.value;
            setTimeout(() => {
                playerData.tempBuffs.comprehension -= item.effect.value;
                updateUI();
            }, item.effect.duration * 1000);
            showMessage(`悟性+${item.effect.value}，持续${Math.floor(item.effect.duration/60)}分钟`, 'success');
            break;
    }

    checkAchievements();
    saveGame();
    renderSect();
    updateUI();
}

function renderDailyTasks() {
    checkDailyTasksReset();

    const container = document.getElementById('sectDailyTasks');
    const remainCount = Math.max(0, 3 - playerData.sectContribToday);
    container.innerHTML = `
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
            任务每日0点重置 | 剩余次数: ${remainCount}
        </div>
        ${DAILY_TASKS.map(task => {
            const progress = playerData.sectDailyTasks[task.id] || 0;
            const completed = progress >= task.target;
            const canClaim = !completed && remainCount > 0;
            return `
                <div class="sect-task-card">
                    <div class="sect-task-info">
                        <div class="sect-task-name">${task.icon} ${task.name} <span style="color: ${completed ? 'var(--green)' : 'var(--text-secondary)'}">(${progress}/${task.target})</span></div>
                        <div class="sect-task-desc">${task.desc} | 奖励: ${task.reward.contrib}贡献 + ${task.reward.spiritStones}灵石</div>
                    </div>
                    ${completed ? '<span style="color: var(--green);">✅</span>' :
                      `<button class="btn btn-primary" onclick="claimDailyTask('${task.id}')" style="padding: 4px 8px; font-size: 11px;" ${remainCount <= 0 ? 'disabled' : ''}>完成</button>`}
                </div>
            `;
        }).join('')}
    `;
}

function checkDailyTasksReset() {
    const today = getToday();
    if (playerData.sectLastResetDate !== today) {
        playerData.sectDailyTasks = {};
        playerData.sectContribToday = 0;
        playerData.sectLastResetDate = today;
    }
}

function claimDailyTask(taskId) {
    if (playerData.sectId === null) {
        showMessage('请先加入宗门！', 'fail');
        return;
    }

    const task = DAILY_TASKS.find(t => t.id === taskId);
    if (!task) return;

    const progress = playerData.sectDailyTasks[taskId] || 0;
    if (progress < task.target) {
        showMessage('任务未完成！', 'fail');
        return;
    }

    if (playerData.sectContribToday >= 3) {
        showMessage('今日任务次数已用完！', 'fail');
        return;
    }

    playerData.sectContrib += task.reward.contrib;
    playerData.sectContribToday++;
    playerData.spiritStones += task.reward.spiritStones;
    playerData.stats.totalSpiritStones += task.reward.spiritStones;

    showMessage(`任务完成！+${task.reward.contrib}贡献 +${task.reward.spiritStones}灵石`, 'success');
    checkAchievements();
    saveGame();
    renderSect();
    updateUI();
}

function updateDailyTaskProgress(type, value) {
    if (playerData.sectId === null) return;
    checkDailyTasksReset();

    DAILY_TASKS.forEach(task => {
        if (task.type === type) {
            playerData.sectDailyTasks[task.id] = (playerData.sectDailyTasks[task.id] || 0) + value;
        }
    });
}
