const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

// A modern, elegant loading screen.
let cachedHtml = `<!DOCTYPE html><html><head><title>Study Smarterz</title><style>
:root { --primary-color: #3b82f6; --bg-color: #f8fafc; --text-color: #334155; }
body { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background-color: var(--bg-color); color: var(--text-color); }
.loader { width: 60px; height: 60px; border-radius: 50%; display: inline-block; position: relative; border: 3px solid; border-color: var(--primary-color) var(--primary-color) transparent transparent; box-sizing: border-box; animation: rotation 1s linear infinite; }
.loader::after, .loader::before { content: ''; box-sizing: border-box; position: absolute; left: 0; right: 0; top: 0; bottom: 0; margin: auto; border: 3px solid; border-color: transparent transparent #60a5fa #60a5fa; width: 50px; height: 50px; border-radius: 50%; box-sizing: border-box; animation: rotationBack 0.5s linear infinite; transform-origin: center center; }
.loader::before { width: 40px; height: 40px; border-color: var(--primary-color) var(--primary-color) transparent transparent; animation: rotation 1.5s linear infinite; }
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes rotationBack { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
p { margin-top: 24px; font-size: 1.125rem; letter-spacing: 0.5px; }
</style></head><body><div class="loader"></div><p>Loading Live Classes...</p></body></html>`;

