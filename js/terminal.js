/**
 * TERMINAL LOG
 * Menangani simulasi log sistem di dashboard
 */
export function initTerminal() {
    const terminalLines = document.getElementById('terminal-lines');
    if (!terminalLines) return;

    const logs = [
        "> Initializing Energy System v4.0...",
        "> Establishing secure connection to Grid-Alpha...",
        "> Fetching real-time monitoring data...",
        "> Syncing trainee certification database...",
        "> Security protocol: active",
        "> Firewall: standard encryption",
        "> System: Operational"
    ];

    terminalLines.innerHTML = '';
    logs.forEach((log, index) => {
        setTimeout(() => {
            const line = document.createElement('p');
            line.className = 'text-energi-cyan/80 mb-1 animate-fade-in';
            line.innerHTML = `<span class="text-energi-gold">user@portal:~$</span> ${log}`;
            terminalLines.appendChild(line);
            terminalLines.scrollTop = terminalLines.scrollHeight;
        }, index * 800);
    });
}
