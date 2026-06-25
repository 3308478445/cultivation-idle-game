// ==================== cultivation.js — 修炼、突破、自动修炼、手动修炼 ====================

function cultivateTick() {
    const gain = getCultivationGain();
    playerData.cultivation += gain;
    playerData.stats.totalCultivation += gain;

    // 自动修炼不消耗灵气，每秒自动获得修为
    // 手动修炼的灵气消耗和双倍修为在 manualCultivate() 中处理

    updateDailyTaskProgress('cultivation', gain);

    checkSubLevelUp();
    checkBreakthroughAvailability();
    checkAchievements();

    if (playerData.equippedBeast !== null) {
        const beastExp = Math.floor(gain / 100);
        if (beastExp > 0) addBeastExp(beastExp);
    }
    checkNewStoryUnlock();
}

// 小层自动提升
function checkSubLevelUp() {
    if (playerData.subLevel < 9) {
        const needed = getSubLevelCultivation(playerData.realm, playerData.subLevel);
        if (playerData.cultivation >= needed) {
            playerData.subLevel++;
            showMessage(`修为精进！${getFullRealmName()}`, 'success');
            createFloatingText('修为精进!', 'gold');
            if (window.audioManager) audioManager.play('levelup');
            updateTaijiProgress();
        }
    }
}

function getCultivationGain() {
    const baseRate = 5; // 从10降为5
    const realmBonus = REALMS[playerData.realm - 1].speedMultiplier;

    let skillMultiplier = 1.0;
    playerData.equippedSkills.forEach(skillId => {
        const skill = SKILLS.find(s => s.id === skillId);
        if (skill && skill.multiplier) {
            const level = playerData.skillLevels[skillId] || 1;
            // 每级+10%效果
            skillMultiplier *= skill.multiplier * (1 + (level - 1) * 0.1);
        }
    });

    let totalTalent = playerData.talent;
    playerData.equippedSkills.forEach(skillId => {
        const skill = SKILLS.find(s => s.id === skillId);
        if (skill && skill.talentBonus) {
            const level = playerData.skillLevels[skillId] || 1;
            totalTalent += skill.talentBonus * (1 + (level - 1) * 0.1);
        }
    });

    const artifactBonus = 1 + getArtifactCultivationBonus();
    const beastBonus = 1 + getBeastCultivationBonus();

    // 成就永久加成
    const achBonus = playerData.achievementBonuses.cultivationSpeed || 0;

    // 主动技能增益
    let activeMultiplier = 1.0;
    for (const skillId in playerData.activeSkillBuffs) {
        const skill = SKILLS.find(s => s.id === parseInt(skillId));
        if (skill && skill.activeMultiplier) {
            activeMultiplier *= skill.activeMultiplier;
        }
    }

    return Math.floor(baseRate * realmBonus * skillMultiplier * totalTalent * artifactBonus * beastBonus * (1 + achBonus) * activeMultiplier);
}

function getTotalComprehension() {
    let total = playerData.comprehension;

    playerData.equippedSkills.forEach(skillId => {
        const skill = SKILLS.find(s => s.id === skillId);
        if (skill && skill.comprehensionBonus) {
            const level = playerData.skillLevels[skillId] || 1;
            total += skill.comprehensionBonus * (1 + (level - 1) * 0.1);
        }
    });

    total += playerData.tempBuffs.comprehension;

    // 成就永久加成
    const achBonus = playerData.achievementBonuses.comprehension || 0;
    total += achBonus;

    return total;
}

// 手动修炼
function manualCultivate() {
    if (playerData.spirit < getSpiritCost()) {
        showMessage('灵气不足！', 'fail');
        return;
    }
    const gain = getCultivationGain() * 2; // 手动修炼2倍收益
    playerData.cultivation += gain;
    playerData.stats.totalCultivation += gain;
    playerData.spirit = Math.max(0, playerData.spirit - getSpiritCost());

    if (window.audioManager) audioManager.play('cultivate');
    createFloatingText(`+${gain} 修为`, 'gold');
    checkSubLevelUp();
    checkBreakthroughAvailability();
    checkAchievements();
    updateDailyTaskProgress('cultivation', gain);
    updateUI();
    updateTaijiProgress();
    saveGame();
}

