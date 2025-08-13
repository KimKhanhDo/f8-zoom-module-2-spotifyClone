let singleton = null;

export default function setupTooltip() {
    if (singleton) return singleton; // tránh khởi tạo nhiều lần

    const TIP_DELAY = 200;

    const tip = document.createElement('div');
    tip.className = 'app-tooltip';
    document.body.appendChild(tip);

    let showTimer = null;

    // ---- helpers ----
    const normTarget = (t) =>
        t && t.nodeType === 1 ? t : t?.parentElement || null;

    function hideTip() {
        tip.classList.remove('show');
    }

    function positionTip(el) {
        const r = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const pad = 8; // lề chống dính viền viewport
        const ARROW = 6; // trùng với CSS ::after (border: 6px)
        const GAP_RECT = 2; // khoảng cách NHÌN THẤY giữa mũi tên và element

        const tipW = tip.offsetWidth || 0;
        const tipH = tip.offsetHeight || 0;

        // --- Clamp ngang (không tràn trái/phải) ---
        const desiredX = r.left + r.width / 2;
        const half = tipW / 2;
        const clampedX = Math.min(
            Math.max(desiredX, half + pad),
            vw - half - pad
        );

        // Dịch mũi tên để vẫn trỏ đúng vào element khi bị kẹp mép
        const arrowOffset = desiredX - clampedX;
        tip.style.setProperty(
            '--arrow-left',
            `${50 + (arrowOffset / (tipW || 1)) * 100}%`
        );

        // --- Vị trí dọc: tính theo phần BUBBLE (đã trừ/ cộng mũi tên) ---
        const aboveTop = r.top - (tipH + ARROW + GAP_RECT); // bubble nằm TRÊN
        const belowTop = r.bottom + (ARROW + GAP_RECT); // bubble nằm DƯỚI

        // Lật xuống nếu thiếu chỗ phía trên
        const needFlip = r.top < tipH + ARROW + GAP_RECT + pad;
        tip.classList.toggle('bottom', needFlip);

        const targetTop = needFlip ? belowTop : aboveTop;
        const clampedTop = Math.min(Math.max(targetTop, pad), vh - tipH - pad);

        tip.style.left = `${clampedX}px`;
        tip.style.top = `${clampedTop}px`;
    }

    function onEnter(e) {
        const base = normTarget(e.target);
        const el = base?.closest?.('[data-tooltip]');
        if (!el) return;

        const text = el.getAttribute('data-tooltip')?.trim();
        if (!text) return;

        clearTimeout(showTimer);
        showTimer = setTimeout(() => {
            tip.textContent = text;
            positionTip(el);
            tip.classList.add('show');
        }, TIP_DELAY);
    }

    function onLeave(e) {
        const base = normTarget(e.target);
        const el = base?.closest?.('[data-tooltip]');
        if (!el) return;

        // đừng ẩn nếu vẫn đang di chuyển trong cùng element
        const to = e.relatedTarget;
        if (to && (to === el || el.contains(to))) return;

        clearTimeout(showTimer);
        hideTip();
    }

    // ---- listeners (dùng mouseover/mouseout vì bubble) ----
    document.addEventListener('mouseover', onEnter, true);
    document.addEventListener('mouseout', onLeave, true);
    document.addEventListener('focusin', onEnter, true);
    document.addEventListener('focusout', onLeave, true);
    window.addEventListener('scroll', hideTip, true);
    window.addEventListener('resize', hideTip);

    singleton = {
        destroy() {
            document.removeEventListener('mouseover', onEnter, true);
            document.removeEventListener('mouseout', onLeave, true);
            document.removeEventListener('focusin', onEnter, true);
            document.removeEventListener('focusout', onLeave, true);
            window.removeEventListener('scroll', hideTip, true);
            window.removeEventListener('resize', hideTip);
            tip.remove();
            singleton = null;
        },
    };

    return singleton;
}
