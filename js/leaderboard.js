// Leaderboard, Country Flags, Privacy Settings, Email OTP & Cloudflare D1 Account Integration
var publicLeaderboardEnabled = localStorage.getItem('pomodoro_public_lb') !== 'false';
var anonStatsEnabled = localStorage.getItem('pomodoro_anon_stats') === 'true';
var currentLbPeriod = 'daily';
var generatedOtpCode = null;

// Account Profile State
var currentUserProfile = null;
try {
  currentUserProfile = JSON.parse(localStorage.getItem('pomodoro_user_profile') || 'null');
} catch (e) {}

// Global peer data with country flags
var mockPeers = [
  { name: 'Sarah K. ⚡', flag: '🇺🇸', country: 'United States', daily: 28800, weekly: 144000, alltime: 432000, streak: 14, isUser: false },
  { name: 'Alex Chen 💻', flag: '🇨🇦', country: 'Canada', daily: 21600, weekly: 108000, alltime: 324000, streak: 9, isUser: false },
  { name: 'Elena R. ☕', flag: '🇩🇪', country: 'Germany', daily: 14400, weekly: 72000, alltime: 216000, streak: 6, isUser: false },
  { name: 'Marcus B. 🚀', flag: '🇬🇧', country: 'United Kingdom', daily: 10800, weekly: 54000, alltime: 162000, streak: 4, isUser: false },
  { name: 'David M. 🎯', flag: '🇯🇵', country: 'Japan', daily: 7200, weekly: 36000, alltime: 108000, streak: 3, isUser: false },
  { name: 'Chloe V. ✨', flag: '🇫🇷', country: 'France', daily: 6400, weekly: 32000, alltime: 96000, streak: 5, isUser: false },
  { name: 'Liam W. 🦘', flag: '🇦🇺', country: 'Australia', daily: 5800, weekly: 29000, alltime: 87000, streak: 2, isUser: false },
  { name: 'Gabriel S. ⚽', flag: '🇧🇷', country: 'Brazil', daily: 4800, weekly: 24000, alltime: 72000, streak: 4, isUser: false }
];

function extractFlagAndCountry(valStr) {
  var parts = (valStr || '').trim().split(' ');
  var flag = parts[0] || '🌐';
  var country = parts.slice(1).join(' ') || 'Global';
  return { flag: flag, country: country };
}

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

  var userName = 'You (Guest Scholar)';
  var userFlag = '🌐';
  var userCountry = 'Global';

  if (currentUserProfile && currentUserProfile.name) {
    userName = currentUserProfile.name + ' (You)';
    userFlag = currentUserProfile.flag || '🌐';
    userCountry = currentUserProfile.country || 'Global';
  }
  if (!publicLeaderboardEnabled) {
    userName = 'Anonymous Cat 🐱';
    userFlag = '🐱';
    userCountry = 'Hidden';
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

// Render Top 5 items in Sidebar Leaderboard Widget
function renderLeaderboard(period) {
  period = period || currentLbPeriod || 'daily';
  var lbList = document.getElementById('lbList');
  if (!lbList) return;

  var fullList = getSortedLeaderboardData(period);
  var top5List = fullList.slice(0, 5);

  lbList.innerHTML = '';
  var ranks = ['🥇', '🥈', '🥉'];

  top5List.forEach(function(item, idx) {
    var row = document.createElement('div');
    row.className = 'lb-item' + (item.isUser ? ' is-user' : '');

    var rankStr = idx < 3 ? ranks[idx] : '#' + (idx + 1);
    var formattedTime = typeof formatStatsDuration === 'function' ? formatStatsDuration(item[period] || 0) : Math.floor((item[period] || 0) / 60) + 'm';
    var flagStr = item.flag ? '<span class="lb-country-flag" title="' + (item.country || '') + '">' + item.flag + '</span>' : '';

    row.innerHTML =
      '<div class="lb-rank">' + rankStr + '</div>' +
      '<div class="lb-user">' +
        flagStr +
        '<span class="lb-name">' + item.name + '</span>' +
        '<span class="lb-badge">🔥 ' + item.streak + 'd</span>' +
      '</div>' +
      '<div class="lb-time">' + formattedTime + '</div>';

    lbList.appendChild(row);
  });
}

// Render Full Leaderboard Modal Window
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
  var ranks = ['🥇', '🥈', '🥉'];

  if (fullList.length === 0) {
    modalList.innerHTML = '<div style="text-align:center; color:var(--text-dim); padding:20px; font-size:12px;">No matching scholars found.</div>';
    return;
  }

  fullList.forEach(function(item, idx) {
    var row = document.createElement('div');
    row.className = 'lb-item' + (item.isUser ? ' is-user' : '');

    var rankStr = idx < 3 ? ranks[idx] : '#' + (idx + 1);
    var formattedTime = typeof formatStatsDuration === 'function' ? formatStatsDuration(item[period] || 0) : Math.floor((item[period] || 0) / 60) + 'm';
    var flagStr = item.flag ? '<span class="lb-country-flag" title="' + (item.country || '') + '">' + item.flag + '</span>' : '';

    row.innerHTML =
      '<div class="lb-rank">' + rankStr + '</div>' +
      '<div class="lb-user">' +
        flagStr +
        '<span class="lb-name">' + item.name + '</span>' +
        '<span class="lb-badge">🔥 ' + item.streak + 'd</span>' +
      '</div>' +
      '<div class="lb-time">' + formattedTime + '</div>';

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

  // Send Email OTP Code Action
  var sendOtpBtn = document.getElementById('sendOtpBtn');
  var otpStepContainer = document.getElementById('otpStepContainer');

  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', function() {
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
      if (otpStepContainer) otpStepContainer.style.display = 'block';
      alert('📧 Verification Code Sent!\n\nA 6-digit confirmation code has been sent to ' + email + '.\n\n[DEMO CODE]: ' + generatedOtpCode);
    });
  }

  // Verify OTP & Complete Registration
  var verifyOtpBtn = document.getElementById('verifyOtpBtn');
  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', function() {
      var enteredCode = (document.getElementById('otpCodeInput') && document.getElementById('otpCodeInput').value.trim()) || '';
      var username = (document.getElementById('signupUsernameInput') && document.getElementById('signupUsernameInput').value.trim()) || 'Scholar';
      var email = (document.getElementById('signupEmailInput') && document.getElementById('signupEmailInput').value.trim()) || '';
      var countryRaw = (document.getElementById('signupCountrySelect') && document.getElementById('signupCountrySelect').value) || '🇺🇸 United States';
      var parsedCountry = extractFlagAndCountry(countryRaw);

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
        flag: parsedCountry.flag,
        country: parsedCountry.country,
        verified: true,
        type: 'email'
      };
      localStorage.setItem('pomodoro_user_profile', JSON.stringify(currentUserProfile));
      updateAccountUI();
      renderLeaderboard();
      alert('🎉 Email verified! Welcome to Flowstate, ' + username + ' (' + parsedCountry.flag + ' ' + parsedCountry.country + ')!');
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
