/**
 * INTERACTIVE ELEMENTS
 * Scroll reveal, magnetic buttons, and stats counter
 */
export function initInteractions() {
    // A. SCROLL REVEAL
    const observerOptions = { threshold: 0.1 };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.querySelectorAll('.counter').length > 0) {
                    entry.target.querySelectorAll('.counter').forEach(count => startCounter(count));
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // B. MAGNETIC EFFECTS
    document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = `translate(0px, 0px)`;
        });
    });

    // C. FLOATING BAR VISIBILITY
    const floatingBar = document.getElementById('floating-bar');
    if (floatingBar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                floatingBar.classList.add('active');
            } else {
                floatingBar.classList.remove('active');
            }
        });
    }
}

function startCounter(el) {
    if (el.classList.contains('counted')) return;
    el.classList.add('counted');
    
    const target = parseInt(el.getAttribute('data-target'));
    let count = 0;
    const speed = 20; 

    const updateCount = () => {
        const increment = Math.ceil(target / 100);
        if (count < target) {
            count += increment;
            el.innerText = count > target ? target : count;
            setTimeout(updateCount, speed);
        } else {
            el.innerText = target;
        }
    };
    updateCount();
}
