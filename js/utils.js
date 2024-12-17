// Utility Functions
const utils = {
    formatCurrency: (amount) => {
        return `${amount.toLocaleString('ar-EG')} ${CONFIG.CURRENCY}`;
    },

    formatDate: (date) => {
        return new Date(date).toLocaleDateString('ar-EG');
    },

    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    showAlert: (type, message) => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('.main-content').insertAdjacentElement('afterbegin', alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
    },

    saveToStorage: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    },

    getFromStorage: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
};
