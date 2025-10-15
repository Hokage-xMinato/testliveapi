const express = require('express');
const fetch = require('node-fetch'); // Ensure you have installed 'node-fetch' v2: npm i node-fetch@2

const app = express();
const PORT = process.env.PORT || 10000;

// --- HTML BASE (Completely Revamped) ---
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
  @keyframes moveGradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  body {
    font-family: 'Poppins', 'Inter', sans-serif;
    margin: 0; padding: 0;
    color: #e5e7eb;
    background: linear-gradient(-45deg, #111827, #1f2937, #374151, #4b5563);
    background-size: 400% 400%;
    animation: moveGradient 20s ease infinite;
    transition: background 0.8s, color 0.8s;
  }
  html.light body {
    color: #1f2937;
    background: linear-gradient(-45deg, #f5f3ff, #e0e7ff, #c7d2fe, #a5b4fc);
    background-size: 400% 400%;
  }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-thumb { background: #8b5cf6; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #a78bfa; }
  
  /* Custom Dropdown */
  .custom-select-wrapper {
    position: relative;
    display: inline-block;
    width: 280px;
  }
  #batch-filter {
    appearance: none; -webkit-appearance: none; -moz-appearance: none;
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    background-color: #374151;
    color: #e5e7eb;
    border: 2px solid #4f46e5;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }
  html.light #batch-filter {
    background-color: #ede9fe;
    color: #4f46e5;
    border-color: #7c3aed;
  }
  .custom-select-wrapper::after {
    content: '\\f078'; /* Font Awesome Chevron Down */
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    position: absolute;
    top: 50%; right: 1rem;
    transform: translateY(-50%);
    pointer-events: none;
    color: #a78bfa;
    transition: color 0.3s;
  }
  html.light .custom-select-wrapper::after {
    color: #7c3aed;
  }

  /* Tab Buttons */
  .tab-btn.active {
    background: linear-gradient(135deg, #7c3aed, #ec4899);
    color: #fff !important;
    box-shadow: 0 8px 15px rgb(236 72 153 / 0.45);
    transform: translateY(-3px);
  }
  .tab-btn:not(.active) { color: #c4b5fd; background: transparent; }
  .tab-btn:not(.active):hover { color: #fff; background: rgba(124, 58, 237, 0.2); }
  html.light .tab-btn:not(.active) { color: #6d28d9; }
  html.light .tab-btn:not(.active):hover { background: rgba(124, 58, 237, 0.1); color: #4f46e5; }
  
  /* Lecture Card with Glowing Border */
  .lecture-card {
    position: relative;
    cursor: pointer;
    border-radius: 1.3rem;
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s;
    background: #232a3b;
    overflow: hidden;
    color: #fff;
  }
  html.light .lecture-card { background: #ffffff; color: #1a202c; box-shadow: 0 10px 25px rgba(165, 180, 252, 0.2); }
  .lecture-card::before {
    content: '';
    position: absolute;
    top: -3px; left: -3px; right: -3px; bottom: -3px;
    z-index: -1;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    border-radius: calc(1.3rem + 3px);
    opacity: 0.7;
    filter: blur(8px);
    transition: opacity 0.4s, filter 0.4s;
  }
  .lecture-card:hover { transform: translateY(-10px) scale(1.02); }
  .lecture-card:hover::before { opacity: 1; filter: blur(12px); }
  
  .lecture-card img {
    width: 100%; height: 180px; object-fit: cover;
    border-bottom: 2px solid #4f46e544;
    transition: transform .65s;
  }
  .lecture-card:hover img { transform: scale(1.08); }

  /* Footer */
  .site-footer {
    margin-top: 5rem;
    padding: 2.5rem 1.5rem;
    background: rgba(17, 24, 39, 0.5);
    border-top: 1px solid rgba(139, 92, 246, 0.3);
    backdrop-filter: blur(10px);
    text-align: center;
  }
  html.light .site-footer {
    background: rgba(255, 255, 255, 0.5);
    border-top: 1px solid rgba(124, 58, 237, 0.2);
    color: #4f46e5;
  }
</style>
</head>
<body class="transition-colors duration-500">
<script>
  // Anti-iframe script
  if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) {} }
</script>
<div id="app-container" class="min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto">
  <header class="flex justify-between items-center mb-12 select-none">
    <h1 class="font-extrabold text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 cursor-default">
      Study Smarterz
    </h1>
    <button id="toggle-theme" aria-label="Toggle Dark/Light Mode" title="Toggle Dark/Light Mode" class="w-14 h-14 text-2xl rounded-full flex items-center justify-center transition-all duration-300 text-purple-300 bg-gray-800/50 hover:bg-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/50">
      <i id="theme-icon" class="fa-solid fa-moon"></i>
    </button>
  </header>
  
  <div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
    <nav class="flex space-x-2 sm:space-x-4" aria-label="Tabs" role="tablist">
      <button role="tab" aria-selected="true" id="tab-live" class="tab-btn active text-sm sm:text-base px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300">🔥 Live</button>
      <button role="tab" aria-selected="false" id="tab-up" class="tab-btn text-sm sm:text-base px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300">⏰ Upcoming</button>
      <button role="tab" aria-selected="false" id="tab-completed" class="tab-btn text-sm sm:text-base px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300">📚 Recorded</button>
    </nav>
    <div class="custom-select-wrapper">
      <select id="batch-filter" aria-label="Batch filter">${'${batchOptions}'}</select>
    </div>
  </div>

  <main id="content-area" aria-live="polite">
    <div id="live-content" role="tabpanel" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      ${'${liveCards}'}
    </div>
    <div id="up-content" role="tabpanel" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      ${'${upCards}'}
    </div>
    <div id="completed-content" role="tabpanel" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      ${'${completedCards}'}
    </div>
  </main>
  
  <div id="empty-state" class="text-center mt-20 hidden" role="alert">
    <h3 class="font-bold text-2xl mb-2">No Lectures Found</h3>
    <p class="text-lg italic opacity-80">Try adjusting filters or check back later. The pursuit of knowledge is a journey!</p>
  </div>
</div>

<footer class="site-footer">
    <div class="max-w-7xl mx-auto">
      <p class="font-bold text-lg mb-2">© ${new Date().getFullYear()} Study Smarterz. All Rights Reserved.</p>
      <p class="motivational italic text-sm opacity-80 mb-4">"The beautiful thing about learning is that no one can take it away from you." – B.B. King</p>
      <a href="https://t.me/studysmarterhub" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-pink-500/50">
        <i class="fa-brands fa-telegram text-xl"></i> Join Our Community
      </a>
    </div>
</footer>

<div id="telegram-popup" class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60" style="display:none;">
  <div class="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl shadow-pink-500/30 text-white max-w-sm text-center mx-4">
    <h3 class="text-3xl font-extrabold mb-3">Join Our Community! 🎉</h3>
    <p class="opacity-80 mb-6">Stay updated with the latest classes, notes, and announcements.</p>
    <div class="flex flex-col gap-3">
      <a href="https://t.me/studysmarterhub" id="join-tg-button" target="_blank" class="bg-white text-purple-600 rounded-lg px-6 py-3 font-bold hover:bg-purple-100 transition flex items-center gap-2 justify-center">
        <i class="fa-brands fa-telegram text-xl"></i> Join Telegram
      </a>
      <button id="close-popup-btn" class="border-2 border-white/50 text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-white/20 transition">Maybe Later</button>
    </div>
  </div>
</div>

<script>
(() => {
  const tabs = document.querySelectorAll('button[role="tab"]');
  const panels = document.querySelectorAll('main#content-area > div[role="tabpanel"]');
  const batchFilter = document.getElementById('batch-filter');
  const emptyState = document.getElementById('empty-state');
  const telegramPopup = document.getElementById('telegram-popup');
  const joinTgBtn = document.getElementById('join-tg-button');
  const closePopupBtn = document.getElementById('close-popup-btn');
  const toggleThemeBtn = document.getElementById('toggle-theme');
  const themeIcon = document.getElementById('theme-icon');
  const htmlEl = document.documentElement;

  let activeTab = sessionStorage.getItem('activeTab') || 'live';
  
  // Theme Management
  function applyTheme(theme) {
    if (theme === 'light') {
      htmlEl.classList.add('light');
      htmlEl.classList.remove('dark');
      themeIcon.className = 'fa-solid fa-sun';
    } else {
      htmlEl.classList.remove('light');
      htmlEl.classList.add('dark');
      themeIcon.className = 'fa-solid fa-moon';
    }
    localStorage.setItem('theme', theme);
  }

  toggleThemeBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.classList.contains('light') ? 'dark' : 'light';
    applyTheme(currentTheme);
  });
  
  // Initial theme setup
  const preferredTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(preferredTheme);

  // Card Filtering Logic
  function filterCards() {
    const selectedBatch = batchFilter.value;
    const activePanel = document.querySelector(\`#\${activeTab}-content\`);
    if (!activePanel) return;
    const cards = activePanel.querySelectorAll('a.lecture-card');
    let shownCount = 0;
    
    cards.forEach(card => {
      const isVisible = selectedBatch === 'all' || card.dataset.batch === selectedBatch;
      card.style.display = isVisible ? 'block' : 'none';
      if(isVisible) shownCount++;
    });

    emptyState.style.display = shownCount === 0 ? 'block' : 'none';
    if (shownCount === 0) {
        let message = '';
        switch (activeTab) {
            case 'live': message = '<h3>No Live Lectures Now</h3><p class="text-lg italic opacity-80">Keep your curiosity alive — new classes could arrive anytime! 🚀</p>'; break;
            case 'up': message = '<h3>No Upcoming Lectures Scheduled</h3><p class="text-lg italic opacity-80">Stay tuned for new batches — your journey continues! 🎯</p>'; break;
            case 'completed': message = '<h3>No Recorded Lectures Found</h3><p class="text-lg italic opacity-80">Keep learning today for a successful tomorrow.</p>'; break;
            default: message = '<h3>No Lectures Found</h3><p class="text-lg italic opacity-80">Try adjusting filters or check back later.</p>';
        }
        emptyState.innerHTML = message;
    }
  }

  // Tab Switching Logic
  function showTab(tabId) {
    activeTab = tabId;
    sessionStorage.setItem('activeTab', activeTab);
    
    tabs.forEach(tab => {
      const isSelected = tab.id === \`tab-\${tabId}\`;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', isSelected);
    });

    panels.forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== \`\${tabId}-content\`);
    });

    filterCards();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (!tab.classList.contains('active')) {
        showTab(tab.id.replace('tab-', ''));
      }
    });
  });

  batchFilter.addEventListener('change', filterCards);

  // Popup Logic
  function closePopup(storeDismiss = true) {
    telegramPopup.style.display = 'none';
    if (storeDismiss) sessionStorage.setItem('popupDismissed', '1');
  }

  if (sessionStorage.getItem('popupDismissed') === null) {
    setTimeout(() => { telegramPopup.style.display = 'flex'; }, 2000);
  }

  closePopupBtn.addEventListener('click', () => closePopup(true));
  joinTgBtn.addEventListener('click', () => closePopup(true));

  // Initial setup and auto-refresh
  showTab(activeTab);
  setTimeout(() => window.location.reload(), 60000); // 1-minute auto-refresh
})();
</script>
</body>
</html>`;

// --- BACKEND LOGIC (No changes needed here, but included for completeness) ---

const textReplacer = (text) => typeof text !== 'string' ? text : text.replace(/rolexcoderz/gi,'studysmarterz').replace(/rolex/gi,'study').replace(/coderz/gi,'smarter');

const fetchApiData = async (endpoint) => {
  const url = `https://api.rolexcoderz.live/${endpoint}`;
  try {
    const response = await fetch(url, {timeout: 10000});
    if (!response.ok) return [];
    return (await response.json()).data || [];
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return [];
  }
};

const iconMap = { live: '🔥', up: '⏰', completed: '📚' };

const renderLectureCards = (data, type) => {
  if (!data || data.length === 0) return '';
  
  return data.map((item) => {
    const title = textReplacer(item.title);
    const batch = textReplacer(item.batch);
    
    let imageHtml = `<div class="w-full h-[180px] flex items-center justify-center bg-gray-700 font-bold text-center text-xl p-4">${title}</div>`;
    if (item.image) {
      try {
        const imageUrl = new URL(item.image);
        if (imageUrl.hostname.endsWith('cloudfront.net')) {
          imageHtml = `<img src="${item.image}" alt="${title}" loading="lazy" class="w-full h-[180px] object-cover transition-transform duration-500 group-hover:scale-110">`;
        }
      } catch {}
    }

    let finalLink = '#';
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
      <a href="${finalLink}" target="${finalLink !== '#' ? '_blank' : '_self'}" rel="noopener noreferrer" class="lecture-card group flex flex-col" data-batch="${item.batch}">
        <div class="overflow-hidden">
            ${imageHtml}
        </div>
        <div class="p-5 flex-grow flex flex-col">
          <h3 class="font-bold text-lg mb-2 leading-tight">${title}</h3>
          <p class="text-sm font-semibold opacity-70 mt-auto">${batch}</p>
          <span class="absolute top-4 right-4 text-2xl select-none backdrop-blur-sm bg-black/20 p-2 rounded-full">${iconMap[type] || '🎓'}</span>
        </div>
      </a>`;
  }).join('');
};

const renderBatchOptions = (live, up, completed) => {
  const all = [...live, ...up, ...completed];
  const batches = ['all', ...new Set(all.map(item => item.batch))];
  return batches.map(b => `<option value="${b}">${b === 'all' ? 'All Batches' : textReplacer(b)}</option>`).join('');
};

const buildFullHtmlPage = (live, up, completed) => {
  return cachedHtml.replace('${liveCards}', renderLectureCards(live, 'live'))
    .replace('${upCards}', renderLectureCards(up, 'up'))
    .replace('${completedCards}', renderLectureCards(completed, 'completed'))
    .replace('${batchOptions}', renderBatchOptions(live, up, completed))
    .replace(/\${new Date\(\)\.getFullYear\(\)}/g, new Date().getFullYear());
};

const updateCache = async () => {
  console.log('Updating cache...');
  try {
    const [live, up, completed] = await Promise.all([
      fetchApiData('Live/?get=live'),
      fetchApiData('Live/?get=up'),
      fetchApiData('Live/?get=completed'),
    ]);
    // Note: The original code had a 'notifications' fetch but it wasn't used in the template.
    // I've removed it from this Promise.all call for clarity.
    
    cachedHtml = buildFullHtmlPage(live, up, completed);
    console.log('Cache updated successfully.');
  } catch (error) {
    console.error('Failed to update cache:', error);
  }
};

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(cachedHtml);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  updateCache(); // Initial cache fill
  setInterval(updateCache, 60000); // Refresh cache every 60 seconds
});const express = require('express');
const fetch = require('node-fetch'); // Ensure you have installed 'node-fetch' v2: npm i node-fetch@2

const app = express();
const PORT = process.env.PORT || 10000;

// --- HTML BASE (Completely Revamped) ---
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
  @keyframes moveGradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  body {
    font-family: 'Poppins', 'Inter', sans-serif;
    margin: 0; padding: 0;
    color: #e5e7eb;
    background: linear-gradient(-45deg, #111827, #1f2937, #374151, #4b5563);
    background-size: 400% 400%;
    animation: moveGradient 20s ease infinite;
    transition: background 0.8s, color 0.8s;
  }
  html.light body {
    color: #1f2937;
    background: linear-gradient(-45deg, #f5f3ff, #e0e7ff, #c7d2fe, #a5b4fc);
    background-size: 400% 400%;
  }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-thumb { background: #8b5cf6; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #a78bfa; }
  
  /* Custom Dropdown */
  .custom-select-wrapper {
    position: relative;
    display: inline-block;
    width: 280px;
  }
  #batch-filter {
    appearance: none; -webkit-appearance: none; -moz-appearance: none;
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    background-color: #374151;
    color: #e5e7eb;
    border: 2px solid #4f46e5;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }
  html.light #batch-filter {
    background-color: #ede9fe;
    color: #4f46e5;
    border-color: #7c3aed;
  }
  .custom-select-wrapper::after {
    content: '\\f078'; /* Font Awesome Chevron Down */
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    position: absolute;
    top: 50%; right: 1rem;
    transform: translateY(-50%);
    pointer-events: none;
    color: #a78bfa;
    transition: color 0.3s;
  }
  html.light .custom-select-wrapper::after {
    color: #7c3aed;
  }

  /* Tab Buttons */
  .tab-btn.active {
    background: linear-gradient(135deg, #7c3aed, #ec4899);
    color: #fff !important;
    box-shadow: 0 8px 15px rgb(236 72 153 / 0.45);
    transform: translateY(-3px);
  }
  .tab-btn:not(.active) { color: #c4b5fd; background: transparent; }
  .tab-btn:not(.active):hover { color: #fff; background: rgba(124, 58, 237, 0.2); }
  html.light .tab-btn:not(.active) { color: #6d28d9; }
  html.light .tab-btn:not(.active):hover { background: rgba(124, 58, 237, 0.1); color: #4f46e5; }
  
  /* Lecture Card with Glowing Border */
  .lecture-card {
    position: relative;
    cursor: pointer;
    border-radius: 1.3rem;
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s;
    background: #232a3b;
    overflow: hidden;
    color: #fff;
  }
  html.light .lecture-card { background: #ffffff; color: #1a202c; box-shadow: 0 10px 25px rgba(165, 180, 252, 0.2); }
  .lecture-card::before {
    content: '';
    position: absolute;
    top: -3px; left: -3px; right: -3px; bottom: -3px;
    z-index: -1;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    border-radius: calc(1.3rem + 3px);
    opacity: 0.7;
    filter: blur(8px);
    transition: opacity 0.4s, filter 0.4s;
  }
  .lecture-card:hover { transform: translateY(-10px) scale(1.02); }
  .lecture-card:hover::before { opacity: 1; filter: blur(12px); }
  
  .lecture-card img {
    width: 100%; height: 180px; object-fit: cover;
    border-bottom: 2px solid #4f46e544;
    transition: transform .65s;
  }
  .lecture-card:hover img { transform: scale(1.08); }

  /* Footer */
  .site-footer {
    margin-top: 5rem;
    padding: 2.5rem 1.5rem;
    background: rgba(17, 24, 39, 0.5);
    border-top: 1px solid rgba(139, 92, 246, 0.3);
    backdrop-filter: blur(10px);
    text-align: center;
  }
  html.light .site-footer {
    background: rgba(255, 255, 255, 0.5);
    border-top: 1px solid rgba(124, 58, 237, 0.2);
    color: #4f46e5;
  }
</style>
</head>
<body class="transition-colors duration-500">
<script>
  // Anti-iframe script
  if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) {} }
</script>
<div id="app-container" class="min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto">
  <header class="flex justify-between items-center mb-12 select-none">
    <h1 class="font-extrabold text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 cursor-default">
      Study Smarterz
    </h1>
    <button id="toggle-theme" aria-label="Toggle Dark/Light Mode" title="Toggle Dark/Light Mode" class="w-14 h-14 text-2xl rounded-full flex items-center justify-center transition-all duration-300 text-purple-300 bg-gray-800/50 hover:bg-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/50">
      <i id="theme-icon" class="fa-solid fa-moon"></i>
    </button>
  </header>
  
  <div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
    <nav class="flex space-x-2 sm:space-x-4" aria-label="Tabs" role="tablist">
      <button role="tab" aria-selected="true" id="tab-live" class="tab-btn active text-sm sm:text-base px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300">🔥 Live</button>
      <button role="tab" aria-selected="false" id="tab-up" class="tab-btn text-sm sm:text-base px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300">⏰ Upcoming</button>
      <button role="tab" aria-selected="false" id="tab-completed" class="tab-btn text-sm sm:text-base px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300">📚 Recorded</button>
    </nav>
    <div class="custom-select-wrapper">
      <select id="batch-filter" aria-label="Batch filter">${'${batchOptions}'}</select>
    </div>
  </div>

  <main id="content-area" aria-live="polite">
    <div id="live-content" role="tabpanel" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      ${'${liveCards}'}
    </div>
    <div id="up-content" role="tabpanel" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      ${'${upCards}'}
    </div>
    <div id="completed-content" role="tabpanel" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      ${'${completedCards}'}
    </div>
  </main>
  
  <div id="empty-state" class="text-center mt-20 hidden" role="alert">
    <h3 class="font-bold text-2xl mb-2">No Lectures Found</h3>
    <p class="text-lg italic opacity-80">Try adjusting filters or check back later. The pursuit of knowledge is a journey!</p>
  </div>
</div>

<footer class="site-footer">
    <div class="max-w-7xl mx-auto">
      <p class="font-bold text-lg mb-2">© ${new Date().getFullYear()} Study Smarterz. All Rights Reserved.</p>
      <p class="motivational italic text-sm opacity-80 mb-4">"The beautiful thing about learning is that no one can take it away from you." – B.B. King</p>
      <a href="https://t.me/studysmarterhub" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-pink-500/50">
        <i class="fa-brands fa-telegram text-xl"></i> Join Our Community
      </a>
    </div>
</footer>

<div id="telegram-popup" class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60" style="display:none;">
  <div class="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl shadow-pink-500/30 text-white max-w-sm text-center mx-4">
    <h3 class="text-3xl font-extrabold mb-3">Join Our Community! 🎉</h3>
    <p class="opacity-80 mb-6">Stay updated with the latest classes, notes, and announcements.</p>
    <div class="flex flex-col gap-3">
      <a href="https://t.me/studysmarterhub" id="join-tg-button" target="_blank" class="bg-white text-purple-600 rounded-lg px-6 py-3 font-bold hover:bg-purple-100 transition flex items-center gap-2 justify-center">
        <i class="fa-brands fa-telegram text-xl"></i> Join Telegram
      </a>
      <button id="close-popup-btn" class="border-2 border-white/50 text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-white/20 transition">Maybe Later</button>
    </div>
  </div>
</div>

<script>
(() => {
  const tabs = document.querySelectorAll('button[role="tab"]');
  const panels = document.querySelectorAll('main#content-area > div[role="tabpanel"]');
  const batchFilter = document.getElementById('batch-filter');
  const emptyState = document.getElementById('empty-state');
  const telegramPopup = document.getElementById('telegram-popup');
  const joinTgBtn = document.getElementById('join-tg-button');
  const closePopupBtn = document.getElementById('close-popup-btn');
  const toggleThemeBtn = document.getElementById('toggle-theme');
  const themeIcon = document.getElementById('theme-icon');
  const htmlEl = document.documentElement;

  let activeTab = sessionStorage.getItem('activeTab') || 'live';
  
  // Theme Management
  function applyTheme(theme) {
    if (theme === 'light') {
      htmlEl.classList.add('light');
      htmlEl.classList.remove('dark');
      themeIcon.className = 'fa-solid fa-sun';
    } else {
      htmlEl.classList.remove('light');
      htmlEl.classList.add('dark');
      themeIcon.className = 'fa-solid fa-moon';
    }
    localStorage.setItem('theme', theme);
  }

  toggleThemeBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.classList.contains('light') ? 'dark' : 'light';
    applyTheme(currentTheme);
  });
  
  // Initial theme setup
  const preferredTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(preferredTheme);

  // Card Filtering Logic
  function filterCards() {
    const selectedBatch = batchFilter.value;
    const activePanel = document.querySelector(\`#\${activeTab}-content\`);
    if (!activePanel) return;
    const cards = activePanel.querySelectorAll('a.lecture-card');
    let shownCount = 0;
    
    cards.forEach(card => {
      const isVisible = selectedBatch === 'all' || card.dataset.batch === selectedBatch;
      card.style.display = isVisible ? 'block' : 'none';
      if(isVisible) shownCount++;
    });

    emptyState.style.display = shownCount === 0 ? 'block' : 'none';
    if (shownCount === 0) {
        let message = '';
        switch (activeTab) {
            case 'live': message = '<h3>No Live Lectures Now</h3><p class="text-lg italic opacity-80">Keep your curiosity alive — new classes could arrive anytime! 🚀</p>'; break;
            case 'up': message = '<h3>No Upcoming Lectures Scheduled</h3><p class="text-lg italic opacity-80">Stay tuned for new batches — your journey continues! 🎯</p>'; break;
            case 'completed': message = '<h3>No Recorded Lectures Found</h3><p class="text-lg italic opacity-80">Keep learning today for a successful tomorrow.</p>'; break;
            default: message = '<h3>No Lectures Found</h3><p class="text-lg italic opacity-80">Try adjusting filters or check back later.</p>';
        }
        emptyState.innerHTML = message;
    }
  }

  // Tab Switching Logic
  function showTab(tabId) {
    activeTab = tabId;
    sessionStorage.setItem('activeTab', activeTab);
    
    tabs.forEach(tab => {
      const isSelected = tab.id === \`tab-\${tabId}\`;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', isSelected);
    });

    panels.forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== \`\${tabId}-content\`);
    });

    filterCards();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (!tab.classList.contains('active')) {
        showTab(tab.id.replace('tab-', ''));
      }
    });
  });

  batchFilter.addEventListener('change', filterCards);

  // Popup Logic
  function closePopup(storeDismiss = true) {
    telegramPopup.style.display = 'none';
    if (storeDismiss) sessionStorage.setItem('popupDismissed', '1');
  }

  if (sessionStorage.getItem('popupDismissed') === null) {
    setTimeout(() => { telegramPopup.style.display = 'flex'; }, 2000);
  }

  closePopupBtn.addEventListener('click', () => closePopup(true));
  joinTgBtn.addEventListener('click', () => closePopup(true));

  // Initial setup and auto-refresh
  showTab(activeTab);
  setTimeout(() => window.location.reload(), 60000); // 1-minute auto-refresh
})();
</script>
</body>
</html>`;

// --- BACKEND LOGIC (No changes needed here, but included for completeness) ---

const textReplacer = (text) => typeof text !== 'string' ? text : text.replace(/rolexcoderz/gi,'studysmarterz').replace(/rolex/gi,'study').replace(/coderz/gi,'smarter');

const fetchApiData = async (endpoint) => {
  const url = `https://api.rolexcoderz.live/${endpoint}`;
  try {
    const response = await fetch(url, {timeout: 10000});
    if (!response.ok) return [];
    return (await response.json()).data || [];
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return [];
  }
};

const iconMap = { live: '🔥', up: '⏰', completed: '📚' };

const renderLectureCards = (data, type) => {
  if (!data || data.length === 0) return '';
  
  return data.map((item) => {
    const title = textReplacer(item.title);
    const batch = textReplacer(item.batch);
    
    let imageHtml = `<div class="w-full h-[180px] flex items-center justify-center bg-gray-700 font-bold text-center text-xl p-4">${title}</div>`;
    if (item.image) {
      try {
        const imageUrl = new URL(item.image);
        if (imageUrl.hostname.endsWith('cloudfront.net')) {
          imageHtml = `<img src="${item.image}" alt="${title}" loading="lazy" class="w-full h-[180px] object-cover transition-transform duration-500 group-hover:scale-110">`;
        }
      } catch {}
    }

    let finalLink = '#';
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
      <a href="${finalLink}" target="${finalLink !== '#' ? '_blank' : '_self'}" rel="noopener noreferrer" class="lecture-card group flex flex-col" data-batch="${item.batch}">
        <div class="overflow-hidden">
            ${imageHtml}
        </div>
        <div class="p-5 flex-grow flex flex-col">
          <h3 class="font-bold text-lg mb-2 leading-tight">${title}</h3>
          <p class="text-sm font-semibold opacity-70 mt-auto">${batch}</p>
          <span class="absolute top-4 right-4 text-2xl select-none backdrop-blur-sm bg-black/20 p-2 rounded-full">${iconMap[type] || '🎓'}</span>
        </div>
      </a>`;
  }).join('');
};

const renderBatchOptions = (live, up, completed) => {
  const all = [...live, ...up, ...completed];
  const batches = ['all', ...new Set(all.map(item => item.batch))];
  return batches.map(b => `<option value="${b}">${b === 'all' ? 'All Batches' : textReplacer(b)}</option>`).join('');
};

const buildFullHtmlPage = (live, up, completed) => {
  return cachedHtml.replace('${liveCards}', renderLectureCards(live, 'live'))
    .replace('${upCards}', renderLectureCards(up, 'up'))
    .replace('${completedCards}', renderLectureCards(completed, 'completed'))
    .replace('${batchOptions}', renderBatchOptions(live, up, completed))
    .replace(/\${new Date\(\)\.getFullYear\(\)}/g, new Date().getFullYear());
};

const updateCache = async () => {
  console.log('Updating cache...');
  try {
    const [live, up, completed] = await Promise.all([
      fetchApiData('Live/?get=live'),
      fetchApiData('Live/?get=up'),
      fetchApiData('Live/?get=completed'),
    ]);
    // Note: The original code had a 'notifications' fetch but it wasn't used in the template.
    // I've removed it from this Promise.all call for clarity.
    
    cachedHtml = buildFullHtmlPage(live, up, completed);
    console.log('Cache updated successfully.');
  } catch (error) {
    console.error('Failed to update cache:', error);
  }
};

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(cachedHtml);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  updateCache(); // Initial cache fill
  setInterval(updateCache, 60000); // Refresh cache every 60 seconds
});
