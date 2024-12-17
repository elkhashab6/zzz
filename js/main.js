// Main Application Logic
document.addEventListener('DOMContentLoaded', () => {
    // Load initial page content
    loadPageContent('dashboard');
    
    // Initialize all components
    initializeComponents();
});

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[href="#${pageId}"]`).classList.add('active');
    
    // Load page content if needed
    loadPageContent(pageId);
}

function loadPageContent(pageId) {
    const page = document.getElementById(pageId);
    
    switch(pageId) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'invoices':
            initializeInvoices();
            break;
        case 'inventory':
            initializeInventory();
            break;
        case 'reports':
            initializeReports();
            break;
        case 'accounts':
            initializeAccounts();
            break;
        case 'settings':
            initializeSettings();
            break;
    }
}

function initializeComponents() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

function initializeDashboard() {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
        <h2>لوحة التحكم</h2>
        <hr>
        <div class="row">
            <!-- Statistics Cards -->
            <div class="col-md-3 mb-4">
                <div class="card stats-card">
                    <div class="card-body">
                        <h5 class="card-title">إجمالي المبيعات</h5>
                        <h3 class="card-text" id="totalSales">0</h3>
                    </div>
                </div>
            </div>
            <!-- Add more statistics cards -->
        </div>
        <div class="row">
            <!-- Charts -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">المبيعات الشهرية</h5>
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
            </div>
            <!-- Add more charts -->
        </div>
    `;
    
    // Initialize dashboard charts
    initializeCharts();
}
