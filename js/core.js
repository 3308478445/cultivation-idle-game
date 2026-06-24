// ==================== core.js — 游戏核心：数据定义、存档、主循环 ====================

// 游戏配置 — 境界扩展：每个大境界分9小层
const REALMS = [
    { id: 1, name: '炼气境', shortName: '炼气', requiredCultivation: 0, nextRealmCultivation: 1000, speedMultiplier: 1.0, skillSlots: 1, breakthroughRate: 80 },
    { id: 2, name: '筑基境', shortName: '筑基', requiredCultivation: 1000, nextRealmCultivation: 5000, speedMultiplier: 1.5, skillSlots: 2, breakthroughRate: 70 },
    { id: 3, name: '金丹境', shortName: '金丹', requiredCultivation: 5000, nextRealmCultivation: 25000, speedMultiplier: 2.0, skillSlots: 3, breakthroughRate: 60 },
    { id: 4, name: '元婴境', shortName: '元婴', requiredCultivation: 25000, nextRealmCultivation: 100000, speedMultiplier: 3.0, skillSlots: 4, breakthroughRate: 50 },
    { id: 5, name: '化神境', shortName: '化神', requiredCultivation: 100000, nextRealmCultivation: 999999999, speedMultiplier: 5.0, skillSlots: 5, breakthroughRate: 40 }
];

// 小层修为需求计算 — 指数级增长
function getSubLevelCultivation(realmId, subLevel) {
    const realm = REALMS.find(r => r.id === realmId);
    if (!realm) return 0;
    if (subLevel >= 9) return realm.nextRealmCultivation;
    // 每小层需要的修为：基础 * (1.5^subLevel)
    const base = realm.requiredCultivation;
    const nextBase = realm.nextRealmCultivation;
    const range = nextBase - base;
    // 9层累计 = range, 每层占比按指数增长
    const ratio = (Math.pow(1.5, subLevel) - 1) / (Math.pow(1.5, 9) - 1);
    return Math.floor(base + range * ratio);
}

// 获取当前境界+小层名称
function getFullRealmName() {
    const realm = REALMS[playerData.realm - 1];
    const subLevel = playerData.subLevel || 1;
    return `${realm.shortName}${subLevel}层`;
}

// 功法品阶颜色映射
const SKILL_GRADES = {
    '凡品': { color: '#aaa', border: 'rgba(170,170,170,0.5)', bg: 'rgba(170,170,170,0.1)' },
    '灵品': { color: '#5fb0a8', border: 'rgba(95,176,168,0.5)', bg: 'rgba(95,176,168,0.1)' },
    '玄品': { color: '#5b8def', border: 'rgba(91,141,239,0.5)', bg: 'rgba(91,141,239,0.1)' },
    '地品': { color: '#9b59b6', border: 'rgba(155,89,182,0.5)', bg: 'rgba(155,89,182,0.1)' },
    '天品': { color: '#e8c547', border: 'rgba(232,197,71,0.6)', bg: 'rgba(232,197,71,0.1)' }
};

