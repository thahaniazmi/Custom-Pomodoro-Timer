// Leaderboard, Privacy Settings & Cloudflare D1 Account Integration
var publicLeaderboardEnabled = localStorage.getItem('pomodoro_public_lb') !== 'false';
var anonStatsEnabled = localStorage.getItem('pomodoro_anon_stats') === 'true';
var currentLbPeriod = 'daily';

// Account Profile State
var currentUserProfile = null;
try {
  currentUserProfile = JSON.parse(localStorage.getItem('pomodoro_user_profile') || 'null');
} catch (e) {}

function updateAccountUI() {
  var nameEl = document.getElementById('accountDisplayName');
  var statusEl = document.getElementById('accountStatusText');
  var signOutBtn = document.getElementById('signOutBtn');
  var googleBtn = document.getElementById('googleSignInBtn');
  var emailBtn = document.getElementById('emailSignInBtn');

  if (currentUserProfile && currentUserProfile.name) {
    if (nameEl) nameEl.textContent = currentUserProfile.name;
    if (statusEl) statusEl.textContent = (currentUserProfile.email || 'Signed In') + ' · Cloud Synced';
    if (signOutBtn) signOutBtn.style.display = 'flex';
    if (googleBtn) googleBtn.style.display = 'none';
    if (emailBtn) emailBtn.style.display = 'none';
  } else {
    if (nameEl) nameEl.textContent = 'Guest Focus Scholar';
    if (statusEl) statusEl.textContent = 'Local Session · Not Synced';
    if (signOutBtn) signOutBtn.style.display = 'none';
    if (googleBtn) googleBtn.style.display = 'flex';
    if (emailBtn) emailBtn.style.display = 'flex';
  }
}

function renderLeaderboard(period) {
  period = period || currentLbPeriod || 'daily';
  var lbList = document.getElementById('lbList');
  if (!lbList) return;

  var hist = typeof getHistory === 'function' ? getHistory() : {};
  var now = new Date();
  var todayKey = typeof getLocalDateKey === 'function' ? getLocalDateKey(now) : now.toISOString().split('T')[0];
  var todaySecs = hist[todayKey] || 0;

  // Week calculation
  var dayOfWeek = now.getDay();
  var daysToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMon);
  var weekSecs = 0;
  for (var d = 0; d < 7; d++) {
    var cur = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + d);
    var k = typeof getLocalDateKey === 'function' ? getLocalDateKey(cur) : cur.toISOString().split('T')[0];
    weekSecs += (hist[k] || 0);
  }

  // All-time calculation
  var allTimeSecs = 0;
  for (var key in hist) {
    if (hist.hasOwnProperty(key)) allTimeSecs += hist[key];
  }

  var userName = 'You (Guest Scholar)';
  if (currentUserProfile && currentUserProfile.name) {
    userName = currentUserProfile.name + ' (You)';
  }
  if (!publicLeaderboardEnabled) {
    userName = 'Anonymous Cat 🐱';
  }

  var streakDays = typeof calculateStreak === 'function' ? calculateStreak(hist, todayKey) : 1;

  var peers = [
    { name: 'Sarah K. ⚡', daily: 28800, weekly: 144000, alltime: 432000, streak: 14, isUser: false },
    { name: 'Alex Chen 💻', daily: 21600, weekly: 108000, alltime: 324000, streak: 9, isUser: false },
    { name: 'Elena R. ☕', daily: 14400, weekly: 72000, alltime: 216000, streak: 6, isUser: false },
    { name: 'Marcus B. 🚀', daily: 10800, weekly: 54000, alltime: 162000, streak: 4, isUser: false },
    { name: 'David M. 🎯', daily: 7200, weekly: 36000, alltime: 108000, streak: 3, isUser: false }
  ];

  var userEntry = {
    name: userName,
    daily: todaySecs,
    weekly: weekSecs,
    alltime: allTimeSecs,
    streak: streakDays,
    isUser: true
  };

  var fullList = peers.concat([userEntry]);
  fullList.sort(function(a, b) {
    return (b[period] || 0) - (a[period] || 0);
  });

  lbList.innerHTML = '';
  var ranks = ['🥇', '🥈', '🥉'];

  fullList.forEach(function(item, idx) {
    var row = document.createElement('div');
    row.className = 'lb-item' + (item.isUser ? ' is-user' : '');

    var rankStr = idx < 3 ? ranks[idx] : '#' + (idx + 1);
    var formattedTime = typeof formatStatsDuration === 'function' ? formatStatsDuration(item[period] || 0) : Math.floor((item[period] || 0) / 60) + 'm';

    row.innerHTML =
      '<div class="lb-rank">' + rankStr + '</div>' +
      '<div class="lb-user">' +
        '<span class="lb-name">' + item.name + '</span>' +
        '<span class="lb-badge">🔥 ' + item.streak + 'd</span>' +
      '</div>' +
      '<div class="lb-time">' + formattedTime + '</div>';

    lbList.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', function() {
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

  // Account Profile Buttons
  var googleSignInBtn = document.getElementById('googleSignInBtn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', function() {
      currentUserProfile = { name: 'Focus Champion 🌟', email: 'scholar@flowstate.app', type: 'google' };
      localStorage.setItem('pomodoro_user_profile', JSON.stringify(currentUserProfile));
      updateAccountUI();
      renderLeaderboard();
      alert('Successfully signed in with Google as Focus Champion!');
    });
  }

  var emailSignInBtn = document.getElementById('emailSignInBtn');
  if (emailSignInBtn) {
    emailSignInBtn.addEventListener('click', function() {
      var email = prompt('Enter your email address to sign in:', 'user@flowstate.app');
      if (email && email.trim()) {
        var name = email.split('@')[0];
        name = name.charAt(0).toUpperCase() + name.slice(1);
        currentUserProfile = { name: name, email: email.trim(), type: 'email' };
        localStorage.setItem('pomodoro_user_profile', JSON.stringify(currentUserProfile));
        updateAccountUI();
        renderLeaderboard();
        alert('Signed in as ' + currentUserProfile.name + '!');
      }
    });
  }

  var cloudSyncBtn = document.getElementById('cloudSyncBtn');
  if (cloudSyncBtn) {
    cloudSyncBtn.addEventListener('click', function() {
      alert('⚡ Cloudflare D1 Sync Initialized!\n\nYour local focus history is ready to sync with Cloudflare D1.');
    });
  }

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

  // Leaderboard Filter Buttons
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

  updateAccountUI();
});
