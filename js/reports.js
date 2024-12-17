// Reports Management
function initializeReports() {
    const reportsPage = document.getElementById('reports');
    if (!reportsPage) return;

    reportsPage.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2>التقارير</h2>
                <hr>
            </div>
        </div>

        <!-- Report Filters -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3">
                        <label class="form-label">نوع التقرير</label>
                        <select class="form-select" id="reportType">
                            <option value="sales">المبيعات</option>
                            <option value="purchases">المشتريات</option>
                            <option value="inventory">المخزون</option>
                            <option value="customers">العملاء</option>
                            <option value="suppliers">الموردين</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">من تاريخ</label>
                        <input type="date" class="form-control" id="startDate">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">إلى تاريخ</label>
                        <input type="date" class="form-control" id="endDate">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">&nbsp;</label>
                        <button class="btn btn-primary d-block w-100" onclick="generateReport()">
                            <i class="fas fa-sync"></i> توليد التقرير
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Report Charts -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <canvas id="reportChart1"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <canvas id="reportChart2"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Report Details -->
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="card-title mb-0">تفاصيل التقرير</h5>
                    <button class="btn btn-success" onclick="exportReport()">
                        <i class="fas fa-file-excel"></i> تصدير Excel
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover" id="reportTable">
                        <thead id="reportTableHead"></thead>
                        <tbody id="reportTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Set default dates
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('startDate').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];

    // Initialize report type change handler
    document.getElementById('reportType').addEventListener('change', () => {
        generateReport();
    });

    // Generate initial report
    generateReport();
}

function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Get data based on report type
    const data = getReportData(reportType, startDate, endDate);

    // Update charts
    updateReportCharts(reportType, data);

    // Update table
    updateReportTable(reportType, data);
}

function getReportData(reportType, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    switch(reportType) {
        case 'sales':
            return getSalesData(start, end);
        case 'purchases':
            return getPurchasesData(start, end);
        case 'inventory':
            return getInventoryData();
        case 'customers':
            return getCustomersData(start, end);
        case 'suppliers':
            return getSuppliersData(start, end);
        default:
            return [];
    }
}

function getSalesData(start, end) {
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    return invoices.filter(invoice => 
        invoice.type === 'sale' &&
        new Date(invoice.date) >= start &&
        new Date(invoice.date) <= end
    );
}

function getPurchasesData(start, end) {
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    return invoices.filter(invoice => 
        invoice.type === 'purchase' &&
        new Date(invoice.date) >= start &&
        new Date(invoice.date) <= end
    );
}

function getInventoryData() {
    return utils.getFromStorage(CONFIG.STORAGE_KEYS.INVENTORY) || [];
}

function getCustomersData(start, end) {
    const customers = utils.getFromStorage(CONFIG.STORAGE_KEYS.CUSTOMERS) || [];
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    
    return customers.map(customer => {
        const customerInvoices = invoices.filter(invoice => 
            invoice.customerId === customer.id &&
            invoice.type === 'sale' &&
            new Date(invoice.date) >= start &&
            new Date(invoice.date) <= end
        );

        return {
            ...customer,
            totalSales: customerInvoices.reduce((sum, inv) => sum + inv.total, 0),
            invoiceCount: customerInvoices.length
        };
    });
}

function getSuppliersData(start, end) {
    const suppliers = utils.getFromStorage(CONFIG.STORAGE_KEYS.SUPPLIERS) || [];
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    
    return suppliers.map(supplier => {
        const supplierInvoices = invoices.filter(invoice => 
            invoice.supplierId === supplier.id &&
            invoice.type === 'purchase' &&
            new Date(invoice.date) >= start &&
            new Date(invoice.date) <= end
        );

        return {
            ...supplier,
            totalPurchases: supplierInvoices.reduce((sum, inv) => sum + inv.total, 0),
            invoiceCount: supplierInvoices.length
        };
    });
}

