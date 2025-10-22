let items = JSON.parse(localStorage.getItem('RecipeTool.recipes')) || [];
let currentCategory = 'メイン';
let selectedItemId;
let deleteTimer;
let wakeLock = null;
let isModalOpen = false;

// 既存のレシピに履歴データを初期化
function initializeHistoryData() {
    let hasChanges = false;
    items.forEach(item => {
        if (!item.history) {
            item.history = [];
            hasChanges = true;
        }
    });
    if (hasChanges) {
        saveItems();
    }
}

const $el = document.getElementById.bind(document);

// モーダル表示時のスクロール防止関数
function preventScroll(e) {
    // モーダル内の要素に対するタッチイベントは許可
    const target = e.target;
    const modal = target.closest('.modal');
    if (modal) {
        return; // モーダル内の要素の場合は何もしない
    }
    
    // ボタンや入力要素に対するタッチイベントは許可
    if (target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea')) {
        return;
    }
    
    // その他の要素の場合はスクロールを防止
    e.preventDefault();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
}

function getDaysSinceString(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const days = Math.floor(diff / 86400000);
    if (days == 0) return `今日`;
    if (days < 30) return `${days}日前`;
    return `${Math.floor(days / 30)}ヶ月前`;
}

function isToday(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function adjustContainerHeight() {
    const container = document.querySelector('.container');
    const itemList = $el('itemList');
    const listHeight = itemList.getBoundingClientRect().height;
    const minHeight = Math.max(window.innerHeight, listHeight + 150);
    container.style.height = `${minHeight}px`;
}

function updateTabIndicators() {
    // タブの赤丸表示機能を削除
}

function renderItems() {
    const itemList = $el('itemList');
    
    // DOM要素が存在しない場合は処理をスキップ
    if (!itemList) {
        console.warn('itemList element not found');
        return;
    }
    
    const filteredItems = items.filter(item => item.category === currentCategory);
    const sortedItems = filteredItems.sort((a, b) => {
        // 履歴がある場合は最新の履歴日でソート、ない場合は最後にソート
        const aLatestDate = a.history && a.history.length > 0 
            ? Math.max(...a.history.map(date => new Date(date)))
            : new Date(0); // 1970年1月1日（履歴がない場合は最後にソート）
        const bLatestDate = b.history && b.history.length > 0 
            ? Math.max(...b.history.map(date => new Date(date)))
            : new Date(0);
        return bLatestDate - aLatestDate;
    });

    if (sortedItems.length === 0) {
        // アイテムが存在しない場合の空状態表示
        itemList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-message">まだレシピがありません</div>
                <div class="empty-submessage">画面下の + ボタンからレシピを追加してください</div>
            </div>
        `;
    } else {
        itemList.innerHTML = sortedItems.map(item => {
            // 履歴がある場合は最新の履歴日を表示、ない場合は「-」を表示
            const displayTime = item.history && item.history.length > 0 
                ? getDaysSinceString(new Date(Math.max(...item.history.map(date => new Date(date)))).toISOString())
                : '-';
            
            return `
                <div class="item" onclick="showRecipe('${item.id}')">
                    <span class="item-name">${item.name}</span>
                    <div class="item-right"><span class="last-date">${displayTime}</span></div>
                </div>
            `;
        }).join('');
    }

    updateTabIndicators();
    setTimeout(adjustContainerHeight, 0);
}

function linkifyUrls(text) {
    if (!text) return text;
    
    // URLの正規表現パターン（http、https、wwwで始まるURLを検出）
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    
    return text.replace(urlRegex, (url) => {
        // wwwで始まる場合はhttps://を追加
        const href = url.startsWith('www.') ? `https://${url}` : url;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="recipe-link">${url}</a>`;
    });
}

function showRecipe(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        selectedItemId = id;
        $el('recipeTitle').textContent = item.name;
        
        // 食材と調理手順でURLをリンク化
        const ingredientsText = item.ingredients || '';
        const instructionsText = item.instructions || '';
        
        // 食材欄の表示/非表示を制御
        const ingredientsSection = document.querySelector('.recipe-section-display:first-of-type');
        if (ingredientsText.trim()) {
            ingredientsSection.style.display = 'block';
            $el('ingredientsDisplay').innerHTML = linkifyUrls(ingredientsText);
        } else {
            ingredientsSection.style.display = 'none';
        }
        
        // 調理手順欄の表示/非表示を制御
        const instructionsSection = document.querySelector('.recipe-section-display:last-of-type');
        if (instructionsText.trim()) {
            instructionsSection.style.display = 'block';
            $el('instructionsDisplay').innerHTML = linkifyUrls(instructionsText);
        } else {
            instructionsSection.style.display = 'none';
        }
        
        // 履歴を表示
        displayHistory(item);
        
        // 作ったボタンの表示を更新
        updateMadeButton(item);
        
        showModal('recipeModal');
        requestWakeLock();
    }
}

