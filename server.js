// server.js - Consolidated and Enhanced Node.js Caching/SSR Application
const express = require('express');
const fetch = require('node-fetch'); // NOTE: node-fetch needs to be installed via npm
const helmet = require('helmet');

// --- 1. CONFIGURATION ---
const PORT = process.env.PORT || 10000;
const BASE_API_URL = 'https://api.rolexcoderz.live/Live/';
const PLAYER_BASE_URL = 'https://studysmarterx.netlify.app/player/';
const CACHE_INTERVAL_MS = 60000; // 60 seconds
const MAX_RETRIES = 3;
const TEXT_REPLACEMENTS = {
    rolexcoderz: 'studysmarterz',
    rolex: 'study',
    coderz: 'smarter',
};

// This will hold the complete, pre-generated HTML page.
let cachedHtml = `
<!DOCTYPE html><html><head><title>Study Smarterz</title>
<style>
    body{display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background-color:#f8fafc;color:#475569;} 
    .spinner {width: 56px;height: 56px;border-radius: 50%;padding: 6px;background: conic-gradient(from 180deg at 50% 50%, rgba(255, 255, 255, 0) 0deg, #4f46e5 360deg);animation: spin 1s linear infinite;} 
    .spinner::before {content: "";display: block;width: 100%;height: 100%;border-radius: 50%;background: #f8fafc;} 
    @keyframes spin {to {transform: rotate(1turn);}}
</style>
</head><body>
<div class="spinner"></div>
<p style="margin-left: 16px; font-size: 1.25rem;">Loading live classes, please wait...</p>
</body></html>
`;

// --- 2. UTILITY FUNCTIONS ---

/**
 * Replaces old brand names with new ones, case-insensitively.
 */
const textReplacer = (text) => {
    if (typeof text !== 'string') return text;
    let result = text;
    for (const [oldText, newText] of Object.entries(TEXT_REPLACEMENTS)) {
        const regex = new RegExp(oldText, 'gi');
        result = result.replace(regex, newText);
    }
    return result;
};

// --- 3. API FETCHING (with Resilience) ---

/**
 * Fetches data from a specific API endpoint with a simple retry mechanism.
 */
const fetchApiData = async (endpoint) => {
    const url = `${BASE_API_URL}${endpoint}`;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, { timeout: 10000 });
            if (!response.ok) {
                console.error(`[API Error] HTTP error for ${url}: ${response.status}. Attempt ${attempt}/${MAX_RETRIES}`);
                if (attempt === MAX_RETRIES) return [];
                continue;
            }
            const json = await response.json();
            return json.data || [];
        } catch (error) {
            console.error(`[Fetch Error] Failed to fetch data from ${url} (Attempt ${attempt}/${MAX_RETRIES}):`, error.message);
            if (attempt === MAX_RETRIES) return [];
            await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // Simple backoff
        }
    }
    return [];
};

/**
 * Fetches all necessary data concurrently.
 */
const fetchAllData = async () => {
    const [live, up, completed, notifications] = await Promise.all([
        fetchApiData('?get=live'),
        fetchApiData('?get=up'),
        fetchApiData('?get=completed'),
        fetchApiData('?get=notifications')
    ]);

    return { live, up, completed, notifications };
};


// --- 4. HTML RENDERING FUNCTIONS ---

