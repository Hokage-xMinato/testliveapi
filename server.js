const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

// Pre-generated loading spinner html (modern gradient spinner)
let cachedHtml = `<!DOCTYPE html><html><head><title>Study Smarterz</title><style>
  body{display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#fff;}
  .spinner {width: 64px;height: 64px;border-radius: 50%;position: relative;background: conic-gradient(from 0deg, transparent, #fff);animation: spin 1s linear infinite;}
  .spinner::before {content: "";position: absolute;top: 8px;left: 8px;right: 8px;bottom: 8px;border-radius: 50%;background: transparent;border: 3px solid rgba(255,255,255,0.3);}
  @keyframes spin {to {transform: rotate(360deg);}}
  </style></head><body><div class="spinner"></div><p style="margin-left: 24px; font-size: 1.25rem; font-weight: 500;">Loading live classes, please wait...</p></body></html>`;

/**
 * Utility Functions
 */
const textReplacer = (text) => {
  if (typeof text !== 'string') return text;
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
 * HTML Rendering Functions
 */
const lectureColors = [
  'bg-gradient-to-r from-pink-400 to-yellow-400 text-yellow-900',
  'bg-gradient-to-r from-green-400 to-blue-500 text-white',
  'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white',
  'bg-gradient-to-r from-indigo-400 to-blue-400 text-white',
  'bg-gradient-to-r from-teal-400 to-cyan-400 text-cyan-900',
  'bg-gradient-to-r from-yellow-300 to-red-400 text-red-900',
];
const iconMap = {
  live: '🔥',
  up: '⏰',
  completed: '📚'
};

const getRandomColorClass = (index) => lectureColors[index % lectureColors.length];

const renderLectureCards = (data, type) => {
  if (!data || data.length === 0) return '';

  return data.map((item, idx) => {
    const title = textReplacer(item.title);
    const batch = textReplacer(item.batch);
    const colorClass = getRandomColorClass(idx);

    let imageHtml = '';
    let isImageValid = false;
    if (item.image) {
      try {
        const imageUrl = new URL(item.image);
        if (imageUrl.hostname.endsWith('cloudfront.net')) {
          isImageValid = true;
          imageHtml = `
          <img src="${item.image}" alt="${title}" class="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-110 animate-float" loading="lazy"
            onerror="this.onerror=null; this.parentElement.innerHTML = '<div class=\\'h-48 w-full flex items-center justify-center p-4 text-center font-bold ${colorClass} rounded-2xl shadow-lg animate-pulse\\'>${title}</div>';">`;
        }
      } catch {}
    }
    if(!isImageValid) {
      imageHtml = `<div class="h-48 w-full flex items-center justify-center p-4 text-center font-bold ${colorClass} rounded-2xl shadow-lg animate-pulse">${title}</div>`;
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
      } catch {}
    }

    const cardContent = `
      <div class="lecture-card flex flex-col h-full rounded-3xl overflow-hidden shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl group ${colorClass} relative animate-glow cursor-pointer">
        <span class="absolute top-4 right-4 text-2xl">${iconMap[type] || '🎓'}</span>
        <div class="overflow-hidden rounded-t-3xl">${imageHtml}</div>
        <div class="p-6 flex flex-col flex-grow space-y-4">
          <h3 class="text-xl font-extrabold drop-shadow-lg">${title}</h3>
          <div class="font-semibold tracking-wide">${batch}</div>
          <div class="mt-auto opacity-80 italic">Tap to ${finalLink ? 'watch' : 'view'}</div>
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
    return `
      <div class="flex flex-col items-center justify-center p-10 text-center text-gray-500 dark:text-gray-400 space-y-3 animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p class="text-xl font-semibold">No New Notifications</p>
        <p class="text-sm italic">You're all caught up!</p>
      </div>`;
  }
  return notifications.map(notif => {
    const title = textReplacer(notif.title);
    const message = textReplacer(notif.message);
    return `
      <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        <p class="font-bold text-gray-900 dark:text-gray-100">${title}</p>
        <p class="mt-1 text-gray-700 dark:text-gray-300">${message}</p>
      </div>
    `;
  }).join('');
};

const renderBatchOptions = (live, up, completed) => {
  const allData = [...live, ...up, ...completed];
  const batches = ['all', ...new Set(allData.map(item => item.batch))];
  return batches.map(batch =>
    `<option value="${batch}" class="capitalize">${batch === 'all' ? 'All Batches' : textReplacer(batch)}</option>`
  ).join('');
};


/**
 * MAIN PAGE TEMPLATE
 */
const buildFullHtmlPage = (live, up, completed, notifications) => {
  const liveCards = renderLectureCards(live, 'live');
  const upCards = renderLectureCards(up, 'up');
  const completedCards = renderLectureCards(completed, 'completed');
  const notificationItems = renderNotifications(notifications);
  const batchOptions = renderBatchOptions(live, up, completed);

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth" >
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Study Smarterz - Live Classes</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>  
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Poppins:wght@400;600;800&display=swap" rel="stylesheet" />
  <style>
    /* Global resets and fonts */
    body {
      font-family: 'Inter', 'Poppins', sans-serif;
      margin: 0; padding: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      color: #1a202c;
      transition: background 0.6s ease, color 0.6s ease;
    }
    /* Dark mode support */
    html.dark body {
      background: linear-gradient(135deg, #1f2937 0%, #4b5563 50%, #374151 100%);
      color: #e4e7eb;
    }
    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #7c3aed;
      border-radius: 20px;
      transition: background-color 0.3s ease;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #9d4edd;
    }

    /* Tab Buttons */
    .tab-btn {
      padding: 0.75rem 2rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #7c3aed;
      background: #f3e8ff;
      border: none;
      user-select: none;
      box-shadow: 0 4px 6px rgb(124 58 237 / 0.4);
    }
    .tab-btn:hover:not(.active) {
      background-color: #ede9fe;
    }
    .tab-btn.active {
      background: linear-gradient(135deg, #7928ca 0%, #ff0080 100%);
      color: white;
      box-shadow: 0 8px 15px rgb(255 0 128 / 0.6);
      transform: translateY(-3px);
    }
    html.dark .tab-btn {
      background: #374151;
      color: #c4b5fd;
      box-shadow: 0 4px 6px rgba(148, 163, 184, 0.3);
    }
    html.dark .tab-btn.active {
      color: white;
      background: linear-gradient(135deg, #e879f9 0%, #d946ef 100%);
      box-shadow: 0 8px 15px rgb(232 121 249 / 0.8);
    }
    html.dark .tab-btn:hover:not(.active) {
      background: #4b5563;
    }

    /* Cards */
    .lecture-card {
      will-change: transform, box-shadow;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .lecture-card:hover {
      transform: translateY(-8px) scale(1.05);
      box-shadow: 0 20px 40px rgb(156 39 176 / 0.5);
      z-index: 15;
    }

    .animate-float{
      animation: float 4s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100%{transform: translateY(0);}
      50% {transform: translateY(-10px);}
    }

    /* Glow Animation */
    .animate-glow {
      animation: glowPulse 2.6s ease-in-out infinite alternate;
    }
    @keyframes glowPulse {
      0% {
        filter: drop-shadow(0 0 10px rgb(156 39 176 / 0.7));
      }
      100% {
        filter: drop-shadow(0 0 20px rgb(255 64 64 / 0.9));
      }
    }

    /* Dropdown styling */
    select#batch-filter {
      padding: 0.7rem 1rem;
      font-size: 1rem;
      border-radius: 12px;
      border: 2px solid #9f7aea;
      background: #faf5ff;
      outline-offset: 4px;
      box-shadow: 0 4px 10px rgb(159 122 234 / 0.3);
      transition: border-color 0.3s, box-shadow 0.3s;
      cursor: pointer;
      font-weight: 600;
      color: #6b46c1;
      width: 250px;
    }
    select#batch-filter:focus {
      border-color: #d946ef;
      box-shadow: 0 0 10px #d946ef;
      background: #f5d0fe;
    }
    html.dark select#batch-filter {
      background: #4b5563;
      color: #ddd6fe;
      border-color: #7c3aed;
      box-shadow: 0 4px 10px rgba(124, 58, 237, 0.5);
    }
    html.dark select#batch-filter:focus {
      background: #7c3aed;
      color: white;
      border-color: #d946ef;
      box-shadow: 0 0 15px #d946ef;
    }

    /* Empty states for no lectures */
    #empty-state {
      opacity: 0.8;
      user-select: none;
    }
    #empty-state h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #a78bfa;
      margin-bottom: 0.5rem;
    }
    #empty-state p {
      font-size: 1.1rem;
      font-style: italic;
      color: #c4b5fd;
    }
    html.dark #empty-state h3 {
      color: #d8b4fe;
    }
    html.dark #empty-state p {
      color: #e9d5ff;
    }

    /* Notification Panel */
    #notification-panel {
      background: rgba(255 255 255 / 0.95);
      backdrop-filter: blur(20px);
      box-shadow: 0 0 40px rgba(124, 58, 237, 0.3);
      border-radius: 16px 0 0 16px;
    }
    html.dark #notification-panel {
      background: rgba(45 45 55 / 0.75);
      box-shadow: 0 0 40px rgba(232 121 249 / 0.5);
    }

    /* Popup dark/light backgrounds */
    #telegram-popup {
      backdrop-filter: blur(20px);
      background: rgba(0, 0, 0, 0.6);
      z-index: 1050;
    }
    #popup-content {
      background: linear-gradient(135deg, #7928ca 0%, #ff0080 100%);
      color: #fff;
      max-width: 400px;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 0 40px rgba(255 0 128 / 0.7);
      font-weight: 600;
    }
    #popup-content a,
    #popup-content button {
      border-radius: 12px;
      padding: 0.75rem 1.5rem;
      font-weight: 700;
      cursor: pointer;
      transition: background-color 0.3s ease;
      text-align: center;
      user-select: none;
      display: block;
    }
    #popup-content a {
      background: white;
      color: #7928ca;
      margin-bottom: 1rem;
    }
    #popup-content a:hover {
      background: #f3e8ff;
    }
    #popup-content button {
      background: transparent;
      border: 2px solid white;
      color: white;
    }
    #popup-content button:hover {
      background: white;
      color: #7928ca;
    }

    /* Utility animations */
    @keyframes fadeIn {
      from {opacity: 0;}
      to {opacity: 1;}
    }
    .animate-fade-in {
      animation: fadeIn 1s ease forwards;
    }
  </style>
</head>
<body class="transition-colors duration-500">
<!-- Frame Buster -->
<script>
  if (window.top !== window.self) {
    try {window.top.location = window.self.location;} catch(e){console.error("Frame bust failed:", e);}
  }
</script>

<div id="app-container" class="min-h-screen px-4 py-8 max-w-7xl mx-auto relative">

  <!-- Header -->
  <header class="flex justify-between items-center mb-12">
    <h1 id="logo" class="font-extrabold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 cursor-pointer select-none">
      Study Smarterz
    </h1>
    <button id="toggle-theme" aria-label="Toggle Dark/Light Mode" title="Toggle Dark/Light Mode" class="px-4 py-2 text-purple-700 dark:text-pink-400 border-2 border-purple-700 dark:border-pink-400 rounded-lg font-semibold hover:bg-purple-100 dark:hover:bg-pink-600 transition">
      <i class="fas fa-moon"></i>
    </button>
  </header>

  <!-- Tabs -->
  <nav class="flex space-x-6 mb-6" aria-label="Tabs" role="tablist">
    <button role="tab" aria-selected="true" aria-controls="live-content" id="tab-live" class="tab-btn active">Live</button>
    <button role="tab" aria-selected="false" aria-controls="up-content" id="tab-up" class="tab-btn">Upcoming</button>
    <button role="tab" aria-selected="false" aria-controls="completed-content" id="tab-completed" class="tab-btn">Recorded</button>
  </nav>

  <!-- Batch Filter -->
  <div class="mb-8">
    <label for="batch-filter" class="block font-semibold mb-2 text-purple-700 dark:text-pink-400">Filter by Batch</label>
    <select id="batch-filter" aria-label="Batch filter">${batchOptions}</select>
  </div>

  <!-- Content Panels -->
  <section id="content-area" aria-live="polite">
    <div id="live-content" role="tabpanel" aria-labelledby="tab-live" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      ${liveCards}
    </div>
    <div id="up-content" role="tabpanel" aria-labelledby="tab-up" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      ${upCards}
    </div>
    <div id="completed-content" role="tabpanel" aria-labelledby="tab-completed" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      ${completedCards}
    </div>
  </section>

  <!-- Empty State Feedback -->
  <div id="empty-state" class="text-center mt-20 hidden" role="alert" aria-live="assertive">
    <h3>No matching lectures found</h3>
    <p>Please adjust filters or check back later.</p>
  </div>

  <!-- Notification Panel -->
  <aside id="notification-panel" class="fixed top-0 right-0 h-full max-w-sm w-full transform translate-x-full shadow-lg p-6 overflow-y-auto z-50 transition-transform duration-300" aria-label="Notifications">
    <header class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Notifications</h2>
      <button id="close-notification-btn" aria-label="Close notifications" class="text-pink-600 hover:text-pink-800 text-xl">
        <i class="fas fa-times"></i>
      </button>
    </header>
    <div id="notifications-list" class="space-y-4">${notificationItems}</div>
  </aside>
  <div id="notification-overlay" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 hidden" tabindex="-1" aria-hidden="true"></div>

  <!-- Footer -->
  <footer class="mt-16 text-center text-purple-600 dark:text-pink-400 select-none">
    <p>&copy; ${new Date().getFullYear()} Study Smarterz. All rights reserved.</p>
    <a href="https://t.me/studysmarterhub" target="_blank" rel="noopener noreferrer" class="inline-flex items-center mt-2 font-semibold hover:underline">
      <i class="fab fa-telegram-plane mr-2"></i> Join Telegram Community
    </a>
  </footer>
</div>

<!-- Telegram Join Popup -->
<div id="telegram-popup" class="fixed inset-0 hidden items-center justify-center bg-black/70 backdrop-blur-sm z-50" role="dialog" aria-modal="true" aria-labelledby="popup-title" aria-describedby="popup-desc">
  <div id="popup-content" class="p-8 max-w-md rounded-xl shadow-lg text-center space-y-6 relative">
    <h3 id="popup-title" class="text-3xl font-extrabold text-white">Join Our Community!</h3>
    <p id="popup-desc" class="text-white/80">
      Stay updated with the latest classes, notes, and announcements in our vibrant learning group.
    </p>
    <div class="flex flex-col gap-4">
      <a href="https://t.me/studysmarterhub" target="_blank" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform flex justify-center items-center gap-3" id="join-tg-button">
        <i class="fab fa-telegram-plane text-xl"></i> Join Telegram
      </a>
      <button id="close-popup-btn" class="border-2 border-white text-white rounded-xl px-6 py-3 font-semibold hover:bg-white/20 transition">Maybe Later</button>
    </div>
  </div>
</div>

<script>
  (() => {
    const tabs = document.querySelectorAll('button[role="tab"]');
    const panels = document.querySelectorAll('section#content-area > div[role="tabpanel"]');
    const batchFilter = document.getElementById('batch-filter');
    const emptyState = document.getElementById('empty-state');
    const notificationBtn = document.getElementById('notification-btn');
    const notificationPanel = document.getElementById('notification-panel');
    const notificationOverlay = document.getElementById('notification-overlay');
    const closeNotificationBtn = document.getElementById('close-notification-btn');
    const telegramPopup = document.getElementById('telegram-popup');
    const joinTgBtn = document.getElementById('join-tg-button');
    const closePopupBtn = document.getElementById('close-popup-btn');
    const toggleThemeBtn = document.getElementById('toggle-theme');
    const htmlEl = document.documentElement;

    let activeTab = 'live';

    // Filter cards by batch and active tab
    function filterCards() {
      const selectedBatch = batchFilter.value;
      const activePanel = document.getElementById(activeTab + '-content');
      const cards = activePanel.querySelectorAll('a, div.lecture-card');
      let shownCount = 0;

      cards.forEach(card => {
        // lecture-card class always on a div inside a or div
        const cardElem = card.classList.contains('lecture-card') ? card : card.querySelector('.lecture-card');
        if (!cardElem) return;

        if(selectedBatch === 'all' || cardElem.textContent.toLowerCase().includes(selectedBatch.toLowerCase()) || cardElem.dataset.batch === selectedBatch){
          card.style.display = 'block';
          shownCount++;
          // Animate appearance
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 100);
        } else {
          card.style.display = 'none';
        }
      });

      // Show no results if nothing is visible
      emptyState.style.display = shownCount === 0 ? 'block' : 'none';

      // Change empty state messages based on active tab
      if(emptyState.style.display === 'block') {
        let message = '';
        switch(activeTab) {
          case 'live': message = '<h3>No Live Lectures Now</h3><p>Please check back soon or try another batch.</p>'; break;
          case 'up': message = '<h3>No Upcoming Lectures Scheduled</h3><p>Stay tuned for future batches!</p>'; break;
          case 'completed': message = '<h3>No Recorded Lectures Found</h3><p>Keep learning, new content may arrive soon.</p>'; break;
          default: message = '<h3>No Lectures Found</h3><p>Try adjusting filters or check back later.</p>';
        }
        emptyState.innerHTML = message;
      }
    }

    // Tabs click handler
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.id.replace('tab-', '');

        tabs.forEach(t => {
          const isActive = t === tab;
          t.classList.toggle('active', isActive);
          t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        panels.forEach(panel => {
          panel.classList.toggle('hidden', panel.id !== activeTab + '-content');
          panel.setAttribute('aria-hidden', panel.id !== activeTab + '-content');
        });

        filterCards();
      });
    });

    batchFilter.addEventListener('change', filterCards);

    // Initial filter and visibility setup
    filterCards();

    // Notification Panel Toggles (support disabled since no visible button, kept for extensibility)
    if(notificationBtn){
      notificationBtn.addEventListener('click', () => {
        notificationPanel.classList.remove('translate-x-full');
        notificationOverlay.classList.remove('hidden');
      });
    }
    closeNotificationBtn.addEventListener('click', () => {
      notificationPanel.classList.add('translate-x-full');
      notificationOverlay.classList.add('hidden');
    });
    notificationOverlay.addEventListener('click', () => {
      notificationPanel.classList.add('translate-x-full');
      notificationOverlay.classList.add('hidden');
    });

    // Popup Session Storage Logic
    function popupShouldShow() {
      return sessionStorage.getItem('popupDismissed') === null;
    }
    function closePopup(storeDismiss=true) {
      telegramPopup.style.display = 'none';
      if(storeDismiss) sessionStorage.setItem('popupDismissed', '1');
    }

    if(popupShouldShow()) {
      setTimeout(() => {
        telegramPopup.style.display = 'flex';
      }, 1800);
    }

    closePopupBtn.addEventListener('click', () => {
      closePopup(true);
    });
    joinTgBtn.addEventListener('click', () => {
      closePopup(true);
    });

    // Theme toggle (dark/light mode)
    toggleThemeBtn.addEventListener('click', () => {
      const isDark = htmlEl.classList.toggle('dark');
      toggleThemeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      // Optionally persist preference: localStorage.setItem('dark_mode', isDark);
    });

    // Auto-refresh after 60 seconds for live content refresh
    setTimeout(() => {
      window.location.reload();
    }, 60000);

  })();
</script>
</body>
</html>`;
};

/**
 * Cache Update Logic
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

/**
 * Server Setup
 */
app.get('/', (req, res) => {
  res.send(cachedHtml);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  updateCache();
  setInterval(updateCache, 60000); // 60 seconds
});