const SKILLS = [
    // 凡品
    { id: 1, name: '吐纳术', type: '被动', grade: '凡品', effect: '修炼速度+10%', multiplier: 1.1, cost: 100, desc: '最基础的吐纳之法,引导天地灵气入体' },
    { id: 2, name: '引气诀', type: '被动', grade: '凡品', effect: '修炼速度+20%', multiplier: 1.2, cost: 300, desc: '引导灵气更快涌入丹田' },
    // 灵品
    { id: 3, name: '凝神诀', type: '被动', grade: '灵品', effect: '修炼速度+30%', multiplier: 1.3, cost: 800, desc: '在周天形成小型灵气漩涡' },
    { id: 4, name: '灵台清明', type: '被动', grade: '灵品', effect: '悟性+0.2', comprehensionBonus: 0.2, cost: 500, desc: '保持灵台清明,提升悟性' },
    { id: 5, name: '炼体诀', type: '被动', grade: '灵品', effect: '资质+0.1', talentBonus: 0.1, cost: 600, desc: '锤炼肉身,提升资质' },
    // 玄品
    { id: 6, name: '紫气东来', type: '被动', grade: '玄品', effect: '修炼速度+45%', multiplier: 1.45, cost: 2000, desc: '每日紫气东来,修炼事半功倍' },
    { id: 7, name: '天眼通', type: '被动', grade: '玄品', effect: '悟性+0.5', comprehensionBonus: 0.5, cost: 1500, desc: '开启天眼,洞察天地至理' },
    // 地品
    { id: 8, name: '混元功', type: '被动', grade: '地品', effect: '修炼速度+70%', multiplier: 1.7, cost: 5000, desc: '混元之力,周天大圆满' },
    { id: 9, name: '九转金身', type: '被动', grade: '地品', effect: '资质+0.3,悟性+0.3', talentBonus: 0.3, comprehensionBonus: 0.3, cost: 4000, desc: '九转成金,肉身成圣' },
    // 天品
    { id: 10, name: '太上感应', type: '被动', grade: '天品', effect: '修炼速度+100%', multiplier: 2.0, cost: 12000, desc: '太上忘情,感应天地' },
    // 主动技能
    { id: 11, name: '灵气爆发', type: '主动', grade: '玄品', effect: '10秒内修炼速度x3', activeMultiplier: 3, activeDuration: 10, cooldown: 60, cost: 3000, desc: '瞬间引爆灵气,大幅提升修炼速度' },
    { id: 12, name: '天人合一', type: '主动', grade: '天品', effect: '15秒内修炼速度x5', activeMultiplier: 5, activeDuration: 15, cooldown: 120, cost: 8000, desc: '与天地合而为一,修炼速度暴增' }
];

// 丹药品质
const PILL_QUALITIES = [
    { name: '下品', multiplier: 1.0, color: '#aaa' },
    { name: '中品', multiplier: 1.5, color: '#5fb0a8' },
    { name: '上品', multiplier: 2.0, color: '#e8c547' },
    { name: '极品', multiplier: 3.0, color: '#e74c3c' }
];

const PILLS = [
    { id: 1, name: '聚气丹', effect: '修为+100', cultivationBonus: 100, cost: 50, desc: '蕴含纯净灵气的聚气丹' },
    { id: 2, name: '涤神丹', effect: '悟性临时+0.5(5分钟)', tempComprehension: 0.5, duration: 300, cost: 100, desc: '暂时提升悟性的丹药' },
    { id: 3, name: '洗髓丹', effect: '资质永久+0.05', permanentTalent: 0.05, cost: 500, desc: '洗髓伐毛,提升先天资质' },
    { id: 4, name: '筑基丹', effect: '突破成功率+10%', breakthroughBonus: 10, cost: 200, desc: '辅助筑基的反哺丹药' },
    { id: 5, name: '悟道丹', effect: '修为+500', cultivationBonus: 500, cost: 300, desc: '借道悟道,收益颇丰' },
    { id: 6, name: '凝元丹', effect: '修为+2000', cultivationBonus: 2000, cost: 1000, desc: '凝聚天地元气,修为大增' },
    { id: 7, name: '破境丹', effect: '突破成功率+25%', breakthroughBonus: 25, cost: 800, desc: '助人突破瓶颈的珍稀丹药' },
    { id: 8, name: '轮回丹', effect: '资质永久+0.1', permanentTalent: 0.1, cost: 2000, desc: '经历轮回之力,脱胎换骨' }
];

// 炼丹配方
const ALCHEMY_RECIPES = [
    { id: 1, name: '聚气丹', herbCost: 2, stoneCost: 10, successRate: 0.9, pillId: 1, desc: '基础丹药,成功率极高' },
    { id: 2, name: '涤神丹', herbCost: 3, stoneCost: 30, successRate: 0.75, pillId: 2, desc: '需要静心炼制' },
    { id: 3, name: '筑基丹', herbCost: 5, stoneCost: 50, successRate: 0.6, pillId: 4, desc: '辅助突破的丹药' },
    { id: 4, name: '悟道丹', herbCost: 4, stoneCost: 80, successRate: 0.65, pillId: 5, desc: '蕴含道韵的丹药' },
    { id: 5, name: '洗髓丹', herbCost: 8, stoneCost: 200, successRate: 0.4, pillId: 3, desc: '洗髓伐毛,成功率低' },
    { id: 6, name: '凝元丹', herbCost: 10, stoneCost: 300, successRate: 0.5, pillId: 6, desc: '大量元气凝聚而成' },
    { id: 7, name: '破境丹', herbCost: 12, stoneCost: 500, successRate: 0.35, pillId: 7, desc: '突破瓶颈的珍稀丹药' },
    { id: 8, name: '轮回丹', herbCost: 20, stoneCost: 1000, successRate: 0.2, pillId: 8, desc: '传说级丹药,极难炼制' }
];

