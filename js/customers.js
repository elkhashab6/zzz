// Customers Management
function initializeCustomers() {
    const customersPage = document.getElementById('customers');
    if (!customersPage) return;

    customersPage.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>العملاء</h2>
            <button class="btn btn-primary" onclick="showAddCustomerModal()">
                <i class="fas fa-user-plus"></i> إضافة عميل جديد
            </button>
        </div>

        <!-- Customer Stats -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h6 class="card-title">إجمالي العملاء</h6>
                        <h3 id="totalCustomers">0</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h6 class="card-title">العملاء النشطون</h6>
                        <h3 id="activeCustomers">0</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h6 class="card-title">إجمالي المبيعات</h6>
                        <h3 id="totalSales">0</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-dark">
                    <div class="card-body">
                        <h6 class="card-title">متوسط قيمة الفاتورة</h6>
                        <h3 id="averageInvoice">0</h3>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search and Filters -->
        <div class="row mb-4">
            <div class="col-md-8">
                <input type="text" class="form-control" id="searchCustomers" 
                       placeholder="بحث في العملاء...">
            </div>
            <div class="col-md-4">
                <select class="form-select" id="customerStatusFilter">
                    <option value="">كل العملاء</option>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                </select>
            </div>
        </div>

        <!-- Customers Table -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover" id="customersTable">
                        <thead>
                            <tr>
                                <th>الكود</th>
                                <th>الاسم</th>
                                <th>الهاتف</th>
                                <th>البريد الإلكتروني</th>
                                <th>العنوان</th>
                                <th>الحالة</th>
                                <th>إجمالي المبيعات</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="customersTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Initialize customers data
    loadCustomersData();
    setupCustomerFilters();
    updateCustomerStats();
}

function loadCustomersData() {
    const customers = utils.getFromStorage(CONFIG.STORAGE_KEYS.CUSTOMERS) || [];
    updateCustomersTable(customers);
}

function updateCustomersTable(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.code}</td>
            <td>${customer.name}</td>
            <td>${customer.phone}</td>
            <td>${customer.email}</td>
            <td>${customer.address}</td>
            <td>
                <span class="badge bg-${customer.active ? 'success' : 'secondary'}">
                    ${customer.active ? 'نشط' : 'غير نشط'}
                </span>
            </td>
            <td>${utils.formatCurrency(calculateCustomerSales(customer.id))}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" 
                        onclick="editCustomer('${customer.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info me-1"
                        onclick="viewCustomerDetails('${customer.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger"
                        onclick="deleteCustomer('${customer.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function calculateCustomerSales(customerId) {
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    return invoices
        .filter(invoice => invoice.customerId === customerId && invoice.type === 'sale')
        .reduce((total, invoice) => total + invoice.total, 0);
}

function setupCustomerFilters() {
    const searchInput = document.getElementById('searchCustomers');
    const statusFilter = document.getElementById('customerStatusFilter');

    if (!searchInput || !statusFilter) return;

    // Add event listeners
    searchInput.addEventListener('keyup', filterCustomers);
    statusFilter.addEventListener('change', filterCustomers);
}

function filterCustomers() {
    const searchTerm = document.getElementById('searchCustomers').value.toLowerCase();
    const status = document.getElementById('customerStatusFilter').value;

    let customers = utils.getFromStorage(CONFIG.STORAGE_KEYS.CUSTOMERS) || [];

    // Apply filters
    customers = customers.filter(customer => {
        const matchesSearch = 
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.code.toLowerCase().includes(searchTerm) ||
            customer.phone.includes(searchTerm);
        
        const matchesStatus = !status || 
            (status === 'active' && customer.active) ||
            (status === 'inactive' && !customer.active);

        return matchesSearch && matchesStatus;
    });

    updateCustomersTable(customers);
}

