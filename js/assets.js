// Fixed Assets Management System
const DEPRECIATION_METHODS = {
    STRAIGHT_LINE: 'القسط الثابت',
    DECLINING_BALANCE: 'القسط المتناقص',
    UNITS_OF_PRODUCTION: 'وحدات الإنتاج'
};

const ASSET_CATEGORIES = {
    BUILDINGS: 'مباني',
    VEHICLES: 'سيارات',
    EQUIPMENT: 'معدات',
    FURNITURE: 'أثاث',
    COMPUTERS: 'أجهزة حاسب آلي',
    OTHER: 'أخرى'
};

function initializeAssets() {
    const assetsPage = document.getElementById('assets');
    if (!assetsPage) return;

    displayAssetsDashboard();
    setupAssetsListeners();
}

function displayAssetsDashboard() {
    const assetsPage = document.getElementById('assets');
    
    assetsPage.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2>نظام الأصول الثابتة</h2>
                <hr>
            </div>
        </div>

        <!-- Asset Registration -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">تسجيل أصل جديد</h5>
                    </div>
                    <div class="card-body">
                        <form id="assetForm">
                            <div class="mb-3">
                                <label class="form-label">اسم الأصل</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">الفئة</label>
                                <select class="form-select" name="category" required>
                                    ${Object.entries(ASSET_CATEGORIES).map(([key, value]) => 
                                        `<option value="${key}">${value}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">تاريخ الشراء</label>
                                <input type="date" class="form-control" name="purchaseDate" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">تكلفة الشراء</label>
                                <input type="number" class="form-control" name="cost" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">العمر الإنتاجي (بالسنوات)</label>
                                <input type="number" class="form-control" name="usefulLife" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">طريقة الإهلاك</label>
                                <select class="form-select" name="depreciationMethod" required>
                                    ${Object.entries(DEPRECIATION_METHODS).map(([key, value]) => 
                                        `<option value="${key}">${value}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary">تسجيل الأصل</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="card-title mb-0">قائمة الأصول</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table" id="assetsTable">
                                <thead>
                                    <tr>
                                        <th>الأصل</th>
                                        <th>الفئة</th>
                                        <th>تاريخ الشراء</th>
                                        <th>التكلفة</th>
                                        <th>القيمة الدفترية</th>
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

        <!-- Depreciation Schedule -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0">جدول الإهلاك</h5>
                    </div>
                    <div class="card-body">
                        <div id="depreciationSchedule"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Asset Reports -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="card-title mb-0">تقارير الأصول</h5>
                    </div>
                    <div class="card-body">
                        <div id="assetReports"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupAssetsListeners() {
    // Asset Form Submission
    const assetForm = document.getElementById('assetForm');
    if (assetForm) {
        assetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addAsset(new FormData(this));
        });
    }

    // Load initial data
    loadAssets();
}

function addAsset(formData) {
    const assets = utils.getFromStorage(CONFIG.STORAGE_KEYS.ASSETS) || [];
    
    const newAsset = {
        id: utils.generateId(),
        name: formData.get('name'),
        category: formData.get('category'),
        purchaseDate: formData.get('purchaseDate'),
        cost: parseFloat(formData.get('cost')),
        usefulLife: parseInt(formData.get('usefulLife')),
        depreciationMethod: formData.get('depreciationMethod'),
        salvageValue: 0, // Could be added as a form field
        addedDate: new Date().toISOString()
    };

    assets.push(newAsset);
    utils.saveToStorage(CONFIG.STORAGE_KEYS.ASSETS, assets);
    
    utils.showAlert('success', 'تم إضافة الأصل بنجاح');
    document.getElementById('assetForm').reset();
    loadAssets();
}

function loadAssets() {
    const assets = utils.getFromStorage(CONFIG.STORAGE_KEYS.ASSETS) || [];
    const tbody = document.querySelector('#assetsTable tbody');
    
    if (!tbody) return;

    tbody.innerHTML = assets.map(asset => {
        const bookValue = calculateBookValue(asset);
        return `
            <tr>
                <td>${asset.name}</td>
                <td>${ASSET_CATEGORIES[asset.category]}</td>
                <td>${new Date(asset.purchaseDate).toLocaleDateString()}</td>
                <td>${utils.formatCurrency(asset.cost)}</td>
                <td>${utils.formatCurrency(bookValue)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewDepreciation('${asset.id}')">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAsset('${asset.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function calculateBookValue(asset) {
    const currentDate = new Date();
    const purchaseDate = new Date(asset.purchaseDate);
    const yearsElapsed = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24 * 365);
    
    switch (asset.depreciationMethod) {
        case 'STRAIGHT_LINE':
            return calculateStraightLineDepreciation(asset, yearsElapsed);
        case 'DECLINING_BALANCE':
            return calculateDecliningBalanceDepreciation(asset, yearsElapsed);
        default:
            return asset.cost;
    }
}

function calculateStraightLineDepreciation(asset, yearsElapsed) {
    const annualDepreciation = (asset.cost - asset.salvageValue) / asset.usefulLife;
    const totalDepreciation = Math.min(yearsElapsed * annualDepreciation, asset.cost - asset.salvageValue);
    return asset.cost - totalDepreciation;
}

function calculateDecliningBalanceDepreciation(asset, yearsElapsed) {
    const rate = 2 / asset.usefulLife; // Double declining balance
    let bookValue = asset.cost;
    const fullYears = Math.floor(yearsElapsed);
    
    for (let i = 0; i < fullYears; i++) {
        bookValue *= (1 - rate);
    }
    
    // Account for partial year
    const partialYear = yearsElapsed - fullYears;
    if (partialYear > 0) {
        bookValue *= (1 - (rate * partialYear));
    }
    
    return Math.max(bookValue, asset.salvageValue);
}

function viewDepreciation(assetId) {
    const assets = utils.getFromStorage(CONFIG.STORAGE_KEYS.ASSETS) || [];
    const asset = assets.find(a => a.id === assetId);
    
    if (!asset) return;

    const schedule = generateDepreciationSchedule(asset);
    displayDepreciationSchedule(schedule, asset);
}

function generateDepreciationSchedule(asset) {
    const schedule = [];
    let bookValue = asset.cost;
    const purchaseDate = new Date(asset.purchaseDate);

    for (let year = 0; year <= asset.usefulLife; year++) {
        const yearEnd = new Date(purchaseDate);
        yearEnd.setFullYear(purchaseDate.getFullYear() + year);

        const depreciation = year === 0 ? 0 : calculateAnnualDepreciation(asset, bookValue);
        bookValue = year === 0 ? asset.cost : Math.max(bookValue - depreciation, asset.salvageValue);

        schedule.push({
            year,
            date: yearEnd.toISOString().split('T')[0],
            depreciation,
            bookValue
        });
    }

    return schedule;
}

function calculateAnnualDepreciation(asset, currentBookValue) {
    switch (asset.depreciationMethod) {
        case 'STRAIGHT_LINE':
            return (asset.cost - asset.salvageValue) / asset.usefulLife;
        case 'DECLINING_BALANCE':
            return currentBookValue * (2 / asset.usefulLife);
        default:
            return 0;
    }
}

function displayDepreciationSchedule(schedule, asset) {
    const scheduleDiv = document.getElementById('depreciationSchedule');
    if (!scheduleDiv) return;

    scheduleDiv.innerHTML = `
        <h6>جدول إهلاك ${asset.name}</h6>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>السنة</th>
                        <th>التاريخ</th>
                        <th>قسط الإهلاك</th>
                        <th>القيمة الدفترية</th>
                    </tr>
                </thead>
                <tbody>
                    ${schedule.map(entry => `
                        <tr>
                            <td>${entry.year}</td>
                            <td>${entry.date}</td>
                            <td>${utils.formatCurrency(entry.depreciation)}</td>
                            <td>${utils.formatCurrency(entry.bookValue)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="text-end mt-3">
            <button class="btn btn-primary" onclick="exportDepreciationSchedule('${asset.id}')">
                <i class="fas fa-file-export"></i> تصدير الجدول
            </button>
        </div>
    `;
}

function deleteAsset(assetId) {
    if (!confirm('هل أنت متأكد من حذف هذا الأصل؟')) return;

    const assets = utils.getFromStorage(CONFIG.STORAGE_KEYS.ASSETS) || [];
    const updatedAssets = assets.filter(asset => asset.id !== assetId);
    
    utils.saveToStorage(CONFIG.STORAGE_KEYS.ASSETS, updatedAssets);
    utils.showAlert('success', 'تم حذف الأصل بنجاح');
    loadAssets();
}

function exportDepreciationSchedule(assetId) {
    const assets = utils.getFromStorage(CONFIG.STORAGE_KEYS.ASSETS) || [];
    const asset = assets.find(a => a.id === assetId);
    
    if (!asset) {
        utils.showAlert('warning', 'لم يتم العثور على الأصل');
        return;
    }

    const schedule = generateDepreciationSchedule(asset);
    
    // Create CSV content
    const headers = ['السنة', 'التاريخ', 'قسط الإهلاك', 'القيمة الدفترية'];
    const csvContent = [
        headers.join(','),
        ...schedule.map(entry => [
            entry.year,
            entry.date,
            entry.depreciation,
            entry.bookValue
        ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `depreciation_schedule_${asset.name}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize assets system when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAssets();
});
