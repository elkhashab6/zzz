// Backup and Restore System

function initializeBackup() {
    const settingsPage = document.getElementById('settings');
    if (!settingsPage) return;

    // Add backup section to settings page
    const backupSection = document.createElement('div');
    backupSection.className = 'row mb-4';
    backupSection.innerHTML = `
        <div class="col-12">
            <div class="card">
                <div class="card-header bg-info text-white">
                    <h5 class="card-title mb-0">النسخ الاحتياطي واستعادة البيانات</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>النسخ الاحتياطي</h6>
                            <p class="text-muted">قم بعمل نسخة احتياطية من جميع بيانات النظام</p>
                            <button class="btn btn-primary" onclick="createBackup()">
                                <i class="fas fa-download"></i> إنشاء نسخة احتياطية
                            </button>
                        </div>
                        <div class="col-md-6">
                            <h6>استعادة البيانات</h6>
                            <p class="text-muted">استعادة البيانات من نسخة احتياطية سابقة</p>
                            <div class="mb-3">
                                <input type="file" class="form-control" id="backupFile" accept=".json">
                            </div>
                            <button class="btn btn-warning" onclick="restoreBackup()">
                                <i class="fas fa-upload"></i> استعادة البيانات
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    settingsPage.appendChild(backupSection);
    setupBackupListeners();
}

function createBackup() {
    // Collect all data from localStorage
    const backup = {
        version: CONFIG.VERSION,
        timestamp: new Date().toISOString(),
        data: {}
    };

    // Add all storage keys to backup
    Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
        backup.data[key] = utils.getFromStorage(key);
    });

    // Convert to JSON and create download
    const backupJson = JSON.stringify(backup, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `accounting_backup_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    utils.showAlert('success', 'تم إنشاء النسخة الاحتياطية بنجاح');
}

function restoreBackup() {
    const fileInput = document.getElementById('backupFile');
    const file = fileInput.files[0];

    if (!file) {
        utils.showAlert('warning', 'الرجاء اختيار ملف النسخة الاحتياطية أولاً');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            // Validate backup format
            if (!backup.version || !backup.timestamp || !backup.data) {
                throw new Error('تنسيق ملف النسخة الاحتياطية غير صحيح');
            }

            // Confirm restore
            if (!confirm('سيتم استبدال جميع البيانات الحالية بالبيانات من النسخة الاحتياطية. هل أنت متأكد من المتابعة؟')) {
                return;
            }

            // Restore data
            Object.entries(backup.data).forEach(([key, value]) => {
                utils.saveToStorage(key, value);
            });

            utils.showAlert('success', 'تم استعادة البيانات بنجاح');
            
            // Reload page to reflect changes
            setTimeout(() => window.location.reload(), 1500);

        } catch (error) {
            utils.showAlert('danger', 'حدث خطأ أثناء استعادة البيانات: ' + error.message);
        }
    };

    reader.readAsText(file);
}

function setupBackupListeners() {
    // Add file input change listener to show selected file name
    const fileInput = document.getElementById('backupFile');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name;
            if (fileName) {
                utils.showAlert('info', 'تم اختيار الملف: ' + fileName);
            }
        });
    }
}

// Auto-backup feature
function setupAutoBackup() {
    // Create backup every week
    const lastBackup = localStorage.getItem('lastAutoBackup');
    const now = new Date().getTime();
    const weekInMs = 7 * 24 * 60 * 60 * 1000;

    if (!lastBackup || now - parseInt(lastBackup) > weekInMs) {
        createBackup();
        localStorage.setItem('lastAutoBackup', now.toString());
    }
}

// Initialize backup system
document.addEventListener('DOMContentLoaded', function() {
    initializeBackup();
    setupAutoBackup();
});
