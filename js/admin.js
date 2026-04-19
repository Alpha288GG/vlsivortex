let globalCompData = {};

/* ══════════════════════════════════════════════════════════
   Loader & Popup Helpers
   ══════════════════════════════════════════════════════════ */
function showAdminLoader(text) {
    const overlay = document.getElementById('admin-loader-overlay');
    const label = document.getElementById('admin-loader-text');
    if (label) label.textContent = text || 'Updating...';
    overlay.classList.add('show');
}

function hideAdminLoader() {
    document.getElementById('admin-loader-overlay').classList.remove('show');
}

/**
 * showPopup — custom website-based popup replacing browser confirm/alert.
 * @param {object} opts
 *   icon     – emoji/icon string (default '⚡')
 *   title    – heading text
 *   message  – body message
 *   confirmText – confirm button label (default 'Confirm')
 *   cancelText  – cancel button label; set to null for alert-only mode
 *   onConfirm – callback on confirm
 *   onCancel  – callback on cancel / dismiss
 */
function showPopup(opts) {
    const overlay = document.getElementById('admin-popup-overlay');
    document.getElementById('admin-popup-icon').textContent = opts.icon || '⚡';
    document.getElementById('admin-popup-title').textContent = opts.title || 'Confirm';
    document.getElementById('admin-popup-message').textContent = opts.message || '';

    const actionsEl = document.getElementById('admin-popup-actions');
    const cancelBtn = document.getElementById('admin-popup-cancel');
    const confirmBtn = document.getElementById('admin-popup-confirm');

    confirmBtn.textContent = opts.confirmText || 'Confirm';

    // Alert-only mode (no cancel)
    if (opts.cancelText === null) {
        cancelBtn.style.display = 'none';
        actionsEl.classList.add('popup-actions--alert');
    } else {
        cancelBtn.style.display = '';
        cancelBtn.textContent = opts.cancelText || 'Cancel';
        actionsEl.classList.remove('popup-actions--alert');
    }

    // Wire up buttons (use cloneNode to remove old listeners)
    const newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    newConfirm.addEventListener('click', () => {
        overlay.classList.remove('show');
        if (opts.onConfirm) opts.onConfirm();
    });

    const newCancel = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    newCancel.addEventListener('click', () => {
        overlay.classList.remove('show');
        if (opts.onCancel) opts.onCancel();
    });

    overlay.classList.add('show');
}

function hidePopup() {
    document.getElementById('admin-popup-overlay').classList.remove('show');
}

/* ══════════════════════════════════════════════════════════
   Fetch Registrations
   ══════════════════════════════════════════════════════════ */
async function fetchRegistrations() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = '<div style="text-align:center; padding: 40px; color:var(--text-muted);"><div class="loader-spinner" style="margin:0 auto 16px;"></div>Loading registrations...</div>';
    
    // Mapping keys to readable titles
    const evTitles = {
        'coding': 'Coding Challenge',
        'genai': 'Gen-AI Model Building',
        'circuit': 'Circuit Making / Model Designing',
        'poster': 'Ideathon'
    };

    try {
        // Fetch only the events the current role is authorized to see
        const eventIds = currentAdminRole ? currentAdminRole.events : ['coding', 'genai', 'circuit', 'poster'];
        globalCompData = {};
        let allDocs = [];

        for (const ev of eventIds) {
            const snapshot = await db.collection("registrations_" + ev).orderBy("timestamp", "desc").get();
            snapshot.forEach(doc => allDocs.push({ id: doc.id, eventId: ev, ...doc.data() }));
        }

        if (allDocs.length === 0) {
            adminContent.innerHTML = '<div style="text-align:center; padding: 40px; color:var(--text-muted);">No registrations found.</div>';
            return;
        }

        // Sort by descending timestamp
        allDocs.sort((a,b) => (b.timestamp?.toMillis()||0) - (a.timestamp?.toMillis()||0));

        allDocs.forEach(data => {
            const ev = data.eventId;
            const title = evTitles[ev] || ev;
            if (!globalCompData[title]) globalCompData[title] = [];
            globalCompData[title].push(data);
        });

        renderEventCards();

    } catch(err) {
        console.error("Admin Fetch Error:", err);
        adminContent.innerHTML = `<div style="text-align:center; padding: 40px; color:#ef4444;">Error loading registrations. Check Firebase config and permissions.<br><small>${err.message}</small></div>`;
    }
}

