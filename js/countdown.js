// countdown.js — counts down to event date
(function () {
    const eventDate = new Date('2026-04-03T09:00:00');
    function update() {
        const now = new Date();
        const diff = eventDate - now;
        if (diff <= 0) {
            ['days','hours','minutes','seconds'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = '00';
            });
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const fmt = n => String(n).padStart(2, '0');
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = fmt(val); };
        setEl('days', d); setEl('hours', h); setEl('minutes', m); setEl('seconds', s);
    }
    update();
    setInterval(update, 1000);
})();
