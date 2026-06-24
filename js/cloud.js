// ==================== cloud.js — 存档管理（导出/导入） ====================

function exportSave() {
    saveGame();
    const saveData = JSON.stringify(playerData, null, 2);
    const blob = new Blob([saveData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神'];
    const realmName = realmNames[playerData.realm - 1] || '未知';
    const filename = `修仙存档_${realmName}境_${formatTimeShort(Date.now())}.json`;

    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showMessage('存档已导出！记得保存好文件', 'success');
}

function formatTimeShort(timestamp) {
    const d = new Date(timestamp);
    const Y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${Y}${M}${day}_${h}${m}`;
}

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

                if (!data.realm || data.cultivation === undefined) {
                    showMessage('存档文件无效！', 'fail');
                    return;
                }

                playerData = {...playerData, ...data};
                saveGame();

                const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神'];
                const realmName = realmNames[playerData.realm - 1] || '未知';
                showMessage(`已恢复存档！境界: ${realmName}境`, 'success');

                location.reload();
            } catch (err) {
                showMessage('导入失败：文件格式错误', 'fail');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ==================== GitHub 云同步功能 ====================

function saveGithubToken() {
    const token = document.getElementById('githubToken').value.trim();
    if (!token) {
        showMessage('请输入 Token！', 'fail');
        return;
    }
    localStorage.setItem('githubToken', token);
    document.getElementById('tokenStatus').textContent = '已保存';
    document.getElementById('tokenStatus').style.color = 'var(--green)';
    showMessage('Token 已保存！', 'success');
}

function toggleAutoSync() {
    const toggle = document.getElementById('autoSyncToggle');
    toggle.classList.toggle('active');
    const isActive = toggle.classList.contains('active');
    localStorage.setItem('autoSync', isActive ? 'true' : 'false');
    showMessage(isActive ? '自动同步已开启' : '自动同步已关闭', 'success');
}

function manualUpload() {
    const token = localStorage.getItem('githubToken');
    if (!token) {
        showMessage('请先设置 GitHub Token！', 'fail');
        return;
    }
    showMessage('正在上传存档...', '');
    saveGame();
    const saveData = JSON.stringify(playerData);
    const gistData = {
        description: '修仙放置游戏存档',
        public: false,
        files: {
            'cultivation-save.json': {
                content: saveData
            }
        }
    };

    fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gistData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.id) {
            localStorage.setItem('gistId', data.id);
            document.getElementById('syncStatus').textContent = '上传成功！' + new Date().toLocaleString();
            document.getElementById('gistInfoSection').style.display = 'block';
            document.getElementById('gistLink').innerHTML = `<a href="${data.html_url}" target="_blank" style="color: var(--blue);">${data.html_url}</a>`;
            showMessage('存档上传成功！', 'success');
        } else {
            showMessage('上传失败：' + (data.message || '未知错误'), 'fail');
        }
    })
    .catch(err => {
        showMessage('上传失败：网络错误', 'fail');
    });
}

function manualDownload() {
    const token = localStorage.getItem('githubToken');
    const gistId = localStorage.getItem('gistId');
    if (!token) {
        showMessage('请先设置 GitHub Token！', 'fail');
        return;
    }
    if (!gistId) {
        showMessage('没有找到云端存档，请先上传！', 'fail');
        return;
    }

    showMessage('正在下载存档...', '');

    fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
            'Authorization': `token ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.files && data.files['cultivation-save.json']) {
            const saveData = JSON.parse(data.files['cultivation-save.json'].content);
            playerData = { ...playerData, ...saveData };
            saveGame();
            document.getElementById('syncStatus').textContent = '下载成功！' + new Date().toLocaleString();
            showMessage('存档下载成功！正在刷新...', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showMessage('下载失败：存档不存在', 'fail');
        }
    })
    .catch(err => {
        showMessage('下载失败：网络错误', 'fail');
    });
}