function renderEventCards() {
    const adminContent = document.getElementById('admin-content');
    
    let html = `<div class="event-grid">`;
    for (const [compName, users] of Object.entries(globalCompData)) {
        html += `
            <div class="glass-card event-card" onclick="showCompetition('${compName}')">
                <div style="font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-muted); font-family:var(--font-mono);">${compName}</div>
                <div class="event-card-count">${users.length}</div>
                <div style="font-size:11px; color:var(--text-dim); margin-top:8px;">Registered Participants</div>
            </div>
        `;
    }
    html += `</div>`;
    
    adminContent.innerHTML = html;
}

function showCompetition(compName) {
    const adminContent = document.getElementById('admin-content');
    const users = globalCompData[compName] || [];
    
    // Split users by status
    const pendingUsers = users.filter(u => u.paymentStatus !== 'Verified');
    const verifiedUsers = users.filter(u => u.paymentStatus === 'Verified');
    
    let html = `
        <div class="comp-header">
            <span>${compName} (${users.length})</span>
            <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
                <input type="text" id="admin-search" class="input" placeholder="Search by name, email, or phone 🔍" style="padding: 10px 16px; font-size:13px; min-width:260px;" onkeyup="filterTable()">
                <button class="btn btn-ghost btn-sm" onclick="renderEventCards()">← Back to Events</button>
            </div>
        </div>
    `;

    function renderUserTable(title, usersList) {
        if(usersList.length === 0) return '';
        let tableHtml = `
            <div style="margin-top:24px; margin-bottom:12px; display:inline-block; padding:6px 16px; background:rgba(255,255,255,0.05); border-radius:100px; font-size:13px; font-weight:600; color:var(--text-bright); border:1px solid var(--border);">${title} (${usersList.length})</div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name & Email</th>
                            <th>Phone</th>
                            <th>Team Details</th>
                            <th>Amount</th>
                            <th>Action</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        usersList.forEach(user => {
            const name = user.leaderName || 'N/A';
            const phone = user.phone || 'N/A';
            const email = user.email || 'N/A';
            const teamName = user.teamName || 'N/A';
            
            let teamMembersHtml = '';
            if (user.teamMembers && user.teamMembers.length > 0) {
                teamMembersHtml = `<div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Members: ${user.teamMembers.join(', ')}</div>`;
            }
            
            const isVerified = user.paymentStatus === 'Verified';
            const statusClass = isVerified ? 'status-verified' : 'status-pending';
            const dateStr = user.timestamp ? user.timestamp.toDate().toLocaleString() : 'N/A';
            
            // Clean phone number for WhatsApp
            let cleanPhone = phone.replace(/\\D/g, '');
            if(cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

            const waText = isVerified 
                ? `🎉 Congratulations ${name}, your registration is verified! ✅\n\n📌 Venue: CSMSS College of Engineering, Kanchanwadi, Chh. Sambhajinagar\n🏢 Department: Electronics Engineering [VLSI (D&T)]\n\nPlease check your dashboard for further details: https://vlsivortex.vercel.app/dashboard.html`
                : `Hi ${name}, please send your payment screenshot along with your UPI payment account name as per your registration for Tech Vortex.`;
                
            const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;
            const waBtn = `<a href="${waLink}" target="_blank" class="btn btn-outline btn-sm" style="font-size:11px; padding:6px 12px; gap:6px; text-decoration:none;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg> Message</a>`;

            const delBtn = !isVerified ? `<button onclick="deleteFakeRegistration('${user.id}', '${user.eventId}', '${compName}')" class="btn btn-outline btn-sm" style="font-size:11px; padding:6px; color:#ef4444; border-color:rgba(239,68,68,0.3); margin-left:8px;" title="Delete Spam/Fake Registration">🗑️</button>` : '';

            tableHtml += `<tr>
                <td style="font-size:12px; color:var(--text-muted);">${dateStr}</td>
                <td style="font-weight:600;">${name}<br><span style="font-size:11px; color:var(--text-dim); font-weight:normal;">${email}</span>${teamMembersHtml}</td>
                <td>${phone}</td>
                <td>
                    ${teamName}<br>
                    <span style="font-size:11px; color:var(--text-muted); font-weight:normal;">${user.college || 'N/A'}</span>
                    <div style="font-size:10px; color:var(--text-dim); margin-top:2px;">
                        Type: ${user.regType || 'individual'} ${user.eventDomain && user.eventDomain !== 'N/A' ? `| Track: <b style="color:var(--creamy-blue);">${user.eventDomain}</b>` : ''}
                    </div>
                </td>
                <td style="font-family:var(--font-mono);">₹${user.totalAmount || 0}</td>
                <td><div style="display:flex; align-items:center;">${waBtn}${delBtn}</div></td>
                <td>
                    <span class="status-badge ${statusClass}" style="cursor:pointer;" onclick="toggleStatus('${user.id}', '${compName}')" title="Click to toggle status">
                        ${user.paymentStatus || 'Pending'}
                    </span>
                </td>
            </tr>`;
        });
        tableHtml += `</tbody></table></div>`;
        return tableHtml;
    }

    html += renderUserTable('⚠️ Unverified Registrations', pendingUsers);
    html += renderUserTable('✅ Verified Registrations', verifiedUsers);

    // Export buttons for verified candidates
    if (verifiedUsers.length > 0) {
        const isCircuit = compName.includes('Circuit') || compName.includes('Model');
        html += `
            <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:12px; flex-wrap:wrap;">
                ${isCircuit ? `
                <button class="btn btn-outline btn-sm" onclick="exportVerifiedExcel('${compName}', 'Circuit Making')" style="gap:8px; font-size:11px; padding:10px 16px; border-color:rgba(184,212,232,0.4); color:var(--creamy-blue);">
                    ⚡ Export Circuit Making (${verifiedUsers.filter(u => u.eventDomain === 'Circuit Making').length})
                </button>
                <button class="btn btn-outline btn-sm" onclick="exportVerifiedExcel('${compName}', 'Model Designing')" style="gap:8px; font-size:11px; padding:10px 16px; border-color:rgba(212,175,55,0.4); color:#d4af37;">
                    📐 Export Model Designing (${verifiedUsers.filter(u => u.eventDomain === 'Model Designing').length})
                </button>
                ` : ''}
                <button class="btn btn-outline btn-sm" onclick="exportVerifiedExcel('${compName}')" style="gap:8px; font-size:11px; padding:10px 16px; border-color:rgba(40,167,69,0.4); color:#28a745;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5V13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.6a.5.5 0 0 1 1 0V13a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.6a.5.5 0 0 1 .5-.5"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/></svg>
                    Export All Verified (${verifiedUsers.length})
                </button>
            </div>
        `;
    }

    adminContent.innerHTML = html;
}

