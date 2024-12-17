// Payroll and Employee Management System
const SALARY_TYPES = {
    BASIC: 'أساسي',
    ALLOWANCE: 'بدلات',
    BONUS: 'مكافآت',
    DEDUCTION: 'خصومات',
    OVERTIME: 'إضافي'
};

const TAX_BRACKETS = [
    { limit: 5000, rate: 0 },
    { limit: 15000, rate: 0.10 },
    { limit: 35000, rate: 0.15 },
    { limit: 45000, rate: 0.20 },
    { limit: Infinity, rate: 0.225 }
];

function initializePayroll() {
    const payrollPage = document.getElementById('payroll');
    if (!payrollPage) return;

    displayPayrollDashboard();
    setupPayrollListeners();
}

function displayPayrollDashboard() {
    const payrollPage = document.getElementById('payroll');
    
    payrollPage.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2>نظام الرواتب والموظفين</h2>
                <hr>
            </div>
        </div>

        <!-- Employee Management -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">إضافة موظف جديد</h5>
                    </div>
                    <div class="card-body">
                        <form id="employeeForm">
                            <div class="mb-3">
                                <label class="form-label">اسم الموظف</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">الرقم الوظيفي</label>
                                <input type="text" class="form-control" name="employeeId" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">القسم</label>
                                <input type="text" class="form-control" name="department">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">الراتب الأساسي</label>
                                <input type="number" class="form-control" name="basicSalary" required>
                            </div>
                            <button type="submit" class="btn btn-primary">إضافة موظف</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="card-title mb-0">قائمة الموظفين</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table" id="employeesTable">
                                <thead>
                                    <tr>
                                        <th>الرقم الوظيفي</th>
                                        <th>الاسم</th>
                                        <th>القسم</th>
                                        <th>الراتب الأساسي</th>
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

        <!-- Salary Processing -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0">معالجة الرواتب</h5>
                    </div>
                    <div class="card-body">
                        <form id="salaryProcessForm" class="row">
                            <div class="col-md-3">
                                <label class="form-label">الشهر</label>
                                <select class="form-select" name="month" required>
                                    <option value="1">يناير</option>
                                    <option value="2">فبراير</option>
                                    <option value="3">مارس</option>
                                    <option value="4">أبريل</option>
                                    <option value="5">مايو</option>
                                    <option value="6">يونيو</option>
                                    <option value="7">يوليو</option>
                                    <option value="8">أغسطس</option>
                                    <option value="9">سبتمبر</option>
                                    <option value="10">أكتوبر</option>
                                    <option value="11">نوفمبر</option>
                                    <option value="12">ديسمبر</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">السنة</label>
                                <input type="number" class="form-control" name="year" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">&nbsp;</label>
                                <button type="submit" class="btn btn-success d-block w-100">معالجة الرواتب</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Salary Reports -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="card-title mb-0">تقارير الرواتب</h5>
                    </div>
                    <div class="card-body">
                        <div id="salaryReports"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupPayrollListeners() {
    // Employee Form Submission
    const employeeForm = document.getElementById('employeeForm');
    if (employeeForm) {
        employeeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addEmployee(new FormData(this));
        });
    }

    // Salary Process Form Submission
    const salaryProcessForm = document.getElementById('salaryProcessForm');
    if (salaryProcessForm) {
        salaryProcessForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processSalaries(new FormData(this));
        });
    }

    // Load initial data
    loadEmployees();
}

function addEmployee(formData) {
    const employees = utils.getFromStorage(CONFIG.STORAGE_KEYS.EMPLOYEES) || [];
    
    const newEmployee = {
        id: formData.get('employeeId'),
        name: formData.get('name'),
        department: formData.get('department'),
        basicSalary: parseFloat(formData.get('basicSalary')),
        joinDate: new Date().toISOString()
    };

    // Validate employee ID is unique
    if (employees.some(emp => emp.id === newEmployee.id)) {
        utils.showAlert('danger', 'الرقم الوظيفي مستخدم بالفعل');
        return;
    }

    employees.push(newEmployee);
    utils.saveToStorage(CONFIG.STORAGE_KEYS.EMPLOYEES, employees);
    
    utils.showAlert('success', 'تم إضافة الموظف بنجاح');
    document.getElementById('employeeForm').reset();
    loadEmployees();
}

