// Invoices Management
function initializeInvoices() {
    const invoicesPage = document.getElementById('invoices');
    if (!invoicesPage) return;

    invoicesPage.innerHTML = `
        <h2>الفواتير</h2>
        <hr>
        
        <!-- Invoice Creation Card -->
        <div class="row mb-4">
            <div class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-file-invoice me-2"></i>
                            إنشاء فاتورة جديدة
                        </h5>
                    </div>
                    <div class="card-body">
                        <form id="invoiceForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">رقم الفاتورة</label>
                                    <input type="text" class="form-control" id="invoiceNumber" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">التاريخ</label>
                                    <input type="date" class="form-control" id="invoiceDate" required>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">العميل</label>
                                    <select class="form-select" id="customerSelect" required>
                                        <option value="">اختر العميل...</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">نوع الفاتورة</label>
                                    <select class="form-select" id="invoiceType" required>
                                        <option value="sale">بيع</option>
                                        <option value="purchase">شراء</option>
                                    </select>
                                </div>
                            </div>

                            <div class="table-responsive mb-3">
                                <table class="table table-bordered" id="itemsTable">
                                    <thead class="table-light">
                                        <tr>
                                            <th>الصنف</th>
                                            <th>الكمية</th>
                                            <th>السعر</th>
                                            <th>الإجمالي</th>
                                            <th>حذف</th>
                                        </tr>
                                    </thead>
                                    <tbody id="itemsTableBody"></tbody>
                                </table>
                            </div>

                            <button type="button" class="btn btn-secondary mb-3" onclick="addInvoiceItem()">
                                <i class="fas fa-plus"></i> إضافة صنف
                            </button>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">ملاحظات</label>
                                        <textarea class="form-control" id="invoiceNotes" rows="3"></textarea>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card bg-light">
                                        <div class="card-body">
                                            <h6 class="card-title">ملخص الفاتورة</h6>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>الإجمالي</span>
                                                <span id="subtotal">0.00</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>الضريبة (14%)</span>
                                                <span id="tax">0.00</span>
                                            </div>
                                            <hr>
                                            <div class="d-flex justify-content-between fw-bold">
                                                <span>الإجمالي النهائي</span>
                                                <span id="total">0.00</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="text-end mt-3">
                                <button type="button" class="btn btn-secondary me-2" onclick="resetInvoiceForm()">
                                    <i class="fas fa-times"></i> إلغاء
                                </button>
                                <button type="button" class="btn btn-info me-2" onclick="previewInvoice()">
                                    <i class="fas fa-eye"></i> معاينة
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> حفظ الفاتورة
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Recent Invoices Card -->
            <div class="col-lg-4">
                <div class="card shadow-sm">
                    <div class="card-header bg-info text-white">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-history me-2"></i>
                            آخر الفواتير
                        </h5>
                    </div>
                    <div class="card-body">
                        <div id="recentInvoices"></div>
                    </div>
                </div>
            </div>
        </div>

        <div id="savedInvoicesSection" class="mt-4"></div>
    `;

    // Initialize form handlers
    initializeInvoiceHandlers();
    loadRecentInvoices();
}

function initializeInvoiceHandlers() {
    const form = document.getElementById('invoiceForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveInvoice();
    });

    // Load customers into select
    const customers = utils.getFromStorage(CONFIG.STORAGE_KEYS.CUSTOMERS) || [];
    const customerSelect = document.getElementById('customerSelect');
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        customerSelect.appendChild(option);
    });
}