function updateReportCharts(reportType, data) {
    // Clear existing charts
    Chart.helpers.each(Chart.instances, (instance) => {
        instance.destroy();
    });

    switch(reportType) {
        case 'sales':
        case 'purchases':
            createInvoiceCharts(data, reportType);
            break;
        case 'inventory':
            createInventoryCharts(data);
            break;
        case 'customers':
            createCustomerCharts(data);
            break;
        case 'suppliers':
            createSupplierCharts(data);
            break;
    }
}

function createInvoiceCharts(data, type) {
    // Daily totals chart
    const dailyData = {};
    data.forEach(invoice => {
        const date = invoice.date.split('T')[0];
        dailyData[date] = (dailyData[date] || 0) + invoice.total;
    });

    new Chart(document.getElementById('reportChart1').getContext('2d'), {
        type: 'line',
        data: {
            labels: Object.keys(dailyData),
            datasets: [{
                label: `إجمالي ال${type === 'sales' ? 'مبيعات' : 'مشتريات'} اليومية`,
                data: Object.values(dailyData),
                borderColor: '#2980b9',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `تحليل ال${type === 'sales' ? 'مبيعات' : 'مشتريات'} اليومية`
                }
            }
        }
    });

    // Items distribution chart
    const itemsData = {};
    data.forEach(invoice => {
        invoice.items.forEach(item => {
            itemsData[item.itemId] = (itemsData[item.itemId] || 0) + item.total;
        });
    });

    new Chart(document.getElementById('reportChart2').getContext('2d'), {
        type: 'pie',
        data: {
            labels: Object.keys(itemsData),
            datasets: [{
                data: Object.values(itemsData),
                backgroundColor: [
                    '#2ecc71',
                    '#3498db',
                    '#9b59b6',
                    '#f1c40f',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'توزيع الأصناف'
                }
            }
        }
    });
}

function createInventoryCharts(data) {
    // Categories distribution
    const categories = {};
    data.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + item.quantity;
    });

    new Chart(document.getElementById('reportChart1').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#2ecc71',
                    '#3498db',
                    '#9b59b6',
                    '#f1c40f',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'توزيع المخزون حسب الفئات'
                }
            }
        }
    });

    // Value distribution
    const values = data.map(item => ({
        name: item.name,
        value: item.price * item.quantity
    })).sort((a, b) => b.value - a.value).slice(0, 10);

    new Chart(document.getElementById('reportChart2').getContext('2d'), {
        type: 'bar',
        data: {
            labels: values.map(v => v.name),
            datasets: [{
                label: 'قيمة المخزون',
                data: values.map(v => v.value),
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'أعلى 10 أصناف من حيث القيمة'
                }
            }
        }
    });
}

function createCustomerCharts(data) {
    // Top customers by sales
    const topCustomers = [...data]
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 10);

    new Chart(document.getElementById('reportChart1').getContext('2d'), {
        type: 'bar',
        data: {
            labels: topCustomers.map(c => c.name),
            datasets: [{
                label: 'إجمالي المبيعات',
                data: topCustomers.map(c => c.totalSales),
                backgroundColor: '#2ecc71'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'أفضل 10 عملاء'
                }
            }
        }
    });

    // Customers by invoice count
    const customersByInvoices = [...data]
        .sort((a, b) => b.invoiceCount - a.invoiceCount)
        .slice(0, 10);

    new Chart(document.getElementById('reportChart2').getContext('2d'), {
        type: 'bar',
        data: {
            labels: customersByInvoices.map(c => c.name),
            datasets: [{
                label: 'عدد الفواتير',
                data: customersByInvoices.map(c => c.invoiceCount),
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'العملاء الأكثر نشاطاً'
                }
            }
        }
    });
}