function loadEmployees() {
    const employees = utils.getFromStorage(CONFIG.STORAGE_KEYS.EMPLOYEES) || [];
    const tbody = document.querySelector('#employeesTable tbody');
    
    if (!tbody) return;

    tbody.innerHTML = employees.map(emp => `
        <tr>
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${utils.formatCurrency(emp.basicSalary)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editEmployee('${emp.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${emp.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function editEmployee(employeeId) {
    const employees = utils.getFromStorage(CONFIG.STORAGE_KEYS.EMPLOYEES) || [];
    const employee = employees.find(emp => emp.id === employeeId);
    
    if (!employee) return;

    // Show edit modal
    const modal = new bootstrap.Modal(document.getElementById('editEmployeeModal'));
    const form = document.getElementById('editEmployeeForm');
    
    if (!form) return;

    form.elements.employeeId.value = employee.id;
    form.elements.name.value = employee.name;
    form.elements.department.value = employee.department;
    form.elements.basicSalary.value = employee.basicSalary;
    
    modal.show();
}

function deleteEmployee(employeeId) {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;

    const employees = utils.getFromStorage(CONFIG.STORAGE_KEYS.EMPLOYEES) || [];
    const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
    
    utils.saveToStorage(CONFIG.STORAGE_KEYS.EMPLOYEES, updatedEmployees);
    utils.showAlert('success', 'تم حذف الموظف بنجاح');
    loadEmployees();
}

function processSalaries(formData) {
    const month = parseInt(formData.get('month'));
    const year = parseInt(formData.get('year'));
    const employees = utils.getFromStorage(CONFIG.STORAGE_KEYS.EMPLOYEES) || [];
    const salaries = [];

    employees.forEach(emp => {
        const salary = calculateSalary(emp, month, year);
        salaries.push(salary);
    });

    // Save processed salaries
    const processedSalaries = utils.getFromStorage(CONFIG.STORAGE_KEYS.PROCESSED_SALARIES) || {};
    const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
    processedSalaries[periodKey] = salaries;
    
    utils.saveToStorage(CONFIG.STORAGE_KEYS.PROCESSED_SALARIES, processedSalaries);
    utils.showAlert('success', 'تم معالجة الرواتب بنجاح');
    
    displaySalaryReport(salaries, month, year);
}

function calculateSalary(employee, month, year) {
    // Get allowances and deductions
    const allowances = getAllowances(employee.id, month, year);
    const deductions = getDeductions(employee.id, month, year);
    
    // Calculate gross salary
    const grossSalary = employee.basicSalary + allowances;
    
    // Calculate tax
    const tax = calculateTax(grossSalary);
    
    // Calculate net salary
    const netSalary = grossSalary - tax - deductions;
    
    return {
        employeeId: employee.id,
        employeeName: employee.name,
        month,
        year,
        basicSalary: employee.basicSalary,
        allowances,
        deductions,
        tax,
        grossSalary,
        netSalary
    };
}

function getAllowances(employeeId, month, year) {
    // Get allowances from storage
    const allowances = utils.getFromStorage(CONFIG.STORAGE_KEYS.ALLOWANCES) || {};
    const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
    
    return (allowances[periodKey]?.[employeeId] || [])
        .reduce((sum, allowance) => sum + allowance.amount, 0);
}

function getDeductions(employeeId, month, year) {
    // Get deductions from storage
    const deductions = utils.getFromStorage(CONFIG.STORAGE_KEYS.DEDUCTIONS) || {};
    const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
    
    return (deductions[periodKey]?.[employeeId] || [])
        .reduce((sum, deduction) => sum + deduction.amount, 0);
}

function calculateTax(grossSalary) {
    let remainingSalary = grossSalary;
    let totalTax = 0;

    for (let bracket of TAX_BRACKETS) {
        if (remainingSalary <= 0) break;

        const taxableAmount = Math.min(remainingSalary, bracket.limit);
        totalTax += taxableAmount * bracket.rate;
        remainingSalary -= taxableAmount;
    }

    return totalTax;
}

function displaySalaryReport(salaries, month, year) {
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const reportsDiv = document.getElementById('salaryReports');
    if (!reportsDiv) return;

    const totalGross = salaries.reduce((sum, salary) => sum + salary.grossSalary, 0);
    const totalNet = salaries.reduce((sum, salary) => sum + salary.netSalary, 0);
    const totalTax = salaries.reduce((sum, salary) => sum + salary.tax, 0);

    reportsDiv.innerHTML = `
        <h6>تقرير الرواتب لشهر ${monthNames[month - 1]} ${year}</h6>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>الموظف</th>
                        <th>الراتب الأساسي</th>
                        <th>البدلات</th>
                        <th>الخصومات</th>
                        <th>الضريبة</th>
                        <th>إجمالي الراتب</th>
                        <th>صافي الراتب</th>
                    </tr>
                </thead>
                <tbody>
                    ${salaries.map(salary => `
                        <tr>
                            <td>${salary.employeeName}</td>
                            <td>${utils.formatCurrency(salary.basicSalary)}</td>
                            <td>${utils.formatCurrency(salary.allowances)}</td>
                            <td>${utils.formatCurrency(salary.deductions)}</td>
                            <td>${utils.formatCurrency(salary.tax)}</td>
                            <td>${utils.formatCurrency(salary.grossSalary)}</td>
                            <td>${utils.formatCurrency(salary.netSalary)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr class="table-primary">
                        <th colspan="5">الإجمالي</th>
                        <th>${utils.formatCurrency(totalGross)}</th>
                        <th>${utils.formatCurrency(totalNet)}</th>
                    </tr>
                </tfoot>
            </table>
        </div>
        <div class="text-end mt-3">
            <button class="btn btn-primary" onclick="exportSalaryReport(${month}, ${year})">
                <i class="fas fa-file-export"></i> تصدير التقرير
            </button>
        </div>
    `;
}

function exportSalaryReport(month, year) {
    const processedSalaries = utils.getFromStorage(CONFIG.STORAGE_KEYS.PROCESSED_SALARIES) || {};
    const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
    const salaries = processedSalaries[periodKey] || [];

    if (salaries.length === 0) {
        utils.showAlert('warning', 'لا توجد بيانات للتصدير');
        return;
    }

    // Create CSV content
    const headers = [
        'الموظف',
        'الراتب الأساسي',
        'البدلات',
        'الخصومات',
        'الضريبة',
        'إجمالي الراتب',
        'صافي الراتب'
    ];

    const csvContent = [
        headers.join(','),
        ...salaries.map(salary => [
            salary.employeeName,
            salary.basicSalary,
            salary.allowances,
            salary.deductions,
            salary.tax,
            salary.grossSalary,
            salary.netSalary
        ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `salary_report_${year}_${month}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize payroll system when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializePayroll();
});
