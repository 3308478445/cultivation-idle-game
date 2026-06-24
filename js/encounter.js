// ==================== encounter.js — 奇遇系统 ====================

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
    const totalWeight = ENCOUNTERS.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedEncounter = ENCOUNTERS[0];

    for (const encounter of ENCOUNTERS) {
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

    const effectTexts = encounter.effects.map(e => e.text).join(' | ');
    const effectEl = document.getElementById('encounterEffect');
    effectEl.textContent = effectTexts;
    effectEl.className = 'encounter-modal-effect ' +
        (encounter.category === 'disaster' ? 'negative' :
         encounter.category === 'trial' ? 'neutral' : 'positive');

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

    const btn = modal.querySelector('.encounter-modal-btn');
    btn.onclick = () => {
        applyEncounterEffect(encounter);
        closeEncounterModal();
    };
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
                        createFloatingText(`获得功法: ${randomSkill.name}`, 'purple');
                    }
                }
                break;
        }
    }

    renderEncounter();
    checkAchievements();
    updateDailyTaskProgress('encounter', 1);

    const msgType = encounter.category === 'disaster' ? 'fail' :
                   encounter.category === 'trial' ? '' : 'success';
    showMessage(`触发奇遇: ${encounter.icon} ${encounter.name}`, msgType);
}

function closeEncounterModal() {
    const modal = document.getElementById('encounterModal');
    modal.classList.remove('active');
    modal.querySelector('.encounter-modal-content').classList.remove('encounter-glow');
    const btn = modal.querySelector('.encounter-modal-btn');
    btn.textContent = '接受';
    btn.onclick = function() { acceptEncounter(); };
    modal.querySelector('.encounter-modal-content').style.maxWidth = '';
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