const SHOP_ITEMS = [
    // 丹药
    { id: 1, name: '聚气丹', price: 50, type: 'pill', itemId: 1, desc: '修为+100' },
    { id: 3, name: '涤神丹', price: 100, type: 'pill', itemId: 2, desc: '悟性临时+0.5' },
    { id: 4, name: '筑基丹', price: 200, type: 'pill', itemId: 4, desc: '突破成功率+10%' },
    { id: 7, name: '悟道丹', price: 300, type: 'pill', itemId: 5, desc: '修为+500' },
    { id: 8, name: '洗髓丹', price: 500, type: 'pill', itemId: 3, desc: '资质永久+0.05' },
    { id: 9, name: '凝元丹', price: 1000, type: 'pill', itemId: 6, desc: '修为+2000' },
    { id: 10, name: '破境丹', price: 800, type: 'pill', itemId: 7, desc: '突破成功率+25%' },
    { id: 11, name: '轮回丹', price: 2000, type: 'pill', itemId: 8, desc: '资质永久+0.1' },
    // 功法
    { id: 2, name: '吐纳术', price: 100, type: 'skill', itemId: 1, desc: '修炼速度+10%' },
    { id: 5, name: '引气诀', price: 300, type: 'skill', itemId: 2, desc: '修炼速度+20%' },
    { id: 6, name: '凝神诀', price: 800, type: 'skill', itemId: 3, desc: '修炼速度+30%' },
    { id: 12, name: '灵台清明', price: 500, type: 'skill', itemId: 4, desc: '悟性+0.2' },
    { id: 13, name: '炼体诀', price: 600, type: 'skill', itemId: 5, desc: '资质+0.1' },
    { id: 14, name: '紫气东来', price: 2000, type: 'skill', itemId: 6, desc: '修炼速度+45%' },
    { id: 15, name: '天眼通', price: 1500, type: 'skill', itemId: 7, desc: '悟性+0.5' },
    { id: 16, name: '混元功', price: 5000, type: 'skill', itemId: 8, desc: '修炼速度+70%' },
    { id: 17, name: '九转金身', price: 4000, type: 'skill', itemId: 9, desc: '资质+0.3, 悟性+0.3' },
    { id: 18, name: '太上感应', price: 12000, type: 'skill', itemId: 10, desc: '修炼速度+100%' },
    { id: 19, name: '灵气爆发', price: 3000, type: 'skill', itemId: 11, desc: '主动: 10秒修炼x3' },
    { id: 20, name: '天人合一', price: 8000, type: 'skill', itemId: 12, desc: '主动: 15秒修炼x5' }
];

