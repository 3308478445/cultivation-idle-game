// ==================== encounter.js — 奇遇系统（含选择型、连锁奇遇） ====================

function checkEncounter() {
    const now = Date.now();
    if (now - lastEncounterTime < 60000) return;

    const baseChance = 0.01;
    const realmBonus = playerData.realm * 0.002;
    const chance = baseChance + realmBonus;

    if (Math.random() < chance) {
        lastEncounterTime = now;
        triggerEncounter();
    }
}

function triggerEncounter() {
    // 过滤可触发的奇遇（检查连锁前置条件）
    const available = ENCOUNTERS.filter(e => {
        if (e.requireEncounter) {
            // 检查是否触发过前置奇遇
            return playerData.encounterHistory.some(h => h.id === e.requireEncounter);
        }
        return true;
    });

    const totalWeight = available.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedEncounter = available[0];

    for (const encounter of available) {
        random -= encounter.weight;
        if (random <= 0) {
            selectedEncounter = encounter;
            break;
        }
    }

    showEncounterModal(selectedEncounter);
}

function showEncounterModal(encounter) {
    const modal = document.getElementById('encounterModal');
    const content = modal.querySelector('.encounter-modal-content');

    document.getElementById('encounterIcon').textContent = encounter.icon;
    document.getElementById('encounterTitle').textContent = encounter.name;
    document.getElementById('encounterDesc').textContent = encounter.desc;

    const colors = {
        opportunity: '#e8c547',
        immortal: '#7b5ea7',
        treasure: '#5fb0a8',
        trial: '#5fb0a8',
        disaster: '#c0392b'
    };
    content.style.borderColor = colors[encounter.category] || '#7b5ea7';

    modal.classList.add('active');
    content.classList.add('encounter-glow');

    // 选择型奇遇
    if (encounter.choices) {
        const effectEl = document.getElementById('encounterEffect');
        effectEl.innerHTML = '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">请选择你的行动：</div>';
        effectEl.className = 'encounter-modal-effect neutral';

        // 双按钮布局
        const choicesHtml = encounter.choices.map((choice, idx) => {
            const riskText = choice.risk > 0 ? `<div style="font-size:11px;color:var(--red);margin-top:4px;">⚠️ ${choice.riskText}</div>` : '';
            return `<button class="encounter-modal-btn encounter-choice-btn" 
                onclick="applyChoice(${encounter.id}, ${idx})" 
                style="display:block;width:100%;margin-bottom:8px;${idx === 0 ? '' : 'margin-top:4px;'}">
                ${choice.text}
            </button>${riskText}`;
        }).join('');

        // 替换底部按钮区域
        const existingBtns = content.querySelectorAll('.encounter-modal-btn');
        existingBtns.forEach(b => b.remove());

        const btnContainer = document.createElement('div');
        btnContainer.innerHTML = choicesHtml;
        content.appendChild(btnContainer);
    } else {
        // 普通奇遇
        const effectTexts = encounter.effects.map(e => e.text).join(' | ');
        const effectEl = document.getElementById('encounterEffect');
        effectEl.textContent = effectTexts;
        effectEl.className = 'encounter-modal-effect ' +
            (encounter.category === 'disaster' ? 'negative' :
             encounter.category === 'trial' ? 'neutral' : 'positive');

        // 清理可能存在的选择按钮
        const existingBtns = content.querySelectorAll('.encounter-choice-btn');
        existingBtns.forEach(b => b.remove());

        const btn = modal.querySelector('.encounter-modal-btn:not(.encounter-choice-btn)') || (() => {
            const newBtn = document.createElement('button');
            newBtn.className = 'encounter-modal-btn';
            content.appendChild(newBtn);
            return newBtn;
        })();
        btn.textContent = '接受';
        btn.style.display = '';
        btn.onclick = () => {
            applyEncounterEffect(encounter);
            closeEncounterModal();
        };
    }

    if (window.audioManager) audioManager.play('encounter');
}

function applyChoice(encounterId, choiceIdx) {
    const encounter = ENCOUNTERS.find(e => e.id === encounterId);
    if (!encounter || !encounter.choices) return;

    const choice = encounter.choices[choiceIdx];

    // 记录奇遇
    const record = {
        id: encounter.id,
        name: encounter.name,
        category: encounter.category,
        icon: encounter.icon,
        time: Date.now(),
        effectsApplied: []
    };

    playerData.encounterHistory.unshift(record);
    if (playerData.encounterHistory.length > 50) {
        playerData.encounterHistory.pop();
    }

    playerData.stats.total++;
    if (playerData.stats[encounter.category] !== undefined) {
        playerData.stats[encounter.category]++;
    }

    // 风险判定
    if (choice.risk > 0 && Math.random() < choice.risk) {
        // 触发风险 - 负面效果
        if (choice.effects[0] && choice.effects[0].type === 'cultivation') {
            const loss = Math.abs(choice.effects[0].value) * 0.5;
            playerData.cultivation = Math.max(0, playerData.cultivation - loss);
            createFloatingText(`风险触发! 修为-${Math.floor(loss)}`, 'red');
            record.effectsApplied.push(`风险: 修为-${Math.floor(loss)}`);
        }
        showMessage(`选择「${choice.text}」失败！触发风险`, 'fail');
    } else {
        // 成功 - 应用效果
        for (const effect of choice.effects) {
            applyEncounterEffectItem(effect, record);
        }
        showMessage(`选择「${choice.text}」成功！`, 'success');
    }

    renderEncounter();
    checkAchievements();
    updateDailyTaskProgress('encounter', 1);
    closeEncounterModal();
}

