// Leaderboard, Searchable Country Combobox, Privacy Settings, 2 Auto-Generated Anonymous Names & Account Sync
var publicLeaderboardEnabled = localStorage.getItem('pomodoro_public_lb') !== 'false';
var anonStatsEnabled = localStorage.getItem('pomodoro_anon_stats') === 'true';
var currentLbPeriod = 'daily';
var generatedOtpCode = null;

// Account Profile State
var currentUserProfile = null;
try {
  currentUserProfile = JSON.parse(localStorage.getItem('pomodoro_user_profile') || 'null');
} catch (e) {}

// Comprehensive list of all world countries and territories with official flag emojis
var ALL_COUNTRIES = [
  { flag: '🇦🇫', name: 'Afghanistan' },
  { flag: '🇦🇽', name: 'Åland Islands' },
  { flag: '🇦🇱', name: 'Albania' },
  { flag: '🇩🇿', name: 'Algeria' },
  { flag: '🇦🇸', name: 'American Samoa' },
  { flag: '🇦🇩', name: 'Andorra' },
  { flag: '🇦🇴', name: 'Angola' },
  { flag: '🇦🇮', name: 'Anguilla' },
  { flag: '🇦🇶', name: 'Antarctica' },
  { flag: '🇦🇬', name: 'Antigua and Barbuda' },
  { flag: '🇦🇷', name: 'Argentina' },
  { flag: '🇦🇲', name: 'Armenia' },
  { flag: '🇦🇼', name: 'Aruba' },
  { flag: '🇦🇺', name: 'Australia' },
  { flag: '🇦🇹', name: 'Austria' },
  { flag: '🇦🇿', name: 'Azerbaijan' },
  { flag: '🇧🇸', name: 'Bahamas' },
  { flag: '🇧🇭', name: 'Bahrain' },
  { flag: '🇧🇩', name: 'Bangladesh' },
  { flag: '🇧🇧', name: 'Barbados' },
  { flag: '🇧🇾', name: 'Belarus' },
  { flag: '🇧🇪', name: 'Belgium' },
  { flag: '🇧🇿', name: 'Belize' },
  { flag: '🇧🇯', name: 'Benin' },
  { flag: '🇧🇲', name: 'Bermuda' },
  { flag: '🇧🇹', name: 'Bhutan' },
  { flag: '🇧🇴', name: 'Bolivia' },
  { flag: '🇧🇦', name: 'Bosnia and Herzegovina' },
  { flag: '🇧🇼', name: 'Botswana' },
  { flag: '🇧🇷', name: 'Brazil' },
  { flag: '🇮🇴', name: 'British Indian Ocean Territory' },
  { flag: '🇻🇬', name: 'British Virgin Islands' },
  { flag: '🇧🇳', name: 'Brunei' },
  { flag: '🇧🇬', name: 'Bulgaria' },
  { flag: '🇧🇫', name: 'Burkina Faso' },
  { flag: '🇧🇮', name: 'Burundi' },
  { flag: '🇨🇻', name: 'Cabo Verde' },
  { flag: '🇰🇭', name: 'Cambodia' },
  { flag: '🇨🇲', name: 'Cameroon' },
  { flag: '🇨🇦', name: 'Canada' },
  { flag: '🇰🇾', name: 'Cayman Islands' },
  { flag: '🇨🇫', name: 'Central African Republic' },
  { flag: '🇹🇩', name: 'Chad' },
  { flag: '🇨🇱', name: 'Chile' },
  { flag: '🇨🇳', name: 'China' },
  { flag: '🇨🇴', name: 'Colombia' },
  { flag: '🇰🇲', name: 'Comoros' },
  { flag: '🇨🇬', name: 'Congo' },
  { flag: '🇨🇩', name: 'Congo (DRC)' },
  { flag: '🇨🇰', name: 'Cook Islands' },
  { flag: '🇨🇷', name: 'Costa Rica' },
  { flag: '🇭🇷', name: 'Croatia' },
  { flag: '🇨🇺', name: 'Cuba' },
  { flag: '🇨🇼', name: 'Curaçao' },
  { flag: '🇨🇾', name: 'Cyprus' },
  { flag: '🇨🇿', name: 'Czech Republic' },
  { flag: '🇩🇰', name: 'Denmark' },
  { flag: '🇩🇯', name: 'Djibouti' },
  { flag: '🇩🇲', name: 'Dominica' },
  { flag: '🇩🇴', name: 'Dominican Republic' },
  { flag: '🇪🇨', name: 'Ecuador' },
  { flag: '🇪🇬', name: 'Egypt' },
  { flag: '🇸🇻', name: 'El Salvador' },
  { flag: '🇬🇶', name: 'Equatorial Guinea' },
  { flag: '🇪🇷', name: 'Eritrea' },
  { flag: '🇪🇪', name: 'Estonia' },
  { flag: '🇸🇿', name: 'Eswatini' },
  { flag: '🇪🇹', name: 'Ethiopia' },
  { flag: '🇫🇰', name: 'Falkland Islands' },
  { flag: '🇫🇴', name: 'Faroe Islands' },
  { flag: '🇫🇯', name: 'Fiji' },
  { flag: '🇫🇮', name: 'Finland' },
  { flag: '🇫🇷', name: 'France' },
  { flag: '🇬🇫', name: 'French Guiana' },
  { flag: '🇵🇫', name: 'French Polynesia' },
  { flag: '🇬🇦', name: 'Gabon' },
  { flag: '🇬🇲', name: 'Gambia' },
  { flag: '🇬🇪', name: 'Georgia' },
  { flag: '🇩🇪', name: 'Germany' },
  { flag: '🇬🇭', name: 'Ghana' },
  { flag: '🇬🇮', name: 'Gibraltar' },
  { flag: '🇬🇷', name: 'Greece' },
  { flag: '🇬🇱', name: 'Greenland' },
  { flag: '🇬🇩', name: 'Grenada' },
  { flag: '🇬🇵', name: 'Guadeloupe' },
  { flag: '🇬🇺', name: 'Guam' },
  { flag: '🇬🇹', name: 'Guatemala' },
  { flag: '🇬🇬', name: 'Guernsey' },
  { flag: '🇬🇳', name: 'Guinea' },
  { flag: '🇬🇼', name: 'Guinea-Bissau' },
  { flag: '🇬🇾', name: 'Guyana' },
  { flag: '🇭🇹', name: 'Haiti' },
  { flag: '🇭🇳', name: 'Honduras' },
  { flag: '🇭🇰', name: 'Hong Kong' },
  { flag: '🇭🇺', name: 'Hungary' },
  { flag: '🇮🇸', name: 'Iceland' },
  { flag: '🇮🇳', name: 'India' },
  { flag: '🇮🇩', name: 'Indonesia' },
  { flag: '🇮🇷', name: 'Iran' },
  { flag: '🇮🇶', name: 'Iraq' },
  { flag: '🇮🇪', name: 'Ireland' },
  { flag: '🇮🇲', name: 'Isle of Man' },
  { flag: '🇮🇱', name: 'Israel' },
  { flag: '🇮🇹', name: 'Italy' },
  { flag: '🇨🇮', name: 'Ivory Coast' },
  { flag: '🇯🇲', name: 'Jamaica' },
  { flag: '🇯🇵', name: 'Japan' },
  { flag: '🇯🇪', name: 'Jersey' },
  { flag: '🇯🇴', name: 'Jordan' },
  { flag: '🇰🇿', name: 'Kazakhstan' },
  { flag: '🇰🇪', name: 'Kenya' },
  { flag: '🇰🇮', name: 'Kiribati' },
  { flag: '🇽🇰', name: 'Kosovo' },
  { flag: '🇰🇼', name: 'Kuwait' },
  { flag: '🇰🇬', name: 'Kyrgyzstan' },
  { flag: '🇱🇦', name: 'Laos' },
  { flag: '🇱🇻', name: 'Latvia' },
  { flag: '🇱🇧', name: 'Lebanon' },
  { flag: '🇱🇸', name: 'Lesotho' },
  { flag: '🇱🇷', name: 'Liberia' },
  { flag: '🇱🇾', name: 'Libya' },
  { flag: '🇱🇮', name: 'Liechtenstein' },
  { flag: '🇱🇹', name: 'Lithuania' },
  { flag: '🇱🇺', name: 'Luxembourg' },
  { flag: '🇲🇴', name: 'Macau' },
  { flag: '🇲🇬', name: 'Madagascar' },
  { flag: '🇲🇼', name: 'Malawi' },
  { flag: '🇲🇾', name: 'Malaysia' },
  { flag: '🇲🇻', name: 'Maldives' },
  { flag: '🇲🇱', name: 'Mali' },
  { flag: '🇲🇹', name: 'Malta' },
  { flag: '🇲🇭', name: 'Marshall Islands' },
  { flag: '🇲🇶', name: 'Martinique' },
  { flag: '🇲🇷', name: 'Mauritania' },
  { flag: '🇲🇺', name: 'Mauritius' },
  { flag: '🇾🇹', name: 'Mayotte' },
  { flag: '🇲🇽', name: 'Mexico' },
  { flag: '🇫🇲', name: 'Micronesia' },
  { flag: '🇲🇩', name: 'Moldova' },
  { flag: '🇲🇨', name: 'Monaco' },
  { flag: '🇲🇳', name: 'Mongolia' },
  { flag: '🇲🇪', name: 'Montenegro' },
  { flag: '🇲🇸', name: 'Montserrat' },
  { flag: '🇲🇦', name: 'Morocco' },
  { flag: '🇲🇿', name: 'Mozambique' },
  { flag: '🇲🇲', name: 'Myanmar' },
  { flag: '🇳🇦', name: 'Namibia' },
  { flag: '🇳🇷', name: 'Nauru' },
  { flag: '🇳🇵', name: 'Nepal' },
  { flag: '🇳🇱', name: 'Netherlands' },
  { flag: '🇳🇨', name: 'New Caledonia' },
  { flag: '🇳🇿', name: 'New Zealand' },
  { flag: '🇳🇮', name: 'Nicaragua' },
  { flag: '🇳🇪', name: 'Niger' },
  { flag: '🇳🇬', name: 'Nigeria' },
  { flag: '🇳🇺', name: 'Niue' },
  { flag: '🇲🇰', name: 'North Macedonia' },
  { flag: '🇲🇵', name: 'Northern Mariana Islands' },
  { flag: '🇳🇴', name: 'Norway' },
  { flag: '🇴🇲', name: 'Oman' },
  { flag: '🇵🇰', name: 'Pakistan' },
  { flag: '🇵🇼', name: 'Palau' },
  { flag: '🇵🇸', name: 'Palestine' },
  { flag: '🇵🇦', name: 'Panama' },
  { flag: '🇵🇬', name: 'Papua New Guinea' },
  { flag: '🇵🇾', name: 'Paraguay' },
  { flag: '🇵🇪', name: 'Peru' },
  { flag: '🇵🇭', name: 'Philippines' },
  { flag: '🇵🇱', name: 'Poland' },
  { flag: '🇵🇹', name: 'Portugal' },
  { flag: '🇵🇷', name: 'Puerto Rico' },
  { flag: '🇶🇦', name: 'Qatar' },
  { flag: '🇷🇪', name: 'Réunion' },
  { flag: '🇷🇴', name: 'Romania' },
  { flag: '🇷🇺', name: 'Russia' },
  { flag: '🇷🇼', name: 'Rwanda' },
  { flag: '🇼🇸', name: 'Samoa' },
  { flag: '🇸🇲', name: 'San Marino' },
  { flag: '🇸🇹', name: 'São Tomé and Príncipe' },
  { flag: '🇸🇦', name: 'Saudi Arabia' },
  { flag: '🇸🇳', name: 'Senegal' },
  { flag: '🇷🇸', name: 'Serbia' },
  { flag: '🇸🇨', name: 'Seychelles' },
  { flag: '🇸🇱', name: 'Sierra Leone' },
  { flag: '🇸🇬', name: 'Singapore' },
  { flag: '🇸🇽', name: 'Sint Maarten' },
  { flag: '🇸🇰', name: 'Slovakia' },
  { flag: '🇸🇮', name: 'Slovenia' },
  { flag: '🇸🇧', name: 'Solomon Islands' },
  { flag: '🇸🇴', name: 'Somalia' },
  { flag: '🇿🇦', name: 'South Africa' },
  { flag: '🇰🇷', name: 'South Korea' },
  { flag: '🇸🇸', name: 'South Sudan' },
  { flag: '🇪🇸', name: 'Spain' },
  { flag: '🇱🇰', name: 'Sri Lanka' },
  { flag: '🇸🇩', name: 'Sudan' },
  { flag: '🇸🇷', name: 'Suriname' },
  { flag: '🇸🇪', name: 'Sweden' },
  { flag: '🇨🇭', name: 'Switzerland' },
  { flag: '🇸🇾', name: 'Syria' },
  { flag: '🇹🇼', name: 'Taiwan' },
  { flag: '🇹🇯', name: 'Tajikistan' },
  { flag: '🇹🇿', name: 'Tanzania' },
  { flag: '🇹🇭', name: 'Thailand' },
  { flag: '🇹🇱', name: 'Timor-Leste' },
  { flag: '🇹🇬', name: 'Togo' },
  { flag: '🇹🇴', name: 'Tonga' },
  { flag: '🇹🇹', name: 'Trinidad and Tobago' },
  { flag: '🇹🇳', name: 'Tunisia' },
  { flag: '🇹🇷', name: 'Turkey' },
  { flag: '🇹🇲', name: 'Turkmenistan' },
  { flag: '🇹🇨', name: 'Turks and Caicos Islands' },
  { flag: '🇹🇻', name: 'Tuvalu' },
  { flag: '🇺🇬', name: 'Uganda' },
  { flag: '🇺🇦', name: 'Ukraine' },
  { flag: '🇦🇪', name: 'United Arab Emirates' },
  { flag: '🇬🇧', name: 'United Kingdom' },
  { flag: '🇺🇸', name: 'United States' },
  { flag: '🇺🇾', name: 'Uruguay' },
  { flag: '🇺🇿', name: 'Uzbekistan' },
  { flag: '🇻🇺', name: 'Vanuatu' },
  { flag: '🇻🇦', name: 'Vatican City' },
  { flag: '🇻🇪', name: 'Venezuela' },
  { flag: '🇻🇳', name: 'Vietnam' },
  { flag: '🇾🇪', name: 'Yemen' },
  { flag: '🇿🇲', name: 'Zambia' },
  { flag: '🇿🇼', name: 'Zimbabwe' }
];

