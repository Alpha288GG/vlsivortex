/* ══════════════════════════════════════════════════════════
   dashboard.js — User Dashboard Logic
   Tech Vortex | SSCODEHUB
   ══════════════════════════════════════════════════════════ */

const evTitles = {
    'coding': 'Coding Challenge',
    'genai': 'Gen-AI Model Building',
    'circuit': 'Circuit Making / Model Designing',
    'poster': 'Ideathon'
};

/* ── Dashboard Loader Helpers ── */
function showDashLoader(text) {
    const overlay = document.getElementById('dash-loader-overlay');
    const label = document.getElementById('dash-loader-text');
    if (label) label.textContent = text || 'Loading...';
    if (overlay) overlay.classList.add('show');
}

function hideDashLoader() {
    const overlay = document.getElementById('dash-loader-overlay');
    if (overlay) overlay.classList.remove('show');
}

/* ── Tab Switching ── */
function switchTab(tabId) {
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + tabId).classList.add('active');
    const tabs = document.querySelectorAll('.dash-tab');
    const names = ['profile', 'events', 'coordinators', 'certificate'];
    const idx = names.indexOf(tabId);
    if (idx >= 0 && tabs[idx]) tabs[idx].classList.add('active');

    // Always reload cert names when Certificate tab is opened
    if (tabId === 'certificate') {
        const genUi = document.getElementById('cert-generator-ui');
        if (genUi && genUi.style.display !== 'none') {
            populateCertNameDropdown();
        }
    }
}

/* ── Phone Number Save ── */
async function savePhoneNumber(e) {
    e.preventDefault();
    const phone = document.getElementById('phone-input').value.trim();
    if (!phone) return;
    const user = auth.currentUser;
    if (!user) return;

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.innerHTML = '<span class="mini-spinner"></span> Saving...';
    btn.disabled = true;

    try {
        await db.collection('users').doc(user.uid).update({ phone });
        document.getElementById('phone-modal-overlay').classList.remove('show');
        document.getElementById('prof-phone').textContent = phone;
    } catch (err) {
        console.error('Phone save error:', err);
        btn.textContent = originalText;
        btn.disabled = false;
        alert('Failed to save. Please try again.');
    }
}

/* ── Init Dashboard ── */
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        // Show auth overlay
        document.getElementById('auth-overlay').style.display = 'flex';
        document.getElementById('dashboard-main').style.display = 'none';
        return;
    }

    // Hide auth overlay, show dashboard
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('dashboard-main').style.display = 'block';

    // Show loader while fetching data
    showDashLoader('Loading your dashboard...');

    // Populate header
    const photo = user.photoURL || '';
    const initial = (user.displayName || 'U')[0].toUpperCase();
    const avatarEl = document.getElementById('user-avatar');
    const placeholderEl = document.getElementById('user-avatar-placeholder');

    if (photo) {
        avatarEl.src = photo;
        avatarEl.style.display = 'block';
        placeholderEl.style.display = 'none';
    } else {
        placeholderEl.textContent = initial;
        avatarEl.style.display = 'none';
        placeholderEl.style.display = 'flex';
    }

    document.getElementById('welcome-name').textContent = `Welcome, ${user.displayName || 'User'}!`;
    document.getElementById('welcome-email').textContent = user.email || '';
    document.getElementById('nav-user-name').textContent = user.displayName || 'Dashboard';

    // Fetch user doc
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('prof-name').textContent = userData.displayName || user.displayName || '—';
            document.getElementById('prof-email').textContent = userData.email || user.email || '—';
            document.getElementById('prof-phone').textContent = userData.phone || 'Not set';
            document.getElementById('prof-joined').textContent = userData.createdAt
                ? userData.createdAt.toDate().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
                : '—';

            // Check if phone is missing → show modal
            if (!userData.phone || userData.phone.trim() === '') {
                document.getElementById('phone-modal-overlay').classList.add('show');
            }
        }
    } catch (err) {
        console.error('User doc fetch error:', err);
    }

    // Load events & coupons
    await loadUserEvents(user.uid);

    // Hide loader after everything is loaded
    hideDashLoader();
});

