let items = JSON.parse(localStorage.getItem('MyToDo.shoppingItems')) || [];
let currentCategory = '買う';

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

function renderItems() {
    const itemList = document.getElementById('itemList');
    const filteredItems = items.filter(item => item.category === currentCategory);
    const sortedItems = filteredItems.sort((a, b) => {
        const order = a.checked ? -1 : 1;
        if (a.checked !== b.checked) return order;
        return (new Date(b.lastDone) - new Date(a.lastDone)) * order;
    });

    itemList.innerHTML = sortedItems.map(item => `
        <div class="item">
            <span class="item-name">${item.name}</span>
            <div class="item-right">
                ${!item.checked ? `<span class="last-date">${formatRelativeTime(item.lastDone)}</span>` : ''}
                <input type="checkbox" class="checkbox" 
                    ${item.checked ? 'checked' : ''} 
                    onchange="toggleItem('${item.id}')">
            </div>
        </div>
    `).join('');
}

function toggleItem(id) {
    const item = items.find(item => item.id === id);
    item.checked = !item.checked;
    item.lastDone = new Date().toISOString();
    saveItems();
    renderItems();
}

function addItem() {
    const input = document.getElementById('itemInput');
    if (input.value.trim()) {
        items.push({
            id: Date.now().toString(),
            name: input.value.trim(),
            category: currentCategory,
            checked: true,
            lastDone: new Date().toISOString()
        });
        saveItems();
        renderItems();
        input.value = '';
        closeModal();
    }
}

function saveItems() {
    localStorage.setItem('MyToDo.shoppingItems', JSON.stringify(items));
}

function closeModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('addButton').style.display = 'block';
}

function initializeApp() {
    document.getElementById('categoryTabs').addEventListener('click', (e) => {
        if (e.target.classList.contains('tab')) {
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.textContent;
            renderItems();
        }
    });

    document.getElementById('addButton').onclick = () => {
        const input = document.getElementById('itemInput');
        input.placeholder = `"${currentCategory}"に追加`;
        document.getElementById('addModal').style.display = 'block';
        document.getElementById('addButton').style.display = 'none';
        input.focus();
    };

    let touchStartX = 0;
    document.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    });

    document.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;
        const tabs = Array.from(document.querySelectorAll('.tab'));
        const currentIndex = tabs.findIndex(tab => tab.classList.contains('active'));
        
        if (Math.abs(diff) > 50) {
            let newIndex = diff > 0 ? currentIndex - 1 : currentIndex + 1;
            if (newIndex >= 0 && newIndex < tabs.length) {
                tabs[currentIndex].classList.remove('active');
                tabs[newIndex].classList.add('active');
                currentCategory = tabs[newIndex].textContent;
                renderItems();
            }
        }
    });

    renderItems();
}

document.addEventListener('DOMContentLoaded', initializeApp); 