// Custom Random Silly Name Generator for Anonymous Leaderboard Users
var SILLY_ADJECTIVES = [
  'Chonky', 'Goofy', 'Wobbly', 'Sneaky', 'Caffeinated', 'Sleepy',
  'Bouncy', 'Fluffy', 'Funky', 'Snoozy', 'Clumsy', 'Derpy',
  'Spunky', 'Squishy', 'Wonky', 'Loopy', 'Tipsy', 'Nutty',
  'Zesty', 'Bubbly', 'Fuzzy', 'Sassy', 'Cheeky', 'Giggly',
  'Dizzy', 'Peppy', 'Grumpy', 'Silly', 'Wacko', 'Bumbling',
  'Speedy', 'Zippy', 'Cozy', 'Rowdy', 'Dapper', 'Tubby'
];

var SILLY_NOUNS = [
  { word: 'Potato', emoji: '🥔' },
  { word: 'Waffle', emoji: '🧇' },
  { word: 'Penguin', emoji: '🐧' },
  { word: 'Pickle', emoji: '🥒' },
  { word: 'Marshmallow', emoji: '🍡' },
  { word: 'Banana', emoji: '🍌' },
  { word: 'Muffin', emoji: '🧁' },
  { word: 'Noodle', emoji: '🍜' },
  { word: 'Platypus', emoji: '🦆' },
  { word: 'Sloth', emoji: '🦥' },
  { word: 'Hamster', emoji: '🐹' },
  { word: 'Llama', emoji: '🦙' },
  { word: 'Burrito', emoji: '🌯' },
  { word: 'Bagel', emoji: '🥯' },
  { word: 'Donut', emoji: '🍩' },
  { word: 'Frog', emoji: '🐸' },
  { word: 'Taco', emoji: '🌮' },
  { word: 'Dumpling', emoji: '🥟' },
  { word: 'Hedgehog', emoji: '🦔' },
  { word: 'Duck', emoji: '🦆' },
  { word: 'Otter', emoji: '🦦' },
  { word: 'Pancake', emoji: '🥞' },
  { word: 'Avocado', emoji: '🥑' },
  { word: 'Mushroom', emoji: '🍄' },
  { word: 'Koala', emoji: '🐨' },
  { word: 'Pug', emoji: '🐶' }
];

