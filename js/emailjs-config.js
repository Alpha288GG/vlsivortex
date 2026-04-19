/* ══════════════════════════════════════════════════════════
   emailjs-config.js — Email Notification Utility
   Tech Vortex | SSCODEHUB
   ══════════════════════════════════════════════════════════ */

// ⚠️ REPLACE THESE WITH YOUR ACTUAL IDS FROM EMAILJS DASHBOARD
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";

const EMAILJS_TEMPLATES = {
    welcome: "YOUR_WELCOME_TEMPLATE_ID",
    registration: "YOUR_REGISTRATION_TEMPLATE_ID",
    verified: "YOUR_VERIFIED_TEMPLATE_ID"
};

// Initialize EmailJS
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
})();

/**
 * 1. Send Welcome Email
 */
async function sendWelcomeEmail(userName, toEmail) {
    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATES.welcome, {
            user_name: userName,
            to_email: toEmail
        });
        console.log("Welcome email sent to:", toEmail);
    } catch (err) {
        console.error("EmailJS Welcome Error:", err);
    }
}

/**
 * 2. Send Registration Confirmation Email
 */
async function sendRegistrationEmail(userName, toEmail, eventName, teamName, amount) {
    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATES.registration, {
            user_name: userName,
            to_email: toEmail,
            event_name: eventName,
            team_name: teamName || "Individual",
            amount: amount
        });
        console.log("Registration email sent to:", toEmail);
    } catch (err) {
        console.error("EmailJS Registration Error:", err);
    }
}

/**
 * 3. Send Payment Verified Email
 */
async function sendVerifiedEmail(userName, toEmail, eventName) {
    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATES.verified, {
            user_name: userName,
            to_email: toEmail,
            event_name: eventName
        });
        console.log("Verification email sent to:", toEmail);
    } catch (err) {
        console.error("EmailJS Verified Error:", err);
    }
}
