const express = require('express');
const fetch = require('node-fetch'); // Using v2 for CommonJS compatibility

const app = express();
const PORT = process.env.PORT || 10000;

// --- HTML TEMPLATE ---
// This string holds the entire structure of the webpage.
// Placeholders like '${liveCards}' will be replaced by dynamic data from the backend.
let cachedHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Study Smarterz - Live Classes</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
<style>
  /* Keyframe animations for the background and content loading */
  @keyframes moveGradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes slideUp { 
    from { transform: translateY(20px); opacity: 0; } 
    to { transform: translateY(0); opacity: 1; } 
  }

  /* Base body styling with animated gradient background */
  body {
    font-family: 'Poppins', 'Inter', sans-serif;
    color: #e5e7eb;
    background: linear-gradient(-45deg, #111827, #1f2937, #374151, #4b5563);
    background-size: 400% 400%;
    animation: moveGradient 20s ease infinite;
  }
  html.light body {
    color: #1f2937;
    background: linear-gradient(-45deg, #f5f3ff, #e0e7ff, #c7d2fe, #a5b4fc);
    background-size: 400% 400%;
  }

  /* Class to apply the slide-up animation on page load */
  .animate-load { animation: slideUp 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  
  /* Sticky header with a blurred background effect */
  header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(17, 24, 39, 0.6);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    padding: 1.25rem 1.5rem; margin: 0 -1.5rem;
  }
  html.light header {
    background: rgba(255, 255, 255, 0.6);
    border-bottom: 1px solid rgba(124, 58, 237, 0.15);
  }

  /* Styling for the active tab button */
  .tab-btn.active {
    background: linear-gradient(135deg, #7c3aed, #ec4899); color: #fff !important;
    box-shadow: 0 8px 20px rgb(236 72 153 / 0.4); transform: translateY(-3px);
  }
  
  /* Advanced styling for lecture cards and their hover effects */
  .lecture-card {
    background: #1f2937;
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  html.light .lecture-card { background: #ffffff; box-shadow: 0 10px 25px rgba(165, 180, 252, 0.25); }
  .lecture-card:hover { transform: translateY(-10px) scale(1.03); box-shadow: 0 20px 40px rgba(124, 58, 237, 0.25); }
  
  .image-container::after {
    content: 'Tap to Watch'; font-weight: 700;
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.5); color: white;
    opacity: 0; transition: opacity 0.4s;
  }
  .lecture-card:hover .image-container::after { opacity: 1; }

  /* Slide-in animation for the notifications panel */
  #notifications-panel {
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transform: translateX(100%);
  }
  #notifications-panel.open { transform: translateX(0); }
</style>
</head>
<body class="transition-colors duration-500">
<div id="app-container" class="min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto">
  <header class="mb-12">
    <div class="flex justify-between items-center max-w-7xl mx-auto">
      <h1 class="font-extrabold text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
        Study Smarterz
      </h1>
      <div class="flex items-center gap-3">
        <button id="notification-btn" aria-label="Show notifications" class="relative w-12 h-12 text-xl rounded-full flex items-center justify-center transition-all duration-300 text-purple-300 bg-gray-800/50 hover:bg-purple-500 hover:text-white">
          <i class="fa-solid fa-bell"></i>
          ${'${notificationCountBadge}'}
        </button>
        <button id="toggle-theme" aria-label="Toggle Dark/Light Mode" class="w-12 h-12 text-xl rounded-full flex items-center justify-center transition-all duration-300 text-purple-300 bg-gray-800/50 hover:bg-purple-500 hover:text-white">
          <i id="theme-icon" class="fa-solid fa-moon"></i>
        </button>
      </div>
    </div>
  </header>
  
  <div class="animate-load" style="opacity: 0;">
    <div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
      <nav class="flex space-x-2 sm:space-x-4" role="tablist">
        <button role="tab" aria-selected="true" id="tab-live" class="tab-btn active text-sm sm:text-base px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300">🔥 Live</button>
        <button role="tab" id="tab-up" class="tab-btn text-sm sm:text-base px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300">⏰ Upcoming</button>
        <button role="tab" id="tab-completed" class="tab-btn text-sm sm:text-base px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300">📚 Recorded</button>
      </nav>
      <div class="relative inline-block w-full max-w-xs">
        <select id="batch-filter" aria-label="Batch filter" class="appearance-none w-full px-4 py-3 bg-gray-700 dark:bg-gray-700 text-white dark:text-white border-2 border-purple-600 rounded-lg font-semibold cursor-pointer transition focus:border-pink-500 focus:ring-pink-500 light:bg-purple-50 light:text-purple-800 light:border-purple-400">
          ${'${batchOptions}'}
        </select>
        <i class="fa-solid fa-chevron-down absolute top-1/2 right-4 -translate-y-1/2 text-purple-400 pointer-events-none"></i>
      </div>
    </div>

    <main id="content-area" aria-live="polite" class="relative">
      <div id="live-content" role="tabpanel" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 transition-opacity duration-500">
        ${'${liveCards}'}
      </div>
      <div id="up-content" role="tabpanel" class="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 transition-opacity duration-500 opacity-0 pointer-events-none">
        ${'${upCards}'}
      </div>
      <div id="completed-content" role="tabpanel" class="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 transition-opacity duration-500 opacity-0 pointer-events-none">
        ${'${completedCards}'}
      </div>
    </main>
    
    <div id="empty-state" class="text-center mt-20 hidden" role="alert">
      <svg class="mx-auto h-20 w-20 text-gray-600 dark:text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <div id="empty-state-text"></div>
    </div>
  </div>
</div>

<footer class="mt-20 py-10 bg-gray-900/50 border-t border-purple-500/20 text-center">
    <div class="max-w-7xl mx-auto px-4">
      <p class="font-bold text-lg mb-2">© ${new Date().getFullYear()} Study Smarterz. All Rights Reserved.</p>
      <p class="italic text-sm opacity-70 mb-4">"The beautiful thing about learning is that no one can take it away from you."</p>
      <a href="https://t.me/studysmarterhub" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-pink-500/50">
        <i class="fa-brands fa-telegram text-xl"></i> Join Our Community
      </a>
    </div>
</footer>

<div id="notification-backdrop" class="fixed inset-0 bg-black/60 z-[99] hidden"></div>
<aside id="notifications-panel" class="fixed top-0 right-0 h-full w-full max-w-md bg-gray-800 dark:bg-gray-800 text-white dark:text-white shadow-2xl z-[100] p-6 flex flex-col light:bg-gray-50 light:text-gray-800">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Notifications</h2>
        <button id="close-notifications-btn" aria-label="Close notifications" class="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition light:hover:bg-black/10">
            <i class="fa-solid fa-xmark text-xl"></i>
        </button>
    </div>
    <div id="notifications-list" class="flex-grow overflow-y-auto space-y-4">
        ${'${notificationItems}'}
    </div>
</aside>

<script>
(() => {
  // Select all necessary DOM elements
  const tabs = document.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"]');
  const batchFilter = document.getElementById('batch-filter');
  const emptyState = document.getElementById('empty-state');
  const emptyStateText = document.getElementById('empty-state-text');
  
  const toggleThemeBtn = document.getElementById('toggle-theme');
  const themeIcon = document.getElementById('theme-icon');
  const htmlEl = document.documentElement;

  const notificationBtn = document.getElementById('notification-btn');
  const notificationsPanel = document.getElementById('notifications-panel');
  const closeNotificationsBtn = document.getElementById('close-notifications-btn');
  const notificationBackdrop = document.getElementById('notification-backdrop');

  // Retrieve the active tab from session storage, default to 'live'
  let activeTab = sessionStorage.getItem('activeTab') || 'live';
  
  // --- Theme Management ---
  function applyTheme(theme) {
    htmlEl.classList.toggle('light', theme === 'light');
    htmlEl.classList.toggle('dark', theme !== 'light');
    themeIcon.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    localStorage.setItem('theme', theme); // Persist theme choice
  }
  toggleThemeBtn.addEventListener('click', () => applyTheme(htmlEl.classList.contains('light') ? 'dark' : 'light'));
  applyTheme(localStorage.getItem('theme') || 'dark'); // Set initial theme

  // --- Card Filtering Logic ---
  function filterCards() {
    const selectedBatch = batchFilter.value;
    const activePanel = document.getElementById(\`\${activeTab}-content\`);
    if (!activePanel) return;

    let shownCount = 0;
    activePanel.querySelectorAll('a.lecture-card').forEach(card => {
      const isVisible = selectedBatch === 'all' || card.dataset.batch === selectedBatch;
      card.style.display = isVisible ? 'block' : 'none';
      if (isVisible) shownCount++;
    });

    // Display empty state message if no cards are shown
    emptyState.style.display = shownCount === 0 ? 'block' : 'none';
    if (shownCount === 0) {
        let message = '';
        switch (activeTab) {
            case 'live': message = '<h3>No Live Lectures Now</h3><p class="text-lg italic opacity-80">New classes could arrive anytime! 🚀</p>'; break;
            case 'up': message = '<h3>No Upcoming Lectures</h3><p class="text-lg italic opacity-80">Stay tuned for new batches! 🎯</p>'; break;
            case 'completed': message = '<h3>No Recorded Lectures Found</h3><p class="text-lg italic opacity-80">Keep learning for a successful tomorrow.</p>'; break;
        }
        emptyStateText.innerHTML = message;
    }
  }

  // --- Tab Switching Logic with Animation ---
  function showTab(tabId) {
    if (activeTab === tabId) return;
    activeTab = tabId;
    sessionStorage.setItem('activeTab', tabId); // Persist active tab
    
    tabs.forEach(tab => tab.classList.toggle('active', tab.id === \`tab-\${tabId}\`));
    
    panels.forEach(panel => {
      const isActive = panel.id === \`\${tabId}-content\`;
      // Animate opacity for a smooth fade transition
      panel.style.opacity = isActive ? '1' : '0';
      // Use pointer-events to prevent interaction with hidden tabs
      panel.style.pointerEvents = isActive ? 'auto' : 'none';
      // Use absolute positioning on hidden tabs to prevent layout shifts
      panel.classList.toggle('absolute', !isActive);
      panel.classList.toggle('inset-0', !isActive);
    });
    
    filterCards(); // Re-filter cards for the new active tab
  }

  tabs.forEach(tab => tab.addEventListener('click', () => showTab(tab.id.replace('tab-', ''))));
  batchFilter.addEventListener('change', filterCards);

  // --- Notifications Panel Logic ---
  function toggleNotifications(show) {
    notificationBackdrop.style.display = show ? 'block' : 'none';
    notificationsPanel.classList.toggle('open', show);
  }
  notificationBtn.addEventListener('click', () => toggleNotifications(true));
  closeNotificationsBtn.addEventListener('click', () => toggleNotifications(false));
  notificationBackdrop.addEventListener('click', () => toggleNotifications(false));

  // --- Initial Page Setup ---
  showTab(activeTab); // Set the initial active tab on load
  setTimeout(() => window.location.reload(), 60000); // Auto-refresh the page every 60 seconds
})();
</script>
</body>
</html>`;

// --- BACKEND LOGIC ---

/**
 * Replaces placeholder branding text in a given string.
 * @param {string} text The input string.
 * @returns {string} The string with branding replaced.
 */
const textReplacer = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/rolexcoderz/gi, 'studysmarterz').replace(/rolex/gi, 'study').replace(/coderz/gi, 'smarter');
};

/**
 * Fetches data from a given API endpoint.
 * @param {string} endpoint The API endpoint to fetch (e.g., 'Live/?get=live').
 * @returns {Promise<Array>} A promise that resolves to an array of data items.
 */
const fetchApiData = async (endpoint) => {
  const url = `https://api.rolexcoderz.live/${endpoint}`;
  try {
    const response = await fetch(url, { timeout: 10000 });
    if (!response.ok) {
        console.error(`API Error for ${url}: Status ${response.status}`);
        return [];
    }
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error.message);
    return [];
  }
};

const iconMap = { live: '🔥', up: '⏰', completed: '📚' };

/**
 * Renders HTML for lecture cards from an array of data.
 * @param {Array} data Array of lecture objects.
 * @param {string} type The type of lecture ('live', 'up', 'completed').
 * @returns {string} The generated HTML string for all cards.
 */
const renderLectureCards = (data, type) => {
  if (!data || data.length === 0) return '';
  
  return data.map((item) => {
    const title = textReplacer(item.title);
    const batch = textReplacer(item.batch);
    
    // Fallback image/placeholder
    let imageHtml = `<div class="w-full h-[180px] flex items-center justify-center bg-gray-700 font-bold text-center text-xl p-4">${title}</div>`;
    if (item.image) {
        imageHtml = `<img src="${item.image}" alt="${title}" loading="lazy" class="w-full h-[180px] object-cover transition-transform duration-500 group-hover:scale-110">`;
    }

    // Sanitize and create the final link
    let finalLink = '#';
    if (item.link) {
      try {
        const linkUrl = new URL(item.link);
        const playerUrlParam = linkUrl.searchParams.get('url');
        if (playerUrlParam) {
            finalLink = `https://studysmarterx.netlify.app/player/?url=${encodeURIComponent(playerUrlParam)}`;
        }
      } catch {}
    }

    return `
      <a href="${finalLink}" target="${finalLink !== '#' ? '_blank' : '_self'}" rel="noopener noreferrer" class="lecture-card group flex flex-col rounded-2xl overflow-hidden" data-batch="${item.batch}">
        <div class="overflow-hidden relative image-container">${imageHtml}</div>
        <div class="p-5 flex-grow flex flex-col">
          <h3 class="font-bold text-lg mb-2 leading-tight">${title}</h3>
          <p class="text-sm font-semibold opacity-70 mt-auto">${batch}</p>
          <span class="absolute top-4 right-4 text-xl select-none backdrop-blur-sm bg-black/30 p-2 rounded-full w-10 h-10 flex items-center justify-center">${iconMap[type] || '🎓'}</span>
        </div>
      </a>`;
  }).join('');
};

/**
 * Renders HTML for notification items.
 * @param {Array} notifications Array of notification objects.
 * @returns {string} The generated HTML string for all notifications.
 */
const renderNotifications = (notifications) => {
  if (!notifications || !notifications.length) {
    return `<div class="text-center p-10 opacity-70">
              <i class="fa-solid fa-check-circle text-5xl mb-4"></i>
              <p class="font-semibold">You're all caught up!</p>
              <p class="text-sm">No new notifications.</p>
            </div>`;
  }
  return notifications.map(notif => {
    const title = textReplacer(notif.title);
    const message = textReplacer(notif.message);
    return `<div class="bg-white/5 dark:bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition light:bg-black/5 light:border-black/10 light:hover:bg-black/10">
              <p class="font-bold text-purple-300 dark:text-purple-300 light:text-purple-600">${title}</p>
              <p class="mt-1 text-gray-300 dark:text-gray-300 text-sm light:text-gray-700">${message}</p>
            </div>`;
  }).join('');
};

/**
 * Generates HTML <option> tags for the batch filter dropdown.
 * @param {Array} live Live lectures data.
 * @param {Array} up Upcoming lectures data.
 * @param {Array} completed Completed lectures data.
 * @returns {string} The generated HTML string for options.
 */
const renderBatchOptions = (live, up, completed) => {
  const all = [...live, ...up, ...completed];
  const batches = ['all', ...new Set(all.map(item => item.batch))];
  return batches.map(b => `<option value="${b}">${b === 'all' ? 'All Batches' : textReplacer(b)}</option>`).join('');
};

/**
 * Assembles the complete HTML page by injecting dynamic data into the template.
 * @param {Array} live Live lectures data.
 * @param {Array} up Upcoming lectures data.
 * @param {Array} completed Completed lectures data.
 * @param {Array} notifications Notifications data.
 * @returns {string} The final, complete HTML page as a string.
 */
const buildFullHtmlPage = (live, up, completed, notifications) => {
  const notificationCount = notifications ? notifications.length : 0;
  const notificationBadgeHtml = notificationCount > 0 
    ? `<span class="absolute top-1 right-1 w-5 h-5 bg-pink-500 rounded-full text-xs font-bold flex items-center justify-center text-white">${notificationCount}</span>` 
    : '';

  return cachedHtml
    .replace('${liveCards}', renderLectureCards(live, 'live'))
    .replace('${upCards}', renderLectureCards(up, 'up'))
    .replace('${completedCards}', renderLectureCards(completed, 'completed'))
    .replace('${notificationItems}', renderNotifications(notifications))
    .replace('${notificationCountBadge}', notificationBadgeHtml)
    .replace('${batchOptions}', renderBatchOptions(live, up, completed))
    .replace(/\${new Date\(\)\.getFullYear\(\)}/g, new Date().getFullYear());
};

/**
 * Fetches all data from APIs and updates the `cachedHtml` variable.
 */
const updateCache = async () => {
  console.log('Updating cache...');
  try {
    // Fetch all data in parallel for efficiency
    const [live, up, completed, notifications] = await Promise.all([
      fetchApiData('Live/?get=live'),
      fetchApiData('Live/?get=up'),
      fetchApiData('Live/?get=completed'),
      fetchApiData('Live/?get=notifications')
    ]);
    
    // Re-build the full HTML page with the new data
    cachedHtml = buildFullHtmlPage(live, up, completed, notifications);
    console.log('Cache updated successfully.');
  } catch (error) {
    console.error('Failed to update cache:', error);
  }
};

// --- EXPRESS SERVER SETUP ---

// Define the main route, which sends the cached HTML
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(cachedHtml);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  // Perform an initial cache update when the server starts
  updateCache();
  // Set an interval to automatically update the cache every 60 seconds
  setInterval(updateCache, 60000);
});
