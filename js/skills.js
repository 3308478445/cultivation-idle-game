// ==================== skills.js — 功法系统（含品阶、升级、主动技能） ====================

function renderSkills() {
    const container = document.getElementById('skillsList');
    const maxSlots = REALMS[playerData.realm - 1].skillSlots;

    document.getElementById('skillSlots').textContent =
        `${playerData.equippedSkills.length}/${maxSlots}`;

    container.innerHTML = SKILLS.map(skill => {
        const owned = playerData.ownedSkills.includes(skill.id);
        const equipped = playerData.equippedSkills.includes(skill.id);
        const canEquip = owned && !equipped && playerData.equippedSkills.length < maxSlots;
        const level = playerData.skillLevels[skill.id] || 1;
        const gradeInfo = SKILL_GRADES[skill.grade] || SKILL_GRADES['凡品'];
        const upgradeCost = getSkillUpgradeCost(skill, level);

        let actionHtml = '';
        if (!owned) {
            actionHtml = `<div class="skill-cost">购买: ${skill.cost} 灵石</div>`;
        } else if (skill.type === '主动') {
            const now = Date.now();
            const cooldown = playerData.activeSkillCooldowns[skill.id] || 0;
            const buffEnd = playerData.activeSkillBuffs[skill.id] || 0;
            const isCooling = now < cooldown;
            const isActive = now < buffEnd;
            if (isActive) {
                const remain = Math.ceil((buffEnd - now) / 1000);
                actionHtml = `<div style="color:var(--gold);font-size:12px;margin-top:6px;">⚡ 生效中 ${remain}s</div>`;
            } else if (isCooling) {
                const remain = Math.ceil((cooldown - now) / 1000);
                actionHtml = `<div style="color:var(--smoke-gray);font-size:12px;margin-top:6px;">冷却 ${remain}s</div>`;
            } else if (equipped) {
                actionHtml = `<button class="btn btn-small btn-primary" onclick="event.stopPropagation();useActiveSkill(${skill.id})" style="margin-top:6px;">施展</button>`;
            } else {
                actionHtml = `<div style="color:var(--text-secondary);font-size:12px;margin-top:6px;">需装备后施展</div>`;
            }
        } else if (equipped) {
            actionHtml = '<div style="color: var(--green); font-size: 12px; margin-top: 6px;">已装备</div>';
        } else {
            actionHtml = '<div style="color: var(--text-secondary); font-size: 12px; margin-top: 6px;">点击装配</div>';
        }

        // 升级按钮
        let upgradeHtml = '';
        if (owned && level < 10) {
            upgradeHtml = `<button class="btn btn-small" onclick="event.stopPropagation();upgradeSkill(${skill.id})" style="margin-top:6px;width:100%;">
                ⬆ Lv.${level} (升级: ${upgradeCost}灵石)
            </button>`;
        } else if (owned) {
            upgradeHtml = `<div style="color:var(--gold);font-size:11px;margin-top:4px;">Lv.${level} 满级</div>`;
        }

        return `
            <div class="skill-card ${equipped ? 'equipped' : ''}"
                 style="border-color:${gradeInfo.border};background:${gradeInfo.bg};"
                 onclick="${owned ? `toggleSkill(${skill.id})` : `buySkill(${skill.id})`}">
                <div class="skill-header">
                    <span class="skill-name" style="color:${gradeInfo.color};">${skill.name}</span>
                    <span style="font-size:11px;padding:2px 6px;border-radius:8px;background:${gradeInfo.border};color:${gradeInfo.color};">${skill.grade}</span>
                    <span class="skill-type">${skill.type}</span>
                </div>
                <div class="skill-effect">${skill.effect}${owned && level > 1 ? ` (Lv.${level})` : ''}</div>
                <div class="skill-desc">${skill.desc}</div>
                ${actionHtml}
                ${upgradeHtml}
            </div>
        `;
    }).join('');
}

function getSkillUpgradeCost(skill, level) {
    return Math.floor(skill.cost * Math.pow(1.5, level - 1));
}

function upgradeSkill(skillId) {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill) return;
    const level = playerData.skillLevels[skillId] || 1;
    if (level >= 10) return;

    const cost = getSkillUpgradeCost(skill, level);
    if (playerData.spiritStones < cost) {
        showMessage('灵石不足！', 'fail');
        return;
    }

    playerData.spiritStones -= cost;
    playerData.skillLevels[skillId] = level + 1;
    showMessage(`「${skill.name}」升级至 Lv.${level + 1}！效果+10%`, 'success');
    createFloatingText('功法升级!', 'purple');
    if (window.audioManager) audioManager.play('click');
    renderSkills();
    updateUI();
    saveGame();
}

function buySkill(skillId) {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill || playerData.ownedSkills.includes(skillId)) return;

    if (playerData.spiritStones < skill.cost) {
        showMessage('灵石不够!', 'fail');
        return;
    }

    playerData.spiritStones -= skill.cost;
    playerData.ownedSkills.push(skillId);
    playerData.skillLevels[skillId] = 1;

    showMessage(`获得「${skill.name}」(${skill.grade})！`, 'success');
    createFloatingText('获得功法!', 'purple');
    if (window.audioManager) audioManager.play('click');

    updateUI();
    renderSkills();
    saveGame();
}

function toggleSkill(skillId) {
    const maxSlots = REALMS[playerData.realm - 1].skillSlots;
    const index = playerData.equippedSkills.indexOf(skillId);

    if (index > -1) {
        playerData.equippedSkills.splice(index, 1);
    } else if (playerData.equippedSkills.length < maxSlots) {
        playerData.equippedSkills.push(skillId);
    }

    renderSkills();
    saveGame();
}
