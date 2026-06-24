// ==================== cultivation.js — 修炼、突破、自动修炼 ====================

function cultivateTick() {
    const gain = getCultivationGain();
    playerData.cultivation += gain;
    playerData.stats.totalCultivation += gain;
    playerData.spirit = Math.max(0, playerData.spirit - getSpiritCost());

    updateDailyTaskProgress('cultivation', gain);

    checkBreakthroughAvailability();
    checkAchievements();

    if (playerData.equippedBeast !== null) {
        const beastExp = Math.floor(gain / 100);
        if (beastExp > 0) addBeastExp(beastExp);
    }
    checkNewStoryUnlock();
}

function getCultivationGain() {
    const baseRate = 10;
    const realmBonus = REALMS[playerData.realm - 1].speedMultiplier;

    let skillMultiplier = 1.0;
    playerData.equippedSkills.forEach(skillId => {
        const skill = SKILLS.find(s => s.id === skillId);
        if (skill && skill.multiplier) {
            skillMultiplier *= skill.multiplier;
        }
    });

    let totalTalent = playerData.talent;
    playerData.equippedSkills.forEach(skillId => {
        const skill = SKILLS.find(s => s.id === skillId);
        if (skill && skill.talentBonus) {
            totalTalent += skill.talentBonus;
        }
    });

    const artifactBonus = 1 + getArtifactCultivationBonus();
    const beastBonus = 1 + getBeastCultivationBonus();

    return Math.floor(baseRate * realmBonus * skillMultiplier * totalTalent * artifactBonus * beastBonus);
}

function getTotalComprehension() {
    let total = playerData.comprehension;

    playerData.equippedSkills.forEach(skillId => {
        const skill = SKILLS.find(s => s.id === skillId);
        if (skill && skill.comprehensionBonus) {
            total += skill.comprehensionBonus;
        }
    });

    total += playerData.tempBuffs.comprehension;

    return total;
}

function attemptBreakthrough() {
    const nextRealm = REALMS[playerData.realm];

    if (!nextRealm || playerData.cultivation < nextRealm.requiredCultivation) {
        showMessage('修为不足!', 'fail');
        return;
    }

    const successRate = calculateBreakthroughSuccessRate();
    const isSuccess = Math.random() * 100 < successRate;

    if (isSuccess) {
        playerData.realm++;
        playerData.cultivation = 0;
        playerData.failedBreakthroughs = 0;
        playerData.maxSpirit = 100 + playerData.realm * 10;

        showMessage(`恭喜突破至${REALMS[playerData.realm - 1].name}!`, 'success');
        createFloatingText('突破成功!', 'purple');

        playerData.spiritStones += playerData.realm * 100;
        playerData.stats.totalSpiritStones += playerData.realm * 100;
        checkAchievements();
        updateDailyTaskProgress('breakthrough', 1);
    } else {
        playerData.cultivation = Math.floor(playerData.cultivation * 0.8);
        playerData.failedBreakthroughs++;

        showMessage(`突破失败!损失20%修为,道心-5%`, 'fail');
        createFloatingText('突破失败', 'red');
    }

    updateUI();
    saveGame();
}

function calculateBreakthroughSuccessRate() {
    const baseRate = 50;
    const realmPenalty = playerData.realm * 5;
    const comprehensionBonus = getTotalComprehension() * 10;
    const daoHeartBonus = playerData.failedBreakthroughs * 5;
    const pillBonus = playerData.tempBuffs.breakthrough;

    const rate = baseRate - realmPenalty + comprehensionBonus + daoHeartBonus + pillBonus;
    return Math.max(10, Math.min(90, rate));
}

function checkBreakthroughAvailability() {
    const nextRealm = REALMS[playerData.realm];
    const btn = document.getElementById('breakthroughBtn');

    if (nextRealm && playerData.cultivation >= nextRealm.requiredCultivation) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}
