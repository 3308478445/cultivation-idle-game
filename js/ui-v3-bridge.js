// ==================== ui-v3-bridge.js — 一念逍遥v3导航桥接 ====================
// 在 ui.js 之后加载，覆盖 switchTab 并增强导航

// 备份原始 switchTab（如果其他模块调用了它）
const _originalSwitchTab = typeof switchTab === 'function' ? switchTab : null;

// 覆盖 switchTab：v3使用openPanel代替
// 保留此函数以防 JS 模块中直接调用 switchTab
switchTab = function(tabName) {
    // 所有旧 tab 现在通过 openPanel 打开
    if (tabName === 'main' || tabName === 'cultivation') {
        switchScene('cave');
    } else {
        openPanel(tabName);
    }
};
