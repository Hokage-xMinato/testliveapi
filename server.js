const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

// The full updated HTML template with placeholders for dynamic content
let cachedHtml = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Study Smarterz - Live Classes</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Poppins:wght@400;600;800&display=swap" rel="stylesheet" />
<style>
  body {
    font-family: 'Inter', 'Poppins', sans-serif;
    margin: 0; padding: 0;
    background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%);
    color: #e4e7eb;
    transition: background 1.5s ease, color 1.2s ease;
    position: relative;
    min-height: 100vh;
    overflow-x: hidden;
  }
  /* Light mode styles */
  html.light body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    color: #1a202c;
  }
  /* Smooth header color transition */
  header {
    transition: background-color 1.2s ease, color 1.2s ease;
  }
  html.light header {
    background-color: rgba(255 255 255 / 0.85);
    color: #5b21b6;
  }
  html:not(.light) header {
    background-color: rgba(31 41 55 / 0.85);
    color: #e0d7f6;
  }

  /* Background shining animation */
  @keyframes bgShine {
    0%, 100% {background-position: 0% 50%;}
    50% {background-position: 100% 50%;}
  }
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    background: linear-gradient(270deg, #9d7ace, #ff61a6, #5ac8fa, #9d7ace);
    background-size: 600% 600%;
    animation: bgShine 20s ease infinite;
    opacity: 0.15;
    pointer-events: none;
    z-index: -1;
    border-radius: 0;
    filter: blur(70px);
    transition: opacity 1.5s ease;
  }
  html.light body::before {
    opacity: 0.25;
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 10px; height: 10px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #8b5cf6;
    border-radius: 20px;
    transition: background-color 0.3s ease;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #c084fc;
  }

  /* Tabs */
  .tab-btn {
    padding: 0.75rem 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    user-select: none;
    box-shadow: 0 4px 6px rgb(139 92 246 / 0.6);
  }
  .tab-btn.active {
    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
    color: white !important;
    box-shadow: 0 8px 15px rgb(236 72 153 / 0.85);
    transform: translateY(-3px);
  }
  .tab-btn:not(.active) {
    color: #c4b5fd;
    background: transparent;
  }
  .tab-btn:not(.active):hover {
    color: white;
  }
  html.light .tab-btn.active {
    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    color: white !important;
    box-shadow: 0 8px 15px rgb(236 72 153 / 0.85);
  }
  html.light .tab-btn:not(.active) {
    color: #7c3aed;
  }
  html.light .tab-btn:not(.active):hover {
    background: rgba(124, 58, 237, 0.3);
    color: white;
  }

  /* Cards */
  .lecture-card {
    cursor: pointer;
    border-radius: 1.5rem;
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
    box-shadow: 0 4px 12px rgb(124 58 237 / 0.3);
    overflow: hidden;
    position: relative;
    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    color: white;
  }
  .lecture-card:hover {
    transform: translateY(-12px) scale(1.05);
    box-shadow: 0 20px 40px rgb(236 72 153 / 0.8);
    z-index: 20;
  }
  html.light .lecture-card {
    box-shadow: 0 4px 15px rgb(165 180 252 / 0.4);
    background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
    color: #2c2c2c;
  }
  html.light .lecture-card:hover {
    box-shadow: 0 20px 40px rgb(244 114 182 / 0.8);
  }

  /* Box around images */
  .image-wrapper {
    border-radius: 1.5rem 1.5rem 0 0;
    padding: 6px;
    background: linear-gradient(45deg, #7c3aed, #ec4899);
  }
  html.light .image-wrapper {
    background: linear-gradient(45deg, #a78bfa, #f472b6);
  }
  .image-wrapper img {
    border-radius: 1.25rem;
    width: 100%;
    height: 192px;
    object-fit: cover;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
    transition: transform 0.7s ease;
  }
  .lecture-card:hover img {
    transform: scale(1.1);
  }

  /* Tap to watch - visible only on hover */
  .tap-to-watch {
    color: rgba(255,255,255,0.85);
    font-weight: 600;
    position: absolute;
    bottom: 1.25rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(124, 58, 237, 0.85);
    padding: 0.4rem 1rem;
    border-radius: 1.5rem;
    font-size: 1rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
    user-select: none;
    box-shadow: 0 0 15px rgba(236, 72, 153, 0.7);
  }
  html.light .tap-to-watch {
    background: rgba(167, 139, 250, 0.85);
    color: #2c2c2c;
    box-shadow: 0 0 15px rgba(244, 114, 182, 0.7);
  }
  .lecture-card:hover .tap-to-watch {
    opacity: 1;
    pointer-events: auto;
  }

  /* Footer improvements */
  footer {
    margin-top: 5rem;
    text-align: center;
    font-weight: 600;
    color: rgba(255 255 255 / 0.6);
    user-select: none;
    transition: color 1.3s ease;
  }
  html.light footer {
    color: #6b21a8;
  }
  footer a {
    color: #a78bfa;
    font-weight: 700;
    transition: color 0.3s ease;
  }
  footer a:hover {
    color: #ec4899;
  }

  /* Notification Panel */
  #notification-panel {
    background: rgba(30 30 39 / 0.95);
    backdrop-filter: blur(18px);
    border-radius: 1.5rem 0 0 1.5rem;
    box-shadow: 0 0 30px rgba(236 72 153 / 0.5);
    transition: transform 0.3s ease;
    z-index: 100;
  }
  html.light #notification-panel {
    background: rgba(255 255 255 / 0.95);
    box-shadow: 0 0 30px rgba(124 58 237 / 0.4);
  }

  /* Popup style */
  #telegram-popup {
    backdrop-filter: blur(16px);
    background: rgba(0 0 0 / 0.75);
    z-index: 1050;
    display: none;
  }
  #popup-content {
    background: linear-gradient(135deg, #7c3aed, #ec4899);
    border-radius: 1.5rem;
    padding: 2rem;
    box-shadow: 0 12px 50px rgba(236 72 153 / 0.9);
    color: white;
    user-select: none;
    font-weight: 700;
    max-width: 400px;
    text-align: center;
  }
  #popup-content a {
    background: white;
    color: #7c3aed;
    border-radius: 1.5rem;
    padding: 0.9rem 2rem;
    font-weight: 800;
    text-decoration: none;
    display: inline-flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    transition: background-color 0.3s, color 0.3s;
  }
  #popup-content a:hover {
    background-color: #ede9fe;
  }
  #popup-content button {
    border: 3px solid white;
    background: transparent;
    border-radius: 1.5rem;
    color: white;
    font-weight: 700;
    padding: 0.9rem 2rem;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
  }
  #popup-content button:hover {
    background: white;
    color: #7c3aed;
  }

  /* Quotes on page */
  .quote {
    position: fixed;
    user-select: none;
    font-style: italic;
    font-weight: 600;
    color: rgba(255 255 255 / 0.15);
    font-size: 2.8rem;
    pointer-events: none;
    white-space: nowrap;
    animation: floatUpDown 8s ease-in-out infinite;
    mix-blend-mode: screen;
  }
  html.light .quote {
    color: rgba(124 58 237 / 0.1);
    mix-blend-mode: normal;
  }
  @keyframes floatUpDown {
    0%, 100% {transform: translateY(0);}
    50% {transform: translateY(-15px);}
  }

  /* Utility fadeIn animation */
  @keyframes fadeIn {
    from {opacity: 0;}
    to {opacity: 1;}
  }
  .animate-fadein {
    animation: fadeIn 1.5s ease forwards;
  }
