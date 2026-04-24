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
        { text: "> Syncing certification database...", color: "text-energi-cyan" },
        { text: "> Memory Check: [OK]", color: "text-green-400" },
        { text: "> Security Protocol: [ENCRYPTED]", color: "text-green-400" },
        { text: "> System status: [OPERATIONAL]", color: "text-energi-gold font-bold" }
    ];

    // Bersihkan isi sebelum mulai
    terminalLines.innerHTML = '';
    
    let delay = 0;
    logs.forEach((log, index) => {
        delay += (Math.random() * 600) + 500; 
        
        setTimeout(() => {
            const line = document.createElement('div');
            line.className = `mb-1 opacity-0`;
            line.style.animation = 'fadeInUp 0.5s ease forwards';
            line.innerHTML = `<span class="opacity-40">user@portal:~$</span> ${log.text}`;
            terminalLines.appendChild(line);
            
            terminalLines.scrollTop = terminalLines.scrollHeight;

            if (index === logs.length - 1) {
                const cursor = document.createElement('span');
                cursor.className = 'animate-pulse ml-1 text-energi-gold';
                cursor.textContent = '▊';
                line.appendChild(cursor);
            }
        }, delay);
    });
}