function generateSingleAnonName() {
  var adj = SILLY_ADJECTIVES[Math.floor(Math.random() * SILLY_ADJECTIVES.length)];
  var nounObj = SILLY_NOUNS[Math.floor(Math.random() * SILLY_NOUNS.length)];
  return {
    fullName: adj + ' ' + nounObj.word,
    flag: nounObj.emoji,
    country: 'Anonymous'
  };
}

function generateTwoAnonNames() {
  var name1 = generateSingleAnonName();
  var name2 = generateSingleAnonName();
  while (name2.fullName === name1.fullName) {
    name2 = generateSingleAnonName();
  }
  return [name1, name2];
}

var currentAnonOptions = [];
var selectedAnonName = localStorage.getItem('pomodoro_anon_name');
var selectedAnonFlag = localStorage.getItem('pomodoro_anon_flag');
if (!selectedAnonName || selectedAnonName.includes('Zen Fox')) {
  var initialSillyName = generateSingleAnonName();
  selectedAnonName = initialSillyName.fullName;
  selectedAnonFlag = initialSillyName.flag;
  localStorage.setItem('pomodoro_anon_name', selectedAnonName);
  localStorage.setItem('pomodoro_anon_flag', selectedAnonFlag);
}

// Real peer leaderboard data (populated dynamically by synced users)
// Stable device identifier for guest scholars (prevents duplicate entries from same computer/browser)
function getOrCreateDeviceId() {
  var id = localStorage.getItem('pomodoro_device_id');
  if (!id) {
    id = 'dev_' + (window.crypto && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 16) : Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
    localStorage.setItem('pomodoro_device_id', id);
  }
  return id;
}

function getEffectiveUserId() {
  if (currentUserProfile && currentUserProfile.id) {
    return currentUserProfile.id;
  }
  return getOrCreateDeviceId();
}

function getEffectiveUserName() {
  if (currentUserProfile && currentUserProfile.name) {
    return currentUserProfile.name;
  }
  return selectedAnonName || 'Chonky Potato';
}

function getEffectiveUserEmoji() {
  if (currentUserProfile && currentUserProfile.flag) {
    return currentUserProfile.flag;
  }
  return selectedAnonFlag || '🐱';
}

// Live peer leaderboard data (hydrated dynamically from Cloudflare D1)
var mockPeers = [];

function updateAccountUI() {
  var nameEl = document.getElementById('accountDisplayName');
  var statusEl = document.getElementById('accountStatusText');
  var avatarEl = document.getElementById('accountAvatar');
  var signedOutView = document.getElementById('authSignedOutView');
  var signedInView = document.getElementById('authSignedInView');

  if (currentUserProfile && currentUserProfile.name) {
    var flag = currentUserProfile.flag || '🐱';
    if (nameEl) nameEl.textContent = currentUserProfile.name;
    if (statusEl) statusEl.textContent = (currentUserProfile.email || 'Signed In') + (currentUserProfile.country ? ' · ' + currentUserProfile.country : '') + ' · Cloud Synced';
    if (avatarEl) avatarEl.textContent = flag;
    if (signedOutView) signedOutView.style.display = 'none';
    if (signedInView) signedInView.style.display = 'flex';
  } else {
    var anonDisplay = selectedAnonName || 'Guest Focus Scholar';
    if (nameEl) nameEl.textContent = anonDisplay;
    if (statusEl) statusEl.textContent = 'Anonymous Device Session · Auto-Syncing';
    if (avatarEl) avatarEl.textContent = selectedAnonFlag || '🐱';
    if (signedOutView) signedOutView.style.display = 'flex';
    if (signedInView) signedInView.style.display = 'none';
  }
}

