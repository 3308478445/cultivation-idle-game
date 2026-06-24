// 游戏配置
        const REALMS = [
            { id: 1, name: '炼气境', requiredCultivation: 0, speedMultiplier: 1.0, skillSlots: 1 },
            { id: 2, name: '筑基境', requiredCultivation: 1000, speedMultiplier: 1.5, skillSlots: 2 },
            { id: 3, name: '金丹境', requiredCultivation: 5000, speedMultiplier: 2.0, skillSlots: 3 },
            { id: 4, name: '元婴境', requiredCultivation: 25000, speedMultiplier: 3.0, skillSlots: 4 },
            { id: 5, name: '化神境', requiredCultivation: 100000, speedMultiplier: 5.0, skillSlots: 5 }
        ];

        const SKILLS = [
            { id: 1, name: '吐纳术', type: '被动', effect: '修炼速度+10%', multiplier: 1.1, cost: 100, desc: '最基础的吐纳之法,引导天地灵气入体' },
            { id: 2, name: '引气诀', type: '被动', effect: '修炼速度+20%', multiplier: 1.2, cost: 300, desc: '引导灵气更快涌入丹田' },
            { id: 3, name: '凝神诀', type: '被动', effect: '修炼速度+30%', multiplier: 1.3, cost: 800, desc: '在周天形成小型灵气漩涡' },
            { id: 4, name: '灵台清明', type: '被动', effect: '悟性+0.2', comprehensionBonus: 0.2, cost: 500, desc: '保持灵台清明,提升悟性' },
            { id: 5, name: '炼体诀', type: '被动', effect: '资质+0.1', talentBonus: 0.1, cost: 600, desc: '锤炼肉身,提升资质' }
        ];

        const PILLS = [
            { id: 1, name: '聚气丹', effect: '修为+100', cultivationBonus: 100, cost: 50, desc: '蕴含纯净灵气的聚气丹' },
            { id: 2, name: '涤神丹', effect: '悟性临时+0.5(5分钟)', tempComprehension: 0.5, duration: 300, cost: 100, desc: '暂时提升悟性的丹药' },
            { id: 3, name: '洗髓丹', effect: '资质永久+0.05', permanentTalent: 0.05, cost: 500, desc: '洗髓伐毛,提升先天资质' },
            { id: 4, name: '筑基丹', effect: '突破成功率+10%', breakthroughBonus: 10, cost: 200, desc: '辅助筑基的反哺丹药' },
            { id: 5, name: '悟道丹', effect: '修为+500', cultivationBonus: 500, cost: 300, desc: '借道悟道,收益颇丰' }
        ];

        const SHOP_ITEMS = [
            { id: 1, name: '聚气丹', price: 50, type: 'pill', itemId: 1, desc: '修为+100' },
            { id: 2, name: '吐纳术', price: 100, type: 'skill', itemId: 1, desc: '修炼速度+10%' },
            { id: 3, name: '涤神丹', price: 100, type: 'pill', itemId: 2, desc: '悟性临时+0.5' },
            { id: 4, name: '筑基丹', price: 200, type: 'pill', itemId: 4, desc: '突破成功率+10%' },
            { id: 5, name: '引气诀', price: 300, type: 'skill', itemId: 2, desc: '修炼速度+20%' }
        ];

        // 奇遇数据 - 15个奇遇事件
        const ENCOUNTERS = [
            // 机缘类 (34%)
            { id: 1, name: '仙人指路', category: 'opportunity', icon: '🌟', weight: 12,
              desc: '一位白发仙人出现在梦中,指点你修炼之道',
              effects: [
                { type: 'cultivation', value: 500, text: '修为 +500' },
                { type: 'comprehension_temp', value: 0.3, duration: 180, text: '悟性临时 +0.3 (3分钟)' }
              ] },
            { id: 2, name: '天降灵雨', category: 'opportunity', icon: '🌧️', weight: 11,
              desc: '一场蕴含浓郁灵气的灵雨降临,你沐浴其中',
              effects: [
                { type: 'cultivation', value: 300, text: '修为 +300' },
                { type: 'spirit', value: 50, text: '灵气 +50' }
              ] },
            { id: 3, name: '上古传承', category: 'opportunity', icon: '📜', weight: 11,
              desc: '你在一处遗迹中获得上古修士的修炼心得',
              effects: [
                { type: 'cultivation', value: 800, text: '修为 +800' },
                { type: 'skill', value: 'random', text: '随机获得一门功法' }
              ] },

            // 遇仙类 (27%)
            { id: 4, name: '药老赠丹', category: 'immortal', icon: '🧙', weight: 9,
              desc: '一位炼丹宗师路过,赐予你一瓶珍贵的丹药',
              effects: [
                { type: 'pill', pillId: 1, count: 3, text: '聚气丹 x3' },
                { type: 'cultivation', value: 100, text: '修为 +100' }
              ] },
            { id: 5, name: '剑仙指点', category: 'immortal', icon: '⚔️', weight: 9,
              desc: '一位剑道宗师见你天资不错,指点你剑道奥秘',
              effects: [
                { type: 'cultivation', value: 200, text: '修为 +200' },
                { type: 'spiritStones', value: 100, text: '灵石 +100' }
              ] },
            { id: 6, name: '散仙遗府', category: 'immortal', icon: '🏯', weight: 9,
              desc: '你发现了一处散仙遗留的洞府,获得其部分遗产',
              effects: [
                { type: 'spiritStones', value: 300, text: '灵石 +300' },
                { type: 'talent', value: 0.05, text: '资质永久 +0.05' }
              ] },

            // 寻宝类 (17%)
            { id: 7, name: '灵泉涌动', category: 'treasure', icon: '💧', weight: 6,
              desc: '你发现一处隐秘灵泉,泉水蕴含丰富灵气',
              effects: [
                { type: 'cultivation', value: 150, text: '修为 +150' },
                { type: 'spirit', value: 30, text: '灵气 +30' }
              ] },
            { id: 8, name: '灵石矿脉', category: 'treasure', icon: '💎', weight: 6,
              desc: '你意外发现一条小型灵石矿脉,收获颇丰',
              effects: [
                { type: 'spiritStones', value: 80, text: '灵石 +80' },
                { type: 'cultivation', value: 50, text: '修为 +50' }
              ] },
            { id: 9, name: '灵草园', category: 'treasure', icon: '🌿', weight: 5,
              desc: '你发现一片灵草园,采得几株珍稀灵草',
              effects: [
                { type: 'pill', pillId: 5, count: 1, text: '悟道丹 x1' },
                { type: 'cultivation', value: 80, text: '修为 +80' }
              ] },

            // 历练类 (10%)
            { id: 10, name: '悟道片刻', category: 'trial', icon: '🧘', weight: 4,
              desc: '修炼中忽有所悟,进入短暂的悟道状态',
              effects: [
                { type: 'cultivation', value: 100, text: '修为 +100' },
                { type: 'comprehension_temp', value: 0.2, duration: 120, text: '悟性临时 +0.2 (2分钟)' }
              ] },
            { id: 11, name: '突破瓶颈', category: 'trial', icon: '🔓', weight: 3,
              desc: '你感到修炼瓶颈松动,坚持下去必有所获',
              effects: [
                { type: 'cultivation', value: 200, text: '修为 +200' }
              ] },
            { id: 12, name: '灵气充沛', category: 'trial', icon: '✨', weight: 3,
              desc: '此处灵气格外充沛,修炼效率提升',
              effects: [
                { type: 'cultivation', value: 80, text: '修为 +80' },
                { type: 'spirit', value: 20, text: '灵气 +20' }
              ] },

            // 灾难类 (12%)
            { id: 13, name: '妖兽袭击', category: 'disaster', icon: '👹', weight: 5,
              desc: '一只妖兽突然袭击,虽然击退但受了轻伤',
              effects: [
                { type: 'cultivation', value: -100, text: '修为 -100' },
                { type: 'spirit', value: -20, text: '灵气 -20' }
              ] },
            { id: 14, name: '心魔入侵', category: 'disaster', weight: 4,
              icon: '😈', desc: '修炼时心魔入侵,扰乱心神',
              effects: [
                { type: 'cultivation', value: -150, text: '修为 -150' },
                { type: 'comprehension', value: -0.1, duration: 300, text: '悟性临时 -0.1 (5分钟)' }
              ] },
            { id: 15, name: '走火入魔', category: 'disaster', icon: '💀', weight: 3,
              desc: '修炼方法有误,差点走火入魔',
              effects: [
                { type: 'cultivation', value: -200, text: '修为 -200' },
                { type: 'spirit', value: -30, text: '灵气 -30' }
              ] }
        ];

        // ==================== 宗门系统数据 ====================
        
        // 宗门列表（预设）
        const PREDEFINED_SECTS = [
            { id: 'sect_1', name: '太虚仙宗', level: 5, memberCount: 128, desc: '传承万年的正道巨擘' },
            { id: 'sect_2', name: '天魔宫', level: 4, memberCount: 89, desc: '魔道第一势力' },
            { id: 'sect_3', name: '青云门', level: 3, memberCount: 256, desc: '中土第一仙门' },
            { id: 'sect_4', name: '万剑宗', level: 3, memberCount: 67, desc: '剑道宗门' },
            { id: 'sect_5', name: '百花谷', level: 2, memberCount: 45, desc: '专注丹药与灵植' },
            { id: 'sect_6', name: '散修联盟', level: 1, memberCount: 1024, desc: '散修互助组织' }
        ];

        // 宗门商店物品
        const SECT_SHOP_ITEMS = [
            { id: 'sect_pill_1', name: '聚元丹', desc: '修为 +500', price: 200, priceType: 'contrib', 
              effect: { type: 'cultivation', value: 500 } },
            { id: 'sect_pill_2', name: '筑基丹', desc: '突破成功率 +20%', price: 500, priceType: 'contrib',
              effect: { type: 'breakthrough', value: 20 } },
            { id: 'sect_pill_3', name: '培婴丹', desc: '资质 +0.1', price: 800, priceType: 'contrib',
              effect: { type: 'talent', value: 0.1 } },
            { id: 'sect_item_1', name: '灵气符', desc: '灵气恢复速度 +50% (10分钟)', price: 100, priceType: 'contrib',
              effect: { type: 'spiritBoost', duration: 600 } },
            { id: 'sect_item_2', name: '悟道茶', desc: '悟性 +2 (30分钟)', price: 150, priceType: 'contrib',
              effect: { type: 'comprehension', value: 2, duration: 1800 } }
        ];

        // 每日任务
        const DAILY_TASKS = [
            { id: 'task_cultivate', name: '修炼', desc: '修炼1000修为', icon: '📿', 
              target: 1000, type: 'cultivation', reward: { contrib: 50, spiritStones: 30 } },
            { id: 'task_breakthrough', name: '突破', desc: '完成一次突破', icon: '⚡',
              target: 1, type: 'breakthrough', reward: { contrib: 100, spiritStones: 50 } },
            { id: 'task_encounter', name: '奇遇', desc: '触发2次奇遇', icon: '🌟',
              target: 2, type: 'encounter', reward: { contrib: 30, spiritStones: 20 } },
            { id: 'task_pill', name: '炼丹', desc: '使用3颗丹药', icon: '💊',
              target: 3, type: 'pill', reward: { contrib: 40, spiritStones: 25 } }
        ];

        // 成就数据 - 12个成就
        const ACHIEVEMENTS = [
            // 修炼成就
            { id: 'first_cultivate', name: '初入修仙', desc: '首次修炼', icon: '🎮', category: 'cultivation',
              reward: { spiritStones: 50 }, condition: (pd) => pd.stats.totalCultivation >= 1 },
            { id: 'cultivate_1k', name: '初窥门径', desc: '累计修炼1000修为', icon: '📈', category: 'cultivation',
              reward: { spiritStones: 100 }, condition: (pd) => pd.stats.totalCultivation >= 1000 },
            { id: 'cultivate_10k', name: '修炼达人', desc: '累计修炼10000修为', icon: '🏆', category: 'cultivation',
              reward: { spiritStones: 300 }, condition: (pd) => pd.stats.totalCultivation >= 10000 },
            { id: 'cultivate_100k', name: '一代宗师', desc: '累计修炼100000修为', icon: '🌟', category: 'cultivation',
              reward: { spiritStones: 1000 }, condition: (pd) => pd.stats.totalCultivation >= 100000 },
            // 境界成就
            { id: 'breakthrough_2', name: '炼气初期', desc: '突破到炼气2层', icon: '🔮', category: 'breakthrough',
              reward: { spiritStones: 80 }, condition: (pd) => pd.realm >= 2 },
            { id: 'breakthrough_5', name: '炼气后期', desc: '突破到炼气5层', icon: '💫', category: 'breakthrough',
              reward: { spiritStones: 200 }, condition: (pd) => pd.realm >= 5 },
            { id: 'breakthrough_10', name: '筑基成功', desc: '突破到筑基期', icon: '⚡', category: 'breakthrough',
              reward: { pill: { id: 1, count: 3 } }, condition: (pd) => pd.realm >= 10 },
            // 丹药成就
            { id: 'first_pill', name: '初尝丹药', desc: '首次使用丹药', icon: '💊', category: 'pills',
              reward: { spiritStones: 30 }, condition: (pd) => pd.stats.pillsUsed >= 1 },
            { id: 'pills_10', name: '丹道入门', desc: '使用10次丹药', icon: '🧪', category: 'pills',
              reward: { pill: { id: 2, count: 2 } }, condition: (pd) => pd.stats.pillsUsed >= 10 },
            // 奇遇成就
            { id: 'first_encounter', name: '初遇奇缘', desc: '首次触发奇遇', icon: '📜', category: 'encounter',
              reward: { spiritStones: 50 }, condition: (pd) => pd.encounterHistory.length >= 1 },
            { id: 'encounter_10', name: '奇遇连连', desc: '触发10次奇遇', icon: '🎲', category: 'encounter',
              reward: { spiritStones: 200 }, condition: (pd) => pd.encounterHistory.length >= 10 },
            // 财富成就
            { id: 'spiritStones_1k', name: '小有积蓄', desc: '累计获得1000灵石', icon: '💰', category: 'wealth',
              reward: { spiritStones: 100 }, condition: (pd) => pd.stats.totalSpiritStones >= 1000 },
        ];

        // 法宝数据
        const ARTIFACTS = [
            // 攻击型法宝
            { id: 1, name: '青云剑', type: 'attack', icon: '⚔️', rarity: 'rare',
              desc: '青云门镇派之宝,剑气如虹', 
              effects: { cultivationBonus: 0.1, attack: 15 },
              price: 500, upgradeCost: { spiritStones: 200, materials: 5 } },
            { id: 2, name: '烈焰珠', type: 'attack', icon: '🔥', rarity: 'epic',
              desc: '蕴含天火之力,焚尽万物',
              effects: { cultivationBonus: 0.15, attack: 25 },
              price: 1000, upgradeCost: { spiritStones: 400, materials: 10 } },
            { id: 3, name: '天魔钟', type: 'attack', icon: '🔔', rarity: 'legend',
              desc: '天魔宫至宝,魔音贯耳',
              effects: { cultivationBonus: 0.25, attack: 50 },
              price: 3000, upgradeCost: { spiritStones: 1000, materials: 25 } },
            // 防御型法宝
            { id: 4, name: '玄武甲', type: 'defense', icon: '🛡️', rarity: 'rare',
              desc: '上古玄武龟甲,坚不可摧',
              effects: { maxSpiritBonus: 0.2, defense: 10 },
              price: 400, upgradeCost: { spiritStones: 150, materials: 4 } },
            { id: 5, name: '金刚罩', type: 'defense', icon: '💎', rarity: 'epic',
              desc: '佛门金刚法相,万邪不侵',
              effects: { maxSpiritBonus: 0.35, defense: 20, breakthroughBonus: 0.1 },
              price: 800, upgradeCost: { spiritStones: 350, materials: 8 } },
            { id: 6, name: '太极图', type: 'defense', icon: '☯️', rarity: 'legend',
              desc: '阴阳太极,万物归一',
              effects: { maxSpiritBonus: 0.5, defense: 40, breakthroughBonus: 0.2 },
              price: 2500, upgradeCost: { spiritStones: 800, materials: 20 } },
            // 辅助型法宝
            { id: 7, name: '聚灵阵', type: 'support', icon: '🔮', rarity: 'rare',
              desc: '聚集天地灵气,事半功倍',
              effects: { spiritRegen: 0.2, cultivationBonus: 0.05 },
              price: 300, upgradeCost: { spiritStones: 100, materials: 3 } },
            { id: 8, name: '悟道碑', type: 'support', icon: '📜', rarity: 'epic',
              desc: '记载无上道法,助悟天地',
              effects: { comprehensionBonus: 0.3, cultivationBonus: 0.1 },
              price: 700, upgradeCost: { spiritStones: 300, materials: 7 } },
            { id: 9, name: '东皇钟', type: 'support', icon: '🔔', rarity: 'legend',
              desc: '上古天庭至宝,时间静止',
              effects: { cultivationBonus: 0.3, spiritRegen: 0.5, talentBonus: 0.1 },
              price: 5000, upgradeCost: { spiritStones: 2000, materials: 50 } },
        ];

        // 炼器材料（用于法宝升级）
        const ARTIFACT_MATERIALS = [
            { id: 1, name: '玄铁', icon: '🔩', price: 50, desc: '基础炼器材料' },
            { id: 2, name: '灵银', icon: '🥈', price: 100, desc: '进阶炼器材料' },
            { id: 3, name: '天金', icon: '🥇', price: 300, desc: '高级炼器材料' },
            { id: 4, name: '仙玉', icon: '💠', price: 500, desc: '珍稀炼器材料' },
            { id: 5, name: '混沌石', icon: '🌌', price: 1000, desc: '传说级材料' },
        ];

        // 灵兽数据
        const SPIRIT_BEASTS = [
            // 普通灵兽
            { id: 1, name: '小狐狸', type: 'normal', icon: '🦊', rarity: 'normal',
              desc: '灵动可爱的小狐狸', baseEffect: { type: 'spiritRegen', value: 0.1 },
              price: 200, captureCost: 50, baseExp: 50, expToLevel: 30, maxLevel: 5 },
            { id: 2, name: '野狼', type: 'normal', icon: '🐺', rarity: 'normal',
              desc: '速度极快的野狼', baseEffect: { type: 'cultivationSpeed', value: 0.1 },
              price: 200, captureCost: 50, baseExp: 50, expToLevel: 30, maxLevel: 5 },
            { id: 3, name: '小白兔', type: 'normal', icon: '🐰', rarity: 'normal',
              desc: '灵气充沛的灵兔', baseEffect: { type: 'maxSpirit', value: 0.15 },
              price: 180, captureCost: 40, baseExp: 40, expToLevel: 25, maxLevel: 5 },
            // 稀有灵兽
            { id: 4, name: '火凤凰', type: 'rare', icon: '🔥', rarity: 'rare',
              desc: '浴火重生的神鸟', baseEffect: { type: 'cultivationSpeed', value: 0.25 },
              price: 800, captureCost: 150, baseExp: 150, expToLevel: 50, maxLevel: 10 },
            { id: 5, name: '冰凤凰', type: 'rare', icon: '❄️', rarity: 'rare',
              desc: '寒冰之力的化身', baseEffect: { type: 'breakthroughBonus', value: 0.15 },
              price: 800, captureCost: 150, baseExp: 150, expToLevel: 50, maxLevel: 10 },
            { id: 6, name: '独角兽', type: 'rare', icon: '🦄', rarity: 'rare',
              desc: '纯洁神圣的灵兽', baseEffect: { type: 'talent', value: 0.1 },
              price: 900, captureCost: 180, baseExp: 180, expToLevel: 55, maxLevel: 10 },
            { id: 7, name: '哮天犬', type: 'rare', icon: '🐕', rarity: 'rare',
              desc: '天狗食日之神犬', baseEffect: { type: 'cultivationSpeed', value: 0.2, spiritRegen: 0.15 },
              price: 850, captureCost: 160, baseExp: 160, expToLevel: 48, maxLevel: 10 },
            // 史诗灵兽
            { id: 8, name: '九尾狐', type: 'epic', icon: '🦊', rarity: 'epic',
              desc: '九尾妖狐,魅惑众生', baseEffect: { type: 'cultivationSpeed', value: 0.35, comprehension: 0.2 },
              price: 2000, captureCost: 300, baseExp: 300, expToLevel: 80, maxLevel: 15 },
            { id: 9, name: '麒麟', type: 'epic', icon: '🦒', rarity: 'epic',
              desc: '祥瑞之兽,仁义无双', baseEffect: { type: 'breakthroughBonus', value: 0.25, talent: 0.15 },
              price: 2500, captureCost: 350, baseExp: 350, expToLevel: 90, maxLevel: 15 },
            { id: 10, name: '白虎', type: 'epic', icon: '🐯', rarity: 'epic',
              desc: '西方神兽,战无不胜', baseEffect: { type: 'attack', value: 30, cultivationSpeed: 0.25 },
              price: 2200, captureCost: 320, baseExp: 320, expToLevel: 85, maxLevel: 15 },
            // 传说灵兽
            { id: 11, name: '青龙', type: 'legend', icon: '🐉', rarity: 'legend',
              desc: '东方神兽,掌管生机', baseEffect: { type: 'cultivationSpeed', value: 0.5, maxSpirit: 0.3 },
              price: 5000, captureCost: 500, baseExp: 500, expToLevel: 120, maxLevel: 20 },
            { id: 12, name: '玄武', type: 'legend', icon: '🐢', rarity: 'legend',
              desc: '北方神兽,长寿永恒', baseEffect: { type: 'maxSpirit', value: 0.5, defense: 50, breakthroughBonus: 0.2 },
              price: 5000, captureCost: 500, baseExp: 500, expToLevel: 120, maxLevel: 20 },
            { id: 13, name: '朱雀', type: 'legend', icon: '🦅', rarity: 'legend',
              desc: '南方神兽,掌控火焰', baseEffect: { type: 'cultivationSpeed', value: 0.6, spiritRegen: 0.5 },
              price: 5500, captureCost: 550, baseExp: 550, expToLevel: 130, maxLevel: 20 },
            { id: 14, name: '鲲鹏', type: 'legend', icon: '🐋', rarity: 'legend',
              desc: '扶摇直上九万里', baseEffect: { type: 'cultivationSpeed', value: 0.7, talent: 0.2 },
              price: 6000, captureCost: 600, baseExp: 600, expToLevel: 150, maxLevel: 20 },
            { id: 15, name: '烛龙', type: 'legend', icon: '🐲', rarity: 'legend',
              desc: '开眼为昼,闭眼为夜', baseEffect: { type: 'cultivationSpeed', value: 0.8, comprehension: 0.3, breakthroughBonus: 0.3 },
              price: 8000, captureCost: 800, baseExp: 800, expToLevel: 200, maxLevel: 20 },
        ];

        // 灵兽好感度(亲密度)系统
        const BEAST_AFFECTION_LEVELS = [
            { level: 1, name: '陌生', threshold: 0, effect: 1.0 },
            { level: 2, name: '熟悉', threshold: 50, effect: 1.1 },
            { level: 3, name: '亲近', threshold: 120, effect: 1.2 },
            { level: 4, name: '友好', threshold: 250, effect: 1.35 },
            { level: 5, name: '信赖', threshold: 500, effect: 1.5 },
            { level: 6, name: '默契', threshold: 1000, effect: 1.7 },
            { level: 7, name: '灵魂', threshold: 2000, effect: 2.0 },
        ];

        // 灵兽野外遇怪配置
        let currentWildBeast = null;

        // 洞府配置
        const CAVE_LEVELS = [
            { level: 1, name: '简陋洞府', expRequired: 0, maxPlots: 2, alchemyBonus: 1.0, spiritBonus: 0.1 },
            { level: 2, name: '灵气洞府', expRequired: 100, maxPlots: 3, alchemyBonus: 1.2, spiritBonus: 0.2 },
            { level: 3, name: '灵泉洞府', expRequired: 300, maxPlots: 4, alchemyBonus: 1.4, spiritBonus: 0.3 },
            { level: 4, name: '仙灵洞府', expRequired: 800, maxPlots: 5, alchemyBonus: 1.6, spiritBonus: 0.4 },
            { level: 5, name: '洞天福地', expRequired: 2000, maxPlots: 6, alchemyBonus: 2.0, spiritBonus: 0.5 },
        ];

        const CAVE_UPGRADES = [
            { id: 'herb_garden', name: '灵草园', icon: '🌱', desc: '种植灵草,用于炼丹', maxLevel: 5, 
              baseCost: 100, costMult: 1.5, effectDesc: (lvl) => `产量 +${lvl * 10}%` },
            { id: 'alchemy_furnace', name: '炼丹炉', icon: '🔥', desc: '炼制丹药,提升炼丹效率', maxLevel: 5,
              baseCost: 150, costMult: 1.6, effectDesc: (lvl) => `效率 +${lvl * 10}%` },
            { id: 'spirit_pool', name: '聚灵阵', icon: '💧', desc: '聚集灵气,加快修炼', maxLevel: 5,
              baseCost: 200, costMult: 1.7, effectDesc: (lvl) => `灵气回复 +${lvl * 5}%` },
            { id: 'treasure_room', name: '藏宝室', icon: '💎', desc: '珍藏宝物,增加灵石获取', maxLevel: 5,
              baseCost: 250, costMult: 1.8, effectDesc: (lvl) => `灵石 +${lvl * 8}%` },
        ];

        // 灵草配置
        const HERBS = [
            { id: 1, name: '灵芝', icon: '🍄', growTime: 30, value: 30, color: 'var(--green)', 
              effect: '少量修为', cultivation: 50 },
            { id: 2, name: '雪莲', icon: '🌸', growTime: 60, value: 80, color: 'var(--cyan)',
              effect: '中等修为', cultivation: 150 },
            { id: 3, name: '人参', icon: '🌿', growTime: 120, value: 150, color: 'var(--orange)',
              effect: '大量修为', cultivation: 300 },
            { id: 4, name: '九叶青', icon: '🌾', growTime: 180, value: 300, color: 'var(--gold)',
              effect: '巨额修为', cultivation: 600 },
            { id: 5, name: '蟠桃', icon: '🍑', growTime: 300, value: 500, color: 'var(--red)',
              effect: '传说修为', cultivation: 1200 },
        ];

        // 境界剧情数据
        const REALM_STORIES = [
            {
                realmId: 1, icon: '🌬️', title: '第一章: 炼气入体',
                subtitle: '炼气境',
                desc: '开启修仙之路',
                story: '你出生于凡人世界,自幼体弱多病。一日,一位云游道人路过,见你根骨不凡,留下一枚玉简。玉简中记载着吐纳之法——"天地灵气,呼吸之间,纳为己用,凝于丹田"。\n\n你依言修炼,每日清晨对日吐纳,夜幕降临则静坐观想。渐渐地,你感到体内有一股暖流涌动,那是灵气入体的征兆。\n\n灵气在经脉中游走,如涓涓细流汇入丹田。你终于踏入了修仙的第一步——炼气境。从此,你的命运将不再平凡。',
                progressHint: '修为达到1000即可突破至筑基境',
                unlockCultivation: 0
            },
            {
                realmId: 2, icon: '🏔️', title: '第二章: 筑基凝丹',
                subtitle: '筑基境',
                desc: '打下仙道根基',
                story: '炼气境的你,每日勤修不辍。丹田中的灵气日益充盈,如同一汪泉水终于蓄满。\n\n师傅告诉你:"炼气只是引气入体,真正的修仙,从筑基开始。筑基,是将灵气凝聚成固体形态,在丹田中铸就"道基"。此基一立,方能承载更高深的功法。"\n\n你闭关三月,以雄厚灵气冲破丹田壁垒。金丹初凝的那一刻,丹田中绽放出一道金色光芒——筑基成功!\n\n从此,你正式成为修仙界的一员,能够学习更高深的功法,御剑飞行,延年益寿。',
                progressHint: '修为达到5000即可突破至金丹境',
                unlockCultivation: 1000
            },
            {
                realmId: 3, icon: '☀️', title: '第三章: 金丹大道',
                subtitle: '金丹境',
                desc: '凝聚无上金丹',
                story: '筑基境的你在修仙界已算小有所成,但你深知,这只是开始。\n\n古籍记载:"金丹,是修仙路上第一道大关。金丹品质决定未来成就——九转为最上,一转为最下。"\n\n你寻得一处灵气充沛的秘境闭关。以天地为炉,以灵气为引,以领悟为火,历经七七四十九日,丹田中那枚金丹终于大成。\n\n金丹悬于丹田之上,熠熠生辉。当你睁开眼睛时,周围的山河仿佛都清晰了几分——金丹境,你的神识与感知都有了质的飞跃。',
                progressHint: '修为达到25000即可突破至元婴境',
                unlockCultivation: 5000
            },
            {
                realmId: 4, icon: '👶', title: '第四章: 元婴化神',
                subtitle: '元婴境',
                desc: '神魂出窍,化腐朽为神奇',
                story: '金丹境的你,已是一方强者。但古籍中的记载令你神往——元婴境,神魂可以出窍,肉身可毁而元婴不灭。\n\n"元婴,是神与气的完美融合。金丹破壳,孕育元婴,此婴乃是你修仙意志的结晶。"\n\n你吞下积累多年的天材地宝,引导金丹中的能量孕育婴儿形态。数月后,一个与你一模一样的迷你人形从金丹中破壳而出——那是你的第二生命。\n\n元婴睁眼的瞬间,你的神识暴涨十倍,天地间的灵气流动尽在感知之中。从此,你的寿元大增,就算肉身毁灭,元婴仍可夺舍重生。',
                progressHint: '修为达到100000即可突破至化神境',
                unlockCultivation: 25000
            },
            {
                realmId: 5, icon: '⚡', title: '第五章: 化神飞升',
                subtitle: '化神境',
                desc: '超脱凡尘,羽化成仙',
                story: '元婴境的巅峰,你感到体内元婴与肉身已融为一体。但要真正超脱,还差最后一步——化神。\n\n"化神,是让元婴彻底融入天地大道,感知天地法则,借天地之力为己用。化神之后,便是真正的仙人。"\n\n你登上九天之巅,借九天雷霆之力洗涤自身。在雷劫的洗礼下,元婴与肉身彻底融合,化为一道璀璨的光芒直冲云霄。\n\n当光芒散去,你悬浮于九天之上,俯视着脚下的山河大地。化神境——你终于超脱了凡尘,成为了真正的仙人。',
                progressHint: '恭喜你,已成为真正的仙人!',
                unlockCultivation: 100000
            }
        ];

        // 待解锁成就队列(用于显示动画)
        let pendingAchievements = [];

        // 玩家数据
        let playerData = {
            realm: 1,
            cultivation: 0,
            spirit: 100,
            maxSpirit: 100,
            talent: 1.0,
            comprehension: 1.0,
            spiritStones: 0,
            failedBreakthroughs: 0,
            lastOnlineTime: Date.now(),
            autoCultivate: false,
            equippedSkills: [],
            ownedSkills: [],
            inventory: {}, // { pillId: count }
            tempBuffs: {
                comprehension: 0,
                breakthrough: 0
            },
            // 奇遇系统数据
            encounterHistory: [], // { id, name, category, icon, time, effectsApplied }
            stats: {
                total: 0,
                opportunity: 0,
                immortal: 0,
                treasure: 0,
                trial: 0,
                disaster: 0,
                // 成就追踪
                totalCultivation: 0,  // 累计修炼修为
                pillsUsed: 0,         // 已使用丹药次数
                totalSpiritStones: 0   // 累计获得灵石
            },
            achievements: [],  // 已解锁成就ID列表
            
            // 宗门系统数据
            sectId: null,           // 所属宗门ID
            sectContrib: 0,         // 宗门贡献
            sectContribToday: 0,    // 今日贡献
            sectDailyTasks: {},     // 每日任务进度 { taskId: count }
            sectLastResetDate: null, // 上次重置日期

            // 法宝系统数据
            ownedArtifacts: [],     // 已拥有的法宝 [{ artifactId, level, exp }]
            equippedArtifacts: [null, null, null], // 装备的法宝 [artifactId or null]
            materials: {},          // 炼器材料 { materialId: count }

            // 灵兽系统数据
            ownedBeasts: [],        // 已拥有的灵兽 [{ beastId, level, exp, affection, name }]
            equippedBeast: null,    // 当前出战的灵兽 beastId

            // 洞府系统数据
            caveExp: 0,             // 洞府经验
            caveProsperity: 0,      // 繁荣度
            cavePlots: [            // 灵草地块 [{ herbId, plantedAt, readyAt, herbLevel }]
                { herbId: null, plantedAt: null, readyAt: null, herbLevel: 1 }
            ],
            caveUpgrades: {         // 洞府升级 { upgradeId: level }
                herb_garden: 1,
                alchemy_furnace: 1,
                spirit_pool: 1,
                treasure_room: 1,
            },
            herbs: 0,               // 拥有的灵草数量

            // 剧情系统数据
            readStories: [],       // 已阅读的剧情 ID 列表
            currentStoryId: 1,     // 当前剧情章节
        };

        let gameInterval = null;
        let lastEncounterTime = 0; // 防止短时间内重复触发

        // 初始化
        function init() {
            loadGame();
            updateUI();
            renderSkills();
            renderPills();
            renderShop();
            renderEncounter();
            renderAchievements();
            calculateOfflineReward();
            startGameLoop();
        }

        // 切换标签栏