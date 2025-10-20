let items = JSON.parse(localStorage.getItem('RecipeTool.recipes')) || [];
let currentCategory = 'メイン';
let selectedItemId;
let deleteTimer;

const $el = document.getElementById.bind(document);

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(days / 30);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 30) return `${days}日前`;
    return `${months}ヶ月前`;
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
    const filteredItems = items.filter(item => item.category === currentCategory);
    const sortedItems = filteredItems.sort((a, b) => {
        return new Date(b.lastMade) - new Date(a.lastMade);
    });

    itemList.innerHTML = sortedItems.map(item => `
        <div class="item" onclick="showRecipe('${item.id}')">
            <span class="item-name">
                ${item.name}
            </span>
            <div class="item-right">
                <span class="last-date">${formatRelativeTime(item.lastMade)}</span>
            </div>
        </div>
    `).join('');

    updateTabIndicators();
    setTimeout(adjustContainerHeight, 0);
}

function showRecipe(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        selectedItemId = id;
        $el('recipeTitle').textContent = item.name;
        $el('ingredientsDisplay').textContent = item.ingredients || '食材が入力されていません';
        $el('instructionsDisplay').textContent = item.instructions || '調理手順が入力されていません';
        showModal('recipeModal');
        startSleepPreventVideos();
    }
}

function markAsMade() {
    const item = items.find(item => item.id === selectedItemId);
    if (item) {
        item.lastMade = new Date().toISOString();
        saveItems();
        renderItems();
        closeModal('recipeModal');
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
            lastMade: new Date().toISOString()
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
    $el('shareButton').style.display = 'none';
}

function closeModal(id) {
    $el(id).style.display = 'none';
    $el('addButton').style.display = 'block';
    $el('shareButton').style.display = 'block';
    
    // レシピモーダルを閉じる時は動画も停止
    if (id === 'recipeModal') {
        stopSleepPreventVideos();
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

    $el('shareButton').onclick = async () => {
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

    $el('itemInput').addEventListener('keypress', handleAddModalKeyPress);

    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', e => {
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

    renderItems();
}

function startSleepPreventVideos() {
    const iosVideo = $el('sleep-prevent-video-ios');
    const androidVideo = $el('sleep-prevent-video-android');
    
    if (iosVideo) {
        iosVideo.play().catch(e => console.log('iOS video play failed:', e));
    }
    if (androidVideo) {
        androidVideo.play().catch(e => console.log('Android video play failed:', e));
    }
}

function stopSleepPreventVideos() {
    const iosVideo = $el('sleep-prevent-video-ios');
    const androidVideo = $el('sleep-prevent-video-android');
    
    if (iosVideo) {
        iosVideo.pause();
    }
    if (androidVideo) {
        androidVideo.pause();
    }
}

document.addEventListener('DOMContentLoaded', initializeApp); 