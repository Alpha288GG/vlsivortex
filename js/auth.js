/* ══════════════════════════════════════════════════════════
   auth.js — Firebase Google Auth + Session Management
   Tech Vortex | SSCODEHUB
   ══════════════════════════════════════════════════════════ */

const authProvider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();

/* ── Sign In ── */
function signInWithGoogle() {
    auth.signInWithPopup(authProvider)
        .then(async (result) => {
            const user = result.user;
            // Create / update user doc
            const userRef = db.collection('users').doc(user.uid);
            const doc = await userRef.get();
            if (!doc.exists) {
                await userRef.set({
                    displayName: user.displayName || '',
                    email: user.email || '',
                    photoURL: user.photoURL || '',
                    phone: '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
                // 1. Trigger Welcome Email on Sign Up
                sendWelcomeEmail(user.displayName, user.email);
            } else {
                await userRef.update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            // If on registration page — stay here and let the modal advance
            if (window.location.pathname.includes('registration')) {
                document.dispatchEvent(new CustomEvent('vlsi:authReady', { detail: { user, userDoc: doc } }));
            } else if (window.location.pathname.includes('dashboard')) {
                window.location.reload();
            } else {
                // On any other page — go to dashboard
                window.location.href = 'dashboard.html';
            }
        })
        .catch(err => {
            console.error('Auth error:', err);
            if (err.code !== 'auth/popup-closed-by-user') {
                alert('Sign-in failed. Please try again.');
            }
        });
}

/* ── Sign Out ── */
function signOutUser() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
}

/* ── Auth State Listener — updates navbar ── */
function initAuthUI() {
    auth.onAuthStateChanged(user => {
        // Desktop nav CTA
        const navCta = document.querySelector('.nav-cta');
        if (!navCta) return;
        const isDashboard = window.location.pathname.includes('dashboard.html');

        if (user) {
            // Signed in — show avatar + dashboard link
            const photo = user.photoURL || '';
            const initial = (user.displayName || 'U')[0].toUpperCase();
            
            if (!isDashboard) {
                navCta.innerHTML = `
                    <a href="dashboard.html" class="btn btn-outline btn-sm" style="display:inline-flex; align-items:center; gap:8px;" title="Go to Dashboard">
                        ${photo
                            ? `<img src="${photo}" alt="" style="width:22px; height:22px; border-radius:50%; object-fit:cover;">`
                            : `<span style="width:22px; height:22px; border-radius:50%; background:var(--creamy-blue); color:var(--bg); display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:700;">${initial}</span>`
                        }
                        <span class="hide-mobile">Dashboard</span>
                    </a>
                `;
            }

            // Update mobile menu if present
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                const existingRegBtn = mobileMenu.querySelector('.btn-gold');
                if (existingRegBtn) {
                    existingRegBtn.href = 'dashboard.html';
                    existingRegBtn.textContent = 'My Dashboard';
                }
            }
        } else {
            // Signed out — show sign in button
            if (!isDashboard) {
                navCta.innerHTML = `
                    <button onclick="signInWithGoogle()" class="btn btn-gold btn-sm" style="display:inline-flex; align-items:center; gap:8px;" title="Sign In">
                        <svg width="16" height="16" viewBox="0 0 48 48" style="flex-shrink:0;"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                        <span class="hide-mobile">Sign In</span>
                    </button>
                `;
            }
        }
    });
}


/* ── Init on every page ── */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthUI);
} else {
    initAuthUI();
}
