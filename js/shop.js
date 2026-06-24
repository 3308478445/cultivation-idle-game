// ==================== shop.js — 商店系统 ====================

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
    playerData.stats.totalSpiritStones += item.price;

    if (window.audioManager) audioManager.play('click');

    if (item.type === 'pill') {
        playerData.inventory[item.itemId] = (playerData.inventory[item.itemId] || 0) + 1;
        showMessage(`购买成功!`, 'success');
    } else if (item.type === 'skill') {
        if (!playerData.ownedSkills.includes(item.itemId)) {
            playerData.ownedSkills.push(item.itemId);
            if (!playerData.skillLevels[item.itemId]) playerData.skillLevels[item.itemId] = 1;
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
