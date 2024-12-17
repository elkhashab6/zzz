// Debt and Receivables Tracking System
const DEBT_TYPES = {
    RECEIVABLE: 'مستحقات',
    PAYABLE: 'ديون'
};

const DEBT_STATUS = {
    PENDING: 'معلق',
    PARTIALLY_PAID: 'مدفوع جزئياً',
    PAID: 'مدفوع بالكامل',
    OVERDUE: 'متأخر'
};

function initializeDebts() {
    const debtsPage = document.getElementById('debts');
    if (!debtsPage) return;

    displayDebtsDashboard();
    setupDebtsListeners();
}

function displayDebtsDashboard() {
    const debtsPage = document.getElementById('debts');
    
    debtsPage.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2>نظام تتبع الديون والمستحقات</h2>
                <hr>
            </div>
        </div>

        <!-- Debt Entry -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">تسجيل دين/مستحق جديد</h5>
                    </div>
                    <div class="card-body">
                        <form id="debtForm">
                            <div class="mb-3">
                                <label class="form-label">النوع</label>
                                <select class="form-select" name="type" required>
                                    ${Object.entries(DEBT_TYPES).map(([key, value]) => 
                                        `<option value="${key}">${value}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">الطرف الآخر</label>
                                <input type="text" class="form-control" name="party" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">المبلغ</label>
                                <input type="number" class="form-control" name="amount" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">تاريخ الاستحقاق</label>
                                <input type="date" class="form-control" name="dueDate" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">ملاحظات</label>
                                <textarea class="form-control" name="notes"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">تسجيل</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="card-title mb-0">قائمة الديون والمستحقات</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table" id="debtsTable">
                                <thead>
                                    <tr>
                                        <th>النوع</th>
                                        <th>الطرف</th>
                                        <th>المبلغ</th>
                                        <th>المدفوع</th>
                                        <th>المتبقي</th>
                                        <th>تاريخ الاستحقاق</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Payment Entry -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0">تسجيل دفعة</h5>
                    </div>
                    <div class="card-body">
                        <form id="paymentForm" class="row">
                            <div class="col-md-3">
                                <label class="form-label">الدين/المستحق</label>
                                <select class="form-select" name="debtId" required>
                                    <option value="">اختر...</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">المبلغ</label>
                                <input type="number" class="form-control" name="amount" required>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">تاريخ الدفع</label>
                                <input type="date" class="form-control" name="paymentDate" required>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">&nbsp;</label>
                                <button type="submit" class="btn btn-success d-block w-100">تسجيل الدفعة</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Debt Analysis -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="card-title mb-0">تحليل الديون والمستحقات</h5>
                    </div>
                    <div class="card-body">
                        <div id="debtAnalysis"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupDebtsListeners() {
    // Debt Form Submission
    const debtForm = document.getElementById('debtForm');
    if (debtForm) {
        debtForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addDebt(new FormData(this));
        });
    }

    // Payment Form Submission
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addPayment(new FormData(this));
        });
    }

    // Load initial data
    loadDebts();
    updatePaymentSelect();
}

function addDebt(formData) {
    const debts = utils.getFromStorage(CONFIG.STORAGE_KEYS.DEBTS) || [];
    
    const newDebt = {
        id: utils.generateId(),
        type: formData.get('type'),
        party: formData.get('party'),
        amount: parseFloat(formData.get('amount')),
        dueDate: formData.get('dueDate'),
        notes: formData.get('notes'),
        payments: [],
        createdDate: new Date().toISOString()
    };

    debts.push(newDebt);
    utils.saveToStorage(CONFIG.STORAGE_KEYS.DEBTS, debts);
    
    utils.showAlert('success', 'تم تسجيل الدين/المستحق بنجاح');
    document.getElementById('debtForm').reset();
    loadDebts();
    updatePaymentSelect();
}

function loadDebts() {
    const debts = utils.getFromStorage(CONFIG.STORAGE_KEYS.DEBTS) || [];
    const tbody = document.querySelector('#debtsTable tbody');
    
    if (!tbody) return;

    tbody.innerHTML = debts.map(debt => {
        const paidAmount = calculatePaidAmount(debt);
        const remainingAmount = debt.amount - paidAmount;
        const status = getDebtStatus(debt, paidAmount);
        
        return `
            <tr>
                <td>${DEBT_TYPES[debt.type]}</td>
                <td>${debt.party}</td>
                <td>${utils.formatCurrency(debt.amount)}</td>
                <td>${utils.formatCurrency(paidAmount)}</td>
                <td>${utils.formatCurrency(remainingAmount)}</td>
                <td>${new Date(debt.dueDate).toLocaleDateString()}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(status)}">
                        ${DEBT_STATUS[status]}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewDebtDetails('${debt.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDebt('${debt.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    displayDebtAnalysis();
}

function calculatePaidAmount(debt) {
    return debt.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

function getDebtStatus(debt, paidAmount) {
    const dueDate = new Date(debt.dueDate);
    const today = new Date();
    
    if (paidAmount >= debt.amount) {
        return 'PAID';
    } else if (paidAmount > 0) {
        return dueDate < today ? 'OVERDUE' : 'PARTIALLY_PAID';
    } else {
        return dueDate < today ? 'OVERDUE' : 'PENDING';
    }
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'PAID':
            return 'bg-success';
        case 'PARTIALLY_PAID':
            return 'bg-info';
        case 'OVERDUE':
            return 'bg-danger';
        default:
            return 'bg-warning';
    }
}

function updatePaymentSelect() {
    const debts = utils.getFromStorage(CONFIG.STORAGE_KEYS.DEBTS) || [];
    const select = document.querySelector('#paymentForm select[name="debtId"]');
    
    if (!select) return;

    select.innerHTML = `
        <option value="">اختر...</option>
        ${debts.filter(debt => calculatePaidAmount(debt) < debt.amount)
            .map(debt => `
                <option value="${debt.id}">
                    ${DEBT_TYPES[debt.type]} - ${debt.party} - ${utils.formatCurrency(debt.amount)}
                </option>
            `).join('')}
    `;
}

function addPayment(formData) {
    const debts = utils.getFromStorage(CONFIG.STORAGE_KEYS.DEBTS) || [];
    const debtId = formData.get('debtId');
    const debt = debts.find(d => d.id === debtId);
    
    if (!debt) {
        utils.showAlert('danger', 'لم يتم العثور على الدين/المستحق');
        return;
    }

    const paymentAmount = parseFloat(formData.get('amount'));
    const remainingAmount = debt.amount - calculatePaidAmount(debt);
    
    if (paymentAmount > remainingAmount) {
        utils.showAlert('danger', 'مبلغ الدفعة أكبر من المبلغ المتبقي');
        return;
    }

    const payment = {
        id: utils.generateId(),
        amount: paymentAmount,
        date: formData.get('paymentDate'),
        createdDate: new Date().toISOString()
    };

    debt.payments.push(payment);
    utils.saveToStorage(CONFIG.STORAGE_KEYS.DEBTS, debts);
    
    utils.showAlert('success', 'تم تسجيل الدفعة بنجاح');
    document.getElementById('paymentForm').reset();
    loadDebts();
    updatePaymentSelect();
}

function viewDebtDetails(debtId) {
    const debts = utils.getFromStorage(CONFIG.STORAGE_KEYS.DEBTS) || [];
    const debt = debts.find(d => d.id === debtId);
    
    if (!debt) return;

    const paidAmount = calculatePaidAmount(debt);
    const remainingAmount = debt.amount - paidAmount;
    const status = getDebtStatus(debt, paidAmount);

    const analysisDiv = document.getElementById('debtAnalysis');
    if (!analysisDiv) return;

    analysisDiv.innerHTML = `
        <h6>تفاصيل ${DEBT_TYPES[debt.type]} - ${debt.party}</h6>
        <div class="row">
            <div class="col-md-6">
                <div class="card bg-light">
                    <div class="card-body">
                        <h6 class="card-title">معلومات أساسية</h6>
                        <table class="table table-striped">
                            <tr>
                                <th>المبلغ الكلي</th>
                                <td>${utils.formatCurrency(debt.amount)}</td>
                            </tr>
                            <tr>
                                <th>المبلغ المدفوع</th>
                                <td>${utils.formatCurrency(paidAmount)}</td>
                            </tr>
                            <tr>
                                <th>المبلغ المتبقي</th>
                                <td>${utils.formatCurrency(remainingAmount)}</td>
                            </tr>
                            <tr>
                                <th>تاريخ الاستحقاق</th>
                                <td>${new Date(debt.dueDate).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <th>الحالة</th>
                                <td>
                                    <span class="badge ${getStatusBadgeClass(status)}">
                                        ${DEBT_STATUS[status]}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card bg-light">
                    <div class="card-body">
                        <h6 class="card-title">سجل الدفعات</h6>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>التاريخ</th>
                                        <th>المبلغ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${debt.payments.map(payment => `
                                        <tr>
                                            <td>${new Date(payment.date).toLocaleDateString()}</td>
                                            <td>${utils.formatCurrency(payment.amount)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayDebtAnalysis() {
    const debts = utils.getFromStorage(CONFIG.STORAGE_KEYS.DEBTS) || [];
    
    // Calculate totals
    const analysis = {
        receivables: {
            total: 0,
            paid: 0,
            remaining: 0
        },
        payables: {
            total: 0,
            paid: 0,
            remaining: 0
        }
    };

    debts.forEach(debt => {
        const paidAmount = calculatePaidAmount(debt);
        const category = debt.type === 'RECEIVABLE' ? 'receivables' : 'payables';
        
        analysis[category].total += debt.amount;
        analysis[category].paid += paidAmount;
        analysis[category].remaining += (debt.amount - paidAmount);
    });

    const reportsDiv = document.getElementById('debtAnalysis');
    if (!reportsDiv) return;

    reportsDiv.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h6 class="card-title">المستحقات</h6>
                        <table class="table table-dark">
                            <tr>
                                <th>إجمالي المستحقات</th>
                                <td>${utils.formatCurrency(analysis.receivables.total)}</td>
                            </tr>
                            <tr>
                                <th>المحصل</th>
                                <td>${utils.formatCurrency(analysis.receivables.paid)}</td>
                            </tr>
                            <tr>
                                <th>المتبقي</th>
                                <td>${utils.formatCurrency(analysis.receivables.remaining)}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card bg-warning text-dark">
                    <div class="card-body">
                        <h6 class="card-title">الديون</h6>
                        <table class="table">
                            <tr>
                                <th>إجمالي الديون</th>
                                <td>${utils.formatCurrency(analysis.payables.total)}</td>
                            </tr>
                            <tr>
                                <th>المسدد</th>
                                <td>${utils.formatCurrency(analysis.payables.paid)}</td>
                            </tr>
                            <tr>
                                <th>المتبقي</th>
                                <td>${utils.formatCurrency(analysis.payables.remaining)}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="text-end mt-3">
            <button class="btn btn-primary" onclick="exportDebtReport()">
                <i class="fas fa-file-export"></i> تصدير التقرير
            </button>
        </div>
    `;
}

function deleteDebt(debtId) {
    if (!confirm('هل أنت متأكد من حذف هذا الدين/المستحق؟')) return;

    const debts = utils.getFromStorage(CONFIG.STORAGE_KEYS.DEBTS) || [];
    const updatedDebts = debts.filter(debt => debt.id !== debtId);
    
    utils.saveToStorage(CONFIG.STORAGE_KEYS.DEBTS, updatedDebts);
    utils.showAlert('success', 'تم حذف الدين/المستحق بنجاح');
    loadDebts();
    updatePaymentSelect();
}

function exportDebtReport() {
    const debts = utils.getFromStorage(CONFIG.STORAGE_KEYS.DEBTS) || [];
    
    // Create CSV content
    const headers = [
        'النوع',
        'الطرف',
        'المبلغ الكلي',
        'المبلغ المدفوع',
        'المبلغ المتبقي',
        'تاريخ الاستحقاق',
        'الحالة'
    ];

    const csvContent = [
        headers.join(','),
        ...debts.map(debt => {
            const paidAmount = calculatePaidAmount(debt);
            const remainingAmount = debt.amount - paidAmount;
            const status = getDebtStatus(debt, paidAmount);
            
            return [
                DEBT_TYPES[debt.type],
                debt.party,
                debt.amount,
                paidAmount,
                remainingAmount,
                new Date(debt.dueDate).toLocaleDateString(),
                DEBT_STATUS[status]
            ].join(',');
        })
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `debt_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize debts system when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDebts();
});