const renderLectureCards = (data) => {
    if (!data || data.length === 0) {
        return '';
    }

    return data.map(item => {
        const title = textReplacer(item.title);
        const batch = textReplacer(item.batch);
        const uniqueId = item.id || Math.random().toString(36).substring(2, 9);

        let imageHtml;
        let finalLink = null;
        let isImageValid = false;
        
        try {
            const imageUrl = item.image ? new URL(item.image) : null;
            if (imageUrl && imageUrl.hostname.endsWith('cloudfront.net')) {
                isImageValid = true;
                imageHtml = `<img src="${item.image}" alt="${title}" class="h-40 w-full object-cover transition duration-300 group-hover:opacity-90" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML = '<div class=\\'h-40 w-full bg-slate-200 flex items-center justify-center p-4 text-center font-semibold text-slate-600\\'>${title}</div>';">`;
            }
        } catch (e) { /* Invalid image URL */ }

        if (!isImageValid) {
            imageHtml = `<div class="h-40 w-full bg-slate-200 flex items-center justify-center p-4 text-center font-semibold text-slate-600">${title}</div>`;
        }

        try {
            const linkUrl = item.link ? new URL(item.link) : null;
            const playerUrlParam = linkUrl ? linkUrl.searchParams.get('url') : null;

            if (playerUrlParam) {
                const cdnUrl = new URL(playerUrlParam);
                if (cdnUrl.hostname.endsWith('cloudfront.net')) {
                    finalLink = `${PLAYER_BASE_URL}?url=${encodeURIComponent(playerUrlParam)}`;
                }
            }
        } catch (e) { /* Invalid lecture link URL */ }

        const cardContent = `
            <div class="bg-white rounded-xl shadow-lg hover:shadow-xl overflow-hidden flex flex-col h-full relative group lecture-card transition duration-300" data-batch="${item.batch}" data-id="${uniqueId}">
                <span class="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10">${batch}</span>
                ${imageHtml}
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="text-lg font-semibold text-slate-900 flex-grow">${title}</h3>
                </div>
            </div>
        `;

        return finalLink
            ? `<a href="${finalLink}" target="_blank" rel="noopener noreferrer" class="block transition-transform duration-300 hover:-translate-y-1">${cardContent}</a>`
            : `<div class="block opacity-80 cursor-default">${cardContent}</div>`;
    }).join('');
};

const renderNotifications = (notifications) => {
    if (!notifications || notifications.length === 0) {
        return `<p class="text-slate-500 text-center py-10">No new notifications. Check back later!</p>`;
    }
    return notifications.map(notif => {
        const title = textReplacer(notif.title);
        const message = textReplacer(notif.message);
        return `
            <div class="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                <p class="font-bold text-indigo-800">${title}</p>
                <p class="text-sm text-indigo-600 mt-1">${message}</p>
            </div>
        `;
    }).join('');
};

const renderBatchOptions = (live, up, completed) => {
    const allData = [...live, ...up, ...completed];
    const batches = ['all', ...new Set(allData.map(item => item.batch).filter(b => b))];
    return batches.map(batch =>
        `<option value="${batch}">${batch === 'all' ? 'All Batches' : textReplacer(batch)}</option>`
    ).join('');
};

