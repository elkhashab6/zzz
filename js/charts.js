// Charts initialization and management
function initializeCharts() {
    initializeSalesChart();
    initializeInventoryChart();
    initializeCustomerChart();
}

function initializeSalesChart() {
    const ctx = document.getElementById('salesChart')?.getContext('2d');
    if (!ctx) return;

    const salesData = generateSampleData();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: salesData.labels,
            datasets: [{
                label: 'المبيعات الشهرية',
                data: salesData.values,
                borderColor: '#2980b9',
                backgroundColor: 'rgba(41, 128, 185, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'تحليل المبيعات'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initializeInventoryChart() {
    const ctx = document.getElementById('inventoryChart')?.getContext('2d');
    if (!ctx) return;

    const inventory = utils.getFromStorage(CONFIG.STORAGE_KEYS.INVENTORY) || [];
    const categories = [...new Set(inventory.map(item => item.category))];
    const quantities = categories.map(category => 
        inventory.filter(item => item.category === category)
            .reduce((sum, item) => sum + item.quantity, 0)
    );

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: quantities,
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
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'توزيع المخزون'
                }
            }
        }
    });
}

function initializeCustomerChart() {
    const ctx = document.getElementById('customerChart')?.getContext('2d');
    if (!ctx) return;

    const customerData = generateCustomerData();

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: customerData.labels,
            datasets: [{
                label: 'عدد العملاء',
                data: customerData.values,
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'تحليل العملاء'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function generateSampleData() {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                   'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const values = months.map(() => Math.floor(Math.random() * 50000) + 10000);
    
    return {
        labels: months,
        values: values
    };
}

function generateCustomerData() {
    const categories = ['جدد', 'نشطون', 'متكررون', 'غير نشطين'];
    const values = categories.map(() => Math.floor(Math.random() * 50) + 10);
    
    return {
        labels: categories,
        values: values
    };
}

function updateCharts() {
    // Remove existing charts
    Chart.helpers.each(Chart.instances, (instance) => {
        instance.destroy();
    });
    
    // Reinitialize charts with new data
    initializeCharts();
}