/* ── Load User Events ── */
async function loadUserEvents(uid) {
    const eventsList = document.getElementById('events-list');
    const coordsList = document.getElementById('coordinators-list');
    
    const coordData = {
        'coding':  { name: 'Swapnil Shinde',  phone: '75071 56183' },
        'genai':   { name: 'Vivek Bambarde',  phone: '77749 07326' },
        'circuit': { name: 'Ashwini Divekar', phone: '93598 77447' }, // Circuit Making default
        'circuit-model': { name: 'Faraz Shaikh', phone: '94226 64693' }, // Model Designing
        'poster':  { name: 'Bhakti Sonawane', phone: '70205 94881' }
    };

    try {
        window.userHasVerifiedPayment = false;
        let allDocs = [];
        const eventIds = ['coding', 'genai', 'circuit', 'poster'];
        for (const ev of eventIds) {
            const snap = await db.collection('registrations_' + ev).where('uid', '==', uid).get();
            snap.forEach(doc => allDocs.push({ id: doc.id, eventId: ev, ...doc.data() }));
        }

        if (allDocs.length === 0) {
            eventsList.innerHTML = `
                <div class="glass-card" style="text-align:center; padding:48px 20px;">
                    <div style="font-size:48px; margin-bottom:16px;">📋</div>
                    <h3 style="font-size:16px; font-weight:600; margin-bottom:8px;">No Events Yet</h3>
                    <p style="color:var(--text-muted); font-size:13px; margin-bottom:20px;">You haven't registered for any events. Get started now!</p>
                    <a href="registration.html" class="btn btn-gold btn-sm">Register for an Event →</a>
                </div>
            `;
            coordsList.innerHTML = `
                <div class="glass-card" style="text-align:center; padding:48px 20px;">
                    <div style="font-size:48px; margin-bottom:16px;">📞</div>
                    <h3 style="font-size:16px; font-weight:600; margin-bottom:8px;">No Co-ordinators</h3>
                    <p style="color:var(--text-muted); font-size:13px;">Register for an event to see your co-ordinator details.</p>
                </div>
            `;
            return;
        }

        // Sort by timestamp descending
        allDocs.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));

        let eventsHtml = '';
        let coordsHtml = '';

        allDocs.forEach(data => {
            const events = data.events || [];
            const status = data.paymentStatus || 'Pending';
            if (status === 'Verified') window.userHasVerifiedPayment = true;
            const statusClass = status === 'Verified' ? 'pill-verified' : 'pill-pending';
            const dateStr = data.timestamp ? data.timestamp.toDate().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';

            // Events card
            const eventNames = events.map(e => evTitles[e] || e).join(', ') || 'N/A';
            const teamLabel = data.regType === 'team' ? `Team: ${data.teamName || 'N/A'}` : 'Individual';
            const members = data.teamMembers && data.teamMembers.length > 0
                ? data.teamMembers.filter(m => m).join(', ')
                : '';

            eventsHtml += `
                <div class="glass-card" style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
                        <div>
                            <div style="font-size:15px; font-weight:700; margin-bottom:4px;">${eventNames}</div>
                            <div style="font-size:12px; color:var(--text-muted); font-family:var(--font-mono);">${teamLabel}</div>
                        </div>
                        <span class="pill ${statusClass}">${status}</span>
                    </div>
                    ${members ? `<div style="font-size:12px; color:var(--text-dim); margin-bottom:8px;">Members: ${members}</div>` : ''}
                    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px solid var(--border); font-size:12px; color:var(--text-dim);">
                        <span>Registered: ${dateStr}</span>
                        <span style="font-family:var(--font-mono); color:var(--creamy-blue);">₹100</span>
                    </div>
                    ${status === 'Pending' ? `
                    <div style="margin-top:12px; padding:10px; background:rgba(255,193,7,0.05); border:1px solid rgba(255,193,7,0.2); border-radius:6px; font-size:12px; color:var(--text-muted); line-height:1.5;">
                        <span style="color:#ffc107; font-weight:600;">Note:</span> Our registration team will verify your payment and message you via WhatsApp shortly to coordinate with you.
                    </div>` : ''}
                </div>
            `;

            // Co-ordinators Panel
            events.forEach(ev => {
                let coord;
                let coordTitle;

                if (ev === 'circuit') {
                    // Pick coordinator based on registered domain
                    const domain = (data.eventDomain || '').trim();
                    if (domain === 'Model Designing') {
                        coord = coordData['circuit-model'];
                        coordTitle = 'Model Designing Co-ordinator';
                    } else {
                        // Default: Circuit Making (or legacy registrations without domain)
                        coord = coordData['circuit'];
                        coordTitle = 'Circuit Making Co-ordinator';
                    }
                } else {
                    coord = coordData[ev];
                    coordTitle = `${evTitles[ev] || ev} Co-ordinator`;
                }

                if (coord) {
                    coordsHtml += `
                        <div class="glass-card" style="margin-bottom:16px;">
                            <h4 style="font-size:14px; font-weight:600; margin-bottom:12px;">${coordTitle}</h4>
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="font-size:24px;">👤</div>
                                <div>
                                    <div style="font-size:15px; font-weight:700;">${coord.name}</div>
                                    <div style="font-size:14px; font-family:var(--font-mono); color:var(--creamy-blue); margin-top:4px;">
                                        <a href="tel:+91${coord.phone.replace(/\s/g,'')}" style="color:inherit; text-decoration:none;">📞 +91 ${coord.phone}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
        });

        eventsList.innerHTML = eventsHtml || `
            <div class="glass-card" style="text-align:center; padding:48px 20px;">
                <p style="color:var(--text-muted);">No events found.</p>
            </div>
        `;

        coordsList.innerHTML = coordsHtml || `
            <div class="glass-card" style="text-align:center; padding:48px 20px;">
                <div style="font-size:48px; margin-bottom:16px;">📞</div>
                <h3 style="font-size:16px; font-weight:600; margin-bottom:8px;">No Co-ordinators Yet</h3>
                <p style="color:var(--text-muted); font-size:13px;">Your co-ordinators will appear here after registration.</p>
            </div>
        `;

        const unlockDate = new Date('2026-04-03T19:00:00+05:30').getTime();
        const now = Date.now();
        const isTimeUnlocked = now >= unlockDate;

        if (window.userHasVerifiedPayment) {
            if (isTimeUnlocked) {
                document.getElementById('cert-locked-msg').style.display = 'none';
                document.getElementById('cert-generator-ui').style.display = 'block';
                // Populate dropdown with real names — direct Firestore query
                populateCertNameDropdown();
            } else {
                document.getElementById('cert-locked-msg').innerHTML = `
                    <div style="font-size:32px; margin-bottom:12px;">⏳</div>
                    <h4 style="font-size:14px; font-weight:600; color:var(--text-muted); margin-bottom:8px;">Certificate Locked</h4>
                    <p style="font-size:13px; color:var(--text-dim); line-height:1.5; margin-bottom:16px;">Your payment is verified! Come back here after <strong>April 3, 2026, 7:00 PM</strong> to unlock and generate your certificate.</p>
                    <button class="btn btn-outline btn-sm" onclick="generateCertificate('Sample Name')" style="font-size:11px; padding:8px 16px; border-color:var(--creamy-blue); color:var(--creamy-blue);">✨ Preview Template</button>
                `;
                document.getElementById('cert-locked-msg').style.display = 'block';
                document.getElementById('cert-generator-ui').style.display = 'none';
            }
        } else {
            document.getElementById('cert-locked-msg').innerHTML = `
                <div style="font-size:32px; margin-bottom:12px;">🔒</div>
                <h4 style="font-size:14px; font-weight:600; color:var(--text-muted); margin-bottom:8px;">Certificate Locked</h4>
                <p style="font-size:13px; color:var(--text-dim); line-height:1.5; margin-bottom:16px;">Certificates are unlocked after <strong>April 3, 2026, 7:00 PM</strong>, strictly for users with a Verified payment.</p>
                <button class="btn btn-outline btn-sm" onclick="generateCertificate('Your Full Name')" style="font-size:11px; padding:8px 16px; border-color:var(--creamy-blue); color:var(--creamy-blue); opacity:0.7;">👁️ Preview Template</button>
            `;
            document.getElementById('cert-locked-msg').style.display = 'block';
            document.getElementById('cert-generator-ui').style.display = 'none';
        }

    } catch (err) {
        console.error('Events fetch error:', err);
        eventsList.innerHTML = `<div class="glass-card" style="text-align:center; padding:40px; color:#ef4444;">Error loading events: ${err.message}</div>`;
    }
}

/* ── Custom Cert Dropdown Helpers ── */
window._certSelectedName = '';

function toggleCertDropdown() {
    const trigger = document.getElementById('cert-dropdown-trigger');
    const menu = document.getElementById('cert-dropdown-menu');
    if (!trigger || !menu) return;
    const isOpen = menu.classList.contains('open');
    if (isOpen) {
        menu.classList.remove('open');
        trigger.classList.remove('open');
    } else {
        // Position fixed relative to trigger's viewport rect
        const rect = trigger.getBoundingClientRect();
        menu.style.top    = (rect.bottom + 6) + 'px';
        menu.style.left   = rect.left + 'px';
        menu.style.width  = rect.width + 'px';
        menu.classList.add('open');
        trigger.classList.add('open');
    }
}

function selectCertName(name) {
    window._certSelectedName = name;
    const label = document.getElementById('cert-dropdown-label');
    const trigger = document.getElementById('cert-dropdown-trigger');
    const menu = document.getElementById('cert-dropdown-menu');
    if (label) {
        label.textContent = '\u{1F464} ' + name;
        label.classList.remove('placeholder');
    }
    // Mark selected option
    document.querySelectorAll('.cert-dropdown-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.value === name);
    });
    // Close menu
    if (menu) menu.classList.remove('open');
    if (trigger) trigger.classList.remove('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dd = document.getElementById('cert-dropdown');
    if (dd && !dd.contains(e.target)) {
        const menu = document.getElementById('cert-dropdown-menu');
        const trigger = document.getElementById('cert-dropdown-trigger');
        if (menu) menu.classList.remove('open');
        if (trigger) trigger.classList.remove('open');
    }
});

/* -- Populate Certificate Name Dropdown (self-fetching) -- */
async function populateCertNameDropdown() {
    const menu = document.getElementById('cert-dropdown-menu');
    if (!menu) return;
    const label = document.getElementById('cert-dropdown-label');

    console.log("[CertDebug] Starting name fetch...");

    if (label) { label.textContent = 'Loading names...'; label.classList.add('placeholder'); }
    menu.innerHTML = '<div class="cert-dropdown-option" style="color:rgba(255,255,255,0.4);cursor:default;pointer-events:none;">Loading...</div>';

    const user = auth.currentUser;
    if (!user) {
        console.warn("[CertDebug] No current user found in auth.");
        menu.innerHTML = '<div class="cert-dropdown-option" style="color:#ff6b6b;cursor:default;pointer-events:none;">Sign-in required</div>';
        return;
    }

    console.log("[CertDebug] fetching for UID:", user.uid);

    const names = new Set();
    const eventIds = ['coding', 'genai', 'circuit', 'poster'];
    try {
        for (var i = 0; i < eventIds.length; i++) {
            const collName = 'registrations_' + eventIds[i];
            var snap = await db.collection(collName).where('uid', '==', user.uid).get();
            console.log(`[CertDebug] Collection ${collName} returned ${snap.size} docs`);
            
            snap.forEach(function(doc) {
                var d = doc.data();
                console.log(`[CertDebug] Found doc in ${collName}:`, d.leaderName);
                if (d.leaderName && d.leaderName.trim()) names.add(d.leaderName.trim());
                if (Array.isArray(d.teamMembers)) {
                    d.teamMembers.forEach(function(m) { 
                        if (m && m.trim()) {
                            console.log("  - added member:", m);
                            names.add(m.trim()); 
                        }
                    });
                }
            });
        }
    } catch (err) {
        console.error('[CertDebug] Firestore error:', err);
        menu.innerHTML = '<div class="cert-dropdown-option" style="color:#ff6b6b;cursor:default;pointer-events:none;">Error — please reload</div>';
        return;
    }

    menu.innerHTML = '';
    window._certSelectedName = '';
    if (label) { label.textContent = 'Select your name...'; label.classList.add('placeholder'); }

    if (names.size === 0) {
        console.warn("[CertDebug] No names found for this UID across all collections.");
        menu.innerHTML = '<div class="cert-dropdown-option" style="color:rgba(255,255,255,0.35);cursor:default;pointer-events:none;">No registration found</div>';
        return;
    }

    console.log("[CertDebug] Success! Populating with:", Array.from(names));
    window._certAllowedNames = new Set(Array.from(names).map(function(n) { return n.toLowerCase(); }));

    Array.from(names).sort().forEach(function(name) {
        var opt = document.createElement('div');
        opt.className = 'cert-dropdown-option';
        opt.dataset.value = name;
        opt.innerHTML = '<span class="cd-opt-icon">👤</span><span>' + name + '</span>';
        opt.addEventListener('click', function() { selectCertName(name); });
        menu.appendChild(opt);
    });
}

/* ── Certificate Generation ── */
function generateCertificate(previewName) {
    // previewName is only passed for the locked-state template preview
    let name;
    if (previewName) {
        name = previewName; // template preview — no auth check
    } else {
        name = (window._certSelectedName || '').trim();
        if (!name) {
            alert('⚠️ Please select your name from the dropdown to generate your certificate.');
            return;
        }
        // Security: reject names not in the whitelist
        if (window._certAllowedNames && !window._certAllowedNames.has(name.toLowerCase())) {
            alert('⛔ This name is not in your registered team. You can only generate a certificate for yourself or your team members.');
            return;
        }
    }

    const canvas = document.getElementById('cert-canvas');
    const ctx = canvas.getContext('2d');

    // Certificate dimensions (landscape)
    canvas.width = 1400;
    canvas.height = 1000;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#07090f');
    grad.addColorStop(0.5, '#0d1321');
    grad.addColorStop(1, '#0a0e18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#b8d4e8';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Inner decorative border
    ctx.strokeStyle = 'rgba(184, 212, 232, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);

    // Corner decorations
    const corners = [[60,60],[canvas.width-60,60],[60,canvas.height-60],[canvas.width-60,canvas.height-60]];
    ctx.fillStyle = '#b8d4e8';
    corners.forEach(([cx,cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Top decoration line
    ctx.fillStyle = 'rgba(184, 212, 232, 0.5)';
    ctx.fillRect(canvas.width/2 - 100, 90, 200, 1);

    // "Certificate of Participation" header
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(184, 212, 232, 0.5)';
    ctx.font = '600 14px "DM Mono", monospace';
    ctx.letterSpacing = '4px';
    ctx.fillText('CERTIFICATE OF PARTICIPATION', canvas.width / 2, 140);

    // Tech Vortex title
    ctx.fillStyle = '#b8d4e8';
    ctx.font = '700 68px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Tech Vortex', canvas.width / 2, 240);

    // Year
    ctx.fillStyle = 'rgba(184, 212, 232, 0.4)';
    ctx.font = '500 18px "DM Mono", monospace';
    ctx.fillText('2026', canvas.width / 2, 275);

    // "This is to certify that"
    ctx.fillStyle = 'rgba(244, 244, 247, 0.5)';
    ctx.font = '400 18px "DM Sans", sans-serif';
    ctx.fillText('This is to certify that', canvas.width / 2, 360);

    // Name
    ctx.fillStyle = '#f4f4f7';
    ctx.font = '700 48px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(name, canvas.width / 2, 430);

    // Underline under name
    const nameWidth = ctx.measureText(name).width;
    ctx.strokeStyle = 'rgba(184, 212, 232, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 - nameWidth/2 - 20, 445);
    ctx.lineTo(canvas.width/2 + nameWidth/2 + 20, 445);
    ctx.stroke();

    // Description
    ctx.fillStyle = 'rgba(244, 244, 247, 0.5)';
    ctx.font = '400 17px "DM Sans", sans-serif';
    ctx.fillText('has actively participated in the National Level Technical Symposium', canvas.width / 2, 500);
    ctx.fillText('organized by the Electronics Engineering [VLSI (D&T)] Department', canvas.width / 2, 530);
    ctx.fillText('CSMSS College of Engineering, Kanchanwadi, Chh. Sambhajinagar', canvas.width / 2, 560);

    // Date
    ctx.fillStyle = 'rgba(184, 212, 232, 0.6)';
    ctx.font = '500 15px "DM Mono", monospace';
    ctx.fillText('3 April 2026', canvas.width / 2, 620);

    // Signature lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    // Left signature
    ctx.beginPath(); ctx.moveTo(200, 820); ctx.lineTo(460, 820); ctx.stroke();
    ctx.fillStyle = 'rgba(244, 244, 247, 0.4)';
    ctx.font = '400 12px "DM Sans", sans-serif';
    ctx.fillText('HOD, Electronics Engineering', 330, 845);

    // Right signature
    ctx.beginPath(); ctx.moveTo(canvas.width - 460, 820); ctx.lineTo(canvas.width - 200, 820); ctx.stroke();
    ctx.fillText('Event Coordinator', canvas.width - 330, 845);

    // Bottom watermark
    ctx.fillStyle = 'rgba(184, 212, 232, 0.15)';
    ctx.font = '400 11px "DM Mono", monospace';
    ctx.fillText('TECH VORTEX 2K26 · Chh. Sambhajinagar · Designed by SSCODEHUB', canvas.width / 2, canvas.height - 65);

    // Show output
    document.getElementById('cert-output').style.display = 'block';
    canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ── Download Certificate ── */
function downloadCertificate() {
    const canvas = document.getElementById('cert-canvas');
    const link = document.createElement('a');
    link.download = 'VLSI_Vortex_Certificate.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
