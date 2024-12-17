// Budget Management System
const BUDGET_TYPES = {
    SALES: 'مبيعات',
    PURCHASES: 'مشتريات',
    EXPENSES: 'مصروفات',
    PAYROLL: 'رواتب',
    CAPITAL: 'رأس المال'
};

const BUDGET_PERIODS = {
    MONTHLY: 'شهري',
    QUARTERLY: 'ربع سنوي',
    ANNUAL: 'سنوي'
};

function initializeBudget() {
    const budgetPage = document.getElementById('budget');
    if (!budgetPage) return;

    displayBudgetDashboard();
    setupBudgetListeners();
}

function displayBudgetDashboard() {
    const budgetPage = document.getElementById('budget');
    
    budgetPage.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2>نظام الموازنات التقديرية</h2>
                <hr>
            </div>
        </div>

        <!-- Budget Planning -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">إنشاء موازنة جديدة</h5>
                    </div>
                    <div class="card-body">
                        <form id="budgetForm">
                            <div class="mb-3">
                                <label class="form-label">نوع الموازنة</label>
                                <select class="form-select" name="type" required>
                                    ${Object.entries(BUDGET_TYPES).map(([key, value]) => 
                                        `<option value="${key}">${value}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">الفترة</label>
                                <select class="form-select" name="period" required>
                                    ${Object.entries(BUDGET_PERIODS).map(([key, value]) => 
                                        `<option value="${key}">${value}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">السنة</label>
                                <input type="number" class="form-control" name="year" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">المبلغ المتوقع</label>
                                <input type="number" class="form-control" name="amount" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">ملاحظات</label>
                                <textarea class="form-control" name="notes"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">إنشاء الموازنة</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="card-title mb-0">الموازنات الحالية</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table" id="budgetsTable">
                                <thead>
                                    <tr>
                                        <th>النوع</th>
                                        <th>الفترة</th>
                                        <th>السنة</th>
                                        <th>المبلغ المتوقع</th>
                                        <th>المبلغ الفعلي</th>
                                        <th>نسبة التنفيذ</th>
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

        <!-- Budget Analysis -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0">تحليل الموازنة</h5>
                    </div>
                    <div class="card-body">
                        <div id="budgetAnalysis"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Budget Reports -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="card-title mb-0">تقارير الموازنة</h5>
                    </div>
                    <div class="card-body">
                        <div id="budgetReports"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupBudgetListeners() {
    // Budget Form Submission
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        budgetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addBudget(new FormData(this));
        });
    }

    // Load initial data
    loadBudgets();
}

function addBudget(formData) {
    const budgets = utils.getFromStorage(CONFIG.STORAGE_KEYS.BUDGETS) || [];
    
    const newBudget = {
        id: utils.generateId(),
        type: formData.get('type'),
        period: formData.get('period'),
        year: parseInt(formData.get('year')),
        amount: parseFloat(formData.get('amount')),
        notes: formData.get('notes'),
        createdDate: new Date().toISOString()
    };

    budgets.push(newBudget);
    utils.saveToStorage(CONFIG.STORAGE_KEYS.BUDGETS, budgets);
    
    utils.showAlert('success', 'تم إنشاء الموازنة بنجاح');
    document.getElementById('budgetForm').reset();
    loadBudgets();
}