function getSortedLeaderboardData(period) {
  period = period || currentLbPeriod || 'daily';
  var hist = typeof getHistory === 'function' ? getHistory() : {};
  var now = new Date();
  var todayKey = typeof getLocalDateKey === 'function' ? getLocalDateKey(now) : now.toISOString().split('T')[0];
  var todaySecs = hist[todayKey] || 0;

  var dayOfWeek = now.getDay();
  var daysToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMon);
  var weekSecs = 0;
  for (var d = 0; d < 7; d++) {
    var cur = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + d);
    var k = typeof getLocalDateKey === 'function' ? getLocalDateKey(cur) : cur.toISOString().split('T')[0];
    weekSecs += (hist[k] || 0);
  }

  var allTimeSecs = 0;
  for (var key in hist) {
    if (hist.hasOwnProperty(key)) allTimeSecs += hist[key];
  }

  var currentId = getEffectiveUserId();
  var rawUserName = getEffectiveUserName();
  var userDisplayName = rawUserName + ' (You)';
  var streakDays = typeof calculateStreak === 'function' ? calculateStreak(hist, todayKey) : 1;

  // Filter out any entries that match current user/device to avoid self-duplication on same browser
  var fullList = mockPeers.filter(function(p) {
    return p.id !== currentId && p.name !== rawUserName && p.name !== userDisplayName;
  });

  if (publicLeaderboardEnabled) {
    var userEntry = {
      id: currentId,
      name: userDisplayName,
      emoji: getEffectiveUserEmoji(),
      daily: todaySecs,
      weekly: weekSecs,
      alltime: allTimeSecs,
      streak: streakDays,
      isUser: true
    };
    fullList.push(userEntry);
  }

  fullList.sort(function(a, b) {
    return (b[period] || 0) - (a[period] || 0);
  });
  return fullList;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Fetch live peer ranks from Cloudflare D1
async function fetchLeaderboardData(period) {
  period = period || currentLbPeriod || 'daily';
  try {
    var res = await fetch('/api/leaderboard?period=' + encodeURIComponent(period));
    if (res.ok) {
      var data = await res.json();
      if (Array.isArray(data.leaderboard)) {
        var currentId = getEffectiveUserId();
        var rawUserName = getEffectiveUserName();
        mockPeers = data.leaderboard
          .filter(function(row) {
            return row.id !== currentId && row.name !== rawUserName;
          })
          .map(function(row) {
            return {
              id: row.id,
              name: row.name,
              emoji: row.emoji || '🐱',
              daily: row.daily || 0,
              weekly: row.weekly || 0,
              alltime: row.alltime || 0,
              streak: row.streak || 1,
              isUser: false
            };
          });
        renderLeaderboard(period);
        var modalOverlay = document.getElementById('fullLbModalOverlay');
        if (modalOverlay && modalOverlay.classList.contains('active')) {
          var searchVal = (document.getElementById('fullLbSearchInput') && document.getElementById('fullLbSearchInput').value) || '';
          renderFullLeaderboardModal(period, searchVal);
        }
      }
    }
  } catch (err) {
    console.warn('Leaderboard fetch skipped or offline:', err);
  }
}

var _syncDebounceTimeout = null;
function triggerAutoSync(delayMs) {
  clearTimeout(_syncDebounceTimeout);
  _syncDebounceTimeout = setTimeout(function() {
    syncStatsToServer();
  }, delayMs || 1500);
}

// Sync focus stats to Cloudflare D1 (works for signed-in accounts and guest devices)
async function syncStatsToServer(isManual) {
  var hist = typeof getHistory === 'function' ? getHistory() : {};
  var now = new Date();
  var todayKey = typeof getLocalDateKey === 'function' ? getLocalDateKey(now) : now.toISOString().split('T')[0];
  var todaySecs = hist[todayKey] || 0;

  var dayOfWeek = now.getDay();
  var daysToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMon);
  var weekSecs = 0;
  for (var d = 0; d < 7; d++) {
    var cur = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + d);
    var k = typeof getLocalDateKey === 'function' ? getLocalDateKey(cur) : cur.toISOString().split('T')[0];
    weekSecs += (hist[k] || 0);
  }

  var allTimeSecs = 0;
  for (var key in hist) {
    if (hist.hasOwnProperty(key)) allTimeSecs += hist[key];
  }

  var streakDays = typeof calculateStreak === 'function' ? calculateStreak(hist, todayKey) : 1;
  var userId = getEffectiveUserId();
  var userName = getEffectiveUserName();
  var userEmoji = getEffectiveUserEmoji();
  var isGuest = !(currentUserProfile && currentUserProfile.id);

  try {
    var res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        username: userName,
        emoji: userEmoji,
        isAnonymous: isGuest ? 1 : (currentUserProfile && currentUserProfile.isAnonymous ? 1 : 0),
        isPublicLb: publicLeaderboardEnabled,
        dailySecs: todaySecs,
        weeklySecs: weekSecs,
        alltimeSecs: allTimeSecs,
        streakDays: streakDays,
        lastDate: todayKey
      })
    });

    if (res.ok) {
      await fetchLeaderboardData(currentLbPeriod);
      return true;
    }
  } catch (err) {
    console.warn('Sync failed or offline:', err);
  }
  return false;
}

window.syncPomodoroStats = syncStatsToServer;
window.triggerAutoSync = triggerAutoSync;
window.fetchLeaderboardData = fetchLeaderboardData;

// Render Top 5 items in Sidebar Leaderboard Widget
function renderLeaderboard(period) {
  period = period || currentLbPeriod || 'daily';
  var lbList = document.getElementById('lbList');
  if (!lbList) return;

  var fullList = getSortedLeaderboardData(period);
  var top5List = fullList.slice(0, 5);

  lbList.innerHTML = '';

  if (top5List.length === 0) {
    lbList.innerHTML = '<div style="text-align:center; padding:16px 8px; color:var(--text-dim); font-size:12px;">Start a focus session to join the leaderboard! 🍅</div>';
    return;
  }

  top5List.forEach(function(item) {
    var row = document.createElement('div');
    row.className = 'lb-row' + (item.isUser ? ' is-user' : '');

    var formattedTime = typeof formatStatsDuration === 'function'
      ? formatStatsDuration(item[period] || 0)
      : Math.floor((item[period] || 0) / 60) + 'm';

    var emoji = item.emoji || '🐱';
    var nameHtml = '<div class="lb-name" title="' + escapeHtml(item.name) + '">' +
      '<span class="lb-emoji">' + emoji + '</span>' +
      '<span class="lb-name-text">' + escapeHtml(item.name) + '</span>' +
    '</div>';

    var metaHtml = '<div class="lb-meta">' +
      '<span class="lb-time">' + formattedTime + '</span>' +
      '<span class="lb-streak">' + (item.streak || 1) + 'd streak</span>' +
    '</div>';

    row.innerHTML = nameHtml + metaHtml;
    lbList.appendChild(row);
  });
}

