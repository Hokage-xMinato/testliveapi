const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

// This will hold the complete, pre-generated HTML page.
let cachedHtml = '<!DOCTYPE html><html><head><title>Study Smarterz</title><style>body{display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#fff;} .spinner {width: 64px;height: 64px;border-radius: 50%;position: relative;background: conic-gradient(from 0deg, transparent, #fff);animation: spin 1s linear infinite;} .spinner::before {content: "";position: absolute;top: 8px;left: 8px;right: 8px;bottom: 8px;border-radius: 50%;background: transparent;border: 3px solid rgba(255,255,255,0.3);} @keyframes spin {to {transform: rotate(360deg);}}</style></head><body><div class="spinner"></div><p style="margin-left: 24px; font-size: 1.25rem; font-weight: 500;">Loading live classes, please wait...</p></body></html>';

/**
 * UTILITY FUNCTIONS
 * These are helper functions moved from the original HTML file.
 */
const textReplacer = (text) => {
    if (typeof text !== 'string') return text;
    // Strict replacement for "rolexcoderz", "rolex", and "coderz"
    return text.replace(/rolexcoderz/gi, 'studysmarterz')
               .replace(/rolex/gi, 'study')
               .replace(/coderz/gi, 'smarter');
};

const fetchApiData = async (endpoint) => {
    const url = `https://api.rolexcoderz.live/${endpoint}`;
    try {
        const response = await fetch(url, { timeout: 10000 });
        if (!response.ok) {
            console.error(`HTTP error for ${url}: ${response.status}`);
            return [];
        }
        const json = await response.json();
        return json.data || [];
    } catch (error) {
        console.error(`Failed to fetch data from ${url}:`, error.message);
        return [];
    }
};

/**
 * HTML RENDERING FUNCTIONS
 * These functions build the dynamic parts of the HTML.
 */
const renderLectureCards = (data) => {
    if (!data || data.length === 0) {
        return '';
    }
    return data.map(item => {
        const title = textReplacer(item.title);
        const batch = textReplacer(item.batch);

        let imageHtml = '';
        let isImageValid = false;
        if (item.image) {
            try {
                const imageUrl = new URL(item.image);
                if (imageUrl.hostname.endsWith('cloudfront.net')) {
                    isImageValid = true;
                    imageHtml = `<img src="${item.image}" alt="${title}" class="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML = '<div class=\'h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4 text-center font-semibold text-slate-600\'>${title}</div>';">`;
                }
            } catch (e) { /* Invalid URL */ }
        }
        if (!isImageValid) {
            imageHtml = `<div class="h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4 text-center font-semibold text-slate-600">${title}</div>`;
        }

        let finalLink = null;
        if (item.link) {
            try {
                const linkUrl = new URL(item.link);
                const playerUrlParam = linkUrl.searchParams.get('url');
                if (playerUrlParam) {
                    const cdnUrl = new URL(playerUrlParam);
                    if (cdnUrl.hostname.endsWith('cloudfront.net')) {
                        finalLink = `https://studysmarterx.netlify.app/player/?url=${encodeURIComponent(playerUrlParam)}`;
                    }
                }
            } catch (e) { /* Invalid URL */ }
        }

        const cardContent = `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full relative group lecture-card transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl" data-batch="${item.batch}">
                <span class="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-lg">${batch}</span>
                <div class="overflow-hidden rounded-t-2xl">${imageHtml}</div>
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-lg font-bold text-slate-800 flex-grow leading-tight group-hover:text-blue-600 transition-colors duration-300">${title}</h3>
                    <div class="mt-4 flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span class="text-sm">Watch Now</span>
                        <svg class="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                </div>
            </div>
        `;

        return finalLink
            ? `<a href="${finalLink}" target="_blank" rel="noopener noreferrer" class="block">${cardContent}</a>`
            : `<div>${cardContent}</div>`;
    }).join('');
};

const renderNotifications = (notifications) => {
    if (!notifications || notifications.length === 0) {
        return `<div class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <p class="text-slate-500 font-medium">No new notifications</p>
        </div>`;
    }
    return notifications.map(notif => {
        const title = textReplacer(notif.title);
        const message = textReplacer(notif.message);
        return `
            <div class="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 hover:shadow-md transition-shadow duration-300">
                <p class="font-bold text-slate-800 mb-1">${title}</p>
                <p class="text-sm text-slate-600 leading-relaxed">${message}</p>
            </div>
        `;
    }).join('');
};

const renderBatchOptions = (live, up, completed) => {
    const allData = [...live, ...up, ...completed];
    const batches = ['all', ...new Set(allData.map(item => item.batch))];
    return batches.map(batch =>
        `<option value="${batch}">${batch === 'all' ? 'All Batches' : textReplacer(batch)}</option>`
    ).join('');
};

/**
 * MAIN PAGE TEMPLATE
 * This function generates the entire HTML page with the fetched data.
 */