/* ── Delete Fake/Pending Registration ── */
async function deleteFakeRegistration(docId, eventId, compName) {
    showPopup({
        icon: '🗑️',
        title: 'Delete Fake Registration?',
        message: 'Are you sure you want to permanently delete this registration? This cannot be undone.',
        confirmText: 'Yes, Delete',
        cancelText: 'Keep it',
        onConfirm: async () => {
            showAdminLoader('Deleting...');
            try {
                // Delete from Backend
                await db.collection('registrations_' + eventId).doc(docId).delete();
                
                // Delete from Frontend (Locally instantly)
                const users = globalCompData[compName];
                if (users) {
                    const idx = users.findIndex(u => u.id === docId);
                    if (idx > -1) users.splice(idx, 1);
                }
                
                hideAdminLoader();
                showCompetition(compName); // refresh UI
            } catch (err) {
                console.error("Delete auth error:", err);
                hideAdminLoader();
                showPopup({
                    icon: '❌', title: 'Error',
                    message: 'Failed to delete. Check your connection.',
                    confirmText: 'OK', cancelText: null
                });
            }
        }
    });
}

async function toggleStatus(docId, compName) {
    const users = globalCompData[compName];
    if (!users) return;
    const userIndex = users.findIndex(u => u.id === docId);
    if (userIndex === -1) return;
    
    const currentStatus = users[userIndex].paymentStatus || 'Pending';
    const newStatus = currentStatus === 'Pending' ? 'Verified' : 'Pending';
    const userName = users[userIndex].leaderName || 'this participant';
    
    showPopup({
        icon: newStatus === 'Verified' ? '✅' : '⏳',
        title: newStatus === 'Verified' ? 'Verify Payment' : 'Revert to Pending',
        message: `Change ${userName}'s status to "${newStatus}"?`,
        confirmText: newStatus === 'Verified' ? 'Yes, Verify' : 'Yes, Revert',
        cancelText: 'Cancel',
        onConfirm: async () => {
            showAdminLoader(newStatus === 'Verified' ? 'Verifying payment...' : 'Updating status...');
            try {
                const collectionName = "registrations_" + users[userIndex].eventId;
                const docRef = db.collection(collectionName).doc(docId);
                await db.runTransaction(async (transaction) => {
                    const doc = await transaction.get(docRef);
                    const data = doc.data();
                    const liveStatus = data.paymentStatus || 'Pending';
                    const updatedStatus = liveStatus === 'Pending' ? 'Verified' : 'Pending';
                    transaction.update(docRef, { paymentStatus: updatedStatus });
                    users[userIndex].paymentStatus = updatedStatus;

                    // 3. Trigger Verification Email
                    if (updatedStatus === 'Verified') {
                        const evTitles = { 'coding':'Coding Challenge', 'genai':'Gen-AI Model Building', 'circuit':'Circuit Making / Model Designing', 'poster':'Ideathon' };
                        const eventName = (data.events || []).map(e => evTitles[e] || e).join(', ');
                        sendVerifiedEmail(data.leaderName, data.email, eventName);
                    }
                });
                hideAdminLoader();
                showCompetition(compName);
            } catch(err) {
                console.error(err);
                hideAdminLoader();
                showPopup({
                    icon: '❌',
                    title: 'Error',
                    message: 'Failed to update status. Please check your connection and try again.',
                    confirmText: 'OK',
                    cancelText: null
                });
            }
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const pass = document.getElementById('admin-pass').value;
    const msgEl = document.getElementById('login-msg');
    const btn = document.getElementById('login-btn');

    msgEl.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Signing in...';

    try {
        await firebase.auth().signInWithEmailAndPassword(email, pass);
        // onAuthStateChanged will handle showing the dashboard
    } catch (err) {
        console.error('Login error:', err);
        let msg = 'Incorrect email or password.';
        if (err.code === 'auth/user-not-found') msg = 'No admin account found with this email.';
        else if (err.code === 'auth/wrong-password') msg = 'Incorrect password. Try again or use Forgot Password.';
        else if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Please wait a moment and try again.';
        else if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
        else if (err.code === 'auth/invalid-credential') msg = 'Invalid credentials. Check your email and password.';

        msgEl.textContent = msg;
        msgEl.className = 'login-info login-info-error';
        msgEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Unlock Dashboard';
    }
}

async function handleForgotPassword() {
    const email = document.getElementById('admin-email').value.trim();
    const msgEl = document.getElementById('login-msg');

    if (!email) {
        msgEl.textContent = 'Please enter your admin email above first.';
        msgEl.className = 'login-info login-info-error';
        msgEl.style.display = 'block';
        return;
    }

    try {
        await firebase.auth().sendPasswordResetEmail(email);
        msgEl.textContent = '✅ Password reset link sent to ' + email + '. Check your inbox!';
        msgEl.className = 'login-info login-info-success';
        msgEl.style.display = 'block';
    } catch (err) {
        console.error('Forgot password error:', err);
        let msg = 'Could not send reset email. Try again.';
        if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
        else if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';

        msgEl.textContent = msg;
        msgEl.className = 'login-info login-info-error';
        msgEl.style.display = 'block';
    }
}

/* ══════════════════════════════════════════════════════════
   Role-Based Admin Access
   ══════════════════════════════════════════════════════════
   ⚠️ IMPORTANT: Replace the coordinator emails below with
   the actual Gmail addresses of your coordinators!
   ══════════════════════════════════════════════════════════ */
const ADMIN_ROLES = {
    // Super Admin — sees ALL events
    'sscodehubsuport@gmail.com': { role: 'superadmin', events: ['coding', 'genai', 'circuit', 'poster'], name: 'Super Admin' },

    // Coordinators
    'radhika.thorkar@gmail.com':        { role: 'coordinator', events: ['coding'],  name: 'RADHIKA (Coding)' },
    'rajnandinispatil21@gmail.com':     { role: 'coordinator', events: ['genai'],   name: 'Rajnandini (Gen-AI)' },
    'ganesh2709pokale@gmail.com':       { role: 'coordinator', events: ['poster'],  name: 'Ganesh (Ideathon)' },
    'adityasangle689@gmail.com':        { role: 'coordinator', events: ['circuit'], name: 'Aditya (Circuit)' },
};

let currentAdminRole = null; // Will be set on auth

/* ── Get role for an email ── */
function getAdminRole(email) {
    return ADMIN_ROLES[email] || null;
}

/* ── Coordinator Google Sign-In ── */
function coordinatorGoogleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const btn = document.getElementById('coord-google-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="mini-spinner"></span> Signing in...';

    firebase.auth().signInWithPopup(provider)
        .then(result => {
            const email = result.user.email;
            const role = getAdminRole(email);
            if (!role) {
                // Not a coordinator — sign them out immediately
                firebase.auth().signOut();
                const msgEl = document.getElementById('login-msg');
                msgEl.textContent = '❌ Access denied. Your Google account (' + email + ') is not a registered coordinator.';
                msgEl.className = 'login-info login-info-error';
                msgEl.style.display = 'block';
                btn.disabled = false;
                btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> Sign in as Coordinator (Google)';
            }
            // If role exists, onAuthStateChanged will handle the rest
        })
        .catch(err => {
            console.error('Coordinator sign-in error:', err);
            if (err.code !== 'auth/popup-closed-by-user') {
                const msgEl = document.getElementById('login-msg');
                msgEl.textContent = 'Sign-in failed. Please try again.';
                msgEl.className = 'login-info login-info-error';
                msgEl.style.display = 'block';
            }
            btn.disabled = false;
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> Sign in as Coordinator (Google)';
        });
}

/* ── Auth State Listener — role-based access ── */
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        const role = getAdminRole(user.email);
        if (role) {
            // Authorized admin/coordinator — show dashboard
            currentAdminRole = role;
            document.getElementById('login-overlay').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('login-overlay').style.display = 'none';
                document.getElementById('main-dashboard').style.display = 'block';
                // Update nav title to show role
                const navTitle = document.querySelector('.nav-brand-title');
                if (navTitle) navTitle.textContent = role.role === 'superadmin' ? 'Admin Dashboard' : role.name;
                fetchRegistrations();
            }, 400);
        } else {
            // Signed in but NOT authorized — block access
            console.warn('Unauthorized user blocked:', user.email);
            document.getElementById('login-overlay').style.display = 'flex';
            document.getElementById('login-overlay').style.opacity = '1';
            document.getElementById('main-dashboard').style.display = 'none';
        }
    } else {
        // Not signed in
        currentAdminRole = null;
        document.getElementById('login-overlay').style.display = 'flex';
        document.getElementById('login-overlay').style.opacity = '1';
        document.getElementById('main-dashboard').style.display = 'none';
    }
});