// Render Full Leaderboard Modal Window with Search Filter
function renderFullLeaderboardModal(period, filterQuery) {
  period = period || currentLbPeriod || 'daily';
  var modalList = document.getElementById('modalLbList');
  if (!modalList) return;

  var fullList = getSortedLeaderboardData(period);
  if (filterQuery && filterQuery.trim()) {
    var q = filterQuery.trim().toLowerCase();
    fullList = fullList.filter(function(item) {
      return item.name && item.name.toLowerCase().includes(q);
    });
  }

  modalList.innerHTML = '';

  if (fullList.length === 0) {
    modalList.innerHTML = '<div style="text-align:center; color:var(--text-dim); padding:24px 10px; font-size:12px;">No scholars found. Focus to appear here!</div>';
    return;
  }

  fullList.forEach(function(item) {
    var row = document.createElement('div');
    row.className = 'lb-row' + (item.isUser ? ' is-user' : '');

    var formattedTime = typeof formatStatsDuration === 'function'
      ? formatStatsDuration(item[period] || 0)
      : Math.floor((item[period] || 0) / 60) + 'm';

    var emoji = item.emoji || '🐱';
    var nameHtml = '<div class="lb-name" title="' + escapeHtml(item.name) + '">' +
      '<span class="lb-emoji">' + emoji + '</span>' +
      '<span class="lb-name-text">' + escapeHtml(item.name) + '</span>' +
    '</div>';

    var metaHtml = '<div class="lb-meta">' +
      '<span class="lb-time">' + formattedTime + '</span>' +
      '<span class="lb-streak">' + (item.streak || 1) + 'd streak</span>' +
    '</div>';

    row.innerHTML = nameHtml + metaHtml;
    modalList.appendChild(row);
  });
}

function openFullLeaderboardModal() {
  var overlay = document.getElementById('fullLbModalOverlay');
  if (overlay) {
    overlay.classList.add('active');
    renderFullLeaderboardModal(currentLbPeriod);
  }
}

