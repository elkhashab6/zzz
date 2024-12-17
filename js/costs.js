// Cost Accounting System
const COST_TYPES = {
    DIRECT_MATERIAL: 'مواد مباشرة',
    DIRECT_LABOR: 'عمالة مباشرة',
    OVERHEAD: 'تكاليف صناعية غير مباشرة'
};

const COST_CENTERS = {
    PRODUCTION: 'الإنتاج',
    ASSEMBLY: 'التجميع',
    QUALITY: 'مراقبة الجودة',
    MAINTENANCE: 'الصيانة',
    STORAGE: 'التخزين'
};

const ALLOCATION_METHODS = {
    DIRECT: 'مباشر',
    LABOR_HOURS: 'ساعات العمل',
    MACHINE_HOURS: 'ساعات التشغيل',
    PRODUCTION_UNITS: 'وحدات الإنتاج'
};

function initializeCosts() {
    const costsPage = document.getElementById('costs');
    if (!costsPage) return;

    displayCostsDashboard();
    setupCostsListeners();
}

function displayCostsDashboard() {
    const costsPage = document.getElementById('costs');
    
    costsPage.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2>نظام التكاليف</h2>
                <hr>
            </div>
        </div>

        <!-- Cost Entry -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">تسجيل تكلفة جديدة</h5>
                    </div>
                    <div class="card-body">
                        <form id="costForm">
                            <div class="mb-3">
                                <label class="form-label">نوع التكلفة</label>
                                <select class="form-select" name="type" required>
                                    ${Object.entries(COST_TYPES).map(([key, value]) => 
                                        `<option value="${key}">${value}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">مركز التكلفة</label>
                                <select class="form-select" name="center" required>
                                    ${Object.entries(COST_CENTERS).map(([key, value]) => 
                                        `<option value="${key}">${value}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">المبلغ</label>
                                <input type="number" class="form-control" name="amount" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">التاريخ</label>
                                <input type="date" class="form-control" name="date" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">طريقة التوزيع</label>
                                <select class="form-select" name="allocationMethod">
                                    ${Object.entries(ALLOCATION_METHODS).map(([key, value]) => 
                                        `<option value="${key}">${value}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">ملاحظات</label>
                                <textarea class="form-control" name="notes"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">تسجيل التكلفة</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="card-title mb-0">سجل التكاليف</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table" id="costsTable">
                                <thead>
                                    <tr>
                                        <th>التاريخ</th>
                                        <th>النوع</th>
                                        <th>المركز</th>
                                        <th>المبلغ</th>
                                        <th>طريقة التوزيع</th>
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

        <!-- Cost Analysis -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0">تحليل التكاليف</h5>
                    </div>
                    <div class="card-body">
                        <div id="costAnalysis"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cost Reports -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="card-title mb-0">تقارير التكاليف</h5>
                    </div>
                    <div class="card-body">
                        <div id="costReports"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupCostsListeners() {
    // Cost Form Submission
    const costForm = document.getElementById('costForm');
    if (costForm) {
        costForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addCost(new FormData(this));
        });
    }

    // Load initial data
    loadCosts();
}

function addCost(formData) {
    const costs = utils.getFromStorage(CONFIG.STORAGE_KEYS.COSTS) || [];
    
    const newCost = {
        id: utils.generateId(),
        type: formData.get('type'),
        center: formData.get('center'),
        amount: parseFloat(formData.get('amount')),
        date: formData.get('date'),
        allocationMethod: formData.get('allocationMethod'),
        notes: formData.get('notes'),
        createdDate: new Date().toISOString()
    };

    costs.push(newCost);
    utils.saveToStorage(CONFIG.STORAGE_KEYS.COSTS, costs);
    
    utils.showAlert('success', 'تم تسجيل التكلفة بنجاح');
    document.getElementById('costForm').reset();
    loadCosts();
}

function loadCosts() {
    const costs = utils.getFromStorage(CONFIG.STORAGE_KEYS.COSTS) || [];
    const tbody = document.querySelector('#costsTable tbody');
    
    if (!tbody) return;

    tbody.innerHTML = costs.map(cost => `
        <tr>
            <td>${new Date(cost.date).toLocaleDateString()}</td>
            <td>${COST_TYPES[cost.type]}</td>
            <td>${COST_CENTERS[cost.center]}</td>
            <td>${utils.formatCurrency(cost.amount)}</td>
            <td>${ALLOCATION_METHODS[cost.allocationMethod]}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewCostDetails('${cost.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCost('${cost.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    displayCostAnalysis();
}

function viewCostDetails(costId) {
    const costs = utils.getFromStorage(CONFIG.STORAGE_KEYS.COSTS) || [];
    const cost = costs.find(c => c.id === costId);
    
    if (!cost) return;

    const analysisDiv = document.getElementById('costAnalysis');
    if (!analysisDiv) return;

    analysisDiv.innerHTML = `
        <h6>تفاصيل التكلفة</h6>
        <div class="row">
            <div class="col-md-6">
                <table class="table table-striped">
                    <tr>
                        <th>النوع</th>
                        <td>${COST_TYPES[cost.type]}</td>
                    </tr>
                    <tr>
                        <th>المركز</th>
                        <td>${COST_CENTERS[cost.center]}</td>
                    </tr>
                    <tr>
                        <th>المبلغ</th>
                        <td>${utils.formatCurrency(cost.amount)}</td>
                    </tr>
                    <tr>
                        <th>التاريخ</th>
                        <td>${new Date(cost.date).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <th>طريقة التوزيع</th>
                        <td>${ALLOCATION_METHODS[cost.allocationMethod]}</td>
                    </tr>
                    ${cost.notes ? `
                        <tr>
                            <th>ملاحظات</th>
                            <td>${cost.notes}</td>
                        </tr>
                    ` : ''}
                </table>
            </div>
            <div class="col-md-6">
                <canvas id="costChart"></canvas>
            </div>
        </div>
    `;

    // Create pie chart showing cost distribution
    const ctx = document.getElementById('costChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['التكلفة الحالية', 'إجمالي تكاليف المركز'],
            datasets: [{
                data: [
                    cost.amount,
                    calculateCenterTotal(cost.center) - cost.amount
                ],
                backgroundColor: ['#36a2eb', '#ff6384']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `نسبة التكلفة من إجمالي تكاليف ${COST_CENTERS[cost.center]}`
                }
            }
        }
    });
}

function calculateCenterTotal(center) {
    const costs = utils.getFromStorage(CONFIG.STORAGE_KEYS.COSTS) || [];
    return costs
        .filter(cost => cost.center === center)
        .reduce((sum, cost) => sum + cost.amount, 0);
}

function displayCostAnalysis() {
    const costs = utils.getFromStorage(CONFIG.STORAGE_KEYS.COSTS) || [];
    
    // Calculate totals by type and center
    const typeAnalysis = {};
    const centerAnalysis = {};
    
    Object.keys(COST_TYPES).forEach(type => {
        typeAnalysis[type] = costs
            .filter(cost => cost.type === type)
            .reduce((sum, cost) => sum + cost.amount, 0);
    });

    Object.keys(COST_CENTERS).forEach(center => {
        centerAnalysis[center] = costs
            .filter(cost => cost.center === center)
            .reduce((sum, cost) => sum + cost.amount, 0);
    });

    const reportsDiv = document.getElementById('costReports');
    if (!reportsDiv) return;

    reportsDiv.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>التكاليف حسب النوع</h6>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>النوع</th>
                            <th>المبلغ</th>
                            <th>النسبة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(typeAnalysis).map(([type, amount]) => {
                            const percentage = (amount / Object.values(typeAnalysis)
                                .reduce((a, b) => a + b, 0)) * 100;
                            return `
                                <tr>
                                    <td>${COST_TYPES[type]}</td>
                                    <td>${utils.formatCurrency(amount)}</td>
                                    <td>${percentage.toFixed(1)}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div class="col-md-6">
                <h6>التكاليف حسب المركز</h6>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>المركز</th>
                            <th>المبلغ</th>
                            <th>النسبة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(centerAnalysis).map(([center, amount]) => {
                            const percentage = (amount / Object.values(centerAnalysis)
                                .reduce((a, b) => a + b, 0)) * 100;
                            return `
                                <tr>
                                    <td>${COST_CENTERS[center]}</td>
                                    <td>${utils.formatCurrency(amount)}</td>
                                    <td>${percentage.toFixed(1)}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="text-end mt-3">
            <button class="btn btn-primary" onclick="exportCostReport()">
                <i class="fas fa-file-export"></i> تصدير التقرير
            </button>
        </div>
    `;
}

function deleteCost(costId) {
    if (!confirm('هل أنت متأكد من حذف هذه التكلفة؟')) return;

    const costs = utils.getFromStorage(CONFIG.STORAGE_KEYS.COSTS) || [];
    const updatedCosts = costs.filter(cost => cost.id !== costId);
    
    utils.saveToStorage(CONFIG.STORAGE_KEYS.COSTS, updatedCosts);
    utils.showAlert('success', 'تم حذف التكلفة بنجاح');
    loadCosts();
}

function exportCostReport() {
    const costs = utils.getFromStorage(CONFIG.STORAGE_KEYS.COSTS) || [];
    
    // Create CSV content
    const headers = ['التاريخ', 'النوع', 'المركز', 'المبلغ', 'طريقة التوزيع', 'ملاحظات'];
    const csvContent = [
        headers.join(','),
        ...costs.map(cost => [
            new Date(cost.date).toLocaleDateString(),
            COST_TYPES[cost.type],
            COST_CENTERS[cost.center],
            cost.amount,
            ALLOCATION_METHODS[cost.allocationMethod],
            cost.notes || ''
        ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cost_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize costs system when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCosts();
});