/**
 * UTILITY FUNCTIONS
 * (No changes here, functionality is the same)
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
 * (Major design updates here)
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
                    imageHtml = `<img src="${item.image}" alt="${title}" class="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML = \`<div class='h-48 w-full bg-slate-100 flex flex-col items-center justify-center p-4 text-center text-slate-500'><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg><span class="font-semibold">${title}</span></div>\`;">`;
                }
            } catch (e) { /* Invalid URL */ }
        }
        if (!isImageValid) {
            imageHtml = `<div class="h-48 w-full bg-slate-100 flex flex-col items-center justify-center p-4 text-center text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg><span class="font-semibold">${title}</span></div>`;
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
            <div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full relative group lecture-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1" data-batch="${item.batch}">
                <div class="overflow-hidden">
                   ${imageHtml}
                </div>
                <div class="p-5 flex flex-col flex-grow">
                    <span class="absolute top-3 right-3 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full z-10">${batch}</span>
                    <h3 class="text-base font-bold text-slate-800 flex-grow leading-snug">${title}</h3>
                </div>
            </div>
        `;

        return finalLink
            ? `<a href="${finalLink}" target="_blank" rel="noopener noreferrer" class="block">${cardContent}</a>`
            : `<div class="block">${cardContent}</div>`;
    }).join('');
};

const renderNotifications = (notifications) => {
    if (!notifications || notifications.length === 0) {
        return `<p class="text-slate-500 text-center py-10">No new notifications.</p>`;
    }
    return notifications.map(notif => {
        const title = textReplacer(notif.title);
        const message = textReplacer(notif.message);
        return `
            <div class="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors duration-200">
                <p class="font-semibold text-slate-900">${title}</p>
                <p class="text-sm text-slate-600 mt-1">${message}</p>
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
 * (Completely new design and structure)
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
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-E7FMZ2D4HH"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-E7FMZ2D4HH');
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #3b82f6;
            --primary-color-hover: #2563eb;
        }
        body { 
            font-family: 'Inter', sans-serif; 
            background-color: #f8fafc;
            background-image: radial-gradient(circle at top, #f1f5f9, transparent 40%);
        }
        ::-webkit-scrollbar { width: 8px; } 
        ::-webkit-scrollbar-track { background: #e2e8f0; } 
        ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .notification-panel { transition: transform 0.3s ease-in-out; }
        #app-container { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="text-slate-800">
    <script>if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { console.error("Frame-busting failed:", e); } }</script>

    <div id="app-container" class="min-h-screen">
        <header class="bg-white/80 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-20">
                    <div class="flex-shrink-0"><h1 class="text-3xl font-extrabold text-slate-900">Study <span class="text-blue-600">Smarterz</span></h1></div>
                    <div class="relative">
                        <button id="notification-btn" class="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <div id="notification-panel" class="notification-panel fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-lg z-50 transform translate-x-full">
            <div class="flex items-center justify-between p-4 border-b">
                <h2 class="text-lg font-semibold">Notifications</h2>
                <button id="close-notification-btn" class="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div class="overflow-y-auto h-[calc(100vh-65px)] p-4 space-y-3">${notificationItems}</div>
        </div>
        <div id="notification-overlay" class="fixed inset-0 bg-black/30 z-40 hidden"></div>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div class="bg-slate-100 p-1.5 rounded-lg flex space-x-2">
                    <button data-tab="live" class="tab-btn w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-300 bg-white text-blue-600 shadow-sm">Live</button>
                    <button data-tab="up" class="tab-btn w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-md transition-colors duration-300">Upcoming</button>
                    <button data-tab="completed" class="tab-btn w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-md transition-colors duration-300">Recorded</button>
                </div>
                <div class="flex-shrink-0">
                    <select id="batch-filter" class="block w-full sm:w-64 pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm">${batchOptions}</select>
                </div>
            </div>
            
            <div id="content-area">
                <section id="live-content" class="content-panel mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">${liveCards}</section>
                <section id="up-content" class="content-panel mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 hidden">${upCards}</section>
                <section id="completed-content" class="content-panel mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 hidden">${completedCards}</section>
            </div>
            <div id="empty-state" class="text-center py-20 hidden">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082a.75.75 0 01.75.75v5.714a2.25 2.25 0 00.659 1.591L19.8 18.44a2.25 2.25 0 010 3.182H5.2a2.25 2.25 0 010-3.182l5.109-5.109a2.25 2.25 0 00.66-1.591V3.936c0-.256.03-.51.082-.75.052-.239.122-.468.214-.685a.75.75 0 01.75-.75h.75c.256 0 .51.03.75.082z" /></svg>
                <h3 class="mt-4 text-lg font-semibold text-slate-900">No Lectures Found</h3>
                <p class="mt-1 text-sm text-slate-500">There are no lectures available for the selected filter.</p>
            </div>
        </main>
        
        <footer class="bg-white border-t mt-16"><div class="max-w-7xl mx-auto py-8 px-4 text-center text-sm text-slate-500"><p>&copy; ${new Date().getFullYear()} Study Smarterz. All rights reserved.</p><a href="https://t.me/studysmarterhub" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 font-semibold mt-2 inline-block">Join our Telegram Channel</a></div></footer>
    </div>

    <div id="telegram-popup" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden"><div id="popup-content" class="bg-white rounded-xl shadow-xl max-w-sm w-full p-8 text-center transform transition-all scale-95 opacity-0"><h3 class="text-xl font-bold text-slate-900 mt-4">Join Our Community!</h3><p class="text-sm text-slate-500 mt-2 leading-relaxed">Stay updated with the latest classes, notes, and important announcements by joining our official Telegram channel.</p><div class="mt-6 space-y-3"><a href="https://t.me/studysmarterhub" target="_blank" class="flex items-center justify-center w-full rounded-lg shadow-sm px-4 py-2.5 bg-blue-600 text-base font-semibold text-white hover:bg-blue-700 transition-colors">Join Telegram</a><button type="button" id="close-popup-btn" class="flex items-center justify-center w-full rounded-lg border border-slate-300 shadow-sm px-4 py-2.5 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Maybe Later</button></div></div></div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const tabs = document.querySelectorAll('.tab-btn');
            const contentPanels = document.querySelectorAll('.content-panel');
            const batchFilter = document.getElementById('batch-filter');
            const emptyState = document.getElementById('empty-state');
            let activeTab = 'live';

            function filterContent() {
                const selectedBatch = batchFilter.value;
                const activePanel = document.getElementById(activeTab + '-content');
                if (!activePanel) return;
                
                const cards = activePanel.querySelectorAll('a, div.block');
                let visibleCount = 0;
                cards.forEach(card => {
                    const cardElement = card.querySelector('.lecture-card');
                    if (selectedBatch === 'all' || cardElement.dataset.batch === selectedBatch) {
                        card.style.display = 'block';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
                activePanel.style.display = visibleCount > 0 ? 'grid' : 'none';
            }

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    activeTab = tab.dataset.tab;
                    
                    tabs.forEach(t => {
                        t.classList.remove('bg-white', 'text-blue-600', 'shadow-sm');
                        t.classList.add('text-slate-600', 'hover:text-slate-800');
                    });
                    tab.classList.add('bg-white', 'text-blue-600', 'shadow-sm');
                    tab.classList.remove('text-slate-600', 'hover:text-slate-800');

                    contentPanels.forEach(panel => {
                        panel.id === activeTab + '-content' ? panel.classList.remove('hidden') : panel.classList.add('hidden');
                    });
                    filterContent();
                });
            });

            batchFilter.addEventListener('change', filterContent);
            filterContent(); // Initial check on load
            
            // Notification Panel Logic
            const notificationBtn = document.getElementById('notification-btn');
            const closeNotificationBtn = document.getElementById('close-notification-btn');
            const notificationPanel = document.getElementById('notification-panel');
            const notificationOverlay = document.getElementById('notification-overlay');
            
            const openPanel = () => {
                notificationPanel.classList.remove('translate-x-full');
                notificationOverlay.classList.remove('hidden');
            };
            const closePanel = () => {
                notificationPanel.classList.add('translate-x-full');
                notificationOverlay.classList.add('hidden');
            };

            notificationBtn.addEventListener('click', openPanel);
            closeNotificationBtn.addEventListener('click', closePanel);
            notificationOverlay.addEventListener('click', closePanel);

            // Popup Logic
            const popup = document.getElementById('telegram-popup');
            const popupContent = document.getElementById('popup-content');
            setTimeout(() => {
                popup.classList.remove('hidden');
                popup.classList.add('flex'); // to enable flex centering
                setTimeout(() => { // short delay to allow display change before transition
                    popupContent.classList.remove('scale-95', 'opacity-0');
                    popupContent.classList.add('scale-100', 'opacity-100');
                }, 50);
            }, 1500); // Popup appears after 1.5 seconds

            document.getElementById('close-popup-btn').addEventListener('click', () => {
                popupContent.classList.add('scale-95', 'opacity-0');
                setTimeout(() => popup.classList.add('hidden'), 300);
            });

            // Auto-refresh the page every 90 seconds
            setTimeout(() => { window.location.reload(); }, 90000);
        });
    </script>
</body>
</html>`;
};

/**
 * CACHE UPDATE LOGIC
 * (No changes here, functionality is the same)
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
