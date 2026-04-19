// Event Registration Logic

document.addEventListener('DOMContentLoaded', () => {
    const regForm = document.getElementById('registrationForm');
    
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic validation
            const name = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            
            if (!name || !email || !phone) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Simulate form submission
            const btn = regForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin mr-2 align-middle">progress_activity</span> Processing...';
            btn.disabled = true;
            
            setTimeout(() => {
                alert('Registration submitted successfully! Please check your email for confirmation.');
                btn.innerHTML = originalText;
                btn.disabled = false;
                regForm.reset();
            }, 1500);
        });
    }
});
