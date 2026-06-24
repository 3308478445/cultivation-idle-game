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

        // ==================== 成就系统 ====================

        // 检查所有成就
        function checkAchievements() {
            ACHIEVEMENTS.forEach(ach => {
                // 已解锁则跳过
                if (playerData.achievements.includes(ach.id)) return;
                // 检查条件
                if (ach.condition(playerData)) {
                    playerData.achievements.push(ach.id);
                    pendingAchievements.push(ach);
                    applyAchievementReward(ach);
                }
            });
            // 显示通知
            if (pendingAchievements.length > 0) {
                showAchievementNotification();
            }
        }

        // 应用成就奖励
        function applyAchievementReward(ach) {
            if (ach.reward.spiritStones) {
                playerData.spiritStones += ach.reward.spiritStones;
            }
            if (ach.reward.pill) {
                const pillId = ach.reward.pill.id;
                const count = ach.reward.pill.count;
                playerData.inventory[pillId] = (playerData.inventory[pillId] || 0) + count;
            }
        }

        // 显示成就通知(栈式动画)
        function showAchievementNotification() {
            if (pendingAchievements.length === 0) return;
            const ach = pendingAchievements.shift();

            const notification = document.createElement('div');
            notification.className = 'achievement-notification';
            notification.innerHTML = `
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-title">成就解锁!</div>
                    <div class="achievement-name">${ach.name}</div>
                </div>
            `;
            document.body.appendChild(notification);

            // 3秒后移除
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 500);
            }, 3000);

            // 递归显示下一个
            if (pendingAchievements.length > 0) {
                setTimeout(showAchievementNotification, 3500);
            }
        }

        // 渲染成就列表
        function renderAchievements() {
            const container = document.getElementById('achievementsList');
            if (!container) return;

            const unlocked = playerData.achievements.length;
            const total = ACHIEVEMENTS.length;

            // 统计各类别
            const categories = {
                cultivation: { name: '修炼', icon: '📈', unlocked: 0, total: 0 },
                breakthrough: { name: '境界', icon: '🔮', unlocked: 0, total: 0 },
                pills: { name: '丹药', icon: '💊', unlocked: 0, total: 0 },
                encounter: { name: '奇遇', icon: '📜', unlocked: 0, total: 0 },
                wealth: { name: '财富', icon: '💰', unlocked: 0, total: 0 }
            };

            ACHIEVEMENTS.forEach(ach => {
                categories[ach.category].total++;
                if (playerData.achievements.includes(ach.id)) {
                    categories[ach.category].unlocked++;
                }
            });

            container.innerHTML = `
                <div class="achievement-summary">
                    <div class="achievement-progress">
                        <span class="progress-text">已解锁 ${unlocked}/${total}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(unlocked/total*100).toFixed(1)}%"></div>
                        </div>
                    </div>
                </div>
                <div class="achievement-categories">
                    ${Object.values(categories).map(cat => `
                        <div class="category-badge">
                            <span>${cat.icon} ${cat.name}</span>
                            <span>${cat.unlocked}/${cat.total}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="achievement-list">
                    ${ACHIEVEMENTS.map(ach => {
                        const isUnlocked = playerData.achievements.includes(ach.id);
                        let rewardText = '';
                        if (ach.reward.spiritStones) rewardText = `+${ach.reward.spiritStones}灵石`;
                        if (ach.reward.pill) rewardText = `+${ach.reward.pill.count}个${PILLS.find(p=>p.id===ach.reward.pill.id)?.name || '丹药'}`;
                        return `
                            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                                <div class="achievement-icon">${ach.icon}</div>
                                <div class="achievement-info">
                                    <div class="achievement-name">${ach.name}</div>
                                    <div class="achievement-desc">${ach.desc}</div>
                                    ${rewardText ? `<div class="achievement-reward">奖励: ${rewardText}</div>` : ''}
                                </div>
                                <div class="achievement-status">${isUnlocked ? '✅' : '🔒'}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // ==================== 法宝系统 ====================
        
        // 渲染法宝界面
        function renderArtifact() {
            renderEquippedArtifacts();
            renderArtifactInventory();
            renderArtifactMaterials();
            renderArtifactShop();
        }

        // 渲染炼器材料
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

        // 购买随机炼器材料
        function buyRandomMaterial() {
            const cost = 50;
            if (playerData.spiritStones < cost) {
                showToast('灵石不足!');
                return;
            }
            // 随机给一种材料
            const weights = [50, 30, 15, 4, 1]; // 玄铁50%,灵银30%,天金15%,仙玉4%,混沌石1%
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

        // ==================== 灵兽系统 ====================
        
        // 渲染灵兽界面
        function renderBeast() {
            renderBeastHouse();
            renderBeastShop();
        }

        // 渲染灵兽小屋
        function renderBeastHouse() {
            const container = document.getElementById('beastHouse');
            if (playerData.ownedBeasts.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">还没有灵兽,去野外捕捉吧!</div>';
                return;
            }
            let html = '';
            playerData.ownedBeasts.forEach(owned => {
                const beast = SPIRIT_BEASTS.find(b => b.id === owned.beastId);
                const isActive = playerData.equippedBeast === owned.beastId;
                const expForNext = getBeastExpForLevel(owned.level + 1, beast);
                const expProgress = expForNext > 0 ? Math.floor((owned.exp / expForNext) * 100) : 100;
                const affectionLevel = getBeastAffectionLevel(owned.affection);
                const effectDesc = getBeastEffectDesc(beast, owned.level, affectionLevel.effect);
                const rarityColor = beast.rarity === 'legend' ? 'var(--gold)' : 
                                   beast.rarity === 'epic' ? 'var(--purple)' : 
                                   beast.rarity === 'rare' ? 'var(--blue)' : 'var(--text-primary)';
                html += `<div class="beast-card" ${isActive ? 'style="border:2px solid var(--gold);background:rgba(255,215,0,0.1);"' : ''}>
                    <div class="beast-icon">${beast.icon}</div>
                    <div class="beast-info">
                        <div class="beast-name" style="color:${rarityColor}">${owned.name || beast.name}</div>
                        <div class="beast-level">等级 ${owned.level}/${beast.maxLevel} | ${beast.rarity.toUpperCase()} | 好感: ${affectionLevel.name}</div>
                        <div class="beast-desc">${beast.desc}</div>
                        <div class="beast-effect">${effectDesc}</div>
                        ${owned.level < beast.maxLevel ? `
                        <div class="beast-exp-bar">
                            <div class="beast-exp-fill" style="width:${expProgress}%;"></div>
                        </div>
                        <div style="font-size:10px;color:var(--text-secondary);">经验: ${owned.exp}/${expForNext}</div>
                        ` : '<div style="font-size:10px;color:var(--gold);">已达满级!</div>'}
                    </div>
                    <div class="beast-action-btns">
                        ${isActive ? 
                            '<span style="font-size:11px;color:var(--gold);">战斗中</span>' :
                            `<button class="btn btn-small" onclick="setActiveBeast(${owned.beastId})">出战</button>`
                        }
                        <button class="btn btn-small" onclick="feedBeast(${owned.beastId})" style="padding:4px 8px;font-size:11px;">🍼好感</button>
                    </div>
                </div>`;
            });
            container.innerHTML = html;
        }

        // 获取灵兽升级所需经验
        function getBeastExpForLevel(level, beast) {
            return Math.floor(beast.baseExp * Math.pow(beast.expToLevel / 10, level - 1));
        }

        // 获取灵兽好感度等级
        function getBeastAffectionLevel(affection) {
            for (let i = BEAST_AFFECTION_LEVELS.length - 1; i >= 0; i--) {
                if (affection >= BEAST_AFFECTION_LEVELS[i].threshold) {
                    return BEAST_AFFECTION_LEVELS[i];
                }
            }
            return BEAST_AFFECTION_LEVELS[0];
        }

        // 获取灵兽效果描述
        function getBeastEffectDesc(beast, level, affectionMult) {
            const base = beast.baseEffect;
            const levelBonus = 1 + (level - 1) * 0.1;
            const total = affectionMult * levelBonus;
            let desc = '';
            if (base.type === 'cultivationSpeed') desc = `修炼速度 +${Math.round((base.value * total) * 100)}%`;
            else if (base.type === 'spiritRegen') desc = `灵气回复 +${Math.round((base.value * total) * 100)}%`;
            else if (base.type === 'maxSpirit') desc = `灵气上限 +${Math.round((base.value * total) * 100)}%`;
            else if (base.type === 'breakthroughBonus') desc = `突破成功率 +${Math.round((base.value * total) * 100)}%`;
            else if (base.type === 'talent') desc = `资质 +${(base.value * total).toFixed(2)}`;
            else if (base.type === 'comprehension') desc = `悟性 +${(base.value * total).toFixed(2)}`;
            else if (base.type === 'attack') desc = `攻击 +${Math.round(base.value * total)}`;
            if (base.spiritRegen) desc += ` | 灵气回复 +${Math.round((base.spiritRegen * total) * 100)}%`;
            return desc;
        }

        // 出战灵兽
        function setActiveBeast(beastId) {
            const owned = playerData.ownedBeasts.find(o => o.beastId === beastId);
            if (!owned) return;
            playerData.equippedBeast = beastId;
            showToast(`${(owned.name || SPIRIT_BEASTS.find(b => b.id === beastId).name)} 开始出战!`);
            renderBeastHouse();
        }

        // 喂养灵兽(增加好感度)
        function feedBeast(beastId) {
            const owned = playerData.ownedBeasts.find(o => o.beastId === beastId);
            if (!owned) return;
            const affectionLevel = getBeastAffectionLevel(owned.affection);
            if (affectionLevel.level >= BEAST_AFFECTION_LEVELS.length) {
                showToast('好感度已达最高!');
                return;
            }
            const cost = 20;
            if (playerData.spiritStones < cost) {
                showToast('灵石不足!(需要20灵石)');
                return;
            }
            playerData.spiritStones -= cost;
            owned.affection += 10;
            const newLevel = getBeastAffectionLevel(owned.affection);
            showToast(`好感度 +10! 好感等级: ${newLevel.name}`);
            renderBeastHouse();
            updateUI();
        }

        // 灵兽获得经验
        function addBeastExp(amount) {
            if (playerData.equippedBeast === null) return;
            const owned = playerData.ownedBeasts.find(o => o.beastId === playerData.equippedBeast);
            if (!owned) return;
            const beast = SPIRIT_BEASTS.find(b => b.id === owned.beastId);
            if (owned.level >= beast.maxLevel) return; // 满级不获得经验
            owned.exp += amount;
            // 检查升级
            const expForNext = getBeastExpForLevel(owned.level + 1, beast);
            if (owned.exp >= expForNext) {
                owned.level++;
                owned.exp -= expForNext;
                showToast(`${owned.name || beast.name} 升级到 Lv.${owned.level}!`);
            }
        }

        // 获取灵兽加成(修炼)
        function getBeastCultivationBonus() {
            if (playerData.equippedBeast === null) return 0;
            const owned = playerData.ownedBeasts.find(o => o.beastId === playerData.equippedBeast);
            if (!owned) return 0;
            const beast = SPIRIT_BEASTS.find(b => b.id === owned.beastId);
            const affectionLevel = getBeastAffectionLevel(owned.affection);
            const levelBonus = 1 + (owned.level - 1) * 0.1;
            const mult = affectionLevel.effect * levelBonus;
            return (beast.baseEffect.value || 0) * mult;
        }

        // 进入野外
        function goWildBeast() {
            const cost = 50;
            if (playerData.spirit < cost) {
                showToast('灵气不足!(需要50灵气)');
                return;
            }
            playerData.spirit -= cost;
            // 随机遇到一只灵兽
            const weights = { normal: 50, rare: 35, epic: 12, legend: 3 };
            const total = Object.values(weights).reduce((a, b) => a + b, 0);
            let rand = Math.random() * total;
            let rarity = 'normal';
            for (const [r, w] of Object.entries(weights)) {
                rand -= w;
                if (rand <= 0) { rarity = r; break; }
            }
            const beastsOfRarity = SPIRIT_BEASTS.filter(b => b.rarity === rarity);
            currentWildBeast = beastsOfRarity[Math.floor(Math.random() * beastsOfRarity.length)];
            // 计算捕捉成功率
            const baseChance = { normal: 60, rare: 40, epic: 25, legend: 15 }[rarity];
            const comprehensionBonus = Math.floor((playerData.comprehension - 1) * 20);
            const captureChance = Math.min(85, baseChance + comprehensionBonus);
            // 显示弹窗
            document.getElementById('wildBeastIcon').textContent = currentWildBeast.icon;
            document.getElementById('wildBeastName').textContent = currentWildBeast.name;
            document.getElementById('wildBeastInfo').textContent = `等级 1 | ${currentWildBeast.rarity.toUpperCase()}`;
            document.getElementById('wildBeastDesc').textContent = currentWildBeast.desc;
            document.getElementById('captureChance').textContent = captureChance + '%';
            document.getElementById('captureProgressBar').style.width = captureChance + '%';
            document.getElementById('beastCaptureModal').style.display = 'flex';
            renderBeastShop();
            updateUI();
        }

        // 尝试捕捉
        function attemptCapture() {
            if (!currentWildBeast) return;
            const cost = 100;
            if (playerData.spiritStones < cost) {
                showToast('灵石不足!(需要100灵石)');
                return;
            }
            playerData.spiritStones -= cost;
            // 计算成功率
            const baseChance = { normal: 60, rare: 40, epic: 25, legend: 15 }[currentWildBeast.rarity];
            const comprehensionBonus = Math.floor((playerData.comprehension - 1) * 20);
            const captureChance = Math.min(85, baseChance + comprehensionBonus);
            // 判定
            const roll = Math.random() * 100;
            if (roll < captureChance) {
                // 捕捉成功
                const owned = {
                    beastId: currentWildBeast.id,
                    level: 1,
                    exp: 0,
                    affection: 0,
                    name: ''
                };
                playerData.ownedBeasts.push(owned);
                showToast(`捕捉成功! 获得 ${currentWildBeast.icon} ${currentWildBeast.name}!`);
                closeBeastModal();
                renderBeastHouse();
            } else {
                showToast('捕捉失败!...灵兽逃跑了!');
                closeBeastModal();
            }
        }

        // 关闭捕捉弹窗
        function closeBeastModal() {
            document.getElementById('beastCaptureModal').style.display = 'none';
            currentWildBeast = null;
        }

        // 购买灵兽
        function buyBeast(beastId) {
            const beast = SPIRIT_BEASTS.find(b => b.id === beastId);
            if (!beast) return;
            if (playerData.ownedBeasts.find(o => o.beastId === beastId)) {
                showToast('你已拥有此灵兽!');
                return;
            }
            if (playerData.spiritStones < beast.price) {
                showToast('灵石不足!');
                return;
            }
            playerData.spiritStones -= beast.price;
            playerData.ownedBeasts.push({
                beastId: beastId,
                level: 1,
                exp: 0,
                affection: 20,
                name: ''
            });
            showToast(`购买成功! 获得 ${beast.icon} ${beast.name}!`);
            renderBeastHouse();
            renderBeastShop();
            updateUI();
        }

        // 渲染灵兽商店
        function renderBeastShop() {
            const container = document.getElementById('beastShop');
            let html = '';
            SPIRIT_BEASTS.forEach(beast => {
                const owned = playerData.ownedBeasts.find(o => o.beastId === beast.id);
                const canBuy = !owned && playerData.spiritStones >= beast.price;
                const rarityColor = beast.rarity === 'legend' ? 'var(--gold)' : 
                                   beast.rarity === 'epic' ? 'var(--purple)' : 
                                   beast.rarity === 'rare' ? 'var(--blue)' : 'var(--text-primary)';
                html += `<div class="beast-card">
                    <div class="beast-icon">${beast.icon}</div>
                    <div class="beast-info">
                        <div class="beast-name" style="color:${rarityColor}">${beast.name}</div>
                        <div class="beast-level">${beast.rarity.toUpperCase()} | 最高${beast.maxLevel}级</div>
                        <div class="beast-desc">${beast.desc}</div>
                        <div class="beast-effect">${getBeastEffectDesc(beast, 1, 1.0)}</div>
                    </div>
                    <div>
                        ${owned ? 
                            '<span style="font-size:11px;color:var(--green);">已拥有</span>' :
                            `<button class="btn btn-small btn-primary" onclick="buyBeast(${beast.id})" ${canBuy ? '' : 'disabled'}>
                                ${beast.price}灵石
                            </button>`
                        }
                    </div>
                </div>`;
            });
            container.innerHTML = html;
        }

        // ==================== 洞府系统 ====================
        
        // 渲染洞府界面
        function renderCave() {
            renderCaveInfo();
            renderHerbGarden();
            renderCaveUpgrades();
        }

        // 渲染洞府信息
        function renderCaveInfo() {
            const caveLevel = getCaveLevel();
            document.getElementById('caveLevel').textContent = `Lv.${caveLevel.level}`;
            document.getElementById('caveProsperity').textContent = playerData.caveProsperity;
            const nextLevel = CAVE_LEVELS[caveLevel.level] || CAVE_LEVELS[CAVE_LEVELS.length - 1];
            const expNeeded = nextLevel.expRequired;
            document.getElementById('caveExp').textContent = playerData.caveExp;
            document.getElementById('caveExpMax').textContent = expNeeded;
            const progress = Math.min(100, Math.floor((playerData.caveExp / expNeeded) * 100));
            document.getElementById('caveExpBar').style.width = progress + '%';
            const alchemyBonus = caveLevel.alchemyBonus * (1 + (playerData.caveUpgrades.alchemy_furnace - 1) * 0.1);
            document.getElementById('alchemyEfficiency').textContent = `${Math.round(alchemyBonus * 100)}% 效率`;
            document.getElementById('herbCount').textContent = playerData.herbs;
        }

        function getCaveLevel() {
            let level = 1;
            for (let i = CAVE_LEVELS.length - 1; i >= 0; i--) {
                if (playerData.caveExp >= CAVE_LEVELS[i].expRequired) {
                    level = i + 1;
                    break;
                }
            }
            return { level, config: CAVE_LEVELS[level - 1] };
        }

        function addCaveExp(amount) {
            playerData.caveExp += amount;
            playerData.caveProsperity += Math.floor(amount / 10);
            const caveLevel = getCaveLevel();
            const oldMaxPlots = CAVE_LEVELS[caveLevel.level - 2]?.maxPlots || 2;
            const newMaxPlots = caveLevel.config.maxPlots;
            if (newMaxPlots > oldMaxPlots) {
                showToast(`洞府升级到 Lv.${caveLevel.level}! 获得新地块!`);
                while (playerData.cavePlots.length < newMaxPlots) {
                    playerData.cavePlots.push({ herbId: null, plantedAt: null, readyAt: null, herbLevel: 1 });
                }
            }
        }

        function renderHerbGarden() {
            const container = document.getElementById('herbGarden');
            const caveLevel = getCaveLevel();
            let html = '';
            playerData.cavePlots.forEach((plot, idx) => {
                if (plot.herbId === null) {
                    html += `<div class="herb-plot-card" style="opacity:0.6;">
                        <div class="herb-plot-icon">⬜</div>
                        <div class="herb-plot-info">
                            <div class="herb-plot-name">空地块 #${idx + 1}</div>
                            <div class="herb-plot-status">点击种植灵草</div>
                        </div>
                        <div><button class="btn btn-small" onclick="plantHerb(${idx})">🌱 种植</button></div>
                    </div>`;
                } else {
                    const herb = HERBS.find(h => h.id === plot.herbId);
                    const now = Date.now();
                    const remaining = Math.max(0, plot.readyAt - now);
                    const isReady = remaining === 0;
                    const progress = Math.min(100, 100 - (remaining / (herb.growTime * 1000)) * 100);
                    html += `<div class="herb-plot-card" ${isReady ? 'style="border:2px solid var(--gold);"' : ''}>
                        <div class="herb-plot-icon">${isReady ? '✨' : herb.icon}</div>
                        <div class="herb-plot-info">
                            <div class="herb-plot-name" style="color:${herb.color}">${herb.name}</div>
                            <div class="herb-plot-status">${isReady ? '<span style="color:var(--gold);">✓ 可收获!</span>' : `生长中... ${Math.ceil(remaining/1000)}秒`}</div>
                            ${!isReady ? `<div class="herb-plot-progress"><div class="progress-bar" style="height:4px;"><div class="progress-fill" style="width:${progress}%;background:${herb.color};"></div></div></div>` : ''}
                        </div>
                        <div>${isReady ? `<button class="btn btn-small btn-primary" onclick="harvestHerb(${idx})">收获</button>` : '<span style="font-size:11px;color:var(--text-secondary);">等待中</span>'}</div>
                    </div>`;
                }
            });
            container.innerHTML = html;
            const buyBtn = document.getElementById('buyPlotBtn');
            if (playerData.cavePlots.length >= caveLevel.config.maxPlots) {
                buyBtn.textContent = `已达上限 (${caveLevel.config.maxPlots}块)`;
                buyBtn.disabled = true;
                buyBtn.style.opacity = '0.5';
            } else {
                buyBtn.textContent = `开垦新地块 (200灵石)`;
                buyBtn.disabled = false;
                buyBtn.style.opacity = '1';
            }
        }

        function plantHerb(plotIdx) {
            const plot = playerData.cavePlots[plotIdx];
            if (plot.herbId !== null) { showToast('已有灵草!'); return; }
            const herb = HERBS[0];
            const now = Date.now();
            plot.herbId = herb.id;
            plot.plantedAt = now;
            plot.readyAt = now + herb.growTime * 1000;
            plot.herbLevel = 1;
            showToast(`种植了 ${herb.icon} ${herb.name}!`);
            renderHerbGarden();
            if (!window.herbInterval) window.herbInterval = setInterval(checkHerbs, 1000);
        }

        function harvestHerb(plotIdx) {
            const plot = playerData.cavePlots[plotIdx];
            if (plot.herbId === null) return;
            const herb = HERBS.find(h => h.id === plot.herbId);
            const herbGardenBonus = 1 + (playerData.caveUpgrades.herb_garden - 1) * 0.1;
            const amount = Math.floor(herb.cultivation * herbGardenBonus);
            playerData.cultivation += amount;
            playerData.herbs++;
            playerData.stats.totalCultivation += amount;
            addCaveExp(10);
            showToast(`收获 ${herb.icon} ${herb.name}! +${amount}修为!`);
            plot.herbId = null; plot.plantedAt = null; plot.readyAt = null;
            renderHerbGarden(); renderCaveInfo(); checkAchievements(); updateUI();
        }

        function checkHerbs() {
            const now = Date.now();
            let changed = false;
            playerData.cavePlots.forEach(plot => {
                if (plot.herbId !== null && plot.readyAt !== null && now >= plot.readyAt) changed = true;
            });
            if (changed) renderHerbGarden();
        }

        function buyHerbPlot() {
            const cost = 200;
            if (playerData.spiritStones < cost) { showToast('灵石不足!'); return; }
            const caveLevel = getCaveLevel();
            if (playerData.cavePlots.length >= caveLevel.config.maxPlots) { showToast('已达上限!'); return; }
            playerData.spiritStones -= cost;
            playerData.cavePlots.push({ herbId: null, plantedAt: null, readyAt: null, herbLevel: 1 });
            addCaveExp(20);
            showToast('开垦了新地块!');
            renderHerbGarden(); updateUI();
        }

        function renderCaveUpgrades() {
            const container = document.getElementById('caveUpgrade');
            let html = '';
            CAVE_UPGRADES.forEach(upgrade => {
                const currentLevel = playerData.caveUpgrades[upgrade.id] || 1;
                const isMax = currentLevel >= upgrade.maxLevel;
                const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, currentLevel - 1));
                const canUpgrade = !isMax && playerData.spiritStones >= cost;
                html += `<div class="cave-upgrade-card">
                    <div class="cave-upgrade-icon">${upgrade.icon}</div>
                    <div class="cave-upgrade-info">
                        <div class="cave-upgrade-name">${upgrade.name}</div>
                        <div class="cave-upgrade-desc">${upgrade.desc}</div>
                        <div class="cave-upgrade-level">${isMax ? '已满级' : `Lv.${currentLevel} -> ${upgrade.effectDesc(currentLevel + 1)}`}</div>
                    </div>
                    <div>${isMax ? '<span style="font-size:11px;color:var(--gold);">满级</span>' :
                        `<button class="btn btn-small btn-primary" onclick="upgradeCave('${upgrade.id}')" ${canUpgrade?'':'disabled'}>${cost}灵石</button>`}</div>
                </div>`;
            });
            container.innerHTML = html;
        }

        function upgradeCave(upgradeId) {
            const upgrade = CAVE_UPGRADES.find(u => u.id === upgradeId);
            if (!upgrade) return;
            const currentLevel = playerData.caveUpgrades[upgradeId] || 1;
            if (currentLevel >= upgrade.maxLevel) { showToast('已满级!'); return; }
            const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, currentLevel - 1));
            if (playerData.spiritStones < cost) { showToast('灵石不足!'); return; }
            playerData.spiritStones -= cost;
            playerData.caveUpgrades[upgradeId]++;
            addCaveExp(cost / 10);
            showToast(`${upgrade.icon} ${upgrade.name} 升级到 Lv.${currentLevel + 1}!`);
            renderCaveUpgrades(); renderCaveInfo(); updateUI();
        }

        function alchemyQuickRefine() {
            if (playerData.herbs < 3) { showToast('灵草不足!(需要3个灵草)'); return; }
            playerData.herbs -= 3;
            const caveLevel = getCaveLevel();
            const alchemyBonus = caveLevel.alchemyBonus * (1 + (playerData.caveUpgrades.alchemy_furnace - 1) * 0.1);
            const pillPool = PILLS.filter(p => p.quality === 'normal' || p.quality === 'good');
            const pill = pillPool[Math.floor(Math.random() * pillPool.length)];
            playerData.inventory[pill.id] = (playerData.inventory[pill.id] || 0) + 1;
            addCaveExp(15);
            showToast(`炼制成功! 获得 ${pill.icon} ${pill.name}!`);
            renderCaveInfo(); updateUI();
        }

        function getCaveSpiritBonus() {
            const caveLevel = getCaveLevel();
            const spiritPoolBonus = (playerData.caveUpgrades.spirit_pool - 1) * 0.05;
            return caveLevel.config.spiritBonus + spiritPoolBonus;
        }

        function getCaveSpiritStoneBonus() {
            return (playerData.caveUpgrades.treasure_room - 1) * 0.08;
        }

        // ==================== 剧情系统 ====================
        
        // 渲染剧情界面
        function renderStory() {
            renderCurrentRealmStory();
            renderStoryList();
        }

        // 渲染当前境界剧情
        function renderCurrentRealmStory() {
            const container = document.getElementById('currentRealmStory');
            const currentRealm = REALMS[playerData.realm];
            const story = REALM_STORIES.find(s => s.realmId === playerData.realm + 1) || REALM_STORIES[REALM_STORIES.length - 1];
            const isRead = playerData.readStories.includes(story.realmId);
            const isUnlocked = playerData.cultivation >= story.unlockCultivation;
            
            if (!isUnlocked) {
                container.innerHTML = `
                    <div style="text-align:center;padding:15px;">
                        <div style="font-size:40px;margin-bottom:8px;opacity:0.3;">🔒</div>
                        <div style="font-size:14px;color:var(--text-secondary);">境界未到,剧情未解锁</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">${story.progressHint}</div>
                    </div>
                `;
                return;
            }

            let actionBtn = '';
            if (!isRead) {
                actionBtn = `<button class="btn btn-primary" onclick="readStory(${story.realmId})" style="margin-top:10px;">📖 阅读剧情</button>`;
            } else {
                actionBtn = `<button class="btn" onclick="readStory(${story.realmId})" style="margin-top:10px;">📜 重温剧情</button>`;
            }

            container.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                    <div style="font-size:36px;">${story.icon}</div>
                    <div>
                        <div style="font-size:14px;font-weight:bold;color:var(--gold);">${story.title}</div>
                        <div style="font-size:12px;color:var(--text-secondary);">${story.subtitle} · ${isRead ? '<span style="color:var(--green);">已阅读</span>' : '<span style="color:var(--cyan);">未阅读</span>'}</div>
                    </div>
                </div>
                <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;margin-bottom:8px;">
                    ${story.story.replace(/\n/g, '<br>')}
                </div>
                ${actionBtn}
            `;
        }

        // 渲染剧情列表
        function renderStoryList() {
            const container = document.getElementById('storyList');
            const progress = document.getElementById('storyProgress');
            const unlockedCount = REALM_STORIES.filter(s => playerData.cultivation >= s.unlockCultivation).length;
            progress.textContent = `(${unlockedCount}/${REALM_STORIES.length} 已解锁)`;
            
            let html = '';
            REALM_STORIES.forEach((story, idx) => {
                const isUnlocked = playerData.cultivation >= story.unlockCultivation;
                const isRead = playerData.readStories.includes(story.realmId);
                const isCurrent = playerData.realm + 1 === story.realmId;
                
                if (!isUnlocked) {
                    html += `<div class="story-chapter-card" style="opacity:0.4;cursor:default;">
                        <div class="story-chapter-icon">🔒</div>
                        <div class="story-chapter-info">
                            <div class="story-chapter-title">第${idx + 1}章</div>
                            <div class="story-chapter-desc">${story.desc} · ${story.subtitle}</div>
                            <div class="story-chapter-progress">需 ${story.unlockCultivation.toLocaleString()} 修为解锁</div>
                        </div>
                        <div class="story-chapter-badge">⏳</div>
                    </div>`;
                } else {
                    const cardClass = isCurrent ? 'current' : (isRead ? 'unlocked' : '');
                    const badge = isCurrent ? '🔥' : (isRead ? '✅' : '📜');
                    const clickAction = isRead ? 
                        `onclick="showStoryModal(${story.realmId})"` : 
                        `onclick="readStory(${story.realmId})"`;
                    html += `<div class="story-chapter-card ${cardClass}" ${clickAction}>
                        <div class="story-chapter-icon">${story.icon}</div>
                        <div class="story-chapter-info">
                            <div class="story-chapter-title">${story.title} ${isCurrent ? '<span style="color:var(--red);font-size:10px;">当前</span>' : ''}</div>
                            <div class="story-chapter-desc">${story.desc} · ${isRead ? '<span style="color:var(--green);">已阅读</span>' : '<span style="color:var(--cyan);">未阅读</span>'}</div>
                            ${isRead ? '<div class="story-chapter-progress">点击重温</div>' : '<div class="story-chapter-progress">点击阅读</div>'}
                        </div>
                        <div class="story-chapter-badge">${badge}</div>
                    </div>`;
                }
            });
            container.innerHTML = html;
        }

        // 阅读剧情
        function readStory(realmId) {
            const story = REALM_STORIES.find(s => s.realmId === realmId);
            if (!story) return;
            if (!playerData.readStories.includes(realmId)) {
                playerData.readStories.push(realmId);
                // 阅读剧情奖励
                const rewardCultivation = Math.floor(story.unlockCultivation * 0.05) || 100;
                playerData.cultivation += rewardCultivation;
                playerData.stats.totalCultivation += rewardCultivation;
                showToast(`📖 阅读剧情奖励: +${rewardCultivation}修为!`);
            }
            showStoryModal(realmId);
            checkAchievements();
            updateUI();
        }

        // 显示剧情弹窗
        function showStoryModal(realmId) {
            const story = REALM_STORIES.find(s => s.realmId === realmId);
            if (!story) return;
            const container = document.getElementById('encounterModal');
            const content = container.querySelector('.encounter-modal-content');
            content.style.maxWidth = '500px';
            document.getElementById('encounterIcon').textContent = story.icon;
            document.getElementById('encounterTitle').textContent = story.title;
            document.getElementById('encounterDesc').innerHTML = `<div style="font-size:13px;line-height:1.8;color:var(--text-primary);text-align:justify;">${story.story.replace(/\n\n/g, '<br><br>')}</div>`;
            document.getElementById('encounterEffect').textContent = story.subtitle + ' · ' + story.desc;
            const btn = document.getElementById('encounterModal').querySelector('.encounter-modal-btn');
            btn.textContent = '关闭';
            btn.onclick = closeEncounterModal;
            container.style.display = 'flex';
        }

        // 检查是否解锁新剧情
        function checkNewStoryUnlock() {
            REALM_STORIES.forEach(story => {
                if (playerData.cultivation >= story.unlockCultivation && !playerData.readStories.includes(story.realmId)) {
                    // 新剧情解锁提示
                    const prevUnlocked = REALM_STORIES.some(s => 
                        s.unlockCultivation < story.unlockCultivation && 
                        playerData.cultivation >= s.unlockCultivation
                    );
                    if (prevUnlocked || story.unlockCultivation === 0) {
                        showToast(`📜 新章节解锁: ${story.icon} ${story.title}!`);
                    }
                }
            });
        }

        // 渲染已装备法宝
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

        // 选择法宝装备
        function selectArtifactToEquip(slot) {
            if (playerData.ownedArtifacts.length === 0) {
                showToast('你还没有法宝,先去商店购买吧!');
                return;
            }
            // 过滤掉已装备的
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

        // 卸下法宝
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

        // 渲染法宝背包
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

        // 获取法宝升级消耗
        function getArtifactUpgradeCost(artifact, level) {
            const multiplier = Math.pow(1.5, level - 1);
            return {
                spiritStones: Math.floor(artifact.upgradeCost.spiritStones * multiplier),
                materials: Math.floor(artifact.upgradeCost.materials * multiplier)
            };
        }

        // 获取法宝总修炼加成
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

        // 升级法宝
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

        // 渲染法宝商店
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

        // 购买法宝
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

        // 购买炼器材料
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

        // ==================== 宗门系统 ====================
        
        // 渲染宗门界面
        function renderSect() {
            const hasSect = playerData.sectId !== null;
            document.getElementById('sectInfo').style.display = hasSect ? 'block' : 'none';
            document.getElementById('sectNoSect').style.display = hasSect ? 'none' : 'block';
            
            if (hasSect) {
                // 有宗门
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
                // 无宗门
                renderSectList();
            }
        }

        // 获取宗门信息
        function getSectById(sectId) {
            return PREDEFINED_SECTS.find(s => s.id === sectId);
        }

        // 渲染宗门列表
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

        // 加入宗门
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

        // 创建宗门
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
            
            // 创建自定义宗门
            const newSect = {
                id: 'custom_' + Date.now(),
                name: name,
                level: 1,
                memberCount: 1,
                desc: '玩家创建的宗门',
                isCustom: true
            };
            
            // 添加到宗门列表
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

        // 离开宗门
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

        // 渲染宗门商店
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

        // 购买宗门物品
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
            
            // 应用效果
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

        // 渲染每日任务
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

        // 检查每日任务重置
        function checkDailyTasksReset() {
            const today = getToday();
            if (playerData.sectLastResetDate !== today) {
                playerData.sectDailyTasks = {};
                playerData.sectContribToday = 0;
                playerData.sectLastResetDate = today;
            }
        }

        // 领取每日任务奖励
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

        // 获取今日日期字符串
        function getToday() {
            const now = new Date();
            return `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
        }

        // 更新每日任务进度（由游戏循环调用）
        function updateDailyTaskProgress(type, value) {
            if (playerData.sectId === null) return;
            checkDailyTasksReset();
            
            DAILY_TASKS.forEach(task => {
                if (task.type === type) {
                    playerData.sectDailyTasks[task.id] = (playerData.sectDailyTasks[task.id] || 0) + value;
                }
            });
        }

        // 游戏主循环
        function startGameLoop() {
            if (gameInterval) clearInterval(gameInterval);

            gameInterval = setInterval(() => {
                // 灵气恢复
                if (playerData.spirit < playerData.maxSpirit) {
                    playerData.spirit = Math.min(
                        playerData.maxSpirit,
                        playerData.spirit + getSpiritRecovery()
                    );
                }

                // 自动修炼
                cultivateTick();

                // 检查临时buff过期
                checkTempBuffs();

                // 检查奇遇 (每秒1%基础概率)
                checkEncounter();

                updateUI();
                saveGame();
            }, 1000);
        }

        // 检查奇遇触发
        function checkEncounter() {
            const now = Date.now();
            // 防止1分钟内重复触发
            if (now - lastEncounterTime < 60000) return;

            // 基础概率1%,境界越高概率略有提升
            const baseChance = 0.01;
            const realmBonus = playerData.realm * 0.002;
            const chance = baseChance + realmBonus;

            if (Math.random() < chance) {
                lastEncounterTime = now;
                triggerEncounter();
            }
        }

        // 触发奇遇
        function triggerEncounter() {
            // 根据权重随机选择奇遇
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

            // 显示奇遇弹窗
            showEncounterModal(selectedEncounter);
        }

        // 显示奇遇弹窗
        function showEncounterModal(encounter) {
            const modal = document.getElementById('encounterModal');
            const content = modal.querySelector('.encounter-modal-content');

            // 设置内容
            document.getElementById('encounterIcon').textContent = encounter.icon;
            document.getElementById('encounterTitle').textContent = encounter.name;
            document.getElementById('encounterDesc').textContent = encounter.desc;

            // 生成效果描述
            const effectTexts = encounter.effects.map(e => e.text).join(' | ');
            const effectEl = document.getElementById('encounterEffect');
            effectEl.textContent = effectTexts;
            effectEl.className = 'encounter-modal-effect ' +
                (encounter.category === 'disaster' ? 'negative' :
                 encounter.category === 'trial' ? 'neutral' : 'positive');

            // 根据类型设置边框颜色
            const colors = {
                opportunity: '#FFD700',
                immortal: '#9B59B6',
                treasure: '#4A90E2',
                trial: '#2ECC71',
                disaster: '#E74C3C'
            };
            content.style.borderColor = colors[encounter.category] || '#9B59B6';

            // 显示弹窗
            modal.classList.add('active');
            content.classList.add('encounter-glow');

            // 点击按钮应用效果
            const btn = modal.querySelector('.encounter-modal-btn');
            btn.onclick = () => {
                applyEncounterEffect(encounter);
                closeEncounterModal();
            };
        }

        // 应用奇遇效果
        function applyEncounterEffect(encounter) {
            // 记录到历史
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

            // 更新统计
            playerData.stats.total++;
            if (playerData.stats[encounter.category] !== undefined) {
                playerData.stats[encounter.category]++;
            }

            // 应用各项效果
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
                            playerData.stats.totalSpiritStones += effect.value; // 成就追踪
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

            // 更新奇遇界面
            renderEncounter();

            // 检查成就（奇遇成就）
            checkAchievements();
            updateDailyTaskProgress('encounter', 1); // 每日任务追踪

            // 显示消息
            const msgType = encounter.category === 'disaster' ? 'fail' :
                           encounter.category === 'trial' ? '' : 'success';
            showMessage(`触发奇遇: ${encounter.icon} ${encounter.name}`, msgType);
        }

        // 关闭奇遇弹窗
        function closeEncounterModal() {
            const modal = document.getElementById('encounterModal');
            modal.classList.remove('active');
            modal.querySelector('.encounter-modal-content').classList.remove('encounter-glow');
            // 恢复奇遇按钮
            const btn = modal.querySelector('.encounter-modal-btn');
            btn.textContent = '接受';
            btn.onclick = function() { acceptEncounter(); };
            modal.querySelector('.encounter-modal-content').style.maxWidth = '';
        }

        // 渲染奇遇界面
        function renderEncounter() {
            // 更新总数
            document.getElementById('totalEncounters').textContent = playerData.stats.total;

            // 更新统计
            document.getElementById('stat_opportunity').textContent = playerData.stats.opportunity;
            document.getElementById('stat_immortal').textContent = playerData.stats.immortal;
            document.getElementById('stat_treasure').textContent = playerData.stats.treasure;
            document.getElementById('stat_trial').textContent = playerData.stats.trial;
            document.getElementById('stat_disaster').textContent = playerData.stats.disaster;

            // 更新最近奇遇历史
            const container = document.getElementById('recentEncounters');
            if (playerData.encounterHistory.length === 0) {
                container.innerHTML = '<div style="color: var(--text-secondary);">暂无奇遇记录</div>';
            } else {
                const categoryColors = {
                    opportunity: '#FFD700',
                    immortal: '#9B59B6',
                    treasure: '#4A90E2',
                    trial: '#2ECC71',
                    disaster: '#E74C3C'
                };

                container.innerHTML = playerData.encounterHistory.slice(0, 20).map(record => {
                    const time = new Date(record.time);
                    const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
                    return `
                        <div class="encounter-history-item" style="border-left: 3px solid ${categoryColors[record.category] || '#9B59B6'}; padding-left: 8px;">
                            <div>${record.icon} ${record.name}</div>
                            <div class="encounter-time">${timeStr} | ${record.effectsApplied.join(', ')}</div>
                        </div>
                    `;
                }).join('');
            }
        }

        function cultivateTick() {
            const gain = getCultivationGain();
            playerData.cultivation += gain;
            playerData.stats.totalCultivation += gain; // 成就追踪
            playerData.spirit = Math.max(0, playerData.spirit - getSpiritCost());
            
            // 每日任务进度
            updateDailyTaskProgress('cultivation', gain);

            checkBreakthroughAvailability();
            checkAchievements(); // 检查成就
            // 灵兽获得经验(每获得100修为,灵兽获得1经验)
            if (playerData.equippedBeast !== null) {
                const beastExp = Math.floor(gain / 100);
                if (beastExp > 0) addBeastExp(beastExp);
            }
            // 剧情解锁检查
            checkNewStoryUnlock();
        }

        // 获取修为增益(包含功法加成)
        function getCultivationGain() {
            const baseRate = 10;
            const realmBonus = REALMS[playerData.realm - 1].speedMultiplier;

            // 功法加成
            let skillMultiplier = 1.0;
            playerData.equippedSkills.forEach(skillId => {
                const skill = SKILLS.find(s => s.id === skillId);
                if (skill && skill.multiplier) {
                    skillMultiplier *= skill.multiplier;
                }
            });

            // 资质加成(包含永久提升)
            let totalTalent = playerData.talent;
            playerData.equippedSkills.forEach(skillId => {
                const skill = SKILLS.find(s => s.id === skillId);
                if (skill && skill.talentBonus) {
                    totalTalent += skill.talentBonus;
                }
            });

            // 法宝加成
            const artifactBonus = 1 + getArtifactCultivationBonus();
            // 灵兽加成
            const beastBonus = 1 + getBeastCultivationBonus();

            return Math.floor(baseRate * realmBonus * skillMultiplier * totalTalent * artifactBonus * beastBonus);
        }

        // 获取悟性(包含功法和临时buff)
        function getTotalComprehension() {
            let total = playerData.comprehension;

            // 功法加成
            playerData.equippedSkills.forEach(skillId => {
                const skill = SKILLS.find(s => s.id === skillId);
                if (skill && skill.comprehensionBonus) {
                    total += skill.comprehensionBonus;
                }
            });

            // 临时buff
            total += playerData.tempBuffs.comprehension;

            return total;
        }

        function getSpiritCost() {
            return playerData.realm;
        }

        function getSpiritRecovery() {
            const caveSpiritBonus = getCaveSpiritBonus();
            const beastSpiritRegen = getBeastSpiritRegenBonus();
            const base = 5 + playerData.realm;
            return Math.floor(base * (1 + caveSpiritBonus + beastSpiritRegen));
        }

        // 获取灵兽灵气回复加成
        function getBeastSpiritRegenBonus() {
            if (playerData.equippedBeast === null) return 0;
            const owned = playerData.ownedBeasts.find(o => o.beastId === playerData.equippedBeast);
            if (!owned) return 0;
            const beast = SPIRIT_BEASTS.find(b => b.id === owned.beastId);
            if (!beast.baseEffect.spiritRegen) return 0;
            const affectionLevel = getBeastAffectionLevel(owned.affection);
            const levelBonus = 1 + (owned.level - 1) * 0.1;
            return beast.baseEffect.spiritRegen * affectionLevel.effect * levelBonus;
        }

        // 突破
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
                playerData.stats.totalSpiritStones += playerData.realm * 100; // 成就追踪
                checkAchievements(); // 检查境界成就
                updateDailyTaskProgress('breakthrough', 1); // 每日任务追踪
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

        // 功法系统
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

        // 丹药系统
        function renderPills() {
            const container = document.getElementById('pillsList');

            container.innerHTML = PILLS.map(pill => {
                const count = playerData.inventory[pill.id] || 0;

                return `
                    <div class="pill-card ${count === 0 ? 'empty' : ''}"
                         onclick="${count > 0 ? `usePill(${pill.id})` : ''}">
                        <div class="pill-header">
                            <span class="pill-name">${pill.name}</span>
                            <span class="pill-count">×${count}</span>
                        </div>
                        <div class="pill-effect">${pill.effect}</div>
                        <div class="pill-desc">${pill.desc}</div>
                    </div>
                `;
            }).join('');
        }

        function usePill(pillId) {
            const pill = PILLS.find(p => p.id === pillId);
            if (!pill || !playerData.inventory[pillId]) return;

            playerData.inventory[pillId]--;

            // 应用效果
            if (pill.cultivationBonus) {
                playerData.cultivation += pill.cultivationBonus;
                createFloatingText(`+${pill.cultivationBonus} 修为`, 'gold');
            }

            if (pill.tempComprehension) {
                playerData.tempBuffs.comprehension += pill.tempComprehension;
                setTimeout(() => {
                    playerData.tempBuffs.comprehension -= pill.tempComprehension;
                    updateUI();
                }, pill.duration * 1000);
                showMessage(`悟性临时提升${pill.tempComprehension},持续${Math.floor(pill.duration / 60)}分钟`, 'success');
            }

            if (pill.permanentTalent) {
                playerData.talent += pill.permanentTalent;
                showMessage(`资质永久提升${pill.permanentTalent}!`, 'success');
                createFloatingText('资质提升!', 'green');
            }

            if (pill.breakthroughBonus) {
                playerData.tempBuffs.breakthrough += pill.breakthroughBonus;
                showMessage(`下一次突破成功率+${pill.breakthroughBonus}%`, 'success');
            }

            // 成就追踪
            playerData.stats.pillsUsed++;
            if (pill.cultivationBonus) {
                playerData.stats.totalCultivation += pill.cultivationBonus;
            }
            checkAchievements();
            updateDailyTaskProgress('pill', 1); // 每日任务追踪

            updateUI();
            renderPills();
            saveGame();
        }

        // 商店系统
        function renderShop() {
            const container = document.getElementById('shopList');

            document.getElementById('shopSpiritStones').textContent = formatNumber(playerData.spiritStones);

            container.innerHTML = SHOP_ITEMS.map(item => {
                return `
                    <div class="shop-item" onclick="buyShopItem(${item.id})">
                        <div class="shop-item-header">
                            <span class="shop-item-name">${item.name}</span>
                            <span class="shop-item-price">${item.price} 灵石</span>
                        </div>
                        <div class="shop-item-desc">${item.desc}</div>
                    </div>
                `;
            }).join('');
        }

        function buyShopItem(itemId) {
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            if (!item) return;

            if (playerData.spiritStones < item.price) {
                showMessage('灵石不够!', 'fail');
                return;
            }

            playerData.spiritStones -= item.price;
            playerData.stats.totalSpiritStones += item.price; // 成就追踪
            
            if (item.type === 'pill') {
                playerData.inventory[item.itemId] = (playerData.inventory[item.itemId] || 0) + 1;
                showMessage(`购买成功!`, 'success');
            } else if (item.type === 'skill') {
                if (!playerData.ownedSkills.includes(item.itemId)) {
                    playerData.ownedSkills.push(item.itemId);
                    showMessage(`获得新功法!`, 'success');
                } else {
                    showMessage('已拥有该功法,购买无效退款', 'fail');
                    playerData.spiritStones += item.price;
                }
            }

            updateUI();
            renderShop();
            saveGame();
        }

        // 辅助函数
        function checkBreakthroughAvailability() {
            const nextRealm = REALMS[playerData.realm];
            const btn = document.getElementById('breakthroughBtn');

            if (nextRealm && playerData.cultivation >= nextRealm.requiredCultivation) {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        }

        function checkTempBuffs() {
            // 临时buff通过setTimeout自动清除
        }

        function toggleAutoCultivate() {
            playerData.autoCultivate = !playerData.autoCultivate;
            document.getElementById('autoToggle').classList.toggle('active', playerData.autoCultivate);
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

        function calculateOfflineReward() {
            const now = Date.now();
            const offlineTime = Math.min(24 * 60 * 60 * 1000, now - playerData.lastOnlineTime);
            const offlineSeconds = Math.floor(offlineTime / 1000);

            if (offlineSeconds > 60) {
                const offlineGain = Math.floor(getCultivationGain() * offlineSeconds * 0.5);
                playerData.cultivation += offlineGain;

                showMessage(`离线${formatTime(offlineSeconds)},获得${formatNumber(offlineGain)}修为`, 'success');
            }

            playerData.lastOnlineTime = now;
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
            el.style.color = color === 'gold' ? '#FFD700' :
                            color === 'purple' ? '#9B59B6' :
                            color === 'green' ? '#2ECC71' : '#E74C3C';
            el.style.left = Math.random() * 300 + 100 + 'px';
            el.style.top = '300px';
            document.body.appendChild(el);

            setTimeout(() => el.remove(), 1000);
        }

        function formatNumber(num) {
            if (num >= 10000) {
                return (num / 10000).toFixed(1) + '万';
            }
            return num.toLocaleString();
        }

        function formatTime(seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            if (h > 0) return `${h}小时${m}分钟`;
            return `${m}分钟`;
        }

        function saveGame() {
            playerData.lastOnlineTime = Date.now();
            localStorage.setItem('cultivationGame', JSON.stringify(playerData));
        }

        // 导出存档为 JSON 文件
        function exportSave() {
            saveGame(); // 先保存本地
            const saveData = JSON.stringify(playerData, null, 2);
            const blob = new Blob([saveData], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            // 文件名包含时间和境界信息
            const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神'];
            const realmName = realmNames[playerData.realm - 1] || '未知';
            const filename = `修仙存档_${realmName}境_${formatTimeShort(Date.now())}.json`;
            
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            
            showMessage('存档已导出！记得保存好文件', 'success');
        }

        // 辅助函数：格式化时间用于文件名
        function formatTimeShort(timestamp) {
            const d = new Date(timestamp);
            const Y = d.getFullYear();
            const M = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const h = String(d.getHours()).padStart(2, '0');
            const m = String(d.getMinutes()).padStart(2, '0');
            return `${Y}${M}${day}_${h}${m}`;
        }

        // 导入存档从 JSON 文件
        function importSave() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = event => {
                    try {
                        const data = JSON.parse(event.target.result);
                        
                        // 简单验证：检查是否有必要字段
                        if (!data.realm || data.cultivation === undefined) {
                            showMessage('存档文件无效！', 'fail');
                            return;
                        }
                        
                        // 合并数据，保留新版本可能新增的字段
                        playerData = {...playerData, ...data};
                        saveGame();
                        
                        const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神'];
                        const realmName = realmNames[playerData.realm - 1] || '未知';
                        showMessage(`已恢复存档！境界: ${realmName}境`, 'success');
                        
                        // 刷新界面
                        location.reload();
                    } catch (err) {
                        showMessage('导入失败：文件格式错误', 'fail');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        }

        function loadGame() {
            const saved = localStorage.getItem('cultivationGame');
            if (saved) {
                const loaded = JSON.parse(saved);
                playerData = { ...playerData, ...loaded };

                // 版本兼容
                if (!playerData.inventory) playerData.inventory = {};
                if (!playerData.tempBuffs) playerData.tempBuffs = { comprehension: 0, breakthrough: 0 };
                // 奇遇系统兼容
                if (!playerData.encounterHistory) playerData.encounterHistory = [];
                if (!playerData.stats) playerData.stats = {
                    total: 0,
                    opportunity: 0,
                    immortal: 0,
                    treasure: 0,
                    trial: 0,
                    disaster: 0
                };
            }
        }

        // 启动游戏
        init();