function adminLogout() {
    firebase.auth().signOut();
}

/* ── Fast Client-Side Search Filter ── */
function filterTable() {
    const input = document.getElementById("admin-search");
    if (!input) return;
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll(".table-wrapper tbody tr");
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(filter)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

/* ── Export Verified Candidates as CSV (opens in Excel / Google Sheets) ── */
function exportVerifiedExcel(compName, filterDomain = null) {
    const users = globalCompData[compName] || [];
    let verified = users.filter(u => u.paymentStatus === 'Verified');
    
    if (filterDomain) {
        verified = verified.filter(u => u.eventDomain === filterDomain);
    }
    
    if (verified.length === 0) {
        alert('No verified candidates found for ' + (filterDomain || 'total') + '.');
        return;
    }

    // Helper: escape CSV fields that contain commas, quotes, or newlines
    function csvCell(val) {
        const s = String(val).replace(/"/g, '""');
        return '"' + s + '"';
    }

    const headers = ['Sr No.','Date','Name','Email','Phone','Team Name','College','Type','Track/Domain','Team Members','Amount','Status'];
    const rows = [headers.map(h => csvCell(h)).join(',')];

    verified.forEach((u, i) => {
        const dateStr = u.timestamp ? u.timestamp.toDate().toLocaleString() : 'N/A';
        const members = (u.teamMembers && u.teamMembers.length > 0) ? u.teamMembers.join(', ') : '-';
        rows.push([
            i + 1,
            csvCell(dateStr),
            csvCell(u.leaderName || 'N/A'),
            csvCell(u.email || 'N/A'),
            csvCell(u.phone || 'N/A'),
            csvCell(u.teamName || 'N/A'),
            csvCell(u.college || 'N/A'),
            csvCell(u.regType || 'individual'),
            csvCell(u.eventDomain || 'N/A'),
            csvCell(members),
            u.totalAmount || 0,
            csvCell(u.paymentStatus || 'Pending')
        ].join(','));
    });

    const fileName = filterDomain ? `${compName}_${filterDomain}_Verified` : `${compName}_All_Verified`;

    // BOM prefix so Excel reads UTF-8 correctly (for ₹ symbol etc.)
    const csvContent = '\uFEFF' + rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