function createSupplierCharts(data) {
    // Top suppliers by purchases
    const topSuppliers = [...data]
        .sort((a, b) => b.totalPurchases - a.totalPurchases)
        .slice(0, 10);

    new Chart(document.getElementById('reportChart1').getContext('2d'), {
        type: 'bar',
        data: {
            labels: topSuppliers.map(s => s.name),
            datasets: [{
                label: 'إجمالي المشتريات',
                data: topSuppliers.map(s => s.totalPurchases),
                backgroundColor: '#e74c3c'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'أكبر 10 موردين'
                }
            }
        }
    });

    // Suppliers by invoice count
    const suppliersByInvoices = [...data]
        .sort((a, b) => b.invoiceCount - a.invoiceCount)
        .slice(0, 10);

    new Chart(document.getElementById('reportChart2').getContext('2d'), {
        type: 'bar',
        data: {
            labels: suppliersByInvoices.map(s => s.name),
            datasets: [{
                label: 'عدد الفواتير',
                data: suppliersByInvoices.map(s => s.invoiceCount),
                backgroundColor: '#9b59b6'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'الموردون الأكثر نشاطاً'
                }
            }
        }
    });
}

function updateReportTable(reportType, data) {
    const thead = document.getElementById('reportTableHead');
    const tbody = document.getElementById('reportTableBody');

    switch(reportType) {
        case 'sales':
        case 'purchases':
            thead.innerHTML = `
                <tr>
                    <th>التاريخ</th>
                    <th>رقم الفاتورة</th>
                    <th>${reportType === 'sales' ? 'العميل' : 'المورد'}</th>
                    <th>عدد الأصناف</th>
                    <th>الإجمالي</th>
                </tr>
            `;
            tbody.innerHTML = data.map(invoice => `
                <tr>
                    <td>${utils.formatDate(invoice.date)}</td>
                    <td>${invoice.number}</td>
                    <td>${invoice.customerName || invoice.supplierName}</td>
                    <td>${invoice.items.length}</td>
                    <td>${utils.formatCurrency(invoice.total)}</td>
                </tr>
            `).join('');
            break;

        case 'inventory':
            thead.innerHTML = `
                <tr>
                    <th>الكود</th>
                    <th>الصنف</th>
                    <th>الفئة</th>
                    <th>الكمية</th>
                    <th>السعر</th>
                    <th>القيمة</th>
                </tr>
            `;
            tbody.innerHTML = data.map(item => `
                <tr>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.quantity}</td>
                    <td>${utils.formatCurrency(item.price)}</td>
                    <td>${utils.formatCurrency(item.price * item.quantity)}</td>
                </tr>
            `).join('');
            break;

        case 'customers':
            thead.innerHTML = `
                <tr>
                    <th>الكود</th>
                    <th>العميل</th>
                    <th>عدد الفواتير</th>
                    <th>إجمالي المبيعات</th>
                    <th>الحالة</th>
                </tr>
            `;
            tbody.innerHTML = data.map(customer => `
                <tr>
                    <td>${customer.code}</td>
                    <td>${customer.name}</td>
                    <td>${customer.invoiceCount}</td>
                    <td>${utils.formatCurrency(customer.totalSales)}</td>
                    <td>
                        <span class="badge bg-${customer.active ? 'success' : 'secondary'}">
                            ${customer.active ? 'نشط' : 'غير نشط'}
                        </span>
                    </td>
                </tr>
            `).join('');
            break;

        case 'suppliers':
            thead.innerHTML = `
                <tr>
                    <th>الكود</th>
                    <th>المورد</th>
                    <th>عدد الفواتير</th>
                    <th>إجمالي المشتريات</th>
                    <th>الحالة</th>
                </tr>
            `;
            tbody.innerHTML = data.map(supplier => `
                <tr>
                    <td>${supplier.code}</td>
                    <td>${supplier.name}</td>
                    <td>${supplier.invoiceCount}</td>
                    <td>${utils.formatCurrency(supplier.totalPurchases)}</td>
                    <td>
                        <span class="badge bg-${supplier.active ? 'success' : 'secondary'}">
                            ${supplier.active ? 'نشط' : 'غير نشط'}
                        </span>
                    </td>
                </tr>
            `).join('');
            break;
    }
}

function exportReport() {
    // This is a placeholder for report export functionality
    // In a real application, this would generate an Excel file
    alert('سيتم تنفيذ تصدير التقرير قريباً');
}
