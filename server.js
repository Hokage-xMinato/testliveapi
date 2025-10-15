const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

// HTML BASE
let cachedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Study Smarterz - Live Classes</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
body {
  font-family: 'Poppins', 'Inter', sans-serif;
  margin: 0; padding: 0;
  background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%);
  color: #e4e7eb;
  transition: background 1.2s, color 1.2s;
  min-height: 100vh;
}
html.light body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: #1a202c;
}
header {
  background: transparent !important;
  box-shadow: none !important;
  color: inherit;
  transition: color .8s;
}
::-webkit-scrollbar {width: 10px;}
::-webkit-scrollbar-thumb {background: #8b5cf6; border-radius: 10px;}
::-webkit-scrollbar-thumb:hover {background: #c084fc;}
.tab-btn {
  padding: .7rem 2rem;
  cursor: pointer;
  border-radius: .8rem;
  font-weight: 700;
  letter-spacing: .07em;
  font-family: 'Poppins',sans-serif;
  box-shadow: 0 4px 6px rgb(139 92 246 / 0.18);
  text-transform: uppercase;
  transition: all .3s;
}
.tab-btn.active {
  background: linear-gradient(135deg,#7c3aed,#ec4899);
  color: #fff !important;
  box-shadow:0 8px 15px rgb(236 72 153/0.45);
  transform:translateY(-3px);
}
.tab-btn:not(.active) {color: #c4b5fd; background:transparent;}
.tab-btn:not(.active):hover{color: #fff;}
html.light .tab-btn.active {
  background: linear-gradient(135deg,#8b5cf6,#ec4899);
  color: #fff !important;
}
html.light .tab-btn:not(.active) {color:#7c3aed;}
html.light .tab-btn:not(.active):hover{background:rgba(124,58,237,.2);color:#fff;}
.lecture-card {
  cursor: pointer;
  border-radius: 1.3rem;
  transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.20);
  overflow: hidden; position:relative;
  background:linear-gradient(135deg,#8b5cf6 0%,#ec4899 100%);
  color:#fff;
  font-family:'Poppins',sans-serif;
}
.lecture-card:hover {transform:translateY(-10px) scale(1.04); box-shadow:0 20px 40px #eb2f962e;z-index:2;}
html.light .lecture-card {
  box-shadow: 0 4px 20px #a5b4fc33;
  background:linear-gradient(135deg,#a78bfa 0%,#f472b6 100%);
  color:#2c2c2c;
}
.image-wrapper {
  border-radius:1.3rem 1.3rem 0 0;
  padding:7px 7px 0 7px;
  background:linear-gradient(45deg,#7c3aed,#ec4899);
  border:2px solid transparent;
}
html.light .image-wrapper {
  background:linear-gradient(45deg,#a78bfa,#f472b6);
  border:2px solid #a78bfa;
}
.image-wrapper img {
  border-radius:1.05rem;
  width:100%; height:180px; object-fit:cover;
  filter:drop-shadow(0 2px 6px #0002);
  transition:transform .65s;
}
.lecture-card:hover img{transform:scale(1.08);}
.tap-to-watch {
  color:rgba(255,255,255,0.95);
  font-weight:700;
  position:absolute;
  bottom:1.2rem;left:50%;transform:translateX(-50%);
  background:rgba(124,58,237,0.88);
  padding:.42rem 1.1rem; border-radius:1.2rem;
  font-size:1.01rem; opacity:0; pointer-events:none;
  transition:opacity .4s;
  user-select:none; box-shadow:0 0 11px #ec4899a3;
}
html.light .tap-to-watch {
  background:rgba(167,139,250,.88);
  color:#222;
}
.lecture-card:hover .tap-to-watch {opacity:1; pointer-events:auto;}
footer {
  margin-top:4rem;text-align:center;font-weight:600;
  color:rgba(255,255,255,0.87);user-select:none;
  font-family:'Poppins',sans-serif; font-size:1.08rem;
}
html.light footer{color:#7c3aed;}
footer a {color:#a78bfa;font-weight:700;transition:color .2s;}
footer a:hover{color:#ec4899;}
footer .motivational{margin-top:.31rem;font-style:italic;font-weight:500;font-size:1rem;opacity:.7;}
#telegram-popup {
  backdrop-filter: blur(12px);
  background: rgba(0,0,0,.76);
  z-index:1050;display:none;
}
#popup-content{
  background:linear-gradient(135deg,#7c3aed,#ec4899);
  border-radius: 1.3rem;
  padding:2rem 2.5rem 2.1rem 2.5rem;
  box-shadow:0 12px 40px #ec489988;
  color:#fff;
  max-width:400px;
  text-align:center;
  font-family:'Poppins',sans-serif;
}
#popup-content a {
  background:#fff;color:#7c3aed;
  border-radius:1rem;padding:0.85rem 1.7rem;
  font-weight:800;text-decoration:none;
  display:inline-flex;gap:10px;align-items:center;
  margin-bottom:1rem;transition:.25s;
}
#popup-content button {
  border:2px solid #fff;background:transparent;border-radius:1rem;
  color: #fff;font-weight:700;padding:.9rem 2rem;
  cursor:pointer;transition:.23s;
}
#popup-content a:hover {background:#ede9fe;}
#popup-content button:hover {background:#fff;color:#7c3aed;}
#popup-quote{font-style:italic;font-size:1.01rem;margin-bottom:1rem;}
#empty-state h3{
  font-family:'Poppins',sans-serif; font-weight:700; font-size:1.7rem;
  margin-bottom:.3rem;
}
#empty-state p{
  font-family:'Inter',sans-serif;font-weight:500;font-size:1.08rem;
  font-style:italic;opacity:.84;
}
</style>
</head>
<body>
<script>
if(window.top!==window.self){try{window.top.location=window.self.location;}catch(e){}}
</script>
<div id="app-container" class="min-h-screen px-6 py-8 max-w-7xl mx-auto relative">
  <!-- Header -->
  <header class="flex justify-between items-center mb-12 select-none" style="box-shadow:none;">
    <h1 id="logo" class="font-extrabold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 cursor-default">
      Study Smarterz
    </h1>
    <button id="toggle-theme" aria-label="Toggle Dark/Light Mode" title="Toggle Dark/Light Mode" class="px-4 py-2 text-xl rounded-lg border-2 border-purple-400 text-purple-400 hover:bg-purple-300 transition flex items-center gap-3 dark:text-pink-400 dark:border-pink-400 dark:hover:bg-pink-600">
      <i id="theme-icon" class="fas fa-moon"></i>
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
  <!-- No content / empty states with motivational quote -->
  <div id="empty-state" class="text-center mt-20 hidden" role="alert" aria-live="assertive">
    <h3>No matching lectures found</h3>
    <p>Keep your curiosity alive — new classes could arrive anytime! 🚀</p>
  </div>
  <!-- Footer with quote -->
  <footer>
    <p>© ${new Date().getFullYear()} Study Smarterz. All rights reserved.</p>
    <p class="motivational">🎓 "Education is the passport to the future — invest in yourself today!"</p>
    <a href="https://t.me/studysmarterhub" target="_blank" rel="noopener noreferrer" class="inline-flex items-center mt-2 font-bold hover:underline text-purple-400 dark:text-pink-400">
      <i class="fab fa-telegram-plane mr-2"></i> Join Telegram Community
    </a>
  </footer>
</div>
<!-- Telegram Popup with motivating quote -->
<div id="telegram-popup" class="fixed inset-0 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="popup-title" aria-describedby="popup-desc" style="display:none;">
  <div id="popup-content" class="text-center">
    <h3 id="popup-title" class="text-3xl font-extrabold text-white mb-4">Join Our Community! 🎉</h3>
    <p id="popup-desc" class="text-white/80 mb-6 px-6">Stay updated with the latest classes, notes, and announcements in our vibrant learning group.</p>
    <p id="popup-quote" class="italic">💡 "Together we grow stronger and smarter."</p>
    <div class="flex flex-col gap-4 px-8 mt-4">
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
  const htmlEl = document.documentElement;
  let activeTab = sessionStorage.getItem('activeTab') || 'live';
  let themePref = localStorage.getItem('theme');
  if (!themePref) { htmlEl.classList.remove('light'); htmlEl.classList.add('dark'); themePref = 'dark'; }
  else if (themePref === 'light') { htmlEl.classList.add('light'); htmlEl.classList.remove('dark'); }
  else { htmlEl.classList.add('dark'); htmlEl.classList.remove('light'); }
  function updateThemeButton() {
    themeIcon.className = htmlEl.classList.contains('light') ? 'fas fa-sun' : 'fas fa-moon';
  }
  updateThemeButton();
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
        card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.3s, transform 0.3s';
          card.style.opacity = '1'; card.style.transform = 'translateY(0)';
        }, 100);
        shownCount++;
      } else card.style.display = 'none';
    });
    emptyState.style.display = shownCount === 0 ? 'block' : 'none';
    if (emptyState.style.display === 'block') {
      let message = '';
      switch (activeTab) {
        case 'live': message = '<h3>No Live Lectures Now</h3><p>Keep your curiosity alive — new classes could arrive anytime! 🚀</p>'; break;
        case 'up': message = '<h3>No Upcoming Lectures Scheduled</h3><p>Stay tuned for all new batches — your journey continues! 🎯</p>'; break;
        case 'completed': message = '<h3>No Recorded Lectures Found</h3><p>Keep learning today for success tomorrow.</p>'; break;
        default: message = '<h3>No Lectures Found</h3><p>Try adjusting filters or check back later.</p>';
      }
      emptyState.innerHTML = message;
    }
  }
  function showTab(tabId) {
    activeTab = tabId; sessionStorage.setItem('activeTab', activeTab);
    tabs.forEach(t => {
      const isActive = t.id === 'tab-' + tabId;
      t.classList.toggle('active', isActive); t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    panels.forEach(p => {const isVisible = p.id === activeTab + '-content';p.classList.toggle('hidden', !isVisible); p.setAttribute('aria-hidden', !isVisible);});
    filterCards();
  }
  tabs.forEach(tab => {tab.addEventListener('click', () => {!tab.classList.contains('active') && showTab(tab.id.replace('tab-',''));});});
  batchFilter.addEventListener('change', filterCards);
  toggleThemeBtn.addEventListener('click', () => {
    if (htmlEl.classList.contains('light')) { htmlEl.classList.remove('light'); htmlEl.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { htmlEl.classList.add('light'); htmlEl.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
    updateThemeButton();
  });
  function popupShouldShow() {return sessionStorage.getItem('popupDismissed') === null;}
  function closePopup(storeDismiss=true) {telegramPopup.style.display = 'none'; if (storeDismiss) sessionStorage.setItem('popupDismissed','1');}
  if (popupShouldShow()) {setTimeout(() => {telegramPopup.style.display='flex';}, 1500);}
  closePopupBtn.addEventListener('click', () => closePopup(true));
  joinTgBtn.addEventListener('click', () => closePopup(true));
  showTab(activeTab);
  setTimeout(() => window.location.reload(), 60000);
})();
</script>
</body>
</html>`;

// Utility: Replace branding
const textReplacer = (text) => typeof text !== 'string' ? text : text.replace(/rolexcoderz/gi,'studysmarterz').replace(/rolex/gi,'study').replace(/coderz/gi,'smarter');

// Data API loader
const fetchApiData = async (endpoint) => {
  const url = `https://api.rolexcoderz.live/${endpoint}`;
  try {
    const response = await fetch(url, {timeout: 10000});
    if (!response.ok) return [];
    const json = await response.json();
    return json.data || [];
  } catch { return []; }
};
const lectureColors=[
  'bg-gradient-to-r from-pink-400 to-yellow-400 text-yellow-900',
  'bg-gradient-to-r from-green-400 to-blue-500 text-white',
  'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white',
  'bg-gradient-to-r from-indigo-400 to-blue-400 text-white',
  'bg-gradient-to-r from-teal-400 to-cyan-400 text-cyan-900',
  'bg-gradient-to-r from-yellow-300 to-red-400 text-red-900',
];
const iconMap={live:'🔥',up:'⏰',completed:'📚'};
const getRandomColorClass = (index) => lectureColors[index % lectureColors.length];
const renderLectureCards = (data,type) => !data||data.length===0 ? '' : data.map((item,idx) => {
  const title=textReplacer(item.title),batch=textReplacer(item.batch),colorClass=getRandomColorClass(idx);
  let imageHtml='',isImageValid=false;
  if(item.image)try{const imageUrl=new URL(item.image);
  if(imageUrl.hostname.endsWith('cloudfront.net')){
    isImageValid=true;
    imageHtml=`
    <div class="image-wrapper">
      <img src="${item.image}" alt="${title}" loading="lazy"
        onerror="this.onerror=null; this.parentElement.innerHTML = '<div class=\\'p-12 font-bold text-center text-xl rounded-xl bg-gray-200 dark:bg-gray-700\\'>${title}</div>';">
      </div>`;
  }}catch{}
  if(!isImageValid)imageHtml=`<div class="image-wrapper p-12 font-bold text-center text-xl rounded-xl bg-gray-200 dark:bg-gray-700">${title}</div>`;
  let finalLink=null;
  if(item.link)try{
    const linkUrl=new URL(item.link);
    const playerUrlParam=linkUrl.searchParams.get('url');
    if(playerUrlParam){
      const cdnUrl=new URL(playerUrlParam);
      if(cdnUrl.hostname.endsWith('cloudfront.net'))
        finalLink=`https://studysmarterx.netlify.app/player/?url=${encodeURIComponent(playerUrlParam)}`;
    }}catch{}
  return `
    <a href="${finalLink||'#'}" target="${finalLink?'_blank':'_self'}" rel="noopener noreferrer" class="lecture-card relative group ${colorClass}" data-batch="${item.batch}">
      ${imageHtml}
      <div class="p-6">
        <h3 class="font-extrabold text-xl mb-2">${title}</h3>
        <div class="font-semibold mb-4">${batch}</div>
        <div class="tap-to-watch absolute left-1/2 bottom-6 -translate-x-1/2 cursor-pointer transition-opacity duration-300 opacity-0 group-hover:opacity-100">Tap to Watch</div>
        <span class="absolute top-4 right-5 text-3xl select-none">${iconMap[type]||'🎓'}</span>
      </div>
    </a>`;
}).join('');
const renderNotifications = n => !n||!n.length ? `<div class="flex flex-col items-center justify-center p-10 text-center text-gray-500 dark:text-gray-400 space-y-3 animate-fadein"><svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg><p class="text-xl font-semibold">No New Notifications</p><p class="text-sm italic">You're all caught up!</p></div>` : n.map(notif=>{
  const title=textReplacer(notif.title),message=textReplacer(notif.message);
  return`<div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"><p class="font-bold text-gray-900 dark:text-gray-100">${title}</p><p class="mt-1 text-gray-700 dark:text-gray-300">${message}</p></div>`;
}).join('');
const renderBatchOptions = (live,up,completed) => {
  const all=[...live,...up,...completed],
        batches=['all',...new Set(all.map(item=>item.batch))];
  return batches.map(b=> `<option value="${b}" class="capitalize">${b==='all'?'All Batches':textReplacer(b)}</option>`).join('')
}
const buildFullHtmlPage = (live, up, completed, notifications) => {
  return cachedHtml.replace('${liveCards}', renderLectureCards(live,'live'))
    .replace('${upCards}', renderLectureCards(up,'up'))
    .replace('${completedCards}', renderLectureCards(completed,'completed'))
    .replace('${notificationItems}', renderNotifications(notifications))
    .replace('${batchOptions}',renderBatchOptions(live,up,completed))
    .replace(/\${new Date\(\)\.getFullYear\(\)}/g, new Date().getFullYear());
};
// Cache refresh
const updateCache = async () => {
  try {
    const [live,up,completed,notifications]=await Promise.all([
      fetchApiData('Live/?get=live'),
      fetchApiData('Live/?get=up'),
      fetchApiData('Live/?get=completed'),
      fetchApiData('Live/?get=notifications')
    ]);
    cachedHtml=buildFullHtmlPage(live,up,completed,notifications);
  } catch {}
};
// Express
app.get('/', (req, res) => res.send(cachedHtml));
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  updateCache(); setInterval(updateCache,60000);
});