</style>
</head>
<body>
<script>
  if (window.top !== window.self) {
    try {window.top.location = window.self.location;} catch(e) {console.error('Frame bust failed:', e);}
  }
</script>

<div id="app-container" class="min-h-screen px-6 py-8 max-w-7xl mx-auto relative">

  <!-- Quotes -->
  <div class="quote" style="top:10%; left: 10%; animation-delay: 0s;">🌟 "Learning is a treasure that will follow its owner everywhere." 🌟</div>
  <div class="quote" style="top:25%; right: 12%; animation-delay: 3s;">💡 "Knowledge is power, and smart work is the key." 💡</div>
  <div class="quote" style="bottom:15%; left: 8%; animation-delay: 6s;">📚 "Unlock your potential with every lecture." 📚</div>
  <div class="quote" style="bottom:10%; right: 10%; animation-delay: 9s;">🚀 "Success is the sum of small efforts, repeated daily." 🚀</div>
  <div class="quote" style="top:60%; left: 50%; transform: translateX(-50%);" >✨ "Stay motivated, study smarter!" ✨</div>

  <!-- Header -->
  <header class="flex justify-between items-center mb-12 select-none">
    <h1 id="logo" class="font-extrabold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 cursor-default">
      Study Smarterz
    </h1>
    <button id="toggle-theme" aria-label="Toggle Dark/Light Mode" title="Toggle Dark/Light Mode" class="px-5 py-2 text-xl rounded-lg font-semibold border-2 border-purple-400 text-purple-400 hover:bg-purple-300 transition flex items-center gap-3 dark:text-pink-400 dark:border-pink-400 dark:hover:bg-pink-600">
      <i id="theme-icon" class="fas fa-moon"></i> <span id="theme-text">Dark Mode</span>
    </button>
  </header>

  <!-- Tabs -->
  <nav class="flex space-x-6 mb-6" aria-label="Tabs" role="tablist">
    <button role="tab" aria-selected="true" aria-controls="live-content" id="tab-live" class="tab-btn active">🔥 Live</button>
    <button role="tab" aria-selected="false" aria-controls="up-content" id="tab-up" class="tab-btn">⏰ Upcoming</button>
    <button role="tab" aria-selected="false" aria-controls="completed-content" id="tab-completed" class="tab-btn">📚 Recorded</button>
  </nav>

  <!-- Batch Filter -->
  <div class="mb-8">
    <label for="batch-filter" class="block font-semibold mb-2 text-purple-400 dark:text-pink-400">Filter by Batch</label>
    <select id="batch-filter" aria-label="Batch filter">${'${batchOptions}'}</select>
  </div>

  <!-- Content Panels -->
  <section id="content-area" aria-live="polite">
    <div id="live-content" role="tabpanel" aria-labelledby="tab-live" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      ${'${liveCards}'}
    </div>
    <div id="up-content" role="tabpanel" aria-labelledby="tab-up" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      ${'${upCards}'}
    </div>
    <div id="completed-content" role="tabpanel" aria-labelledby="tab-completed" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      ${'${completedCards}'}
    </div>
  </section>

  <!-- No content / empty states -->
  <div id="empty-state" class="text-center mt-20 hidden" role="alert" aria-live="assertive">
    <h3>No matching lectures found</h3>
    <p>Please adjust your filters or check again later.</p>
  </div>

  <!-- Footer -->
  <footer>
    <p>© ${new Date().getFullYear()} Study Smarterz. All rights reserved.</p>
    <a href="https://t.me/studysmarterhub" target="_blank" rel="noopener noreferrer" class="inline-flex items-center mt-2 font-bold hover:underline text-purple-400 dark:text-pink-400">
      <i class="fab fa-telegram-plane mr-2"></i> Join Telegram Community
    </a>
  </footer>