const buildFullHtmlPage = (live, up, completed, notifications) => {
    const liveCards = renderLectureCards(live);
    const upCards = renderLectureCards(up);
    const completedCards = renderLectureCards(completed);
    const notificationItems = renderNotifications(notifications);
    const batchOptions = renderBatchOptions(live, up, completed);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Study Smarterz - Live Classes</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-E7FMZ2D4HH');
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', 'Poppins', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            min-height: 100vh;
            position: relative;
        }
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
        }
        ::-webkit-scrollbar { width: 8px; } 
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 4px; } 
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
        
        .tab-active { 
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }
        .tab-btn {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 12px;
            padding: 12px 24px;
            font-weight: 600;
        }
        .tab-btn:not(.tab-active):hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        
        .notification-panel { 
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
        }
        
        .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .gradient-text {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .floating-animation {
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        .pulse-glow {
            animation: pulseGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes pulseGlow {
            from { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
            to { box-shadow: 0 0 30px rgba(139, 92, 246, 0.6); }
        }
        
        .dropdown-modern {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
        }
        
        .card-hover-glow:hover {
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(59, 130, 246, 0.2);
        }
    </style>
</head>
<body class="text-slate-800">
    <!-- Frame Buster Script -->
    <script>
        if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { console.error("Frame-busting failed:", e); } }
    </script>

    <div id="app-container" class="min-h-screen">
        <header class="glass-effect sticky top-0 z-30 border-b-0">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-20">
                    <div class="flex-shrink-0 floating-animation">
                        <h1 class="text-3xl font-black gradient-text">Study Smarterz</h1>
                        <p class="text-white/70 text-sm font-medium -mt-1">Live Learning Platform</p>
                    </div>
                    <div class="relative">
                        <button id="notification-btn" class="p-3 rounded-xl glass-effect text-white hover:bg-white/20 transition-all duration-300 pulse-glow">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <div id="notification-panel" class="notification-panel fixed top-0 right-0 h-full w-full max-w-md z-50 transform translate-x-full">
            <div class="flex items-center justify-between p-6 border-b border-slate-200/20">
                <h2 class="text-xl font-bold text-slate-800">Notifications</h2>
                <button id="close-notification-btn" class="p-2 rounded-xl hover:bg-slate-100 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="overflow-y-auto h-[calc(100vh-89px)] p-6 space-y-4">${notificationItems}</div>
        </div>
        <div id="notification-overlay" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 hidden"></div>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="glass-effect rounded-2xl p-2 mb-8">
                <nav class="flex space-x-2" aria-label="Tabs">
                    <button data-tab="live" class="tab-btn flex-1 text-center tab-active">
                        <span class="font-bold">Live</span>
                    </button>
                    <button data-tab="up" class="tab-btn flex-1 text-center text-white/70">
                        <span class="font-bold">Upcoming</span>
                    </button>
                    <button data-tab="completed" class="tab-btn flex-1 text-center text-white/70">
                        <span class="font-bold">Recorded</span>
                    </button>
                </nav>
            </div>
            
            <div class="mb-8">
                <select id="batch-filter" class="dropdown-modern block w-full max-w-xs px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300">${batchOptions}</select>
            </div>
            
            <div id="content-area">
                <div id="live-content" class="content-panel grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">${liveCards}</div>
                <div id="up-content" class="content-panel grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 hidden">${upCards}</div>
                <div id="completed-content" class="content-panel grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 hidden">${completedCards}</div>
            </div>
            
            <div id="empty-state" class="text-center py-20 hidden">
                <div class="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                    <svg class="w-20 h-20 mx-auto text-white/40 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    <h3 class="text-xl font-bold text-white mb-2">No Lectures Found</h3>
                    <p class="text-white/70">Try selecting a different batch or check back later.</p>
                </div>
            </div>
        </main>
        
        <footer class="glass-effect border-t-0 mt-20">
            <div class="max-w-7xl mx-auto py-8 px-4 text-center">
                <p class="text-white/70 font-medium">&copy; ${new Date().getFullYear()} Study Smarterz. All rights reserved.</p>
                <a href="https://t.me/studysmarterhub" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-white hover:text-blue-300 font-bold mt-4 px-6 py-3 glass-effect rounded-xl transition-all duration-300 hover:scale-105">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Join Telegram Community
                </a>
            </div>
        </footer>
    </div>

    <div id="telegram-popup" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div id="popup-content" class="glass-effect rounded-2xl max-w-sm w-full p-8 text-center transform transition-all scale-95 opacity-0 border border-white/20">
            <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Join Our Community!</h3>
            <p class="text-white/80 mb-8 leading-relaxed">Stay updated with the latest classes, notes, and announcements in our vibrant learning community.</p>
            <div class="space-y-4">
                <a href="https://t.me/studysmarterhub" target="_blank" class="inline-flex justify-center items-center w-full rounded-xl px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Join Telegram
                </a>
                <button type="button" id="close-popup-btn" class="inline-flex justify-center w-full rounded-xl px-6 py-4 glass-effect text-white font-semibold hover:bg-white/20 transition-all duration-300 border border-white/30">
                    Maybe Later
                </button>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Client-side interactivity script
            const tabs = document.querySelectorAll('.tab-btn');
            const contentPanels = document.querySelectorAll('.content-panel');
            const batchFilter = document.getElementById('batch-filter');
            const emptyState = document.getElementById('empty-state');
            let activeTab = 'live';

            function filterContent() {
                const selectedBatch = batchFilter.value;
                const activePanel = document.getElementById(activeTab + '-content');
                const cards = activePanel.querySelectorAll('a, div');
                let visibleCount = 0;
                
                cards.forEach((card, index) => {
                    const cardElement = card.querySelector('.lecture-card');
                    if (cardElement) {
                        if (selectedBatch === 'all' || cardElement.dataset.batch === selectedBatch) {
                            card.style.display = 'block';
                            // Add staggered animation
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                            }, index * 100);
                            visibleCount++;
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });
                
                emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
            }

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    activeTab = tab.dataset.tab;
                    
                    // Reset all tabs
                    tabs.forEach(t => {
                        t.classList.remove('tab-active');
                        t.classList.add('text-white/70');
                    });
                    
                    // Activate current tab
                    tab.classList.add('tab-active');
                    tab.classList.remove('text-white/70');
                    
                    // Hide all panels
                    contentPanels.forEach(panel => panel.classList.add('hidden'));
                    
                    // Show active panel
                    document.getElementById(activeTab + '-content').classList.remove('hidden');
                    
                    // Reset card animations
                    const activePanel = document.getElementById(activeTab + '-content');
                    const cards = activePanel.querySelectorAll('a, div');
                    cards.forEach(card => {
                        if (card.querySelector('.lecture-card')) {
                            card.style.opacity = '0';
                            card.style.transform = 'translateY(20px)';
                        }
                    });
                    
                    setTimeout(() => filterContent(), 50);
                });
            });

            batchFilter.addEventListener('change', filterContent);
            
            // Initial setup
            const initialCards = document.querySelectorAll('#live-content a, #live-content div');
            initialCards.forEach(card => {
                if (card.querySelector('.lecture-card')) {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                }
            });
            
            setTimeout(() => filterContent(), 100);
            
            // Notification Panel Logic
            const notificationBtn = document.getElementById('notification-btn');
            const closeNotificationBtn = document.getElementById('close-notification-btn');
            const notificationPanel = document.getElementById('notification-panel');
            const notificationOverlay = document.getElementById('notification-overlay');
            
            notificationBtn.addEventListener('click', () => {
                notificationPanel.classList.remove('translate-x-full');
                notificationOverlay.classList.remove('hidden');
            });
            
            closeNotificationBtn.addEventListener('click', () => {
                notificationPanel.classList.add('translate-x-full');
                notificationOverlay.classList.add('hidden');
            });
            
            notificationOverlay.addEventListener('click', () => {
                notificationPanel.classList.add('translate-x-full');
                notificationOverlay.classList.add('hidden');
            });

            // Popup Logic
            const popup = document.getElementById('telegram-popup');
            const popupContent = document.getElementById('popup-content');
            
            setTimeout(() => {
                popup.style.display = 'flex';
                setTimeout(() => {
                    popupContent.classList.remove('scale-95', 'opacity-0');
                    popupContent.classList.add('scale-100', 'opacity-100');
                }, 50);
            }, 1000);
            
            document.getElementById('close-popup-btn').addEventListener('click', () => {
                popupContent.classList.add('scale-95', 'opacity-0');
                setTimeout(() => popup.style.display = 'none', 300);
            });

            // Auto-refresh the page every 60 seconds to get new server-rendered content
            setTimeout(() => { window.location.reload(); }, 60000);
        });
    </script>
</body>
</html>`;
};

/**
 * CACHE UPDATE LOGIC
 * This function runs periodically to refresh the data and rebuild the HTML.
 */
const updateCache = async () => {
    console.log('Updating cache...');
    try {
        const [live, up, completed, notifications] = await Promise.all([
            fetchApiData('Live/?get=live'),
            fetchApiData('Live/?get=up'),
            fetchApiData('Live/?get=completed'),
            fetchApiData('Live/?get=notifications')
        ]);

        cachedHtml = buildFullHtmlPage(live, up, completed, notifications);
        console.log('Cache updated successfully.');
    } catch (error) {
        console.error('Failed to update cache:', error);
    }
};

// --- SERVER SETUP ---
app.get('/', (req, res) => {
    res.send(cachedHtml);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Immediately update cache on start, then set interval.
    updateCache();
    setInterval(updateCache, 60000); // 60 seconds
});