// 突破（大境界）
function attemptBreakthrough() {
    if (playerData.subLevel < 9) {
        showMessage('需先修炼至本境界9层圆满！', 'fail');
        return;
    }

    const nextRealm = REALMS[playerData.realm];
    if (!nextRealm) {
        showMessage('已达最高境界！', 'fail');
        return;
    }

    const successRate = calculateBreakthroughSuccessRate();
    const isSuccess = Math.random() * 100 < successRate;

    if (window.audioManager) audioManager.play(isSuccess ? 'breakthrough_success' : 'breakthrough_fail');

    if (isSuccess) {
        const oldRealm = playerData.realm;
        playerData.realm++;
        playerData.subLevel = 1;
        playerData.cultivation = 0;
        playerData.failedBreakthroughs = 0;
        playerData.maxSpirit = 100 + playerData.realm * 20;

        const newRealmConfig = REALMS[playerData.realm - 1];
        const tier = newRealmConfig.tier;

        // 根据境界等级给予不同奖励
        const stoneReward = getBreakthroughStoneReward(playerData.realm);
        playerData.spiritStones += stoneReward;
        playerData.stats.totalSpiritStones += stoneReward;

        // 不同 tier 的突破消息
        let breakthroughMsg = `恭喜突破至${newRealmConfig.name}！`;
        if (tier >= 4) {
            // 顶阶突破：雷劫描述
            breakthroughMsg = `⚡ 天雷散去，你突破至${newRealmConfig.name}！${getTierBreakthroughDesc(tier)}`;
        } else if (tier >= 3) {
            // 高阶突破：天地异象
            breakthroughMsg = `🌟 天地异现，你突破至${newRealmConfig.name}！${getTierBreakthroughDesc(tier)}`;
        } else if (tier >= 2) {
            breakthroughMsg = `✨ 仙光笼罩，你突破至${newRealmConfig.name}！`;
        }

        showMessage(breakthroughMsg, 'success');
        createFloatingText('突破成功!', 'purple');

        // 太极图金光爆发
        const taiji = document.getElementById('taijiContainer');
        if (taiji) {
            taiji.classList.add('taiji-burst');
            setTimeout(() => taiji.classList.remove('taiji-burst'), 2000);
        }

        // 高阶境界额外特效
        if (tier >= 3) {
            createFloatingText('天地异象!', 'gold');
            setTimeout(() => createFloatingText('灵气暴涨!', 'gold'), 500);
        }
        if (tier >= 4) {
            setTimeout(() => createFloatingText('雷劫降临!', 'red'), 300);
        }
        if (tier >= 5) {
            setTimeout(() => createFloatingText('仙光万丈!', 'gold'), 700);
        }

        showMessage(`恭喜突破至${newRealmConfig.name}！获得${formatNumber(stoneReward)}灵石`, 'success');

        checkAchievements();
        updateDailyTaskProgress('breakthrough', 1);
    } else {
        playerData.cultivation = Math.floor(playerData.cultivation * 0.7);
        playerData.failedBreakthroughs++;

        showMessage(`突破失败！损失30%修为，道心+${playerData.failedBreakthroughs * 5}%`, 'fail');
        createFloatingText('突破失败', 'red');
    }

    updateUI();
    updateTaijiProgress();
    saveGame();
}

// 根据境界 tier 获取灵石奖励
function getBreakthroughStoneReward(realm) {
    const realmConfig = REALMS[realm - 1];
    const tier = realmConfig.tier;
    // 基础奖励 = realm * 200，高 tier 额外倍率
    const base = realm * 200;
    const tierMultiplier = [1, 1, 2, 5, 10, 50][tier - 1] || 1;
    return Math.floor(base * tierMultiplier);
}

// 根据 tier 获取突破描述文本
function getTierBreakthroughDesc(tier) {
    const descs = {
        3: '天地灵气汇聚，方圆千里为之震动。',
        4: '九重天雷洗礼，你以无畏之心硬抗天劫，终成大道！',
        5: '仙界金光万丈，仙乐飘飘，你已超脱轮回，与天地同寿！'
    };
    return descs[tier] || '';
}

function calculateBreakthroughSuccessRate() {
    const realmConfig = REALMS[playerData.realm - 1];
    const baseRate = realmConfig.breakthroughRate;
    const comprehensionBonus = getTotalComprehension() * 10;
    const daoHeartBonus = playerData.failedBreakthroughs * 5;
    const pillBonus = playerData.tempBuffs.breakthrough;

    const rate = baseRate + comprehensionBonus + daoHeartBonus + pillBonus;
    return Math.max(10, Math.min(95, rate));
}

function checkBreakthroughAvailability() {
    const btn = document.getElementById('breakthroughBtn');
    if (!btn) return;

    if (playerData.subLevel >= 9 && playerData.realm < REALMS.length) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

// 使用主动技能
function useActiveSkill(skillId) {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill || skill.type !== '主动') return;
    if (!playerData.ownedSkills.includes(skillId)) return;

    const now = Date.now();
    const cooldown = playerData.activeSkillCooldowns[skillId] || 0;
    if (now < cooldown) {
        const remaining = Math.ceil((cooldown - now) / 1000);
        showMessage(`冷却中，还需${remaining}秒`, 'fail');
        return;
    }

    playerData.activeSkillBuffs[skillId] = now + skill.activeDuration * 1000;
    playerData.activeSkillCooldowns[skillId] = now + skill.cooldown * 1000;

    if (window.audioManager) audioManager.play('cultivate');
    showMessage(`「${skill.name}」已激活！${skill.activeDuration}秒内修炼速度x${skill.activeMultiplier}`, 'success');
    createFloatingText(`${skill.name}!`, 'purple');
    renderSkills();
    saveGame();
}
