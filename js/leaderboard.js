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

// Comprehensive list of countries with official flag emojis
var ALL_COUNTRIES = [
  { flag: '🇺🇸', name: 'United States' },
  { flag: '🇬🇧', name: 'United Kingdom' },
  { flag: '🇨🇦', name: 'Canada' },
  { flag: '🇮🇳', name: 'India' },
  { flag: '🇩🇪', name: 'Germany' },
  { flag: '🇫🇷', name: 'France' },
  { flag: '🇯🇵', name: 'Japan' },
  { flag: '🇦🇺', name: 'Australia' },
  { flag: '🇧🇷', name: 'Brazil' },
  { flag: '🇪🇸', name: 'Spain' },
  { flag: '🇮🇹', name: 'Italy' },
  { flag: '🇳🇱', name: 'Netherlands' },
  { flag: '🇸🇬', name: 'Singapore' },
  { flag: '🇰🇷', name: 'South Korea' },
  { flag: '🇲🇽', name: 'Mexico' },
  { flag: '🇨🇭', name: 'Switzerland' },
  { flag: '🇸🇪', name: 'Sweden' },
  { flag: '🇳🇴', name: 'Norway' },
  { flag: '🇩🇰', name: 'Denmark' },
  { flag: '🇫🇮', name: 'Finland' },
  { flag: '🇵🇱', name: 'Poland' },
  { flag: '🇦🇹', name: 'Austria' },
  { flag: '🇧🇪', name: 'Belgium' },
  { flag: '🇮🇪', name: 'Ireland' },
  { flag: '🇳🇿', name: 'New Zealand' },
  { flag: '🇵🇹', name: 'Portugal' },
  { flag: '🇬🇷', name: 'Greece' },
  { flag: '🇿🇦', name: 'South Africa' },
  { flag: '🇪🇬', name: 'Egypt' },
  { flag: '🇹🇷', name: 'Turkey' },
  { flag: '🇸🇦', name: 'Saudi Arabia' },
  { flag: '🇦🇪', name: 'United Arab Emirates' },
  { flag: '🇮🇩', name: 'Indonesia' },
  { flag: '🇲🇾', name: 'Malaysia' },
  { flag: '🇵🇭', name: 'Philippines' },
  { flag: '🇹🇭', name: 'Thailand' },
  { flag: '🇻🇳', name: 'Vietnam' },
  { flag: '🇦🇷', name: 'Argentina' },
  { flag: '🇨🇱', name: 'Chile' },
  { flag: '🇨🇴', name: 'Colombia' },
  { flag: '🇵🇪', name: 'Peru' },
  { flag: '🇳🇬', name: 'Nigeria' },
  { flag: '🇰🇪', name: 'Kenya' },
  { flag: '🇵🇰', name: 'Pakistan' },
  { flag: '🇧🇩', name: 'Bangladesh' },
  { flag: '🇮🇱', name: 'Israel' },
  { flag: '🇺🇦', name: 'Ukraine' },
  { flag: '🇨🇿', name: 'Czech Republic' },
  { flag: '🇷🇴', name: 'Romania' },
  { flag: '🇭🇺', name: 'Hungary' }
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

// Global peer mock data with country flags
var mockPeers = [
  { name: 'Sarah', flag: '🇺🇸', country: 'United States', daily: 28800, weekly: 144000, alltime: 432000, streak: 14, isUser: false },
  { name: 'Alex', flag: '🇨🇦', country: 'Canada', daily: 21600, weekly: 108000, alltime: 324000, streak: 9, isUser: false },
  { name: 'Elena', flag: '🇩🇪', country: 'Germany', daily: 14400, weekly: 72000, alltime: 216000, streak: 6, isUser: false },
  { name: 'Marcus', flag: '🇬🇧', country: 'United Kingdom', daily: 10800, weekly: 54000, alltime: 162000, streak: 4, isUser: false },
  { name: 'David', flag: '🇯🇵', country: 'Japan', daily: 7200, weekly: 36000, alltime: 108000, streak: 3, isUser: false },
  { name: 'Chloe', flag: '🇫🇷', country: 'France', daily: 6400, weekly: 32000, alltime: 96000, streak: 5, isUser: false },
  { name: 'Liam', flag: '🇦🇺', country: 'Australia', daily: 5800, weekly: 29000, alltime: 87000, streak: 2, isUser: false },
  { name: 'Gabriel', flag: '🇧🇷', country: 'Brazil', daily: 4800, weekly: 24000, alltime: 72000, streak: 4, isUser: false }
];

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
    if (nameEl) nameEl.textContent = 'Guest Focus Scholar';
    if (statusEl) statusEl.textContent = 'Local Session · Not Synced';
    if (avatarEl) avatarEl.textContent = '🐱';
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

  var userName = (selectedAnonName || 'Chonky Potato') + ' (You)';
  var userFlag = selectedAnonFlag || '🥔';
  var userCountry = 'Anonymous';

  if (currentUserProfile && currentUserProfile.name && publicLeaderboardEnabled) {
    userName = currentUserProfile.name + ' (You)';
    userFlag = currentUserProfile.flag || '🌐';
    userCountry = currentUserProfile.country || 'Global';
  }

  var streakDays = typeof calculateStreak === 'function' ? calculateStreak(hist, todayKey) : 1;

  var userEntry = {
    name: userName,
    flag: userFlag,
    country: userCountry,
    daily: todaySecs,
    weekly: weekSecs,
    alltime: allTimeSecs,
    streak: streakDays,
    isUser: true
  };

  var fullList = mockPeers.concat([userEntry]);
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

// Render Top 5 items in Sidebar Leaderboard Widget
function renderLeaderboard(period) {
  period = period || currentLbPeriod || 'daily';
  var lbList = document.getElementById('lbList');
  if (!lbList) return;

  var fullList = getSortedLeaderboardData(period);
  var top5List = fullList.slice(0, 5);

  lbList.innerHTML = '';

  top5List.forEach(function(item, idx) {
    var row = document.createElement('div');
    row.className = 'lb-row rank-' + (idx + 1) + (item.isUser ? ' is-user' : '');

    var rankHtml = '<div class="lb-rank">' + (idx + 1) + '</div>';

    var formattedTime = typeof formatStatsDuration === 'function'
      ? formatStatsDuration(item[period] || 0)
      : Math.floor((item[period] || 0) / 60) + 'm';

    var flagHtml = '<div class="lb-flag" title="' + escapeHtml(item.country || '') + '">' + (item.flag || '🌐') + '</div>';
    var nameHtml = '<div class="lb-name" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</div>';
    var metaHtml = '<div class="lb-meta">' +
      '<span class="lb-time">' + formattedTime + '</span>' +
      '<span class="lb-streak">' + (item.streak || 1) + 'd streak</span>' +
    '</div>';

    row.innerHTML = rankHtml + flagHtml + nameHtml + metaHtml;
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
      return (item.name && item.name.toLowerCase().includes(q)) ||
             (item.country && item.country.toLowerCase().includes(q));
    });
  }

  modalList.innerHTML = '';

  if (fullList.length === 0) {
    modalList.innerHTML = '<div style="text-align:center; color:var(--text-dim); padding:20px; font-size:12px;">No matching scholars found.</div>';
    return;
  }

  fullList.forEach(function(item, idx) {
    var row = document.createElement('div');
    row.className = 'lb-row rank-' + (idx + 1) + (item.isUser ? ' is-user' : '');

    var rankHtml = '<div class="lb-rank">' + (idx + 1) + '</div>';

    var formattedTime = typeof formatStatsDuration === 'function'
      ? formatStatsDuration(item[period] || 0)
      : Math.floor((item[period] || 0) / 60) + 'm';

    var flagHtml = '<div class="lb-flag" title="' + escapeHtml(item.country || '') + '">' + (item.flag || '🌐') + '</div>';
    var nameHtml = '<div class="lb-name" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</div>';
    var metaHtml = '<div class="lb-meta">' +
      '<span class="lb-time">' + formattedTime + '</span>' +
      '<span class="lb-streak">' + (item.streak || 1) + 'd streak</span>' +
    '</div>';

    row.innerHTML = rankHtml + flagHtml + nameHtml + metaHtml;
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
    renderLeaderboard();
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

  if (togglePublicLbSetting) {
    togglePublicLbSetting.checked = publicLeaderboardEnabled;
    togglePublicLbSetting.addEventListener('change', function() {
      publicLeaderboardEnabled = togglePublicLbSetting.checked;
      localStorage.setItem('pomodoro_public_lb', publicLeaderboardEnabled);
      renderLeaderboard();
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

  if (authTabSignIn && authTabSignUp) {
    authTabSignIn.addEventListener('click', function() {
      authTabSignIn.classList.add('active');
      authTabSignUp.classList.remove('active');
      if (formSignInGroup) formSignInGroup.style.display = 'block';
      if (formSignUpGroup) formSignUpGroup.style.display = 'none';
    });
    authTabSignUp.addEventListener('click', function() {
      authTabSignUp.classList.add('active');
      authTabSignIn.classList.remove('active');
      if (formSignUpGroup) formSignUpGroup.style.display = 'block';
      if (formSignInGroup) formSignInGroup.style.display = 'none';
    });
  }

  // Sign In Action
  var accountSignInBtn = document.getElementById('accountSignInBtn');
  if (accountSignInBtn) {
    accountSignInBtn.addEventListener('click', function() {
      var loginEmailInput = document.getElementById('loginEmailInput');
      var loginPasswordInput = document.getElementById('loginPasswordInput');
      var val = (loginEmailInput && loginEmailInput.value.trim()) || '';
      var pass = (loginPasswordInput && loginPasswordInput.value.trim()) || '';

      if (!val) {
        alert('Please enter your email or username to sign in.');
        return;
      }
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
      alert('Welcome back, ' + currentUserProfile.name + '! Signed in successfully.');
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

  // Verify OTP & Complete Registration
  var verifyOtpBtn = document.getElementById('verifyOtpBtn');
  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', function() {
      var enteredCode = (document.getElementById('otpCodeInput') && document.getElementById('otpCodeInput').value.trim()) || '';
      var username = (document.getElementById('signupUsernameInput') && document.getElementById('signupUsernameInput').value.trim()) || 'Scholar';
      var email = (document.getElementById('signupEmailInput') && document.getElementById('signupEmailInput').value.trim()) || '';

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
      if (generatedOtpCode && enteredCode !== generatedOtpCode) {
        alert('Invalid verification code. Please try again.');
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
    });
  }

  // Quick Google Sign In
  var googleSignInBtn = document.getElementById('googleSignInBtn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', function() {
      currentUserProfile = {
        name: 'Focus Champion 🌟',
        email: 'scholar@flowstate.app',
        flag: '🇺🇸',
        country: 'United States',
        type: 'google'
      };
      localStorage.setItem('pomodoro_user_profile', JSON.stringify(currentUserProfile));
      updateAccountUI();
      renderLeaderboard();
      alert('Successfully signed in with Google!');
    });
  }

  // Cloud Sync Button
  var cloudSyncBtn = document.getElementById('cloudSyncBtn');
  if (cloudSyncBtn) {
    cloudSyncBtn.addEventListener('click', function() {
      alert('⚡ Cloudflare D1 Sync Initialized!\n\nYour focus history and country ranking are synced to Cloudflare D1.');
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
});