function displayHistory(item) {
    const historyDisplay = $el('historyDisplay');
    const history = item.history || [];
    
    if (history.length === 0) {
        historyDisplay.innerHTML = '<div class="no-history">履歴がありません</div>';
    } else {
        // 履歴を新しい順にソート
        const sortedHistory = [...history].sort((a, b) => new Date(b) - new Date(a));
        
        historyDisplay.innerHTML = sortedHistory.map(dateString => {
            const daysSince = getDaysSinceString(dateString);
            const formattedDate = formatDate(dateString);
            return `
                <div class="history-item">
                    <span class="history-date">${formattedDate}</span>
                    <span class="history-days">${daysSince}</span>
                </div>
            `;
        }).join('');
    }
}

function updateMadeButton(item) {
    const madeButton = document.querySelector('.made-button');
    if (!madeButton) return;
    
    const todayDate = new Date().toDateString();
    const hasTodayHistory = item.history && item.history.some(dateString => 
        new Date(dateString).toDateString() === todayDate
    );
    
    if (hasTodayHistory) {
        madeButton.textContent = '作ってない';
    } else {
        madeButton.textContent = '作った';
    }
}

function markAsMade() {
    const item = items.find(item => item.id === selectedItemId);
    if (item) {
        const today = new Date().toISOString();
        const todayDate = new Date().toDateString();
        
        // 履歴を初期化（存在しない場合）
        if (!item.history) {
            item.history = [];
        }
        
        // 今日の履歴があるかチェック
        const hasTodayHistory = item.history.some(dateString => 
            new Date(dateString).toDateString() === todayDate
        );
        
        if (hasTodayHistory) {
            // 今日の履歴がある場合は削除
            item.history = item.history.filter(dateString => 
                new Date(dateString).toDateString() !== todayDate
            );
        } else {
            // 今日の履歴がない場合は追加
            item.history.push(today);
        }
        
        
        saveItems();
        renderItems();
        
        // 履歴表示を更新
        displayHistory(item);
        
        // 作ったボタンの表示を更新
        updateMadeButton(item);
    }
}

function addItem() {
    const input = $el('itemInput');
    const ingredientsInput = $el('ingredientsInput');
    const instructionsInput = $el('instructionsInput');
    if (input.value.trim()) {
        items.push({
            id: Date.now().toString(),
            name: input.value.trim(),
            ingredients: ingredientsInput.value.trim(),
            instructions: instructionsInput.value.trim(),
            category: currentCategory,
            history: []
        });
        saveItems();
        renderItems();
        input.value = '';
        ingredientsInput.value = '';
        instructionsInput.value = '';
        closeModal('addModal');
    }
}

function handleAddModalKeyPress(event) {
    if (event.key === 'Enter') {
        addItem();
    }
}

function saveItems() {
    localStorage.setItem('RecipeTool.recipes', JSON.stringify(items));
}

function handleItemClick(id) {
    selectedItemId = id;
    const item = items.find(item => item.id === id);
    const editInput = $el('editInput');
    const editIngredientsInput = $el('editIngredientsInput');
    const editInstructionsInput = $el('editInstructionsInput');
    editInput.value = item.name;
    editIngredientsInput.value = item.ingredients || '';
    editInstructionsInput.value = item.instructions || '';
    showModal('editModal');
    editInput.focus();
    editInput.select();
}

function updateItem() {
    const editInput = $el('editInput');
    const editIngredientsInput = $el('editIngredientsInput');
    const editInstructionsInput = $el('editInstructionsInput');
    const item = items.find(item => item.id === selectedItemId);
    if (editInput.value.trim() && item) {
        item.name = editInput.value.trim();
        item.ingredients = editIngredientsInput.value.trim();
        item.instructions = editInstructionsInput.value.trim();
        saveItems();
        renderItems();
        closeModal('editModal');
    }
}

function startDelete() {
    const deleteButton = $el('deleteButton');
    deleteButton.classList.add('deleting');
    deleteTimer = setTimeout(() => {
        deleteItem();
        deleteButton.classList.remove('deleting');
    }, 1000);
}

function cancelDelete() {
    const deleteButton = $el('deleteButton');
    deleteButton.classList.remove('deleting');
    clearTimeout(deleteTimer);
}

function deleteItem() {
    items = items.filter(item => item.id !== selectedItemId);
    saveItems();
    renderItems();
    closeModal('editModal');
}

