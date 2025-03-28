let items = JSON.parse(localStorage.getItem('MyToDo.shoppingItems')) || [];
let currentCategory = '買う';
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
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        const category = tab.textContent;
        const hasChecked = items.some(item => item.category === category && item.checked);
        tab.classList.toggle('has-checked', hasChecked);
    });
}

function renderItems() {
    const itemList = $el('itemList');
    const filteredItems = items.filter(item => item.category === currentCategory);
    const sortedItems = filteredItems.sort((a, b) => {
        const order = a.checked ? -1 : 1;
        if (a.checked !== b.checked) return order;
        if (a.checked && b.checked) {
            return a.priority - b.priority;
        }
        return (new Date(b.lastDone) - new Date(a.lastDone)) * order;
    });

    itemList.innerHTML = sortedItems.map(item => `
        <div class="item">
            <span class="item-name" onclick="handleItemClick('${item.id}')">
                ${item.name}
            </span>
            <div class="item-right">
                ${!item.checked ? `<span class="last-date">${formatRelativeTime(item.lastDone)}</span>` : ''}
                <input type="checkbox" class="checkbox" 
                    ${item.checked ? 'checked' : ''} 
                    onchange="toggleItem('${item.id}')">
            </div>
        </div>
    `).join('');

    updateTabIndicators();
    setTimeout(adjustContainerHeight, 0);
}

function toggleItem(id) {
    const item = items.find(item => item.id === id);
    item.checked = !item.checked;
    item.lastDone = new Date().toISOString();
    saveItems();
    renderItems();
}

function addItem() {
    const input = $el('itemInput');
    if (input.value.trim()) {
        items.push({
            id: Date.now().toString(),
            name: input.value.trim(),
            category: currentCategory,
            checked: true,
            lastDone: new Date().toISOString(),
            priority: 10
        });
        saveItems();
        renderItems();
        input.value = '';
        closeModal('addModal');
    }
}

function handleAddModalKeyPress(event) {
    if (event.key === 'Enter') {
        addItem();
    }
}

function saveItems() {
    localStorage.setItem('MyToDo.shoppingItems', JSON.stringify(items));
}

function handleItemClick(id) {
    selectedItemId = id;
    const item = items.find(item => item.id === id);
    const editInput = $el('editInput');
    const priorityInput = $el('priorityInput');
    editInput.value = item.name;
    priorityInput.value = item.priority || 10;
    showModal('editModal');
    editInput.focus();
    editInput.select();
}

function updateItem() {
    const editInput = $el('editInput');
    const priorityInput = $el('priorityInput');
    const item = items.find(item => item.id === selectedItemId);
    if (editInput.value.trim() && item) {
        item.name = editInput.value.trim();
        item.priority = parseFloat(priorityInput.value) || item.priority;
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

function showModal(id) {
    $el(id).style.display = 'block';
    $el('addButton').style.display = 'none';
}

function closeModal(id) {
    $el(id).style.display = 'none';
    $el('addButton').style.display = 'block';
}

function handleModalOutsideClick(event) {
    if (event.target.id === 'editModal' || event.target.id === 'addModal') {
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

    $el('addButton').onclick = () => {
        const input = $el('itemInput');
        input.placeholder = `"${currentCategory}"に追加`;
        showModal('addModal');
        input.focus();
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

document.addEventListener('DOMContentLoaded', initializeApp); 