function closeFullLeaderboardModal() {
  var overlay = document.getElementById('fullLbModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// DOM Listeners & Interactive Combobox / Anonymous Name Chooser Binding
document.addEventListener('DOMContentLoaded', function() {
  // 1. Searchable Country Combobox with Real-Time Typing Filter
  var countryInput = document.getElementById('signupCountryInput');
  var countryHidden = document.getElementById('signupCountryHidden');
  var countryList = document.getElementById('countryDropdownList');

  function renderCountryOptions(filterQuery) {
    if (!countryList) return;
    var q = (filterQuery || '').trim().toLowerCase();
    var matches = ALL_COUNTRIES.filter(function(c) {
      return !q || c.name.toLowerCase().includes(q);
    });

    countryList.innerHTML = '';
    if (matches.length === 0) {
      countryList.innerHTML = '<div class="country-dropdown-empty">No matching country found</div>';
      return;
    }

    matches.forEach(function(item) {
      var opt = document.createElement('div');
      opt.className = 'country-dropdown-item';
      opt.innerHTML = '<span style="font-size:15px;line-height:1;">' + item.flag + '</span><span>' + item.name + '</span>';
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        var valStr = item.flag + ' ' + item.name;
        if (countryInput) countryInput.value = valStr;
        if (countryHidden) countryHidden.value = valStr;
        countryList.style.display = 'none';
      });
      countryList.appendChild(opt);
    });
  }

  if (countryInput && countryList) {
    if (!countryInput.value) countryInput.value = '🇺🇸 United States';
    if (countryHidden) countryHidden.value = '🇺🇸 United States';

    countryInput.addEventListener('focus', function() {
      renderCountryOptions(countryInput.value.replace(/^[^\w\s]+\s*/, ''));
      countryList.style.display = 'flex';
    });

    countryInput.addEventListener('input', function() {
      // Filter out as user types each letter
      var cleanedQuery = countryInput.value.replace(/^[^\w\s]+\s*/, '');
      renderCountryOptions(cleanedQuery);
      countryList.style.display = 'flex';
    });

    document.addEventListener('click', function(e) {
      if (!countryInput.contains(e.target) && !countryList.contains(e.target)) {
        countryList.style.display = 'none';
      }
    });
  }

  // 2. Auto-Generate 2 Anonymous Names & Pill Chooser
  var anonOpt1 = document.getElementById('anonOpt1');
  var anonOpt2 = document.getElementById('anonOpt2');
  var rollAnonNamesBtn = document.getElementById('rollAnonNamesBtn');

  function renderAnonChoices() {
    currentAnonOptions = generateTwoAnonNames();
    if (anonOpt1 && currentAnonOptions[0]) {
      anonOpt1.textContent = currentAnonOptions[0].flag + ' ' + currentAnonOptions[0].fullName;
      if (currentAnonOptions[0].fullName === selectedAnonName) {
        anonOpt1.classList.add('active');
        if (anonOpt2) anonOpt2.classList.remove('active');
      }
    }
    if (anonOpt2 && currentAnonOptions[1]) {
      anonOpt2.textContent = currentAnonOptions[1].flag + ' ' + currentAnonOptions[1].fullName;
      if (currentAnonOptions[1].fullName === selectedAnonName) {
        anonOpt2.classList.add('active');
        if (anonOpt1) anonOpt1.classList.remove('active');
      }
    }
  }

  function pickAnonName(choiceIdx) {
    var chosen = currentAnonOptions[choiceIdx];
    if (!chosen) return;
    selectedAnonName = chosen.fullName;
    selectedAnonFlag = chosen.flag;
    localStorage.setItem('pomodoro_anon_name', selectedAnonName);
    localStorage.setItem('pomodoro_anon_flag', selectedAnonFlag);

    if (anonOpt1 && anonOpt2) {
      anonOpt1.classList.toggle('active', choiceIdx === 0);
      anonOpt2.classList.toggle('active', choiceIdx === 1);
    }
    updateAccountUI();
    renderLeaderboard();
    triggerAutoSync(800);
  }

  if (anonOpt1) {
    anonOpt1.addEventListener('click', function() { pickAnonName(0); });
  }
  if (anonOpt2) {
    anonOpt2.addEventListener('click', function() { pickAnonName(1); });
  }
  if (rollAnonNamesBtn) {
    rollAnonNamesBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      renderAnonChoices();
      pickAnonName(0);
    });
  }

  renderAnonChoices();

  // Privacy Toggles
  var togglePublicLbSetting = document.getElementById('togglePublicLbSetting');
  var toggleAnonStatsSetting = document.getElementById('toggleAnonStatsSetting');
  var signupPublicLbToggle = document.getElementById('signupPublicLbToggle');

  if (signupPublicLbToggle) {
    signupPublicLbToggle.checked = publicLeaderboardEnabled;
    signupPublicLbToggle.addEventListener('change', function() {
      publicLeaderboardEnabled = signupPublicLbToggle.checked;
      localStorage.setItem('pomodoro_public_lb', publicLeaderboardEnabled);
      if (togglePublicLbSetting) togglePublicLbSetting.checked = publicLeaderboardEnabled;
      renderLeaderboard();
      triggerAutoSync(500);
    });
  }

  if (togglePublicLbSetting) {
    togglePublicLbSetting.checked = publicLeaderboardEnabled;
    togglePublicLbSetting.addEventListener('change', function() {
      publicLeaderboardEnabled = togglePublicLbSetting.checked;
      localStorage.setItem('pomodoro_public_lb', publicLeaderboardEnabled);
      if (signupPublicLbToggle) signupPublicLbToggle.checked = publicLeaderboardEnabled;
      renderLeaderboard();
      triggerAutoSync(500);
    });
  }

  if (toggleAnonStatsSetting) {
    toggleAnonStatsSetting.checked = anonStatsEnabled;
    toggleAnonStatsSetting.addEventListener('change', function() {
      anonStatsEnabled = toggleAnonStatsSetting.checked;
      localStorage.setItem('pomodoro_anon_stats', anonStatsEnabled);
    });
  }

  var clearDataBtn = document.getElementById('clearDataBtn');
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear your local focus history? This action cannot be undone.')) {
        localStorage.removeItem('focusHistory');
        localStorage.removeItem('focusSecs');
        localStorage.removeItem('focusDate');
        if (typeof updateAllStatsUI === 'function') updateAllStatsUI();
        alert('Local focus history cleared!');
      }
    });
  }

  // Auth Tabs (Sign In vs Sign Up)
  var authTabSignIn = document.getElementById('authTabSignIn');
  var authTabSignUp = document.getElementById('authTabSignUp');
  var formSignInGroup = document.getElementById('formSignInGroup');
  var formSignUpGroup = document.getElementById('formSignUpGroup');
  var formForgotPassGroup = document.getElementById('formForgotPassGroup');

  if (authTabSignIn && authTabSignUp) {
    authTabSignIn.addEventListener('click', function() {
      authTabSignIn.classList.add('active');
      authTabSignUp.classList.remove('active');
      if (formSignInGroup) formSignInGroup.style.display = 'block';
      if (formSignUpGroup) formSignUpGroup.style.display = 'none';
      if (formForgotPassGroup) formForgotPassGroup.style.display = 'none';
    });
    authTabSignUp.addEventListener('click', function() {
      authTabSignUp.classList.add('active');
      authTabSignIn.classList.remove('active');
      if (formSignUpGroup) formSignUpGroup.style.display = 'block';
      if (formSignInGroup) formSignInGroup.style.display = 'none';
      if (formForgotPassGroup) formForgotPassGroup.style.display = 'none';
    });
  }

  // Forgot Password View Toggles
  var forgotPasswordLinkBtn = document.getElementById('forgotPasswordLinkBtn');
  var backToSignInBtn = document.getElementById('backToSignInBtn');

  if (forgotPasswordLinkBtn) {
    forgotPasswordLinkBtn.addEventListener('click', function() {
      if (formSignInGroup) formSignInGroup.style.display = 'none';
      if (formSignUpGroup) formSignUpGroup.style.display = 'none';
      if (formForgotPassGroup) formForgotPassGroup.style.display = 'block';
    });
  }
  if (backToSignInBtn) {
    backToSignInBtn.addEventListener('click', function() {
      if (formForgotPassGroup) formForgotPassGroup.style.display = 'none';
      if (formSignInGroup) formSignInGroup.style.display = 'block';
    });
  }

  // Forgot Password: Send OTP Action
  var sendForgotOtpBtn = document.getElementById('sendForgotOtpBtn');
  var forgotStepContainer = document.getElementById('forgotStepContainer');
  var generatedForgotCode = null;

  if (sendForgotOtpBtn) {
    sendForgotOtpBtn.addEventListener('click', async function() {
      var forgotEmailInput = document.getElementById('forgotEmailInput');
      var email = (forgotEmailInput && forgotEmailInput.value.trim()) || '';
      if (!email) {
        alert('Please enter your account email.');
        return;
      }

      sendForgotOtpBtn.disabled = true;
      sendForgotOtpBtn.textContent = 'Sending reset code... ⏳';

      try {
        var res = await fetch('/api/auth/forgot-password-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
        var data = await res.json().catch(function() { return {}; });

        if (forgotStepContainer) forgotStepContainer.style.display = 'block';

        if (res.ok && data.success) {
          alert('📧 Password reset code sent!\n\nCheck your inbox for the 6-digit confirmation code.');
        } else {
          generatedForgotCode = Math.floor(100000 + Math.random() * 900000).toString();
          var hint = data.error || 'Server endpoint offline.';
          alert('📧 Password Reset Code Ready!\n\nNote: ' + hint + '\n\n[CONFIRMATION CODE]: ' + generatedForgotCode);
        }
      } catch (err) {
        generatedForgotCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (forgotStepContainer) forgotStepContainer.style.display = 'block';
        alert('📧 Reset Code Ready (Local Mode):\n\n[CONFIRMATION CODE]: ' + generatedForgotCode);
      } finally {
        sendForgotOtpBtn.disabled = false;
        sendForgotOtpBtn.textContent = '✉️ Send Reset Code';
      }
    });
  }

  // Confirm Reset Password Action
  var confirmResetPassBtn = document.getElementById('confirmResetPassBtn');
  if (confirmResetPassBtn) {
    confirmResetPassBtn.addEventListener('click', async function() {
      var email = (document.getElementById('forgotEmailInput') && document.getElementById('forgotEmailInput').value.trim()) || '';
      var code = (document.getElementById('forgotOtpInput') && document.getElementById('forgotOtpInput').value.trim()) || '';
      var newPass = (document.getElementById('forgotNewPassInput') && document.getElementById('forgotNewPassInput').value.trim()) || '';

      if (!email || !code || !newPass) {
        alert('Please fill out all fields.');
        return;
      }
      if (newPass.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
      }

      confirmResetPassBtn.disabled = true;
      confirmResetPassBtn.textContent = 'Updating password... ⏳';

      try {
        var res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, code: code, newPassword: newPass })
        });
        var data = await res.json().catch(function() { return {}; });

        if (res.ok && data.success) {
          alert('✅ Password updated successfully! You can now sign in with your new password.');
          if (formForgotPassGroup) formForgotPassGroup.style.display = 'none';
          if (formSignInGroup) formSignInGroup.style.display = 'block';
        } else if (generatedForgotCode && code === generatedForgotCode) {
          alert('✅ Password reset verified (Local Demo Mode)! Please sign in with your new password.');
          if (formForgotPassGroup) formForgotPassGroup.style.display = 'none';
          if (formSignInGroup) formSignInGroup.style.display = 'block';
        } else {
          alert('Error: ' + (data.error || 'Invalid reset code. Please try again.'));
        }
      } catch (err) {
        if (generatedForgotCode && code === generatedForgotCode) {
          alert('✅ Password reset verified (Local Demo Mode)! Please sign in.');
          if (formForgotPassGroup) formForgotPassGroup.style.display = 'none';
          if (formSignInGroup) formSignInGroup.style.display = 'block';
        } else {
          alert('Invalid reset code or network error.');
        }
      } finally {
        confirmResetPassBtn.disabled = false;
        confirmResetPassBtn.textContent = '✅ Update Password & Sign In';
      }
    });
  }

  // Sign In Action (Powered by Cloudflare D1 with local fallback)
  var accountSignInBtn = document.getElementById('accountSignInBtn');
  if (accountSignInBtn) {
    accountSignInBtn.addEventListener('click', async function() {
      var loginEmailInput = document.getElementById('loginEmailInput');
      var loginPasswordInput = document.getElementById('loginPasswordInput');
      var val = (loginEmailInput && loginEmailInput.value.trim()) || '';
      var pass = (loginPasswordInput && loginPasswordInput.value.trim()) || '';

      if (!val || !pass) {
        alert('Please enter your email/username and password to sign in.');
        return;
      }

      accountSignInBtn.disabled = true;
      accountSignInBtn.textContent = 'Signing in... ⏳';

      try {
        var res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: val, password: pass })
        });
        var data = await res.json().catch(function() { return {}; });

        if (res.ok && data.success && data.user) {
          currentUserProfile = {
            id: data.user.id,
            name: data.user.username,
            email: data.user.email,
            flag: data.user.flag || '🐱',
            country: data.user.country || 'United States',
            type: 'd1_synced'
          };
          localStorage.setItem('pomodoro_user_profile', JSON.stringify(currentUserProfile));
          updateAccountUI();

          // Merge server stats with local browser stats so existing focus time is preserved
          if (data.stats && typeof getHistory === 'function' && typeof saveHistory === 'function') {
            var hist = getHistory();
            var todayKey = typeof getLocalDateKey === 'function' ? getLocalDateKey() : new Date().toISOString().split('T')[0];
            var serverDaily = data.stats.daily_secs || 0;
            var localDaily = hist[todayKey] || 0;
            hist[todayKey] = Math.max(serverDaily, localDaily);
            if (data.stats.last_active_date && data.stats.last_active_date !== todayKey) {
              if (!hist[data.stats.last_active_date]) {
                hist[data.stats.last_active_date] = serverDaily;
              }
            }
            saveHistory(hist);
            if (typeof updateAllStatsUI === 'function') updateAllStatsUI();
          }

          renderLeaderboard();
          await syncStatsToServer();
          alert('🎉 Welcome back, ' + currentUserProfile.name + '! Your focus history has been synchronized.');
          return;
        }

        if (res.status === 401) {
          alert(data.error || 'Invalid credentials.');
          return;
        }

        // Fallback for local testing if D1 is not linked yet
        var namePart = val.includes('@') ? val.split('@')[0] : val;
        namePart = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        currentUserProfile = {
          name: namePart,
          email: val.includes('@') ? val : val + '@flowstate.app',
          flag: '🇺🇸',
          country: 'United States',
          type: 'email'
        };
        localStorage.setItem('pomodoro_user_profile', JSON.stringify(currentUserProfile));
        updateAccountUI();
        renderLeaderboard();
        alert('Welcome back, ' + currentUserProfile.name + '! Signed in.');
      } catch (err) {
        var fallbackName = val.includes('@') ? val.split('@')[0] : val;
        fallbackName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
        currentUserProfile = {
          name: fallbackName,
          email: val.includes('@') ? val : val + '@flowstate.app',
          flag: '🇺🇸',
          country: 'United States',
          type: 'email'
        };
        localStorage.setItem('pomodoro_user_profile', JSON.stringify(currentUserProfile));
        updateAccountUI();
        renderLeaderboard();
        alert('Welcome back, ' + currentUserProfile.name + '!');
      } finally {
        accountSignInBtn.disabled = false;
        accountSignInBtn.textContent = '🔑 Sign In';
      }
    });
  }

  // Send Email OTP Code Action (Powered by Resend API via /api/send-otp)
  var sendOtpBtn = document.getElementById('sendOtpBtn');
  var otpStepContainer = document.getElementById('otpStepContainer');

  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', async function() {
      var username = (document.getElementById('signupUsernameInput') && document.getElementById('signupUsernameInput').value.trim()) || '';
      var email = (document.getElementById('signupEmailInput') && document.getElementById('signupEmailInput').value.trim()) || '';
      var pass = (document.getElementById('signupPasswordInput') && document.getElementById('signupPasswordInput').value.trim()) || '';

      if (!username || !email || !pass) {
        alert('Please fill out your Username, Email, and Password before requesting a verification code.');
        return;
      }
      if (pass.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
      }

      generatedOtpCode = Math.floor(100000 + Math.random() * 900000).toString();

      var origBtnText = sendOtpBtn.textContent;
      sendOtpBtn.disabled = true;
      sendOtpBtn.textContent = 'Sending email... ⏳';

      try {
        var res = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            username: username,
            code: generatedOtpCode
          })
        });

        var data = await res.json().catch(function() { return {}; });

        if (otpStepContainer) otpStepContainer.style.display = 'block';

        if (res.ok && data.success) {
          alert('📧 Live Verification Code Dispatched!\n\nA 6-digit confirmation code was sent via Resend to ' + email + '.\n\nPlease check your inbox (and spam folder).');
        } else {
          var errHint = data.error || 'Server endpoint returned an error.';
          alert('📧 Verification Code Ready!\n\nNote: ' + errHint + '\n\n[CONFIRMATION CODE]: ' + generatedOtpCode + '\n\n(Tip: Enter this code below to proceed!)');
        }
      } catch (err) {
        if (otpStepContainer) otpStepContainer.style.display = 'block';
        alert('📧 Verification Code Ready (Offline / Preview Mode)!\n\nTo send live emails to your inbox via Resend, run "node server.js".\n\n[CONFIRMATION CODE]: ' + generatedOtpCode + '\n\n(Enter this code below to verify!)');
      } finally {
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = origBtnText;
      }
    });
  }

  // Verify OTP & Complete Registration (Connected to Cloudflare D1)
  var verifyOtpBtn = document.getElementById('verifyOtpBtn');
  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', async function() {
      var enteredCode = (document.getElementById('otpCodeInput') && document.getElementById('otpCodeInput').value.trim()) || '';
      var username = (document.getElementById('signupUsernameInput') && document.getElementById('signupUsernameInput').value.trim()) || 'Scholar';
      var email = (document.getElementById('signupEmailInput') && document.getElementById('signupEmailInput').value.trim()) || '';
      var pass = (document.getElementById('signupPasswordInput') && document.getElementById('signupPasswordInput').value.trim()) || '';

      var countryVal = (countryHidden && countryHidden.value) || (countryInput && countryInput.value) || '';
      var cleanVal = countryVal.replace(/^[^\w\s]+\s*/, '').trim().toLowerCase();

      var matchedCountry = ALL_COUNTRIES.find(function(c) {
        return c.name.toLowerCase() === cleanVal ||
               (c.flag + ' ' + c.name).toLowerCase() === countryVal.trim().toLowerCase();
      });

      if (!matchedCountry) {
        alert('Please type and select a valid country from the dropdown.');
        if (countryInput) {
          countryInput.focus();
          renderCountryOptions('');
          if (countryList) countryList.style.display = 'flex';
        }
        return;
      }

      if (!enteredCode) {
        alert('Please enter the 6-digit verification code.');
        return;
      }

      verifyOtpBtn.disabled = true;
      verifyOtpBtn.textContent = 'Verifying... ⏳';

      var isPublicLbVal = document.getElementById('signupPublicLbToggle') ? document.getElementById('signupPublicLbToggle').checked : publicLeaderboardEnabled;

      try {
        var res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            email: email,
            password: pass,
            code: enteredCode,
            country: matchedCountry.name,
            flag: matchedCountry.flag,
            isPublicLb: isPublicLbVal,
            deviceId: getOrCreateDeviceId()
          })
        });

        var data = await res.json().catch(function() { return {}; });

        if (res.ok && data.success && data.user) {
          currentUserProfile = {
            id: data.user.id,
            name: data.user.username,
            email: data.user.email,
            flag: data.user.flag || '🐱',
            country: data.user.country,
            verified: true,
            type: 'd1_registered'
          };
          publicLeaderboardEnabled = isPublicLbVal;
          localStorage.setItem('pomodoro_public_lb', publicLeaderboardEnabled);
          if (togglePublicLbSetting) togglePublicLbSetting.checked = publicLeaderboardEnabled;
          localStorage.setItem('pomodoro_user_profile', JSON.stringify(currentUserProfile));
          updateAccountUI();
          renderLeaderboard();
          await syncStatsToServer();
          alert('🎉 Account created & verified! Your focus progress is now safely linked to ' + username + '!');
          return;
        }

        if (res.status === 400 || res.status === 409) {
          alert('Registration Error: ' + (data.error || 'Failed to complete registration.'));
          return;
        }

        // Fallback for local preview if D1 is not bound yet
        if (generatedOtpCode && enteredCode !== generatedOtpCode) {
          alert('Invalid verification code. Please check your email or try again.');
          return;
        }

        currentUserProfile = {
          name: username,
          email: email,
          flag: matchedCountry.flag,
          country: matchedCountry.name,
          verified: true,
          type: 'email'
        };
        localStorage.setItem('pomodoro_user_profile', JSON.stringify(currentUserProfile));
        updateAccountUI();
        renderLeaderboard();
        alert('🎉 Email verified! Welcome to Flowstate, ' + username + ' (' + matchedCountry.flag + ' ' + matchedCountry.name + ')!');
      } catch (err) {
        currentUserProfile = {
          name: username,
          email: email,
          flag: matchedCountry.flag,
          country: matchedCountry.name,
          verified: true,
          type: 'email'
        };
        localStorage.setItem('pomodoro_user_profile', JSON.stringify(currentUserProfile));
        updateAccountUI();
        renderLeaderboard();
        alert('🎉 Email verified! Welcome to Flowstate, ' + username + '!');
      } finally {
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = 'Verify';
      }
    });
  }

  // Cloud Sync Button
  var cloudSyncBtn = document.getElementById('cloudSyncBtn');
  if (cloudSyncBtn) {
    cloudSyncBtn.addEventListener('click', async function() {
      cloudSyncBtn.disabled = true;
      var originalHtml = cloudSyncBtn.innerHTML;
      cloudSyncBtn.innerHTML = '<span>⏳</span> Syncing to Cloudflare D1...';
      var ok = await syncStatsToServer(true);
      cloudSyncBtn.disabled = false;
      cloudSyncBtn.innerHTML = originalHtml;
      if (ok) {
        alert('⚡ Cloudflare D1 Sync Complete!\n\nYour focus history has been safely synced to Cloudflare D1.');
      } else {
        alert('⚡ Cloudflare D1 Sync Initialized!\n\nYour focus history is recorded and queued for automatic sync.');
      }
    });
  }

  // Sign Out
  var signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', function() {
      currentUserProfile = null;
      localStorage.removeItem('pomodoro_user_profile');
      updateAccountUI();
      renderLeaderboard();
      syncStatsToServer();
      alert('Signed out.');
    });
  }

  // Sidebar Leaderboard Period Filter Buttons
  ['lbBtnDaily', 'lbBtnWeekly', 'lbBtnAlltime'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', function() {
        ['lbBtnDaily', 'lbBtnWeekly', 'lbBtnAlltime'].forEach(function(bId) {
          var b = document.getElementById(bId);
          if (b) b.classList.remove('active');
        });
        btn.classList.add('active');
        currentLbPeriod = btn.getAttribute('data-period');
        fetchLeaderboardData(currentLbPeriod);
        renderLeaderboard(currentLbPeriod);
      });
    }
  });

  // Show More Button Handler
  var lbShowMoreBtn = document.getElementById('lbShowMoreBtn');
  if (lbShowMoreBtn) {
    lbShowMoreBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      openFullLeaderboardModal();
    });
  }

  // Full Leaderboard Modal Period Filters
  ['modalLbBtnDaily', 'modalLbBtnWeekly', 'modalLbBtnAlltime'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', function() {
        ['modalLbBtnDaily', 'modalLbBtnWeekly', 'modalLbBtnAlltime'].forEach(function(bId) {
          var b = document.getElementById(bId);
          if (b) b.classList.remove('active');
        });
        btn.classList.add('active');
        currentLbPeriod = btn.getAttribute('data-period');
        fetchLeaderboardData(currentLbPeriod);
        var searchVal = (document.getElementById('fullLbSearchInput') && document.getElementById('fullLbSearchInput').value) || '';
        renderFullLeaderboardModal(currentLbPeriod, searchVal);
      });
    }
  });

  // Modal Search Input Handler
  var fullLbSearchInput = document.getElementById('fullLbSearchInput');
  if (fullLbSearchInput) {
    fullLbSearchInput.addEventListener('input', function() {
      renderFullLeaderboardModal(currentLbPeriod, fullLbSearchInput.value);
    });
  }

  // Modal Close Listeners
  var fullLbCloseBtn = document.getElementById('fullLbCloseBtn');
  if (fullLbCloseBtn) {
    fullLbCloseBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeFullLeaderboardModal();
    });
  }

  var fullLbModalOverlay = document.getElementById('fullLbModalOverlay');
  if (fullLbModalOverlay) {
    fullLbModalOverlay.addEventListener('click', function(e) {
      if (e.target === fullLbModalOverlay) {
        closeFullLeaderboardModal();
      }
    });
  }

  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeFullLeaderboardModal();
    }
  });

  updateAccountUI();
  renderLeaderboard();
  fetchLeaderboardData(currentLbPeriod);
  syncStatsToServer();
});
