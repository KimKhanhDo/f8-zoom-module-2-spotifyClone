// Chuyển đổi text thành HTML an toàn (chống XSS)
export function escapeHTML(html) {
    if (typeof html !== 'string') {
        return '';
    }
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// Định dạng thời gian (giây) thành mm:ss hoặc hh:mm:ss
export function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const hrsFormat = hrs > 0 ? `${hrs}:` : '';
    const minsFormat = hrs > 0 ? String(mins).padStart(2, '0') : mins;
    const secsFormat = String(secs).padStart(2, '0');

    return `${hrsFormat}${minsFormat}:${secsFormat}`;
}

// Định dạng số theo quy tắc của khu vực
export function formatCount(count) {
    if (typeof count !== 'number') return '0';
    return count.toLocaleString('en-US');
}

// Show toast message
export function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('#toast-container');
    const icons = {
        success: 'fa-solid fa-circle-check',
        updated: 'fa-solid fa-bullhorn',
        error: 'fa-solid fa-circle-exclamation',
    };
    const icon = icons[type];

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.animation = `slideIn 0.3s ease-out, fadeOut 0.6s ease-in 6s forwards`;

    toast.innerHTML = `
            <span class="toast-icon"><i class="${icon}"></i></span>
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;

    const autoDismissId = setTimeout(() => {
        toast.remove();
    }, 7000);

    toast.querySelector('.toast-close').onclick = () => {
        toast.remove();
        clearTimeout(autoDismissId);
    };

    toastContainer.appendChild(toast);
}

export function extractUserName(email) {
    return email.charAt(0).toUpperCase();
}
