// ==================== skills.js — 功法系统 ====================

function renderSkills() {
    const container = document.getElementById('skillsList');
    const maxSlots = REALMS[playerData.realm - 1].skillSlots;

    document.getElementById('skillSlots').textContent =
        `${playerData.equippedSkills.length}/${maxSlots}`;

    container.innerHTML = SKILLS.map(skill => {
        const owned = playerData.ownedSkills.includes(skill.id);
        const equipped = playerData.equippedSkills.includes(skill.id);
        const canEquip = owned && !equipped && playerData.equippedSkills.length < maxSlots;

        return `
            <div class="skill-card ${equipped ? 'equipped' : ''}"
                 onclick="${owned ? `toggleSkill(${skill.id})` : `buySkill(${skill.id})`}">
                <div class="skill-header">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-type">${skill.type}</span>
                </div>
                <div class="skill-effect">${skill.effect}</div>
                <div class="skill-desc">${skill.desc}</div>
                ${!owned ? `<div class="skill-cost">购买: ${skill.cost} 灵石</div>` :
                  (equipped ? '<div style="color: var(--green); font-size: 12px; margin-top: 6px;">已装备</div>' :
                   '<div style="color: var(--text-secondary); font-size: 12px; margin-top: 6px;">点击装配</div>')}
            </div>
        `;
    }).join('');
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

    showMessage(`获得「${skill.name}」!`, 'success');
    createFloatingText('获得功法!', 'purple');

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