function applyEncounterEffect(encounter) {
    const record = {
        id: encounter.id,
        name: encounter.name,
        category: encounter.category,
        icon: encounter.icon,
        time: Date.now(),
        effectsApplied: encounter.effects.map(e => e.text)
    };
    playerData.encounterHistory.unshift(record);
    if (playerData.encounterHistory.length > 50) {
        playerData.encounterHistory.pop();
    }

    playerData.stats.total++;
    if (playerData.stats[encounter.category] !== undefined) {
        playerData.stats[encounter.category]++;
    }

    for (const effect of encounter.effects) {
        applyEncounterEffectItem(effect, record);
    }

    renderEncounter();
    checkAchievements();
    updateDailyTaskProgress('encounter', 1);

    const msgType = encounter.category === 'disaster' ? 'fail' :
                   encounter.category === 'trial' ? '' : 'success';
    showMessage(`触发奇遇: ${encounter.icon} ${encounter.name}`, msgType);
}

function applyEncounterEffectItem(effect, record) {
    switch (effect.type) {
        case 'cultivation':
            playerData.cultivation = Math.max(0, playerData.cultivation + effect.value);
            createFloatingText(effect.text, effect.value > 0 ? 'gold' : 'red');
            break;

        case 'spirit':
            playerData.spirit = Math.max(0, Math.min(playerData.maxSpirit, playerData.spirit + effect.value));
            break;

        case 'spiritStones':
            playerData.spiritStones = Math.max(0, playerData.spiritStones + effect.value);
            if (effect.value > 0) {
                playerData.stats.totalSpiritStones += effect.value;
                createFloatingText(effect.text, 'gold');
            }
            break;

        case 'talent':
            playerData.talent = Math.max(0.1, playerData.talent + effect.value);
            createFloatingText(effect.text, 'green');
            break;

        case 'comprehension':
            playerData.tempBuffs.comprehension += effect.value;
            setTimeout(() => {
                playerData.tempBuffs.comprehension -= effect.value;
            }, (effect.duration || 60) * 1000);
            break;

        case 'comprehension_temp':
            playerData.tempBuffs.comprehension += effect.value;
            setTimeout(() => {
                playerData.tempBuffs.comprehension -= effect.value;
            }, (effect.duration || 60) * 1000);
            showMessage(`悟性临时 ${effect.value > 0 ? '+' : ''}${effect.value},持续 ${Math.floor((effect.duration || 60) / 60)} 分钟`, 'success');
            break;

        case 'pill':
            playerData.inventory[effect.pillId] = (playerData.inventory[effect.pillId] || 0) + (effect.count || 1);
            break;

        case 'skill':
            if (effect.value === 'random') {
                const unownedSkills = SKILLS.filter(s => !playerData.ownedSkills.includes(s.id));
                if (unownedSkills.length > 0) {
                    const randomSkill = unownedSkills[Math.floor(Math.random() * unownedSkills.length)];
                    playerData.ownedSkills.push(randomSkill.id);
                    if (!playerData.skillLevels[randomSkill.id]) playerData.skillLevels[randomSkill.id] = 1;
                    createFloatingText(`获得功法: ${randomSkill.name}`, 'purple');
                }
            }
            break;
    }
}

function closeEncounterModal() {
    const modal = document.getElementById('encounterModal');
    modal.classList.remove('active');
    modal.querySelector('.encounter-modal-content').classList.remove('encounter-glow');
    const content = modal.querySelector('.encounter-modal-content');
    content.style.maxWidth = '';
    content.style.borderColor = '';

    // 清理选择按钮
    const choiceBtns = content.querySelectorAll('.encounter-choice-btn');
    choiceBtns.forEach(b => b.remove());

    const btn = modal.querySelector('.encounter-modal-btn:not(.encounter-choice-btn)');
    if (btn) {
        btn.textContent = '接受';
        btn.style.display = '';
        btn.onclick = function() { acceptEncounter(); };
    }
}

function renderEncounter() {
    document.getElementById('totalEncounters').textContent = playerData.stats.total;

    document.getElementById('stat_opportunity').textContent = playerData.stats.opportunity;
    document.getElementById('stat_immortal').textContent = playerData.stats.immortal;
    document.getElementById('stat_treasure').textContent = playerData.stats.treasure;
    document.getElementById('stat_trial').textContent = playerData.stats.trial;
    document.getElementById('stat_disaster').textContent = playerData.stats.disaster;

    const container = document.getElementById('recentEncounters');
    if (playerData.encounterHistory.length === 0) {
        container.innerHTML = '<div style="color: var(--text-secondary);">暂无奇遇记录</div>';
    } else {
        const categoryColors = {
            opportunity: '#e8c547',
            immortal: '#7b5ea7',
            treasure: '#5fb0a8',
            trial: '#5fb0a8',
            disaster: '#c0392b'
        };

        container.innerHTML = playerData.encounterHistory.slice(0, 20).map(record => {
            const time = new Date(record.time);
            const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
            return `
                <div class="encounter-history-item" style="border-left: 3px solid ${categoryColors[record.category] || '#7b5ea7'}; padding-left: 8px;">
                    <div>${record.icon} ${record.name}</div>
                    <div class="encounter-time">${timeStr} | ${record.effectsApplied.join(', ')}</div>
                </div>
            `;
        }).join('');
    }
}
