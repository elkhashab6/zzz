// Suppliers Management
function initializeSuppliers() {
    const suppliersPage = document.getElementById('suppliers');
    if (!suppliersPage) return;

    suppliersPage.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>الموردون</h2>
            <button class="btn btn-primary" onclick="showAddSupplierModal()">
                <i class="fas fa-user-plus"></i> إضافة مورد جديد
            </button>
        </div>

        <!-- Supplier Stats -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h6 class="card-title">إجمالي الموردين</h6>
                        <h3 id="totalSuppliers">0</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h6 class="card-title">الموردون النشطون</h6>
                        <h3 id="activeSuppliers">0</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h6 class="card-title">إجمالي المشتريات</h6>
                        <h3 id="totalPurchases">0</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-dark">
                    <div class="card-body">
                        <h6 class="card-title">متوسط قيمة الفاتورة</h6>
                        <h3 id="averagePurchase">0</h3>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search and Filters -->
        <div class="row mb-4">
            <div class="col-md-8">
                <input type="text" class="form-control" id="searchSuppliers" 
                       placeholder="بحث في الموردين...">
            </div>
            <div class="col-md-4">
                <select class="form-select" id="supplierStatusFilter">
                    <option value="">كل الموردين</option>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                </select>
            </div>
        </div>

        <!-- Suppliers Table -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover" id="suppliersTable">
                        <thead>
                            <tr>
                                <th>الكود</th>
                                <th>الاسم</th>
                                <th>الهاتف</th>
                                <th>البريد الإلكتروني</th>
                                <th>العنوان</th>
                                <th>الحالة</th>
                                <th>إجمالي المشتريات</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="suppliersTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Initialize suppliers data
    loadSuppliersData();
    setupSupplierFilters();
    updateSupplierStats();
}

function loadSuppliersData() {
    const suppliers = utils.getFromStorage(CONFIG.STORAGE_KEYS.SUPPLIERS) || [];
    updateSuppliersTable(suppliers);
}

