/**
 * TERMINAL LOG
 * Menangani simulasi log sistem di dashboard secara dinamis
 */
export function initTerminal() {
    const terminalLines = document.getElementById('terminal-content');
    if (!terminalLines) return;

    const logs = [
        { text: "> Initializing Energy System v4.0...", color: "text-energi-gold" },
        { text: "> Establishing secure connection to Grid-Alpha...", color: "text-energi-cyan" },
        { text: "> Syncing trainee certification database...", color: "text-energi-cyan" },
        { text: "> Security protocol: [ACTIVE]", color: "text-green-400" },
        { text: "> Firewall: [ENCRYPTED]", color: "text-green-400" },
        { text: "> Checking energy metrics...", color: "text-energi-cyan" },
        { text: "> System status: [OPERATIONAL]", color: "text-energi-gold font-bold" }
    ];

    terminalLines.innerHTML = '';
    
    let delay = 0;
    logs.forEach((log, index) => {
        delay += (Math.random() * 500) + 400; // Delay acak agar terasa nyata
        
        setTimeout(() => {
            const line = document.createElement('div');
            line.className = `mb-1 animate-fade-in opacity-0 ${log.color}`;
            line.style.animation = 'fadeInUp 0.5s ease forwards';
            line.innerHTML = `<span class="opacity-50">user@portal:~$</span> ${log.text}`;
            terminalLines.appendChild(line);
            
            // Auto scroll ke bawah
            terminalLines.scrollTop = terminalLines.scrollHeight;

            // Efek berkedip di akhir log terakhir
            if (index === logs.length - 1) {
                const cursor = document.createElement('span');
                cursor.className = 'animate-pulse ml-1';
                cursor.textContent = '▊';
                line.appendChild(cursor);
            }
        }, delay);
    });
}