</div>

<!-- Telegram Join Popup -->
<div id="telegram-popup" class="fixed inset-0 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="popup-title" aria-describedby="popup-desc" style="display:none;">
  <div id="popup-content" class="text-center">
    <h3 id="popup-title" class="text-3xl font-extrabold text-white mb-4">Join Our Community! 🎉</h3>
    <p id="popup-desc" class="text-white/80 mb-8 px-6">Stay updated with the latest classes, notes, and announcements in our vibrant learning group.</p>
    <div class="flex flex-col gap-4 px-8">
      <a href="https://t.me/studysmarterhub" target="_blank" class="bg-white text-purple-600 rounded-xl px-6 py-3 font-bold hover:bg-purple-100 transition flex items-center gap-2 justify-center" id="join-tg-button">
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
  const telegramPopup = document.getElementById('telegram-popup');
  const joinTgBtn = document.getElementById('join-tg-button');
  const closePopupBtn = document.getElementById('close-popup-btn');
  const toggleThemeBtn = document.getElementById('toggle-theme');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  const htmlEl = document.documentElement;

  // Initialization: active tab from sessionStorage or default 'live'
  let activeTab = sessionStorage.getItem('activeTab') || 'live';

  // Initialization: theme preference from localStorage or default dark
  let themePref = localStorage.getItem('theme');
  if (!themePref) { // default dark mode
    htmlEl.classList.remove('light');
    htmlEl.classList.add('dark');
    themePref = 'dark';
  } else if (themePref === 'light') {
    htmlEl.classList.add('light');
    htmlEl.classList.remove('dark');
  } else {
    htmlEl.classList.add('dark');
    htmlEl.classList.remove('light');
  }
  // Update toggle button icon/text
  function updateThemeButton() {
    if (htmlEl.classList.contains('light')) {
      themeIcon.className = 'fas fa-sun';
      themeText.textContent = 'Light Mode';
    } else {
      themeIcon.className = 'fas fa-moon';
      themeText.textContent = 'Dark Mode';
    }
  }
  updateThemeButton();

  // Filter cards by batch for shown tab
  function filterCards() {
    const selectedBatch = batchFilter.value;
    const activePanel = document.getElementById(activeTab + '-content');
    const cards = activePanel.querySelectorAll('a, div.lecture-card');
    let shownCount = 0;
    cards.forEach(card => {
      const cardElem = card.classList.contains('lecture-card') ? card : card.querySelector('.lecture-card');
      if (!cardElem) return;
      if (selectedBatch === 'all' || cardElem.dataset.batch === selectedBatch) {
        card.style.display = 'block';
        // Animate appearance
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 100);
        shownCount++;
      } else card.style.display = 'none';
    });
    emptyState.style.display = shownCount === 0 ? 'block' : 'none';
    if (emptyState.style.display === 'block') {
      let message = '';
      switch (activeTab) {
        case 'live': message = '<h3>No Live Lectures Now</h3><p>Please check back soon or try another batch.</p>'; break;
        case 'up': message = '<h3>No Upcoming Lectures Scheduled</h3><p>Stay tuned for all new batches!</p>'; break;
        case 'completed': message = '<h3>No Recorded Lectures Found</h3><p>Keep learning, new content is coming soon.</p>'; break;
        default: message = '<h3>No Lectures Found</h3><p>Try adjusting filters or check back later.</p>';
      }
      emptyState.innerHTML = message;
    }
  }

  // Show active tab's panel & mark tab active
  function showTab(tabId) {
    activeTab = tabId;
    sessionStorage.setItem('activeTab', activeTab);
    tabs.forEach(t => {
      const isActive = t.id === 'tab-' + tabId;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    panels.forEach(p => {
      const isVisible = p.id === activeTab + '-content';
      p.classList.toggle('hidden', !isVisible);
      p.setAttribute('aria-hidden', !isVisible);
    });
    filterCards();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (!tab.classList.contains('active')) showTab(tab.id.replace('tab-', ''));
    });
  });

  batchFilter.addEventListener('change', filterCards);

  // Theme toggle with persistence
  toggleThemeBtn.addEventListener('click', () => {
    if (htmlEl.classList.contains('light')) {
      htmlEl.classList.remove('light');
      htmlEl.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlEl.classList.add('light');
      htmlEl.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    updateThemeButton();
  });

  // Popup sessionStorage suppression logic
  function popupShouldShow() {
    return sessionStorage.getItem('popupDismissed') === null;
  }
  function closePopup(storeDismiss = true) {
    telegramPopup.style.display = 'none';
    if (storeDismiss) sessionStorage.setItem('popupDismissed', '1');
  }
  if (popupShouldShow()) {
    setTimeout(() => {
      telegramPopup.style.display = 'flex';
    }, 1500);
  }
  closePopupBtn.addEventListener('click', () => closePopup(true));
  joinTgBtn.addEventListener('click', () => closePopup(true));

  // Initialize UI states
  showTab(activeTab);

  // Auto-refresh every 60 seconds to fetch fresh server data
  setTimeout(() => window.location.reload(), 60000);
})();
</script>
</body>
</html>`;

/**
 * Utility function to replace branded text
 */
const textReplacer = (text) => {
  if (typeof text !== 'string') return text;
  return text.replace(/rolexcoderz/gi, 'studysmarterz')
    .replace(/rolex/gi, 'study')
    .replace(/coderz/gi, 'smarter');
};

/**
 * Utility: fetch and parse API data
 */
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
 * Lecture card colors and icons
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

/**
 * Render lecture cards HTML
 */
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
          <div class="image-wrapper">
            <img src="${item.image}" alt="${title}" loading="lazy"
              onerror="this.onerror=null; this.parentElement.innerHTML = '<div class=\\'p-12 font-bold text-center text-xl rounded-xl bg-gray-200 dark:bg-gray-700\\'>${title}</div>';">
          </div>`;
        }
      } catch {}
    }
    if(!isImageValid) {
      imageHtml = `<div class="image-wrapper p-12 font-bold text-center text-xl rounded-xl bg-gray-200 dark:bg-gray-700">${title}</div>`;
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
    return `
      <a href="${finalLink || '#'}" target="${finalLink ? '_blank' : '_self'}" rel="noopener noreferrer" class="lecture-card relative group ${colorClass}" data-batch="${item.batch}">
        ${imageHtml}
        <div class="p-6">
          <h3 class="font-extrabold text-xl mb-2">${title}</h3>
          <div class="font-semibold mb-4">${batch}</div>
          <div class="tap-to-watch absolute left-1/2 bottom-6 -translate-x-1/2 cursor-pointer transition-opacity duration-300 opacity-0 group-hover:opacity-100">Tap to Watch</div>
          <span class="absolute top-4 right-5 text-3xl select-none">${iconMap[type] || '🎓'}</span>
        </div>
      </a>`;
  }).join('');
};