function loadBudgets() {
    const budgets = utils.getFromStorage(CONFIG.STORAGE_KEYS.BUDGETS) || [];
    const tbody = document.querySelector('#budgetsTable tbody');
    
    if (!tbody) return;

    tbody.innerHTML = budgets.map(budget => {
        const actualAmount = calculateActualAmount(budget);
        const executionRate = (actualAmount / budget.amount) * 100;
        
        return `
            <tr>
                <td>${BUDGET_TYPES[budget.type]}</td>
                <td>${BUDGET_PERIODS[budget.period]}</td>
                <td>${budget.year}</td>
                <td>${utils.formatCurrency(budget.amount)}</td>
                <td>${utils.formatCurrency(actualAmount)}</td>
                <td>
                    <div class="progress">
                        <div class="progress-bar ${getProgressBarClass(executionRate)}" 
                             role="progressbar" 
                             style="width: ${Math.min(executionRate, 100)}%">
                            ${executionRate.toFixed(1)}%
                        </div>
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewBudgetDetails('${budget.id}')">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBudget('${budget.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    displayBudgetAnalysis();
}

function calculateActualAmount(budget) {
    const startDate = getStartDate(budget);
    const endDate = getEndDate(budget);
    
    switch (budget.type) {
        case 'SALES':
            return calculateActualSales(startDate, endDate);
        case 'PURCHASES':
            return calculateActualPurchases(startDate, endDate);
        case 'EXPENSES':
            return calculateActualExpenses(startDate, endDate);
        case 'PAYROLL':
            return calculateActualPayroll(startDate, endDate);
        default:
            return 0;
    }
}

function getStartDate(budget) {
    const date = new Date(budget.year, 0, 1);
    return date.toISOString();
}

function getEndDate(budget) {
    let date = new Date(budget.year, 11, 31);
    if (budget.period === 'MONTHLY') {
        date = new Date(budget.year, 1, 0);
    } else if (budget.period === 'QUARTERLY') {
        date = new Date(budget.year, 3, 0);
    }
    return date.toISOString();
}

function calculateActualSales(startDate, endDate) {
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    return invoices
        .filter(inv => inv.type === 'sale' && 
                      inv.date >= startDate && 
                      inv.date <= endDate)
        .reduce((sum, inv) => sum + inv.total, 0);
}

function calculateActualPurchases(startDate, endDate) {
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    return invoices
        .filter(inv => inv.type === 'purchase' && 
                      inv.date >= startDate && 
                      inv.date <= endDate)
        .reduce((sum, inv) => sum + inv.total, 0);
}

function calculateActualExpenses(startDate, endDate) {
    const expenses = utils.getFromStorage(CONFIG.STORAGE_KEYS.EXPENSES) || [];
    return expenses
        .filter(exp => exp.date >= startDate && 
                      exp.date <= endDate)
        .reduce((sum, exp) => sum + exp.amount, 0);
}

function calculateActualPayroll(startDate, endDate) {
    const salaries = utils.getFromStorage(CONFIG.STORAGE_KEYS.PROCESSED_SALARIES) || {};
    return Object.values(salaries)
        .flat()
        .filter(salary => salary.date >= startDate && 
                         salary.date <= endDate)
        .reduce((sum, salary) => sum + salary.netSalary, 0);
}

function getProgressBarClass(executionRate) {
    if (executionRate < 70) return 'bg-danger';
    if (executionRate < 90) return 'bg-warning';
    if (executionRate <= 110) return 'bg-success';
    return 'bg-danger';
}

function viewBudgetDetails(budgetId) {
    const budgets = utils.getFromStorage(CONFIG.STORAGE_KEYS.BUDGETS) || [];
    const budget = budgets.find(b => b.id === budgetId);
    
    if (!budget) return;

    const actualAmount = calculateActualAmount(budget);
    const variance = actualAmount - budget.amount;
    const executionRate = (actualAmount / budget.amount) * 100;

    const analysisDiv = document.getElementById('budgetAnalysis');
    if (!analysisDiv) return;

    analysisDiv.innerHTML = `
        <h6>تحليل موازنة ${BUDGET_TYPES[budget.type]} - ${budget.year}</h6>
        <div class="row">
            <div class="col-md-4">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h6 class="card-title">المبلغ المتوقع</h6>
                        <h4>${utils.formatCurrency(budget.amount)}</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h6 class="card-title">المبلغ الفعلي</h6>
                        <h4>${utils.formatCurrency(actualAmount)}</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card ${variance >= 0 ? 'bg-info' : 'bg-danger'} text-white">
                    <div class="card-body">
                        <h6 class="card-title">الفرق</h6>
                        <h4>${utils.formatCurrency(Math.abs(variance))} ${variance >= 0 ? 'زيادة' : 'نقص'}</h4>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-4">
            <h6>نسبة التنفيذ</h6>
            <div class="progress" style="height: 25px;">
                <div class="progress-bar ${getProgressBarClass(executionRate)}" 
                     role="progressbar" 
                     style="width: ${Math.min(executionRate, 100)}%">
                    ${executionRate.toFixed(1)}%
                </div>
            </div>
        </div>
        ${budget.notes ? `
            <div class="mt-4">
                <h6>ملاحظات</h6>
                <p>${budget.notes}</p>
            </div>
        ` : ''}
    `;
}

function displayBudgetAnalysis() {
    const budgets = utils.getFromStorage(CONFIG.STORAGE_KEYS.BUDGETS) || [];
    const currentYear = new Date().getFullYear();
    
    // Filter budgets for current year
    const yearBudgets = budgets.filter(b => b.year === currentYear);
    
    // Calculate totals by type
    const totals = {};
    Object.keys(BUDGET_TYPES).forEach(type => {
        const typeBudgets = yearBudgets.filter(b => b.type === type);
        totals[type] = {
            budgeted: typeBudgets.reduce((sum, b) => sum + b.amount, 0),
            actual: typeBudgets.reduce((sum, b) => sum + calculateActualAmount(b), 0)
        };
    });

    const reportsDiv = document.getElementById('budgetReports');
    if (!reportsDiv) return;

    reportsDiv.innerHTML = `
        <h6>ملخص موازنة ${currentYear}</h6>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>النوع</th>
                        <th>المبلغ المتوقع</th>
                        <th>المبلغ الفعلي</th>
                        <th>الفرق</th>
                        <th>نسبة التنفيذ</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(totals).map(([type, data]) => {
                        const variance = data.actual - data.budgeted;
                        const executionRate = (data.actual / data.budgeted) * 100;
                        return `
                            <tr>
                                <td>${BUDGET_TYPES[type]}</td>
                                <td>${utils.formatCurrency(data.budgeted)}</td>
                                <td>${utils.formatCurrency(data.actual)}</td>
                                <td class="${variance >= 0 ? 'text-success' : 'text-danger'}">
                                    ${utils.formatCurrency(Math.abs(variance))}
                                    ${variance >= 0 ? 'زيادة' : 'نقص'}
                                </td>
                                <td>
                                    <div class="progress">
                                        <div class="progress-bar ${getProgressBarClass(executionRate)}" 
                                             role="progressbar" 
                                             style="width: ${Math.min(executionRate, 100)}%">
                                            ${executionRate.toFixed(1)}%
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <div class="text-end mt-3">
            <button class="btn btn-primary" onclick="exportBudgetReport()">
                <i class="fas fa-file-export"></i> تصدير التقرير
            </button>
        </div>
    `;
}

function deleteBudget(budgetId) {
    if (!confirm('هل أنت متأكد من حذف هذه الموازنة؟')) return;

    const budgets = utils.getFromStorage(CONFIG.STORAGE_KEYS.BUDGETS) || [];
    const updatedBudgets = budgets.filter(budget => budget.id !== budgetId);
    
    utils.saveToStorage(CONFIG.STORAGE_KEYS.BUDGETS, updatedBudgets);
    utils.showAlert('success', 'تم حذف الموازنة بنجاح');
    loadBudgets();
}

function exportBudgetReport() {
    const budgets = utils.getFromStorage(CONFIG.STORAGE_KEYS.BUDGETS) || [];
    const currentYear = new Date().getFullYear();
    const yearBudgets = budgets.filter(b => b.year === currentYear);

    // Create CSV content
    const headers = ['النوع', 'الفترة', 'المبلغ المتوقع', 'المبلغ الفعلي', 'الفرق', 'نسبة التنفيذ'];
    const csvContent = [
        headers.join(','),
        ...yearBudgets.map(budget => {
            const actualAmount = calculateActualAmount(budget);
            const variance = actualAmount - budget.amount;
            const executionRate = (actualAmount / budget.amount) * 100;
            return [
                BUDGET_TYPES[budget.type],
                BUDGET_PERIODS[budget.period],
                budget.amount,
                actualAmount,
                variance,
                `${executionRate.toFixed(1)}%`
            ].join(',');
        })
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `budget_report_${currentYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize budget system when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeBudget();
});