// 奇遇数据 - 20个奇遇事件（含选择型）
const ENCOUNTERS = [
    // 机缘类
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
    // 选择型奇遇
    { id: 16, name: '神秘洞穴', category: 'opportunity', icon: '🕳️', weight: 8,
      desc: '你发现一个散发着诡异光芒的洞穴,深处隐约有吼声传来',
      choices: [
        { text: '深入探索', effects: [
            { type: 'cultivation', value: 1000, text: '修为 +1000' },
            { type: 'spirit', value: -30, text: '灵气 -30' }
          ], risk: 0.3, riskText: '30%概率损失修为' },
        { text: '在外观察', effects: [
            { type: 'spiritStones', value: 200, text: '灵石 +200' }
          ], risk: 0 }
      ] },
    { id: 17, name: '古镜问心', category: 'trial', icon: '🪞', weight: 7,
      desc: '一面古镜拦住去路,镜中浮现你内心的执念',
      choices: [
        { text: '直面心魔', effects: [
            { type: 'cultivation', value: 600, text: '修为 +600' },
            { type: 'comprehension_temp', value: 0.5, duration: 300, text: '悟性 +0.5 (5分钟)' }
          ], risk: 0.4, riskText: '40%概率修为-200' },
        { text: '绕道而行', effects: [
            { type: 'cultivation', value: 100, text: '修为 +100' }
          ], risk: 0 }
      ] },

    // 遇仙类
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
    // 连锁奇遇：仙人指路后续
    { id: 18, name: '仙人再访', category: 'immortal', icon: '🌟', weight: 5, requireEncounter: 1,
      desc: '上次指路的老仙人再次现身,这次他带来了一枚丹药',
      effects: [
        { type: 'pill', pillId: 5, count: 2, text: '悟道丹 x2' },
        { type: 'comprehension_temp', value: 0.4, duration: 300, text: '悟性 +0.4 (5分钟)' }
      ] },

    // 寻宝类
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

    // 历练类
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

    // 选择型奇遇 - 宝物与风险
    { id: 19, name: '拍卖会', category: 'treasure', icon: '🏦', weight: 6,
      desc: '路过一处拍卖会,有一件神秘宝物正在拍卖',
      choices: [
        { text: '花500灵石竞拍', effects: [
            { type: 'spiritStones', value: -500, text: '灵石 -500' },
            { type: 'cultivation', value: 500, text: '获得宝物: 修为 +500' }
          ], risk: 0.3, riskText: '30%概率拍品是假的' },
        { text: '观望不出手', effects: [
            { type: 'cultivation', value: 30, text: '修为 +30' }
          ], risk: 0 }
      ] },

    // 灾难类
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
      ] },

    // 选择型灾难
    { id: 20, name: '天道考验', category: 'disaster', icon: '⚡', weight: 5,
      desc: '天道降下雷劫,考验你的修仙之心',
      choices: [
        { text: '硬抗雷劫', effects: [
            { type: 'cultivation', value: 800, text: '修为 +800' },
            { type: 'talent', value: 0.05, text: '资质 +0.05' }
          ], risk: 0.5, riskText: '50%概率损失500修为' },
        { text: '暂避锋芒', effects: [
            { type: 'cultivation', value: -100, text: '修为 -100' }
          ], risk: 0 }
      ] }
];

// ==================== 宗门系统数据 ====================

const PREDEFINED_SECTS = [
    { id: 'sect_1', name: '太虚仙宗', level: 5, memberCount: 128, desc: '传承万年的正道巨擘' },
    { id: 'sect_2', name: '天魔宫', level: 4, memberCount: 89, desc: '魔道第一势力' },
    { id: 'sect_3', name: '青云门', level: 3, memberCount: 256, desc: '中土第一仙门' },
    { id: 'sect_4', name: '万剑宗', level: 3, memberCount: 67, desc: '剑道宗门' },
    { id: 'sect_5', name: '百花谷', level: 2, memberCount: 45, desc: '专注丹药与灵植' },
    { id: 'sect_6', name: '散修联盟', level: 1, memberCount: 1024, desc: '散修互助组织' }
];

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

