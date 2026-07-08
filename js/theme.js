/**
 * THEME MANAGER
 * Menangani mode gelap dan terang
 */
export function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
        if (themeToggleBtn) themeToggleBtn.textContent = '🌙'; 
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            themeToggleBtn.style.transform = 'scale(0.5) rotate(180deg)';
            themeToggleBtn.style.opacity = '0';
            
            setTimeout(() => {
                body.classList.toggle('light-mode');
                
                if (body.classList.contains('light-mode')) {
                    localStorage.setItem('theme', 'light');
                    themeToggleBtn.textContent = '🌙';
                } else {
                    localStorage.setItem('theme', 'dark');
                    themeToggleBtn.textContent = '☀️';
                }

                themeToggleBtn.style.transform = 'scale(1) rotate(0deg)';
                themeToggleBtn.style.opacity = '1';
            }, 200); 
        });
    }
}
