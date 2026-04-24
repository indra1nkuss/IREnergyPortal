/**
 * TEAM RENDERER
 * Menangani tampilan tim energi
 */
import { teamData } from './data.js';

export function renderTeam() {
    const container = document.getElementById('team-container');
    if (!container) return; 
    
    const createCard = (person, delay) => {
        const imagePath = person.image || `images/default.jpg`;
        const isClickable = !!person.link; 
        
        const wrapperTag = isClickable ? 'a' : 'div';
        const linkAttr = isClickable ? `href="${person.link}" target="_blank" rel="noopener noreferrer"` : '';
        const cursorClass = isClickable ? 'cursor-pointer hover:-translate-y-2' : '';
        
        const hintHTML = isClickable ? `
            <div class="mt-4 flex justify-center w-full">
                <div class="animate-bounce flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-energi-cyan/10 to-energi-gold/10 border border-energi-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.2)] backdrop-blur-sm">
                    <span class="text-[10px] md:text-xs text-energi-gold">✨</span>
                    <span class="text-[9px] md:text-[10px] text-white font-medium tracking-wide drop-shadow-md">Klik disini untuk melihat portofolio</span>
                </div>
            </div>
        ` : '';

        return `
        <${wrapperTag} ${linkAttr} class="block luxury-card group w-[220px] md:w-[240px] p-6 text-center z-10 relative transition-transform duration-500 ${cursorClass}" style="animation: fadeInUpTeam 0.6s ease backwards ${delay}s;">
            <div class="absolute inset-0 bg-gradient-to-br from-energi-cyan/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-xl"></div>
            
            <div class="hex-container relative z-10 mx-auto">
                <div class="hex-border"></div>
                <div class="hex-photo-wrap">
                    <img src="${imagePath}" 
                         alt="${person.name}" 
                         class="hex-photo object-cover w-full h-full transition-transform duration-500">
                </div>
            </div>

            <div class="relative z-10 mt-4 flex flex-col items-center">
                <h3 class="text-base md:text-lg font-bold text-white tracking-wide group-hover:text-energi-gold transition-colors duration-300">${person.name}</h3>
                <div class="inline-block px-3 py-1.5 mt-2 rounded-full bg-[#050508]/80 border border-white/10 group-hover:border-energi-cyan/40 group-hover:bg-energi-cyan/10 transition-all duration-300 shadow-inner">
                    <p class="text-energi-cyan text-[10px] md:text-[11px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">${person.role}</p>
                </div>
                ${hintHTML} 
            </div>
        </${wrapperTag}>
        `;
    };

    const mobileLine = `
        <div class="md:hidden flex justify-center w-full my-2">
            <div class="w-[2px] h-8 relative overflow-hidden line-glow">
                <div class="absolute inset-0 energy-flow-y"></div>
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="flex flex-col items-center w-full relative py-6 max-w-5xl mx-auto overflow-x-hidden">
            ${createCard(teamData[0], '0.1')}
            <div class="flex justify-center w-full my-2 md:my-0">
                <div class="w-[2px] h-10 md:h-12 relative overflow-hidden line-glow">
                    <div class="absolute inset-0 energy-flow-y"></div>
                </div>
            </div>
            ${createCard(teamData[1], '0.3')}
            <div class="flex justify-center w-full my-2 md:my-0">
                <div class="w-[2px] h-8 md:h-10 relative overflow-hidden line-glow">
                    <div class="absolute inset-0 energy-flow-y" style="animation-delay: 0.2s"></div>
                </div>
            </div>
            <div class="hidden md:block w-full max-w-[800px] relative">
                <div class="absolute top-0 left-[16.66%] right-[16.66%] h-[2px] overflow-hidden line-glow">
                    <div class="absolute inset-0 energy-flow-x"></div>
                </div>
                <div class="grid grid-cols-3 w-full">
                    <div class="flex justify-center"><div class="w-[2px] h-10 relative overflow-hidden line-glow"><div class="absolute inset-0 energy-flow-y" style="animation-delay: 0.4s"></div></div></div>
                    <div class="flex justify-center"><div class="w-[2px] h-10 relative overflow-hidden line-glow"><div class="absolute inset-0 energy-flow-y" style="animation-delay: 0.5s"></div></div></div>
                    <div class="flex justify-center"><div class="w-[2px] h-10 relative overflow-hidden line-glow"><div class="absolute inset-0 energy-flow-y" style="animation-delay: 0.6s"></div></div></div>
                </div>
            </div>
            <div class="flex flex-col items-center md:grid md:grid-cols-3 w-full max-w-[800px] gap-0 md:gap-4 justify-items-center relative z-10 pb-10">
                ${createCard(teamData[3], '0.5')}
                ${mobileLine}
                ${createCard({ ...teamData[2], link: 'https://indra1nkuss.github.io/mycv/' }, '0.7')}
                ${mobileLine}
                ${createCard(teamData[4], '0.9')}
            </div>
        </div>
    `;
}
