export default function setupTooltip() {
    let tipEl = null;

    function ensureTip() {
        if (tipEl) return;
        tipEl = document.createElement('div');
        tipEl.id = 'app-tooltip';
        tipEl.role = 'tooltip';
        tipEl.className = 'tooltip';
        document.body.appendChild(tipEl);
    }

    function show(target) {
        const text = target.dataset.tooltip;
        if (!text) return;

        ensureTip();
        tipEl.textContent = text;
        tipEl.style.opacity = '1';
        position(target);
        target.setAttribute('app-tooltip');
    }

    function hide() {
        if (!tipEl) return;
        tipEl.style.opacity = '0';
    }

    function position(target) {
        const r = target.getBoundingClientRect();
        const tipRect = tipEl.getBoundingClientRect();
        let top = r.top - tipRect.height - 5; // mặc định hiện phía trên
        let left = r.left + r.width / 2 - tipRect.width / 2;

        // chống tràn ngang
        left = Math.max(
            8,
            Math.min(left, window.innerWidth - tipRect.width - 8)
        );

        // không đủ chỗ phía trên -> chuyển xuống dưới
        if (top < 8) top = r.bottom + 10;

        tipEl.style.position = 'fixed';
        tipEl.style.top = `${Math.round(top)}px`;
        tipEl.style.left = `${Math.round(left)}px`;
    }

    const pick = (el) => el?.closest?.('[data-tooltip]:not([disabled])');

    // Hover
    document.addEventListener(
        'pointerenter',
        (e) => {
            const t = pick(e.target);
            if (t) show(t);
        },
        true
    );

    document.addEventListener(
        'pointermove',
        (e) => {
            if (!tipEl || tipEl.style.opacity !== '1') return;
            const t = pick(e.target);
            if (t) position(t);
        },
        true
    );

    document.addEventListener(
        'pointerleave',
        (e) => {
            if (pick(e.target)) hide();
        },
        true
    );
}