/**
 * Render notifications
 */
const renderNotifications = (notifications) => {
  if (!notifications || notifications.length === 0) {
    return `
      <div class="flex flex-col items-center justify-center p-10 text-center text-gray-500 dark:text-gray-400 space-y-3 animate-fadein">
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

/**
 * Render batch options for select dropdown
 */
const renderBatchOptions = (live, up, completed) => {
  const allData = [...live, ...up, ...completed];
  const batches = ['all', ...new Set(allData.map(item => item.batch))];
  return batches.map(batch =>
    `<option value="${batch}" class="capitalize">${batch === 'all' ? 'All Batches' : textReplacer(batch)}</option>`
  ).join('');
};

/**
 * Build full updated HTML page
 */
const buildFullHtmlPage = (live, up, completed, notifications) => {
  const liveCards = renderLectureCards(live, 'live');
  const upCards = renderLectureCards(up, 'up');
  const completedCards = renderLectureCards(completed, 'completed');
  const notificationItems = renderNotifications(notifications);
  const batchOptions = renderBatchOptions(live, up, completed);

  return cachedHtml
    .replace('${liveCards}', liveCards)
    .replace('${upCards}', upCards)
    .replace('${completedCards}', completedCards)
    .replace('${notificationItems}', notificationItems)
    .replace('${batchOptions}', batchOptions)
    .replace(/\${new Date\(\)\.getFullYear\(\)}/g, new Date().getFullYear());
};

/**
 * Update cache periodically
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

// Express setup
app.get('/', (req, res) => {
  res.send(cachedHtml);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  updateCache();
  setInterval(updateCache, 60000); // Refresh cache every minute
});