const buildFullHtmlPage = (live, up, completed, notifications) => {
    const liveCards = renderLectureCards(live);
    const upCards = renderLectureCards(up);
    const completedCards = renderLectureCards(completed);
    const notificationItems = renderNotifications(notifications);
    const batchOptions = renderBatchOptions(live, up, completed);
    const initialEmptyState = liveCards.length === 0 ? 'block' : 'hidden';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Study Smarterz - Live Classes</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = { theme: { extend: { colors: { indigo: { 50: '#f0f4ff', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3' } } } } }
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-E7FMZ2D4HH"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-E7FMZ2D4HH');
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #f1f5f9; } ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
        .tab-active { border-color: #4f46e5; color: #4f46e5; font-weight: 600; }
        .notification-panel { transition: transform 0.3s ease-in-out; }
    </style>
</head>
<body class="text-slate-800">
    <script>
        if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { /* Permission denied, ignore */ } }
    </script>

    <div id="app-container" class="min-h-screen flex flex-col">
        <header class="bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex-shrink-0"><h1 class="text-2xl font-extrabold text-indigo-700">Study Smarterz</h1></div>
                    <div class="relative">
                        <button id="notification-btn" class="p-2 rounded-full text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition duration-150" aria-label="Notifications"><svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></button>
                    </div>
                </div>
            </div>
        </header>

        <div id="notification-panel" class="notification-panel fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform translate-x-full">
            <div class="flex items-center justify-between p-4 border-b border-slate-100">
                <h2 class="text-xl font-bold text-slate-800">Notifications</h2>
                <button id="close-notification-btn" class="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition duration-150" aria-label="Close Notifications"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div class="overflow-y-auto h-[calc(100vh-65px)] p-4 space-y-4">${notificationItems}</div>
        </div>
        <div id="notification-overlay" class="fixed inset-0 bg-black/40 z-40 hidden transition-opacity duration-300"></div>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
            <div class="border-b border-slate-200">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <button data-tab="live" class="tab-btn whitespace-nowrap py-3 px-1 border-b-2 text-base border-transparent text-slate-500 hover:text-indigo-600 hover:border-indigo-300 tab-active">Live</button>
                    <button data-tab="up" class="tab-btn whitespace-nowrap py-3 px-1 border-b-2 text-base border-transparent text-slate-500 hover:text-indigo-600 hover:border-indigo-300">Upcoming</button>
                    <button data-tab="completed" class="tab-btn whitespace-nowrap py-3 px-1 border-b-2 text-base border-transparent text-slate-500 hover:text-indigo-600 hover:border-indigo-300">Recorded</button>
                </nav>
            </div>

            <div class="mt-8 flex justify-end">
                <select id="batch-filter" class="block max-w-xs pl-4 pr-12 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm">${batchOptions}</select>
            </div>
            
            <div id="content-area">
                <div id="live-content" class="content-panel mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">${liveCards}</div>
                <div id="up-content" class="content-panel mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 hidden">${upCards}</div>
                <div id="completed-content" class="content-panel mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 hidden">${completedCards}</div>
            </div>
            <div id="empty-state" class="text-center py-24 border border-dashed border-slate-300 rounded-xl mt-8 ${initialEmptyState} bg-white"><svg class="mx-auto h-12 w-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-2.25A3.375 3.375 0 0010.5 10.875v2.625m-2.25 0h-2.25A3.375 3.375 0 013.75 10.875v-2.625A3.375 3.375 0 017.125 4.875h5.25a3.375 3.375 0 013.375 3.375v3.375m-3.75 0h-1.5M4.125 18.75h14.75m-15.5-5.25v6.75m16-6.75v6.75M9 18.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM15 18.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /></svg><h3 class="mt-2 text-lg font-bold text-slate-900">No Lectures Found</h3><p class="mt-1 text-sm text-slate-500">Try changing the batch filter or check a different tab.</p></div>
        </main>
        
        <footer class="bg-white border-t border-slate-100 mt-12">
            <div class="max-w-7xl mx-auto py-6 px-4 text-center text-sm text-slate-500">
                <p>&copy; ${new Date().getFullYear()} Study Smarterz. All rights reserved.</p>
                <a href="https://t.me/studysmarterhub" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block transition duration-150 border-b border-dotted border-indigo-300">Join our Telegram Channel</a>
            </div>
        </footer>
    </div>

    <div id="telegram-popup" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
        <div id="popup-content" class="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all duration-500 scale-95 opacity-0">
            <svg class="mx-auto h-12 w-12 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <h3 class="text-xl font-bold text-slate-900 mt-4">Join Our Community!</h3>
            <p class="text-sm text-slate-600 mt-2">Stay updated with the latest classes, notes, and announcements.</p>
            <div class="mt-6 space-y-3">
                <a href="https://t.me/studysmarterhub" target="_blank" class="inline-flex justify-center w-full rounded-lg shadow-md px-4 py-3 bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 transition duration-150">Join Telegram Now</a>
                <button type="button" id="close-popup-btn" class="inline-flex justify-center w-full rounded-lg border border-slate-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 transition duration-150">Maybe Later</button>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const tabs = document.querySelectorAll('.tab-btn');
            const contentPanels = document.querySelectorAll('.content-panel');
            const batchFilter = document.getElementById('batch-filter');
            const emptyState = document.getElementById('empty-state');
            let activeTab = 'live';

            // --- FILTERING LOGIC ---
            function filterContent() {
                const selectedBatch = batchFilter.value;
                const activePanel = document.getElementById(activeTab + '-content');
                const cards = activePanel.querySelectorAll('a, div.block');
                let visibleCount = 0;
                
                cards.forEach(cardWrapper => {
                    const cardElement = cardWrapper.querySelector('.lecture-card');
                    if (!cardElement) return;

                    const matchesBatch = selectedBatch === 'all' || cardElement.dataset.batch === selectedBatch;
                    
                    if (matchesBatch) {
                        cardWrapper.style.display = 'block';
                        visibleCount++;
                    } else {
                        cardWrapper.style.display = 'none';
                    }
                });
                
                activePanel.style.display = visibleCount > 0 ? 'grid' : 'none';
                emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
            }

            // --- TAB SWITCHING LOGIC ---
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    activeTab = tab.dataset.tab;
                    
                    tabs.forEach(t => {
                        const isActive = t.dataset.tab === activeTab;
                        t.classList.toggle('tab-active', isActive);
                        t.classList.toggle('text-slate-500', !isActive);
                        t.classList.toggle('hover:text-indigo-600', !isActive);
                        t.classList.toggle('hover:border-indigo-300', !isActive);
                        t.classList.toggle('border-transparent', !isActive);
                    });

                    contentPanels.forEach(panel => {
                        panel.id === activeTab + '-content' ? panel.classList.remove('hidden') : panel.classList.add('hidden');
                    });
                    
                    filterContent();
                });
            });

            // Initial setup
            document.querySelector('[data-tab="live"]').click(); 
            batchFilter.addEventListener('change', filterContent);
            
            // --- NOTIFICATION PANEL LOGIC ---
            const notificationBtn = document.getElementById('notification-btn');
            const closeNotificationBtn = document.getElementById('close-notification-btn');
            const notificationPanel = document.getElementById('notification-panel');
            const notificationOverlay = document.getElementById('notification-overlay');
            
            const toggleNotificationPanel = (open) => {
                if (open) {
                    notificationPanel.classList.remove('translate-x-full');
                    notificationOverlay.classList.remove('hidden');
                } else {
                    notificationPanel.classList.add('translate-x-full');
                    notificationOverlay.classList.add('hidden');
                }
            };

            notificationBtn.addEventListener('click', () => toggleNotificationPanel(true));
            closeNotificationBtn.addEventListener('click', () => toggleNotificationPanel(false));
            notificationOverlay.addEventListener('click', () => toggleNotificationPanel(false));

            // --- TELEGRAM POPUP LOGIC ---
            const popup = document.getElementById('telegram-popup');
            const popupContent = document.getElementById('popup-content');
            const hasSeenPopup = localStorage.getItem('studysmarterz_popup_seen');

            if (!hasSeenPopup) {
                setTimeout(() => {
                    popup.classList.remove('hidden');
                    setTimeout(() => {
                        popupContent.classList.remove('scale-95', 'opacity-0');
                        popupContent.classList.add('scale-100', 'opacity-100');
                    }, 10);
                }, 500);

                document.getElementById('close-popup-btn').addEventListener('click', () => {
                    popup.style.display = 'none';
                    localStorage.setItem('studysmarterz_popup_seen', 'true');
                });
            } else {
                popup.style.display = 'none';
            }

            // --- AUTO-REFRESH (Keep for live data) ---
            setTimeout(() => { window.location.reload(); }, 60000);
        });
    </script>