function updateCustomerStats() {
    const customers = utils.getFromStorage(CONFIG.STORAGE_KEYS.CUSTOMERS) || [];
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];

    // Calculate stats
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.active).length;
    const totalSales = invoices
        .filter(invoice => invoice.type === 'sale')
        .reduce((sum, invoice) => sum + invoice.total, 0);
    const averageInvoice = invoices.length > 0 ? totalSales / invoices.length : 0;

    // Update UI
    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('activeCustomers').textContent = activeCustomers;
    document.getElementById('totalSales').textContent = utils.formatCurrency(totalSales);
    document.getElementById('averageInvoice').textContent = utils.formatCurrency(averageInvoice);
}

function showAddCustomerModal(customerId = null) {
    const customer = customerId ? 
        (utils.getFromStorage(CONFIG.STORAGE_KEYS.CUSTOMERS) || [])
            .find(c => c.id === customerId) : null;

    const modal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    document.getElementById('customerModalTitle').textContent = 
        customer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد';

    // Fill form if editing
    if (customer) {
        document.getElementById('customerId').value = customer.id;
        document.getElementById('customerCode').value = customer.code;
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerEmail').value = customer.email;
        document.getElementById('customerAddress').value = customer.address;
        document.getElementById('customerActive').checked = customer.active;
    }

    modal.show();
}

function saveCustomer() {
    const customerId = document.getElementById('customerId').value;
    const customerData = {
        id: customerId || utils.generateId(),
        code: document.getElementById('customerCode').value,
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        email: document.getElementById('customerEmail').value,
        address: document.getElementById('customerAddress').value,
        active: document.getElementById('customerActive').checked
    };

    let customers = utils.getFromStorage(CONFIG.STORAGE_KEYS.CUSTOMERS) || [];

    if (customerId) {
        // Update existing customer
        customers = customers.map(customer => 
            customer.id === customerId ? customerData : customer
        );
    } else {
        // Add new customer
        customers.push(customerData);
    }

    utils.saveToStorage(CONFIG.STORAGE_KEYS.CUSTOMERS, customers);
    
    // Close modal and refresh data
    bootstrap.Modal.getInstance(document.getElementById('addCustomerModal')).hide();
    loadCustomersData();
    updateCustomerStats();
    utils.showAlert('success', 'تم حفظ بيانات العميل بنجاح');
}

function deleteCustomer(customerId) {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;

    let customers = utils.getFromStorage(CONFIG.STORAGE_KEYS.CUSTOMERS) || [];
    customers = customers.filter(customer => customer.id !== customerId);
    
    utils.saveToStorage(CONFIG.STORAGE_KEYS.CUSTOMERS, customers);
    loadCustomersData();
    updateCustomerStats();
    utils.showAlert('success', 'تم حذف العميل بنجاح');
}

function editCustomer(customerId) {
    showAddCustomerModal(customerId);
}

function viewCustomerDetails(customerId) {
    const customer = (utils.getFromStorage(CONFIG.STORAGE_KEYS.CUSTOMERS) || [])
        .find(c => c.id === customerId);
    
    if (!customer) return;

    const invoices = (utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [])
        .filter(invoice => invoice.customerId === customerId);

    // Show customer details in a modal
    const modalContent = `
        <div class="modal-header">
            <h5 class="modal-title">تفاصيل العميل</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
            <div class="row">
                <div class="col-md-6">
                    <p><strong>الكود:</strong> ${customer.code}</p>
                    <p><strong>الاسم:</strong> ${customer.name}</p>
                    <p><strong>الهاتف:</strong> ${customer.phone}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>البريد:</strong> ${customer.email}</p>
                    <p><strong>العنوان:</strong> ${customer.address}</p>
                    <p><strong>الحالة:</strong> 
                        <span class="badge bg-${customer.active ? 'success' : 'secondary'}">
                            ${customer.active ? 'نشط' : 'غير نشط'}
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
                                    <span class="badge bg-${invoice.type === 'sale' ? 'success' : 'primary'}">
                                        ${invoice.type === 'sale' ? 'بيع' : 'شراء'}
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
