/**
 * RADIO PLAYER
 * Menangani pemutaran radio streaming
 */
export function toggleRadio(e) {
    if (e) e.stopPropagation(); 
    
    const audio = document.getElementById('radio-stream');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const eq = document.getElementById('radio-eq');
    const radioBtn = document.getElementById('radio-btn');

    if(!audio) return;

    // Local state management
    const isPlaying = !audio.paused;

    if (isPlaying) {
        audio.pause();
        if(iconPlay) iconPlay.classList.remove('hidden');
        if(iconPause) iconPause.classList.add('hidden');
        if(eq) {
            eq.classList.remove('flex');
            eq.classList.add('hidden');
        }
        if(radioBtn) radioBtn.classList.remove('animate-pulse');
    } else {
        audio.play().catch(err => console.warn("Autoplay blocked or stream error"));
        if(iconPlay) iconPlay.classList.add('hidden');
        if(iconPause) iconPause.classList.remove('hidden');
        if(eq) {
            eq.classList.remove('hidden');
            eq.classList.add('flex');
        }
        if(radioBtn) radioBtn.classList.add('animate-pulse');
    }
}

export function initRadio() {
    const radioBtn = document.getElementById('radio-btn');
    if (radioBtn) {
        radioBtn.addEventListener('click', toggleRadio);
    }
}