// 成就数据 - 24个成就（含隐藏成就）
const ACHIEVEMENTS = [
    // 修炼类
    { id: 'first_cultivate', name: '初入修仙', desc: '首次修炼', icon: '🎮', category: 'cultivation',
      reward: { spiritStones: 50 }, condition: (pd) => pd.stats.totalCultivation >= 1 },
    { id: 'cultivate_1k', name: '初窥门径', desc: '累计修炼1000修为', icon: '📈', category: 'cultivation',
      reward: { spiritStones: 100 }, condition: (pd) => pd.stats.totalCultivation >= 1000 },
    { id: 'cultivate_10k', name: '修炼达人', desc: '累计修炼10000修为', icon: '🏆', category: 'cultivation',
      reward: { spiritStones: 300 }, condition: (pd) => pd.stats.totalCultivation >= 10000 },
    { id: 'cultivate_100k', name: '一代宗师', desc: '累计修炼100000修为', icon: '🌟', category: 'cultivation',
      reward: { spiritStones: 1000, permBonus: { cultivationSpeed: 0.05 } }, condition: (pd) => pd.stats.totalCultivation >= 100000 },
    // 突破类
    { id: 'breakthrough_2', name: '炼气初期', desc: '突破到炼气2层', icon: '🔮', category: 'breakthrough',
      reward: { spiritStones: 80 }, condition: (pd) => pd.realm >= 2 || (pd.realm === 2 && pd.subLevel >= 2) },
    { id: 'breakthrough_5', name: '炼气后期', desc: '突破到炼气5层', icon: '💫', category: 'breakthrough',
      reward: { spiritStones: 200 }, condition: (pd) => pd.subLevel >= 5 || pd.realm >= 2 },
    { id: 'breakthrough_10', name: '筑基成功', desc: '突破到筑基期', icon: '⚡', category: 'breakthrough',
      reward: { pill: { id: 1, count: 3 } }, condition: (pd) => pd.realm >= 2 },
    { id: 'breakthrough_jindan', name: '金丹大成', desc: '突破到金丹期', icon: '🌞', category: 'breakthrough',
      reward: { spiritStones: 500, permBonus: { talent: 0.05 } }, condition: (pd) => pd.realm >= 3 },
    { id: 'breakthrough_yuanying', name: '元婴化形', desc: '突破到元婴期', icon: '👶', category: 'breakthrough',
      reward: { spiritStones: 1000, permBonus: { comprehension: 0.1 } }, condition: (pd) => pd.realm >= 4 },
    { id: 'breakthrough_huashen', name: '化神飞升', desc: '突破到化神期', icon: '🚀', category: 'breakthrough',
      reward: { spiritStones: 5000, permBonus: { cultivationSpeed: 0.1 } }, condition: (pd) => pd.realm >= 5 },
    // 丹药类
    { id: 'first_pill', name: '初尝丹药', desc: '首次使用丹药', icon: '💊', category: 'pills',
      reward: { spiritStones: 30 }, condition: (pd) => pd.stats.pillsUsed >= 1 },
    { id: 'pills_10', name: '丹道入门', desc: '使用10次丹药', icon: '🧪', category: 'pills',
      reward: { pill: { id: 2, count: 2 } }, condition: (pd) => pd.stats.pillsUsed >= 10 },
    { id: 'pills_50', name: '丹道精通', desc: '使用50次丹药', icon: '⚗️', category: 'pills',
      reward: { spiritStones: 300, permBonus: { cultivationSpeed: 0.03 } }, condition: (pd) => pd.stats.pillsUsed >= 50 },
    { id: 'alchemy_master', name: '炼丹宗师', desc: '成功炼丹20次', icon: '🔥', category: 'pills',
      reward: { spiritStones: 500, permBonus: { talent: 0.03 } }, condition: (pd) => (pd.stats.alchemySuccess || 0) >= 20 },
    // 奇遇类
    { id: 'first_encounter', name: '初遇奇缘', desc: '首次触发奇遇', icon: '📜', category: 'encounter',
      reward: { spiritStones: 50 }, condition: (pd) => pd.encounterHistory.length >= 1 },
    { id: 'encounter_10', name: '奇遇连连', desc: '触发10次奇遇', icon: '🎲', category: 'encounter',
      reward: { spiritStones: 200 }, condition: (pd) => pd.encounterHistory.length >= 10 },
    { id: 'encounter_30', name: '机缘深厚', desc: '触发30次奇遇', icon: '🌈', category: 'encounter',
      reward: { spiritStones: 500, permBonus: { comprehension: 0.05 } }, condition: (pd) => pd.encounterHistory.length >= 30 },
    // 财富类
    { id: 'spiritStones_1k', name: '小有积蓄', desc: '累计获得1000灵石', icon: '💰', category: 'wealth',
      reward: { spiritStones: 100 }, condition: (pd) => pd.stats.totalSpiritStones >= 1000 },
    { id: 'spiritStones_10k', name: '富甲一方', desc: '累计获得10000灵石', icon: '💎', category: 'wealth',
      reward: { spiritStones: 500, permBonus: { cultivationSpeed: 0.03 } }, condition: (pd) => pd.stats.totalSpiritStones >= 10000 },
    // 功法类
    { id: 'skills_3', name: '博学多才', desc: '拥有3门功法', icon: '📚', category: 'cultivation',
      reward: { spiritStones: 200 }, condition: (pd) => pd.ownedSkills.length >= 3 },
    { id: 'skills_all', name: '功法大成', desc: '拥有所有功法', icon: '📖', category: 'cultivation',
      reward: { spiritStones: 2000, permBonus: { cultivationSpeed: 0.1 } }, condition: (pd) => pd.ownedSkills.length >= 12 },
    // 隐藏成就
    { id: 'hidden_breakthrough_fail', name: '百折不挠', desc: '累计突破失败5次', icon: '💔', category: 'breakthrough', hidden: true,
      reward: { spiritStones: 300, permBonus: { comprehension: 0.1 } }, condition: (pd) => pd.failedBreakthroughs >= 5 },
    { id: 'hidden_disaster_5', name: '逆境求生', desc: '遭遇5次灾难奇遇', icon: '☠️', category: 'encounter', hidden: true,
      reward: { spiritStones: 400, permBonus: { talent: 0.05 } }, condition: (pd) => pd.stats.disaster >= 5 },
    { id: 'hidden_playtime', name: '修仙苦旅', desc: '游戏时长达1小时', icon: '⏰', category: 'cultivation', hidden: true,
      reward: { spiritStones: 500, permBonus: { cultivationSpeed: 0.05 } }, condition: (pd) => (pd.stats.playTime || 0) >= 3600 }
];

