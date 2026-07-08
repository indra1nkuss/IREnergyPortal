/**
 * YOUTUBE POWERED RADIO MODULE
 * Menggunakan YouTube IFrame API & YouTube Data API v3
 * Mengapa YouTube? Karena server YouTube (Google) hampir tidak pernah diblokir (ERR_NAME_NOT_RESOLVED)
 * dan mendukung streaming audio/video 24/7 berkualitas tinggi.
 */

import CONFIG from './config.js';

const CHANNELS = [
    { 
        name: "Global Hits Radio", 
        freq: "107.5", 
        query: "Official Hits Radio UK Live streaming", 
        tags: "Original • International" 
    },
    { 
        name: "Prambors Indo Hits", 
        freq: "102.2", 
        query: "Official Prambors FM Jakarta Live Streaming", 
        tags: "Original • Indonesia" 
    },
    { 
        name: "Energy Dance Mix", 
        freq: "94.8", 
        query: "Tomorrowland One World Radio Live", 
        tags: "Party • Global" 
    }
];

let currentIndex = 0;
let player = null;
let isYTReady = false;

// Elements
const musicWindow = document.getElementById('music-window');
const toggleBtn = document.getElementById('toggle-music');
const closeBtn = document.getElementById('close-music');
const playerPlayBtn = document.getElementById('player-play-pause');
const playerFreq = document.getElementById('player-freq');
const playerTitle = document.getElementById('player-title');
const radioStatus = document.getElementById('radio-status');
const presets = document.querySelectorAll('.station-preset');

export function initMusic() {
    if (!toggleBtn || !musicWindow) return;

    // 1. Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: '', // Will be set dynamically
            playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1 },
            events: {
                'onReady': () => { isYTReady = true; },
                'onStateChange': onPlayerStateChange
            }
        });
    };

    // Toggle Window
    toggleBtn.addEventListener('click', () => {
        musicWindow.classList.toggle('hidden');
        musicWindow.classList.toggle('flex');
        
        // Sembunyikan hint saat dibuka
        const hint = document.getElementById('music-hint');
        if (hint) hint.style.opacity = '0';

        if (musicWindow.classList.contains('flex')) {
            musicWindow.classList.add('chat-visible');
            musicWindow.classList.remove('chat-closing');
            updateUI();
        }
    });

    closeBtn?.addEventListener('click', () => {
        musicWindow.classList.add('chat-closing');
        setTimeout(() => {
            musicWindow.classList.add('hidden');
            musicWindow.classList.remove('flex', 'chat-visible', 'chat-closing');
        }, 300);
    });

    // Controls
    if (playerPlayBtn) {
        playerPlayBtn.addEventListener('click', () => {
            if (player && player.getPlayerState() === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                playCurrent();
            }
        });
    }

    document.getElementById('player-next')?.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % CHANNELS.length;
        playCurrent();
    });

    document.getElementById('player-prev')?.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + CHANNELS.length) % CHANNELS.length;
        playCurrent();
    });

    presets.forEach(btn => {
        btn.addEventListener('click', () => {
            currentIndex = parseInt(btn.dataset.id);
            playCurrent();
        });
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        radioStatus.innerText = "Satelit Locked • HD";
        radioStatus.classList.remove('animate-pulse');
        playerPlayBtn.innerText = '⏸';
    } else if (event.data === YT.PlayerState.BUFFERING) {
        radioStatus.innerText = "Buffering...";
        radioStatus.classList.add('animate-pulse');
    } else {
        playerPlayBtn.innerText = '▶';
    }
}

async function playCurrent() {
    if (!isYTReady || !player) return;
    
    const channel = CHANNELS[currentIndex];
    updateUI();
    
    radioStatus.innerText = "Searching Satelit...";
    radioStatus.classList.add('animate-pulse');

    try {
        // Menggunakan Serverless Proxy untuk keamanan (Bypass browser blocks)
        const searchUrl = `${CONFIG.YOUTUBE_API_URL}?q=${encodeURIComponent(channel.query)}`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            player.loadVideoById(videoId);
            player.playVideo();
        } else {
            radioStatus.innerText = "Signal Offline";
            console.error("No live stream found for:", channel.name);
        }
    } catch (error) {
        radioStatus.innerText = "API Limit / Error";
        console.error("YouTube API Error:", error);
    }
}

function updateUI() {
    const channel = CHANNELS[currentIndex];
    if (playerFreq) playerFreq.innerText = channel.freq;
    if (playerTitle) playerTitle.innerText = channel.name;
    
    presets.forEach((btn, i) => {
        if (i === currentIndex) {
            btn.classList.add('text-energi-cyan', 'border-energi-cyan/40');
            btn.classList.remove('text-white/40');
        } else {
            btn.classList.remove('text-energi-cyan', 'border-energi-cyan/40');
            btn.classList.add('text-white/40');
        }
    });
}
