// Financial Reports and Tax Management
const TAX_RATES = {
    VAT: 0.14, // ضريبة القيمة المضافة
    INCOME: 0.225 // ضريبة الدخل
};

function initializeFinancial() {
    const financialPage = document.getElementById('financial');
    if (!financialPage) return;

    displayFinancialDashboard();
    setupFinancialListeners();
}

function displayFinancialDashboard() {
    const financialPage = document.getElementById('financial');
    
    financialPage.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2>التقارير المالية والضرائب</h2>
                <hr>
            </div>
        </div>

        <!-- Financial Reports Section -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">قائمة الدخل</h5>
                    </div>
                    <div class="card-body">
                        <div id="incomeStatement"></div>
                        <button class="btn btn-outline-primary mt-3" onclick="generateIncomeStatement()">
                            <i class="fas fa-sync"></i> تحديث قائمة الدخل
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0">الميزانية العمومية</h5>
                    </div>
                    <div class="card-body">
                        <div id="balanceSheet"></div>
                        <button class="btn btn-outline-success mt-3" onclick="generateBalanceSheet()">
                            <i class="fas fa-sync"></i> تحديث الميزانية
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tax Reports Section -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="card-title mb-0">ضريبة القيمة المضافة</h5>
                    </div>
                    <div class="card-body">
                        <div id="vatReport"></div>
                        <button class="btn btn-outline-info mt-3" onclick="generateVATReport()">
                            <i class="fas fa-file-invoice-dollar"></i> تقرير الضريبة
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="card-title mb-0">ضريبة الدخل</h5>
                    </div>
                    <div class="card-body">
                        <div id="incomeTaxReport"></div>
                        <button class="btn btn-outline-warning mt-3" onclick="generateIncomeTaxReport()">
                            <i class="fas fa-file-invoice-dollar"></i> تقرير ضريبة الدخل
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cash Flow Section -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-secondary text-white">
                        <h5 class="card-title mb-0">التدفقات النقدية</h5>
                    </div>
                    <div class="card-body">
                        <div id="cashFlow"></div>
                        <button class="btn btn-outline-secondary mt-3" onclick="generateCashFlowStatement()">
                            <i class="fas fa-money-bill-wave"></i> تحديث التدفقات النقدية
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateIncomeStatement() {
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    const expenses = utils.getFromStorage(CONFIG.STORAGE_KEYS.EXPENSES) || [];
    
    // Calculate revenues
    const revenues = invoices
        .filter(inv => inv.type === 'sale')
        .reduce((sum, inv) => sum + inv.total, 0);
    
    // Calculate cost of goods sold
    const cogs = invoices
        .filter(inv => inv.type === 'purchase')
        .reduce((sum, inv) => sum + inv.total, 0);
    
    // Calculate operating expenses
    const operatingExpenses = expenses
        .filter(exp => exp.category === 'operating')
        .reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate net income
    const grossProfit = revenues - cogs;
    const netIncome = grossProfit - operatingExpenses;
    
    // Display income statement
    document.getElementById('incomeStatement').innerHTML = `
        <table class="table">
            <tr>
                <td>الإيرادات</td>
                <td class="text-end">${utils.formatCurrency(revenues)}</td>
            </tr>
            <tr>
                <td>تكلفة البضاعة المباعة</td>
                <td class="text-end">(${utils.formatCurrency(cogs)})</td>
            </tr>
            <tr class="table-success">
                <th>مجمل الربح</th>
                <th class="text-end">${utils.formatCurrency(grossProfit)}</th>
            </tr>
            <tr>
                <td>المصروفات التشغيلية</td>
                <td class="text-end">(${utils.formatCurrency(operatingExpenses)})</td>
            </tr>
            <tr class="table-primary">
                <th>صافي الدخل</th>
                <th class="text-end">${utils.formatCurrency(netIncome)}</th>
            </tr>
        </table>
    `;
}

function generateBalanceSheet() {
    const accounts = utils.getFromStorage(CONFIG.STORAGE_KEYS.ACCOUNTS) || {};
    
    // Calculate totals
    const assets = calculateAccountTypeTotal(accounts.assets);
    const liabilities = calculateAccountTypeTotal(accounts.liabilities);
    const equity = calculateAccountTypeTotal(accounts.equity);
    
    document.getElementById('balanceSheet').innerHTML = `
        <table class="table">
            <tr class="table-primary">
                <th colspan="2">الأصول</th>
            </tr>
            ${generateAccountTypeRows(accounts.assets)}
            <tr class="table-success">
                <th>إجمالي الأصول</th>
                <th class="text-end">${utils.formatCurrency(assets)}</th>
            </tr>
            
            <tr class="table-primary">
                <th colspan="2">الخصوم</th>
            </tr>
            ${generateAccountTypeRows(accounts.liabilities)}
            <tr class="table-success">
                <th>إجمالي الخصوم</th>
                <th class="text-end">${utils.formatCurrency(liabilities)}</th>
            </tr>
            
            <tr class="table-primary">
                <th colspan="2">حقوق الملكية</th>
            </tr>
            ${generateAccountTypeRows(accounts.equity)}
            <tr class="table-success">
                <th>إجمالي حقوق الملكية</th>
                <th class="text-end">${utils.formatCurrency(equity)}</th>
            </tr>
        </table>
    `;
}

function generateVATReport() {
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    // Calculate VAT
    const salesVAT = invoices
        .filter(inv => inv.type === 'sale' && new Date(inv.date) >= startDate)
        .reduce((sum, inv) => sum + (inv.total * TAX_RATES.VAT), 0);
    
    const purchasesVAT = invoices
        .filter(inv => inv.type === 'purchase' && new Date(inv.date) >= startDate)
        .reduce((sum, inv) => sum + (inv.total * TAX_RATES.VAT), 0);
    
    const netVAT = salesVAT - purchasesVAT;
    
    document.getElementById('vatReport').innerHTML = `
        <table class="table">
            <tr>
                <td>ضريبة المبيعات</td>
                <td class="text-end">${utils.formatCurrency(salesVAT)}</td>
            </tr>
            <tr>
                <td>ضريبة المشتريات</td>
                <td class="text-end">(${utils.formatCurrency(purchasesVAT)})</td>
            </tr>
            <tr class="table-info">
                <th>صافي الضريبة المستحقة</th>
                <th class="text-end">${utils.formatCurrency(netVAT)}</th>
            </tr>
        </table>
    `;
}

function generateIncomeTaxReport() {
    const netIncome = calculateNetIncome();
    const taxableIncome = calculateTaxableIncome(netIncome);
    const incomeTax = taxableIncome * TAX_RATES.INCOME;
    
    document.getElementById('incomeTaxReport').innerHTML = `
        <table class="table">
            <tr>
                <td>صافي الدخل</td>
                <td class="text-end">${utils.formatCurrency(netIncome)}</td>
            </tr>
            <tr>
                <td>الدخل الخاضع للضريبة</td>
                <td class="text-end">${utils.formatCurrency(taxableIncome)}</td>
            </tr>
            <tr class="table-warning">
                <th>ضريبة الدخل المستحقة</th>
                <th class="text-end">${utils.formatCurrency(incomeTax)}</th>
            </tr>
        </table>
    `;
}

function generateCashFlowStatement() {
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    const expenses = utils.getFromStorage(CONFIG.STORAGE_KEYS.EXPENSES) || [];
    
    // Operating activities
    const cashFromSales = invoices
        .filter(inv => inv.type === 'sale')
        .reduce((sum, inv) => sum + inv.total, 0);
    
    const cashForPurchases = invoices
        .filter(inv => inv.type === 'purchase')
        .reduce((sum, inv) => sum + inv.total, 0);
    
    const cashForExpenses = expenses
        .reduce((sum, exp) => sum + exp.amount, 0);
    
    const operatingCashFlow = cashFromSales - cashForPurchases - cashForExpenses;
    
    document.getElementById('cashFlow').innerHTML = `
        <table class="table">
            <tr class="table-secondary">
                <th colspan="2">التدفقات النقدية من الأنشطة التشغيلية</th>
            </tr>
            <tr>
                <td>النقد من المبيعات</td>
                <td class="text-end">${utils.formatCurrency(cashFromSales)}</td>
            </tr>
            <tr>
                <td>النقد للمشتريات</td>
                <td class="text-end">(${utils.formatCurrency(cashForPurchases)})</td>
            </tr>
            <tr>
                <td>النقد للمصروفات</td>
                <td class="text-end">(${utils.formatCurrency(cashForExpenses)})</td>
            </tr>
            <tr class="table-success">
                <th>صافي التدفق النقدي من الأنشطة التشغيلية</th>
                <th class="text-end">${utils.formatCurrency(operatingCashFlow)}</th>
            </tr>
        </table>
    `;
}

// Helper Functions
function calculateAccountTypeTotal(accountType) {
    if (!accountType) return 0;
    
    let total = accountType.balance || 0;
    if (accountType.children) {
        Object.values(accountType.children).forEach(child => {
            total += calculateAccountTypeTotal(child);
        });
    }
    return total;
}

function generateAccountTypeRows(accountType, level = 0) {
    if (!accountType) return '';
    
    const padding = level * 20;
    let html = `
        <tr>
            <td style="padding-right: ${padding}px">${accountType.name}</td>
            <td class="text-end">${utils.formatCurrency(accountType.balance || 0)}</td>
        </tr>
    `;
    
    if (accountType.children) {
        Object.values(accountType.children).forEach(child => {
            html += generateAccountTypeRows(child, level + 1);
        });
    }
    
    return html;
}

function calculateNetIncome() {
    const invoices = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVOICES) || [];
    const expenses = utils.getFromStorage(CONFIG.STORAGE_KEYS.EXPENSES) || [];
    
    const revenues = invoices
        .filter(inv => inv.type === 'sale')
        .reduce((sum, inv) => sum + inv.total, 0);
    
    const cogs = invoices
        .filter(inv => inv.type === 'purchase')
        .reduce((sum, inv) => sum + inv.total, 0);
    
    const operatingExpenses = expenses
        .reduce((sum, exp) => sum + exp.amount, 0);
    
    return revenues - cogs - operatingExpenses;
}

function calculateTaxableIncome(netIncome) {
    // This is a simplified calculation. In reality, you would need to:
    // 1. Add back non-deductible expenses
    // 2. Subtract exempt income
    // 3. Apply any tax credits or deductions
    return netIncome;
}

function setupFinancialListeners() {
    // Add any event listeners needed for the financial page
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-export-report]')) {
            exportFinancialReport(e.target.dataset.reportType);
        }
    });
}

function exportFinancialReport(reportType) {
    // Placeholder for report export functionality
    alert('سيتم تنفيذ تصدير التقرير قريباً');
}

// Initialize financial page when the document loads
document.addEventListener('DOMContentLoaded', function() {
    initializeFinancial();
});