// 法宝数据
const ARTIFACTS = [
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

const ARTIFACT_MATERIALS = [
    { id: 1, name: '玄铁', icon: '🔩', price: 50, desc: '基础炼器材料' },
    { id: 2, name: '灵银', icon: '🥈', price: 100, desc: '进阶炼器材料' },
    { id: 3, name: '天金', icon: '🥇', price: 300, desc: '高级炼器材料' },
    { id: 4, name: '仙玉', icon: '💠', price: 500, desc: '珍稀炼器材料' },
    { id: 5, name: '混沌石', icon: '🌌', price: 1000, desc: '传说级材料' },
];

// 灵兽数据
const SPIRIT_BEASTS = [
    { id: 1, name: '小狐狸', type: 'normal', icon: '🦊', rarity: 'normal',
      desc: '灵动可爱的小狐狸', baseEffect: { type: 'spiritRegen', value: 0.1 },
      price: 200, captureCost: 50, baseExp: 50, expToLevel: 30, maxLevel: 5 },
    { id: 2, name: '野狼', type: 'normal', icon: '🐺', rarity: 'normal',
      desc: '速度极快的野狼', baseEffect: { type: 'cultivationSpeed', value: 0.1 },
      price: 200, captureCost: 50, baseExp: 50, expToLevel: 30, maxLevel: 5 },
    { id: 3, name: '小白兔', type: 'normal', icon: '🐰', rarity: 'normal',
      desc: '灵气充沛的灵兔', baseEffect: { type: 'maxSpirit', value: 0.15 },
      price: 180, captureCost: 40, baseExp: 40, expToLevel: 25, maxLevel: 5 },
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
    { id: 8, name: '九尾狐', type: 'epic', icon: '🦊', rarity: 'epic',
      desc: '九尾妖狐,魅惑众生', baseEffect: { type: 'cultivationSpeed', value: 0.35, comprehension: 0.2 },
      price: 2000, captureCost: 300, baseExp: 300, expToLevel: 80, maxLevel: 15 },
    { id: 9, name: '麒麟', type: 'epic', icon: '🦒', rarity: 'epic',
      desc: '祥瑞之兽,仁义无双', baseEffect: { type: 'breakthroughBonus', value: 0.25, talent: 0.15 },
      price: 2500, captureCost: 350, baseExp: 350, expToLevel: 90, maxLevel: 15 },
    { id: 10, name: '白虎', type: 'epic', icon: '🐯', rarity: 'epic',
      desc: '西方神兽,战无不胜', baseEffect: { type: 'attack', value: 30, cultivationSpeed: 0.25 },
      price: 2200, captureCost: 320, baseExp: 320, expToLevel: 85, maxLevel: 15 },
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

const BEAST_AFFECTION_LEVELS = [
    { level: 1, name: '陌生', threshold: 0, effect: 1.0 },
    { level: 2, name: '熟悉', threshold: 50, effect: 1.1 },
    { level: 3, name: '亲近', threshold: 120, effect: 1.2 },
    { level: 4, name: '友好', threshold: 250, effect: 1.35 },
    { level: 5, name: '信赖', threshold: 500, effect: 1.5 },
    { level: 6, name: '默契', threshold: 1000, effect: 1.7 },
    { level: 7, name: '灵魂', threshold: 2000, effect: 2.0 },
];

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
    subLevel: 1,
    cultivation: 0,
    spirit: 100,
    maxSpirit: 100,
    talent: 1.0,
    comprehension: 1.0,
    spiritStones: 0,
    failedBreakthroughs: 0,
    lastOnlineTime: Date.now(),
    autoCultivate: false,
    manualCultivate: false,
    equippedSkills: [],
    ownedSkills: [],
    skillLevels: {},  // 功法等级 {skillId: level}
    activeSkillCooldowns: {}, // 主动技能冷却 {skillId: timestamp}
    activeSkillBuffs: {}, // 主动技能生效中 {skillId: expireTimestamp}
    inventory: {},
    pillQualities: {}, // 丹药品质 {pillId_qualityIndex: count}
    tempBuffs: {
        comprehension: 0,
        breakthrough: 0
    },
    encounterHistory: [],
    stats: {
        total: 0,
        opportunity: 0,
        immortal: 0,
        treasure: 0,
        trial: 0,
        disaster: 0,
        totalCultivation: 0,
        pillsUsed: 0,
        totalSpiritStones: 0,
        alchemySuccess: 0,
        playTime: 0
    },
    achievements: [],
    achievementBonuses: {}, // 成就永久加成

    sectId: null,
    sectContrib: 0,
    sectContribToday: 0,
    sectDailyTasks: {},
    sectLastResetDate: null,

    ownedArtifacts: [],
    equippedArtifacts: [null, null, null],
    materials: {},

    ownedBeasts: [],
    equippedBeast: null,

    caveExp: 0,
    caveProsperity: 0,
    cavePlots: [
        { herbId: null, plantedAt: null, readyAt: null, herbLevel: 1 }
    ],
    caveUpgrades: {
        herb_garden: 1,
        alchemy_furnace: 1,
        spirit_pool: 1,
        treasure_room: 1,
    },
    herbs: 0,

    readStories: [],
    currentStoryId: 1,

    muted: false,
    sessionStartTime: Date.now(),
};

let gameInterval = null;
let lastEncounterTime = 0;

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
    updateTaijiProgress();
}

