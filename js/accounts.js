// Accounts Tree Management
const ACCOUNT_TYPES = {
    ASSETS: 'أصول',
    LIABILITIES: 'خصوم',
    EXPENSES: 'مصروفات',
    REVENUES: 'إيرادات',
    EQUITY: 'حقوق ملكية'
};

function initializeAccounts() {
    const accountsPage = document.getElementById('accounts');
    if (!accountsPage) return;

    // Load saved accounts or initialize with default structure
    let accounts = utils.getFromStorage(CONFIG.STORAGE_KEYS.ACCOUNTS) || createDefaultAccountStructure();
    displayAccountsTree(accounts);
    setupAccountListeners();
}

function createDefaultAccountStructure() {
    return {
        assets: {
            name: 'الأصول',
            code: '1',
            type: ACCOUNT_TYPES.ASSETS,
            balance: 0,
            children: {
                currentAssets: {
                    name: 'أصول متداولة',
                    code: '11',
                    balance: 0,
                    children: {
                        cash: {
                            name: 'النقدية',
                            code: '111',
                            balance: 0,
                            children: {}
                        },
                        inventory: {
                            name: 'المخزون',
                            code: '112',
                            balance: 0,
                            children: {}
                        }
                    }
                },
                fixedAssets: {
                    name: 'أصول ثابتة',
                    code: '12',
                    balance: 0,
                    children: {}
                }
            }
        },
        liabilities: {
            name: 'الخصوم',
            code: '2',
            type: ACCOUNT_TYPES.LIABILITIES,
            balance: 0,
            children: {
                currentLiabilities: {
                    name: 'خصوم متداولة',
                    code: '21',
                    balance: 0,
                    children: {
                        accountsPayable: {
                            name: 'موردون',
                            code: '211',
                            balance: 0,
                            children: {}
                        }
                    }
                }
            }
        },
        expenses: {
            name: 'المصروفات',
            code: '3',
            type: ACCOUNT_TYPES.EXPENSES,
            balance: 0,
            children: {}
        },
        revenues: {
            name: 'الإيرادات',
            code: '4',
            type: ACCOUNT_TYPES.REVENUES,
            balance: 0,
            children: {
                sales: {
                    name: 'المبيعات',
                    code: '41',
                    balance: 0,
                    children: {}
                }
            }
        },
        equity: {
            name: 'حقوق الملكية',
            code: '5',
            type: ACCOUNT_TYPES.EQUITY,
            balance: 0,
            children: {
                capital: {
                    name: 'رأس المال',
                    code: '51',
                    balance: 0,
                    children: {}
                }
            }
        }
    };
}

function displayAccountsTree(accounts) {
    const accountsContainer = document.getElementById('accountsTree');
    if (!accountsContainer) return;

    accountsContainer.innerHTML = `
        <div class="row">
            ${Object.entries(accounts).map(([key, account]) => `
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5 class="card-title mb-0">${account.name}</h5>
                        </div>
                        <div class="card-body">
                            ${renderAccountNode(account, key)}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAccountNode(account, key, level = 0) {
    const padding = level * 20;
    let html = `
        <div class="account-node" data-account-key="${key}" style="padding-right: ${padding}px">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <span class="badge bg-secondary me-2">${account.code}</span>
                    <span>${account.name}</span>
                </div>
                <div>
                    <span class="badge bg-info">${utils.formatCurrency(account.balance)}</span>
                    <button class="btn btn-sm btn-outline-primary ms-2" onclick="addSubAccount('${key}')">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteAccount('${key}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    if (account.children) {
        Object.entries(account.children).forEach(([childKey, childAccount]) => {
            html += renderAccountNode(childAccount, `${key}.${childKey}`, level + 1);
        });
    }

    return html;
}

function addSubAccount(parentKey) {
    const accounts = utils.getFromStorage(CONFIG.STORAGE_KEYS.ACCOUNTS);
    const parentAccount = getAccountByKey(accounts, parentKey);
    
    if (!parentAccount) return;

    const newAccountCode = generateNextCode(parentAccount);
    const newAccountKey = `subAccount${Date.now()}`;
    
    const newAccount = {
        name: 'حساب جديد',
        code: newAccountCode,
        balance: 0,
        children: {}
    };

    if (!parentAccount.children) {
        parentAccount.children = {};
    }
    parentAccount.children[newAccountKey] = newAccount;

    utils.saveToStorage(CONFIG.STORAGE_KEYS.ACCOUNTS, accounts);
    displayAccountsTree(accounts);
}

function deleteAccount(accountKey) {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب وجميع الحسابات الفرعية؟')) return;

    const accounts = utils.getFromStorage(CONFIG.STORAGE_KEYS.ACCOUNTS);
    const keyParts = accountKey.split('.');
    let current = accounts;
    
    for (let i = 0; i < keyParts.length - 1; i++) {
        current = current[keyParts[i]].children;
    }
    
    delete current[keyParts[keyParts.length - 1]];
    
    utils.saveToStorage(CONFIG.STORAGE_KEYS.ACCOUNTS, accounts);
    displayAccountsTree(accounts);
}

function generateNextCode(parentAccount) {
    const parentCode = parentAccount.code;
    const siblingCodes = Object.values(parentAccount.children || {})
        .map(child => parseInt(child.code))
        .filter(code => !isNaN(code));
    
    const maxCode = Math.max(0, ...siblingCodes);
    return `${parentCode}${(maxCode + 1).toString().padStart(2, '0')}`;
}

function getAccountByKey(accounts, key) {
    const keyParts = key.split('.');
    let current = accounts;
    
    for (const part of keyParts) {
        if (!current[part]) return null;
        current = current[part];
    }
    
    return current;
}

function setupAccountListeners() {
    // Add event listeners for account operations
    document.addEventListener('click', function(e) {
        if (e.target.matches('.edit-account')) {
            const accountKey = e.target.closest('.account-node').dataset.accountKey;
            editAccount(accountKey);
        }
    });
}

function editAccount(accountKey) {
    const accounts = utils.getFromStorage(CONFIG.STORAGE_KEYS.ACCOUNTS);
    const account = getAccountByKey(accounts, accountKey);
    
    if (!account) return;

    // Show edit modal
    const modal = new bootstrap.Modal(document.getElementById('editAccountModal'));
    const form = document.getElementById('editAccountForm');
    
    form.elements.accountName.value = account.name;
    form.elements.accountCode.value = account.code;
    
    form.onsubmit = function(e) {
        e.preventDefault();
        
        account.name = form.elements.accountName.value;
        account.code = form.elements.accountCode.value;
        
        utils.saveToStorage(CONFIG.STORAGE_KEYS.ACCOUNTS, accounts);
        displayAccountsTree(accounts);
        modal.hide();
    };
    
    modal.show();
}

// Initialize accounts on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAccounts();
});