function editCurrentRecipe() {
    const item = items.find(item => item.id === selectedItemId);
    if (item) {
        const editInput = $el('editInput');
        const editIngredientsInput = $el('editIngredientsInput');
        const editInstructionsInput = $el('editInstructionsInput');
        editInput.value = item.name;
        editIngredientsInput.value = item.ingredients || '';
        editInstructionsInput.value = item.instructions || '';
        closeModal('recipeModal');
        showModal('editModal');
        editInput.focus();
        editInput.select();
    }
}


function showModal(id) {
    $el(id).style.display = 'block';
    $el('addButton').style.display = 'none';
    const shareButton = $el('shareButton');
    if (shareButton) {
        shareButton.style.display = 'none';
    }
    
    // モーダルが開いている状態を記録
    isModalOpen = true;
    
    // 背景のスクロールとタッチイベントを無効化
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // タッチイベントの伝播を防ぐ
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('touchstart', preventScroll, { passive: false });
}

function closeModal(id) {
    $el(id).style.display = 'none';
    $el('addButton').style.display = 'block';
    const shareButton = $el('shareButton');
    if (shareButton) {
        shareButton.style.display = 'block';
    }
    
    // モーダルが閉じている状態を記録
    isModalOpen = false;
    
    // 背景のスクロールとタッチイベントを再有効化
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    
    // タッチイベントリスナーを削除
    document.removeEventListener('touchmove', preventScroll);
    document.removeEventListener('touchstart', preventScroll);
    
    // レシピモーダルを閉じる時はWake Lockも解放
    if (id === 'recipeModal') {
        releaseWakeLock();
    }
}

function handleModalOutsideClick(event) {
    if (event.target.id === 'editModal' || event.target.id === 'addModal' || event.target.id === 'recipeModal') {
        closeModal(event.target.id);
    }
}

function initializeApp() {
    $el('categoryTabs').addEventListener('click', (e) => {
        if (e.target.classList.contains('tab')) {
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.textContent;
            renderItems();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('editModal');
            closeModal('addModal');
            closeModal('recipeModal');
        }
    });

    $el('addButton').onclick = () => {
        const input = $el('itemInput');
        input.placeholder = `"${currentCategory}"にレシピを追加`;
        showModal('addModal');
        input.focus();
    };

    // shareButtonが存在する場合のみイベントリスナーを設定
    const shareButton = $el('shareButton');
    if (shareButton) {
        shareButton.onclick = async () => {
            const allItems = items;
            if (allItems.length === 0) return;

            const groupedItems = {};
            allItems.forEach(item => {
                if (!groupedItems[item.category]) {
                    groupedItems[item.category] = [];
                }
                groupedItems[item.category].push(item.name);
            });

            const text = Object.entries(groupedItems)
                .map(([category, items]) => `【${category}】\n${items.map(item => `・${item}`).join('\n')}`)
                .join('\n\n');

            try {
                await navigator.clipboard.writeText(text);
                if (navigator.share) {
                    await navigator.share({
                        text: text
                    });
                } else {
                    alert('クリップボードにコピーしました');
                }
            } catch (err) {
            }
        };
    }

    $el('itemInput').addEventListener('keypress', handleAddModalKeyPress);

    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', e => {
        // モーダルが開いている場合はタブ切り替えを無効化
        if (isModalOpen) {
            return;
        }
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY; 
        const tabs = Array.from(document.querySelectorAll('.tab'));
        const currentIndex = tabs.findIndex(tab => tab.classList.contains('active'));
        
        if (Math.abs(diffX) > 50 && Math.abs(diffY) < 50) {
            let newIndex = diffX > 0 ? currentIndex - 1 : currentIndex + 1;
            if (newIndex >= 0 && newIndex < tabs.length) {
                tabs[currentIndex].classList.remove('active');
                tabs[newIndex].classList.add('active');
                currentCategory = tabs[newIndex].textContent;
                renderItems();
            }
        }
    });

    window.addEventListener('resize', adjustContainerHeight);
    
    // ページが非表示になった時やアプリが終了する時にWake Lockを解放
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && wakeLock) {
            releaseWakeLock();
        }
    });
    
    // ページがアンロードされる時にWake Lockを解放
    window.addEventListener('beforeunload', () => {
        releaseWakeLock();
    });

    // DOM要素が確実に読み込まれてからレンダリングを実行
    setTimeout(() => {
        console.log('Initializing app with items:', items.length);
        console.log('Current category:', currentCategory);
        initializeHistoryData();
        renderItems();
    }, 0);
}

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock acquired');
            
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock released');
                wakeLock = null;
            });
        } else {
            console.log('Wake Lock API not supported');
        }
    } catch (err) {
        console.log('Wake Lock failed:', err);
    }
}

function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
        console.log('Wake Lock released manually');
    }
}

document.addEventListener('DOMContentLoaded', initializeApp); 