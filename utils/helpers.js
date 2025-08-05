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