function addInvoiceItem() {
    const tbody = document.getElementById('itemsTableBody');
    const inventory = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVENTORY) || [];
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <select class="form-select item-select" required>
                <option value="">اختر الصنف...</option>
                ${inventory.map(item => `
                    <option value="${item.id}" data-price="${item.price}">
                        ${item.name}
                    </option>
                `).join('')}
            </select>
        </td>
        <td>
            <input type="number" class="form-control quantity-input" 
                   min="1" value="1" required>
        </td>
        <td>
            <input type="number" class="form-control price-input" 
                   min="0" step="0.01" required>
        </td>
        <td class="item-total">0.00</td>
        <td>
            <button type="button" class="btn btn-danger btn-sm"
                    onclick="this.closest('tr').remove(); updateTotal();">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    tbody.appendChild(row);

    // Add event listeners
    const itemSelect = row.querySelector('.item-select');
    const quantityInput = row.querySelector('.quantity-input');
    const priceInput = row.querySelector('.price-input');

    itemSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        priceInput.value = selectedOption.dataset.price || '';
        updateItemTotal(row);
    });

    [quantityInput, priceInput].forEach(input => {
        input.addEventListener('input', () => updateItemTotal(row));
    });
}

function updateItemTotal(row) {
    const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
    const price = parseFloat(row.querySelector('.price-input').value) || 0;
    const total = quantity * price;
    
    row.querySelector('.item-total').textContent = total.toFixed(2);
    updateTotal();
}

function updateTotal() {
    const totals = Array.from(document.querySelectorAll('.item-total'))
        .map(cell => parseFloat(cell.textContent) || 0);
    
    const subtotal = totals.reduce((sum, total) => sum + total, 0);
    const tax = subtotal * 0.14;
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('tax').textContent = tax.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
}

function saveInvoice() {
    const invoiceData = {
        id: utils.generateId(),
        number: document.getElementById('invoiceNumber').value,
        date: document.getElementById('invoiceDate').value,
        customerId: document.getElementById('customerSelect').value,
        type: document.getElementById('invoiceType').value,
        notes: document.getElementById('invoiceNotes').value,
        items: Array.from(document.getElementById('itemsTableBody').children).map(row => ({
            itemId: row.querySelector('.item-select').value,
            quantity: parseFloat(row.querySelector('.quantity-input').value),
            price: parseFloat(row.querySelector('.price-input').value),
            total: parseFloat(row.querySelector('.item-total').textContent)
        })),
        subtotal: parseFloat(document.getElementById('subtotal').textContent),
        tax: parseFloat(document.getElementById('tax').textContent),
        total: parseFloat(document.getElementById('total').textContent)
    };

    // Save to storage
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    invoices.push(invoiceData);
    utils.saveToStorage(CONFIG.STORAGE_KEYS.INVOICES, invoices);

    // Update inventory
    updateInventoryQuantities(invoiceData);

    // Show success message
    utils.showAlert('success', 'تم حفظ الفاتورة بنجاح');

    // Reset form and reload recent invoices
    resetInvoiceForm();
    loadRecentInvoices();
}

function updateInventoryQuantities(invoice) {
    const inventory = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVENTORY) || [];
    const multiplier = invoice.type === 'sale' ? -1 : 1;

    invoice.items.forEach(item => {
        const inventoryItem = inventory.find(i => i.id === item.itemId);
        if (inventoryItem) {
            inventoryItem.quantity += (item.quantity * multiplier);
        }
    });

    utils.saveToStorage(CONFIG.STORAGE_KEYS.INVENTORY, inventory);
}

function resetInvoiceForm() {
    document.getElementById('invoiceForm').reset();
    document.getElementById('itemsTableBody').innerHTML = '';
    updateTotal();
}

function loadRecentInvoices() {
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    const recentInvoices = document.getElementById('recentInvoices');
    
    if (!recentInvoices) return;

    recentInvoices.innerHTML = invoices.slice(-5).reverse().map(invoice => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <strong>${invoice.number}</strong>
                <br>
                <small class="text-muted">${utils.formatDate(invoice.date)}</small>
            </div>
            <div class="text-end">
                <strong>${utils.formatCurrency(invoice.total)}</strong>
                <br>
                <small class="text-${invoice.type === 'sale' ? 'success' : 'danger'}">
                    ${invoice.type === 'sale' ? 'بيع' : 'شراء'}
                </small>
            </div>
        </div>
    `).join('<hr>');
}

function previewInvoice() {
    // Implementation of invoice preview
    // This would typically open a modal with a printable version of the invoice
    alert('سيتم تنفيذ معاينة الفاتورة قريباً');
}
