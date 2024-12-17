// Inventory Management
function initializeInventory() {
    const inventoryPage = document.getElementById('inventory');
    if (!inventoryPage) return;

    inventoryPage.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>إدارة المخزون</h2>
            <button class="btn btn-primary" onclick="showAddInventoryModal()">
                <i class="fas fa-plus"></i> إضافة صنف جديد
            </button>
        </div>
        
        <div class="row mb-4">
            <!-- Inventory Stats -->
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h6 class="card-title">إجمالي الأصناف</h6>
                        <h3 id="totalItems">0</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h6 class="card-title">القيمة الإجمالية</h6>
                        <h3 id="totalValue">0</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-dark">
                    <div class="card-body">
                        <h6 class="card-title">الأصناف المنخفضة</h6>
                        <h3 id="lowStock">0</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h6 class="card-title">الفئات</h6>
                        <h3 id="totalCategories">0</h3>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="row mb-4">
            <div class="col-md-4">
                <input type="text" class="form-control" id="searchInventory" 
                       placeholder="بحث...">
            </div>
            <div class="col-md-3">
                <select class="form-select" id="categoryFilter">
                    <option value="">كل الفئات</option>
                </select>
            </div>
            <div class="col-md-3">
                <select class="form-select" id="stockFilter">
                    <option value="">كل المخزون</option>
                    <option value="low">مخزون منخفض</option>
                    <option value="out">نفذ المخزون</option>
                </select>
            </div>
        </div>

        <!-- Inventory Table -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover" id="inventoryTable">
                        <thead>
                            <tr>
                                <th>الكود</th>
                                <th>الصنف</th>
                                <th>الفئة</th>
                                <th>الكمية</th>
                                <th>السعر</th>
                                <th>القيمة</th>
                                <th>حد الطلب</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="inventoryTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Initialize inventory data
    loadInventoryData();
    setupInventoryFilters();
    updateInventoryStats();
}

function loadInventoryData() {
    const inventory = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVENTORY) || [];
    updateInventoryTable(inventory);
}

function updateInventoryTable(items) {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td class="${item.quantity <= item.reorderPoint ? 'text-danger' : ''}">
                ${item.quantity}
            </td>
            <td>${utils.formatCurrency(item.price)}</td>
            <td>${utils.formatCurrency(item.price * item.quantity)}</td>
            <td>${item.reorderPoint}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" 
                        onclick="editInventoryItem('${item.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger"
                        onclick="deleteInventoryItem('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function setupInventoryFilters() {
    const searchInput = document.getElementById('searchInventory');
    const categoryFilter = document.getElementById('categoryFilter');
    const stockFilter = document.getElementById('stockFilter');

    if (!searchInput || !categoryFilter || !stockFilter) return;

    // Load categories
    const inventory = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVENTORY) || [];
    const categories = [...new Set(inventory.map(item => item.category))];
    
    categoryFilter.innerHTML = `
        <option value="">كل الفئات</option>
        ${categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('')}
    `;

    // Add event listeners
    [searchInput, categoryFilter, stockFilter].forEach(element => {
        element.addEventListener('change', filterInventory);
    });
    searchInput.addEventListener('keyup', filterInventory);
}

function filterInventory() {
    const searchTerm = document.getElementById('searchInventory').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const stockStatus = document.getElementById('stockFilter').value;

    let inventory = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVENTORY) || [];

    // Apply filters
    inventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                            item.code.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || item.category === category;
        const matchesStock = !stockStatus || 
            (stockStatus === 'low' && item.quantity <= item.reorderPoint) ||
            (stockStatus === 'out' && item.quantity === 0);

        return matchesSearch && matchesCategory && matchesStock;
    });

    updateInventoryTable(inventory);
}

function updateInventoryStats() {
    const inventory = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVENTORY) || [];
    
    // Calculate stats
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const lowStock = inventory.filter(item => item.quantity <= item.reorderPoint).length;
    const categories = new Set(inventory.map(item => item.category)).size;

    // Update UI
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalValue').textContent = utils.formatCurrency(totalValue);
    document.getElementById('lowStock').textContent = lowStock;
    document.getElementById('totalCategories').textContent = categories;
}

function showAddInventoryModal(itemId = null) {
    const item = itemId ? 
        (utils.getFromStorage(CONFIG.STORAGE_KEYS.INVENTORY) || [])
            .find(i => i.id === itemId) : null;

    const modal = new bootstrap.Modal(document.getElementById('addInventoryModal'));
    document.getElementById('inventoryModalTitle').textContent = 
        item ? 'تعديل صنف' : 'إضافة صنف جديد';

    // Fill form if editing
    if (item) {
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemCode').value = item.code;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemQuantity').value = item.quantity;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemReorderPoint').value = item.reorderPoint;
    }

    modal.show();
}

function saveInventoryItem() {
    const itemId = document.getElementById('itemId').value;
    const itemData = {
        id: itemId || utils.generateId(),
        code: document.getElementById('itemCode').value,
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        quantity: parseFloat(document.getElementById('itemQuantity').value),
        price: parseFloat(document.getElementById('itemPrice').value),
        reorderPoint: parseFloat(document.getElementById('itemReorderPoint').value)
    };

    let inventory = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVENTORY) || [];

    if (itemId) {
        // Update existing item
        inventory = inventory.map(item => 
            item.id === itemId ? itemData : item
        );
    } else {
        // Add new item
        inventory.push(itemData);
    }

    utils.saveToStorage(CONFIG.STORAGE_KEYS.INVENTORY, inventory);
    
    // Close modal and refresh data
    bootstrap.Modal.getInstance(document.getElementById('addInventoryModal')).hide();
    loadInventoryData();
    updateInventoryStats();
    utils.showAlert('success', 'تم حفظ الصنف بنجاح');
}

function deleteInventoryItem(itemId) {
    if (!confirm('هل أنت متأكد من حذف هذا الصنف؟')) return;

    let inventory = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVENTORY) || [];
    inventory = inventory.filter(item => item.id !== itemId);
    
    utils.saveToStorage(CONFIG.STORAGE_KEYS.INVENTORY, inventory);
    loadInventoryData();
    updateInventoryStats();
    utils.showAlert('success', 'تم حذف الصنف بنجاح');
}

function editInventoryItem(itemId) {
    showAddInventoryModal(itemId);
}