function updateSuppliersTable(suppliers) {
    const tbody = document.getElementById('suppliersTableBody');
    if (!tbody) return;

    tbody.innerHTML = suppliers.map(supplier => `
        <tr>
            <td>${supplier.code}</td>
            <td>${supplier.name}</td>
            <td>${supplier.phone}</td>
            <td>${supplier.email}</td>
            <td>${supplier.address}</td>
            <td>
                <span class="badge bg-${supplier.active ? 'success' : 'secondary'}">
                    ${supplier.active ? 'نشط' : 'غير نشط'}
                </span>
            </td>
            <td>${utils.formatCurrency(calculateSupplierPurchases(supplier.id))}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" 
                        onclick="editSupplier('${supplier.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info me-1"
                        onclick="viewSupplierDetails('${supplier.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger"
                        onclick="deleteSupplier('${supplier.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function calculateSupplierPurchases(supplierId) {
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    return invoices
        .filter(invoice => invoice.supplierId === supplierId && invoice.type === 'purchase')
        .reduce((total, invoice) => total + invoice.total, 0);
}

function setupSupplierFilters() {
    const searchInput = document.getElementById('searchSuppliers');
    const statusFilter = document.getElementById('supplierStatusFilter');

    if (!searchInput || !statusFilter) return;

    // Add event listeners
    searchInput.addEventListener('keyup', filterSuppliers);
    statusFilter.addEventListener('change', filterSuppliers);
}

function filterSuppliers() {
    const searchTerm = document.getElementById('searchSuppliers').value.toLowerCase();
    const status = document.getElementById('supplierStatusFilter').value;

    let suppliers = utils.getFromStorage(CONFIG.STORAGE_KEYS.SUPPLIERS) || [];

    // Apply filters
    suppliers = suppliers.filter(supplier => {
        const matchesSearch = 
            supplier.name.toLowerCase().includes(searchTerm) ||
            supplier.code.toLowerCase().includes(searchTerm) ||
            supplier.phone.includes(searchTerm);
        
        const matchesStatus = !status || 
            (status === 'active' && supplier.active) ||
            (status === 'inactive' && !supplier.active);

        return matchesSearch && matchesStatus;
    });

    updateSuppliersTable(suppliers);
}

function updateSupplierStats() {
    const suppliers = utils.getFromStorage(CONFIG.STORAGE_KEYS.SUPPLIERS) || [];
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];

    // Calculate stats
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.active).length;
    const totalPurchases = invoices
        .filter(invoice => invoice.type === 'purchase')
        .reduce((sum, invoice) => sum + invoice.total, 0);
    const purchaseInvoices = invoices.filter(invoice => invoice.type === 'purchase');
    const averagePurchase = purchaseInvoices.length > 0 ? 
        totalPurchases / purchaseInvoices.length : 0;

    // Update UI
    document.getElementById('totalSuppliers').textContent = totalSuppliers;
    document.getElementById('activeSuppliers').textContent = activeSuppliers;
    document.getElementById('totalPurchases').textContent = utils.formatCurrency(totalPurchases);
    document.getElementById('averagePurchase').textContent = utils.formatCurrency(averagePurchase);
}

function showAddSupplierModal(supplierId = null) {
    const supplier = supplierId ? 
        (utils.getFromStorage(CONFIG.STORAGE_KEYS.SUPPLIERS) || [])
            .find(s => s.id === supplierId) : null;

    const modal = new bootstrap.Modal(document.getElementById('addSupplierModal'));
    document.getElementById('supplierModalTitle').textContent = 
        supplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد';

    // Fill form if editing
    if (supplier) {
        document.getElementById('supplierId').value = supplier.id;
        document.getElementById('supplierCode').value = supplier.code;
        document.getElementById('supplierName').value = supplier.name;
        document.getElementById('supplierPhone').value = supplier.phone;
        document.getElementById('supplierEmail').value = supplier.email;
        document.getElementById('supplierAddress').value = supplier.address;
        document.getElementById('supplierActive').checked = supplier.active;
    }

    modal.show();
}

function saveSupplier() {
    const supplierId = document.getElementById('supplierId').value;
    const supplierData = {
        id: supplierId || utils.generateId(),
        code: document.getElementById('supplierCode').value,
        name: document.getElementById('supplierName').value,
        phone: document.getElementById('supplierPhone').value,
        email: document.getElementById('supplierEmail').value,
        address: document.getElementById('supplierAddress').value,
        active: document.getElementById('supplierActive').checked
    };

    let suppliers = utils.getFromStorage(CONFIG.STORAGE_KEYS.SUPPLIERS) || [];

    if (supplierId) {
        // Update existing supplier
        suppliers = suppliers.map(supplier => 
            supplier.id === supplierId ? supplierData : supplier
        );
    } else {
        // Add new supplier
        suppliers.push(supplierData);
    }

    utils.saveToStorage(CONFIG.STORAGE_KEYS.SUPPLIERS, suppliers);
    
    // Close modal and refresh data
    bootstrap.Modal.getInstance(document.getElementById('addSupplierModal')).hide();
    loadSuppliersData();
    updateSupplierStats();
    utils.showAlert('success', 'تم حفظ بيانات المورد بنجاح');
}

function deleteSupplier(supplierId) {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;

    let suppliers = utils.getFromStorage(CONFIG.STORAGE_KEYS.SUPPLIERS) || [];
    suppliers = suppliers.filter(supplier => supplier.id !== supplierId);
    
    utils.saveToStorage(CONFIG.STORAGE_KEYS.SUPPLIERS, suppliers);
    loadSuppliersData();
    updateSupplierStats();
    utils.showAlert('success', 'تم حذف المورد بنجاح');
}

function editSupplier(supplierId) {
    showAddSupplierModal(supplierId);
}

function viewSupplierDetails(supplierId) {
    const supplier = (utils.getFromStorage(CONFIG.STORAGE_KEYS.SUPPLIERS) || [])
        .find(s => s.id === supplierId);
    
    if (!supplier) return;

    const invoices = (utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [])
        .filter(invoice => invoice.supplierId === supplierId);

    // Show supplier details in a modal
    const modalContent = `
        <div class="modal-header">
            <h5 class="modal-title">تفاصيل المورد</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
            <div class="row">
                <div class="col-md-6">
                    <p><strong>الكود:</strong> ${supplier.code}</p>
                    <p><strong>الاسم:</strong> ${supplier.name}</p>
                    <p><strong>الهاتف:</strong> ${supplier.phone}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>البريد:</strong> ${supplier.email}</p>
                    <p><strong>العنوان:</strong> ${supplier.address}</p>
                    <p><strong>الحالة:</strong> 
                        <span class="badge bg-${supplier.active ? 'success' : 'secondary'}">
                            ${supplier.active ? 'نشط' : 'غير نشط'}
                        </span>
                    </p>
                </div>
            </div>
            
            <h6 class="mt-4">آخر المعاملات</h6>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>رقم الفاتورة</th>
                            <th>النوع</th>
                            <th>القيمة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoices.slice(-5).map(invoice => `
                            <tr>
                                <td>${utils.formatDate(invoice.date)}</td>
                                <td>${invoice.number}</td>
                                <td>
                                    <span class="badge bg-${invoice.type === 'purchase' ? 'primary' : 'success'}">
                                        ${invoice.type === 'purchase' ? 'شراء' : 'بيع'}
                                    </span>
                                </td>
                                <td>${utils.formatCurrency(invoice.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                ${modalContent}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}