</body>
</html>`;
};

// --- 5. CACHE MANAGEMENT ---

/**
 * Updates the global cached HTML string.
 */
const updateCache = async () => {
    console.log('--- Updating cache...');
    try {
        const { live, up, completed, notifications } = await fetchAllData();
        
        // Only update the cache if we have a significant amount of data
        const totalItems = live.length + up.length + completed.length;
        if (totalItems > 0 || notifications.length > 0) {
            cachedHtml = buildFullHtmlPage(live, up, completed, notifications);
            console.log(`Cache updated successfully. Total items: ${totalItems}`);
        } else {
            console.log('Cache update skipped: Fetched data was empty. Using previous version.');
        }
    } catch (error) {
        console.error('Failed to update cache:', error);
    }
};

/**
 * Initializes the cache and sets the refresh interval.
 */
const startCacheJob = () => {
    updateCache(); 
    setInterval(updateCache, CACHE_INTERVAL_MS);
    console.log(`Cache job started. Refresh interval: ${CACHE_INTERVAL_MS / 1000} seconds.`);
};

// --- 6. SERVER SETUP ---
const app = express();

// Security Middleware (Helmet)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://www.googletagmanager.com", "'unsafe-eval'"], // 'unsafe-eval' is needed for default tailwind config
            connectSrc: ["'self'", "https://www.google-analytics.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "*.cloudfront.net"],
            mediaSrc: ["'self'", "*.cloudfront.net"],
        },
    },
    frameguard: { action: 'DENY' }
}));
app.disable('x-powered-by');

// Main Route
app.get('/', (req, res) => {
    // Set caching headers for client/proxy caching
    res.set('Cache-Control', `public, max-age=${(CACHE_INTERVAL_MS / 1000) - 1}, must-revalidate`);
    res.send(cachedHtml);
});

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Server Start
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    startCacheJob();
});