// 游戏主循环
function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);

    gameInterval = setInterval(() => {
        if (playerData.spirit < playerData.maxSpirit) {
            playerData.spirit = Math.min(
                playerData.maxSpirit,
                playerData.spirit + getSpiritRecovery()
            );
        }

        // 自动修炼或手动修炼开关开启时自动获得修为
        if (playerData.autoCultivate || playerData.manualCultivate) {
            cultivateTick();
        }
        checkTempBuffs();
        checkActiveSkillBuffs();
        checkEncounter();
        playerData.stats.playTime = (playerData.stats.playTime || 0) + 1;
        updateUI();
        saveGame();
    }, 1000);
}

function checkTempBuffs() {
    // 临时buff通过setTimeout自动清除
}

function checkActiveSkillBuffs() {
    const now = Date.now();
    let changed = false;
    for (const skillId in playerData.activeSkillBuffs) {
        if (playerData.activeSkillBuffs[skillId] <= now) {
            delete playerData.activeSkillBuffs[skillId];
            changed = true;
            showMessage('功法增益已结束', '');
        }
    }
}

function toggleAutoCultivate() {
    playerData.autoCultivate = !playerData.autoCultivate;
    const toggle = document.getElementById('autoToggle');
    if (toggle) toggle.classList.toggle('active', playerData.autoCultivate);
    if (window.audioManager) audioManager.play('click');
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

function saveGame() {
    playerData.lastOnlineTime = Date.now();
    localStorage.setItem('cultivationGame', JSON.stringify(playerData));
}

function loadGame() {
    const saved = localStorage.getItem('cultivationGame');
    if (saved) {
        const loaded = JSON.parse(saved);
        playerData = { ...playerData, ...loaded };

        // 兼容处理 - 新字段
        if (!playerData.inventory) playerData.inventory = {};
        if (!playerData.tempBuffs) playerData.tempBuffs = { comprehension: 0, breakthrough: 0 };
        if (!playerData.encounterHistory) playerData.encounterHistory = [];
        if (!playerData.stats) playerData.stats = {
            total: 0, opportunity: 0, immortal: 0, treasure: 0, trial: 0, disaster: 0
        };
        if (playerData.stats.alchemySuccess === undefined) playerData.stats.alchemySuccess = 0;
        if (playerData.stats.playTime === undefined) playerData.stats.playTime = 0;
        if (!playerData.skillLevels) playerData.skillLevels = {};
        if (!playerData.activeSkillCooldowns) playerData.activeSkillCooldowns = {};
        if (!playerData.activeSkillBuffs) playerData.activeSkillBuffs = {};
        if (!playerData.pillQualities) playerData.pillQualities = {};
        if (!playerData.achievementBonuses) playerData.achievementBonuses = { cultivationSpeed: 0, talent: 0, comprehension: 0 };
        if (playerData.subLevel === undefined) playerData.subLevel = 1;
        if (playerData.manualCultivate === undefined) playerData.manualCultivate = false;
        if (playerData.muted === undefined) playerData.muted = false;
        if (playerData.sessionStartTime === undefined) playerData.sessionStartTime = Date.now();
        // 确保 achievementBonuses 有完整字段
        if (playerData.achievementBonuses.cultivationSpeed === undefined) playerData.achievementBonuses.cultivationSpeed = 0;
        if (playerData.achievementBonuses.talent === undefined) playerData.achievementBonuses.talent = 0;
        if (playerData.achievementBonuses.comprehension === undefined) playerData.achievementBonuses.comprehension = 0;
        // 确保 stats 有完整字段
        if (playerData.stats.alchemySuccess === undefined) playerData.stats.alchemySuccess = 0;
    }
}

function formatNumber(num) {
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toLocaleString();
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}小时${m}分钟`;
    return `${m}分钟`;
}

function getToday() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
}

// 更新太极图进度
function updateTaijiProgress() {
    const ring = document.getElementById('taijiRing');
    const percentEl = document.getElementById('taijiPercent');
    const realmNameEl = document.getElementById('realmNameDisplay');
    const cultivationNumEl = document.getElementById('cultivationNum');

    // 进度计算：基于当前小层进度
    const nextSubLevel = getSubLevelCultivation(playerData.realm, playerData.subLevel);
    const prevSubLevel = getSubLevelCultivation(playerData.realm, playerData.subLevel - 1);
    const range = nextSubLevel - prevSubLevel;
    const current = playerData.cultivation - prevSubLevel;
    const progress = range > 0 ? Math.min(100, (current / range) * 100) : 0;

    if (ring) {
        const circumference = 502.65; // 2 * PI * 80
        const offset = circumference - (progress / 100) * circumference;
        ring.style.strokeDashoffset = offset;
    }

    if (percentEl) {
        percentEl.textContent = progress.toFixed(1) + '%';
    }

    if (realmNameEl) {
        realmNameEl.textContent = getFullRealmName();
    }

    if (cultivationNumEl) {
        cultivationNumEl.textContent = formatNumber(playerData.cultivation) + ' / ' + formatNumber(nextSubLevel || 0);
    }
}

// 启动游戏
init();
