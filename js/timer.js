// Core Pomodoro Timer Engine, Stats, Task Goals, Picture-in-Picture & Settings Controls
var plan, index, remainingSeconds, running, timerId;
var targetEndTime = 0;
var currentGoals = [];
var currentTaskName = '';
var soundEnabled = localStorage.getItem('pomodoro_sound_enabled') !== 'false';
var ttsEnabled = localStorage.getItem('pomodoro_tts_enabled') === 'true';
var pauseOnClose = true; // Tab close always pauses timer (bug fix)
var autoStartBreaks = false; // Breaks never auto-start to prevent cheating (bug fix)
var autoStartFocus = false; // Focus never auto-starts to prevent cheating (bug fix)
try {
  localStorage.removeItem('pomodoro_autostart_breaks');
  localStorage.removeItem('pomodoro_autostart_focus');
} catch (e) {}

function buildPlan(startMinutes, focusMin, shortBreakMin) {
  var plan = [];
  var t = startMinutes;
  for (var i = 1; i <= 100; i++) {
    var numStr = i < 10 ? '0' + i : String(i);
    plan.push({ type: 'focus', label: 'Focus', num: numStr, start: t, duration: focusMin });
    t += focusMin;
    plan.push({ type: 'break', label: 'Break', start: t, duration: shortBreakMin });
    t += shortBreakMin;
  }
  return plan;
}

function fmtClock(minsFromMidnight) {
  var h = Math.floor(minsFromMidnight / 60) % 24;
  var m = Math.floor(minsFromMidnight % 60);
  var ampm = h >= 12 ? 'pm' : 'am';
  var h12 = h % 12; if (h12 === 0) h12 = 12;
  return h12 + ':' + (m < 10 ? '0' : '') + m + ampm;
}

function fmtCountdown(totalSeconds) {
  var s = Math.max(0, Math.ceil(totalSeconds));
  var m = Math.floor(s / 60);
  var sec = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
}

function updateFavicon(emoji) {
  var faviconTag = document.getElementById('faviconTag');
  if (faviconTag) {
    faviconTag.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>' + emoji + '</text></svg>';
  }
}

// Stats & LocalStorage Helpers
function getLocalDateKey(d) {
  var date = d || new Date();
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('focusHistory') || '{}');
  } catch (e) {
    return {};
  }
}

function saveHistory(hist) {
  try {
    localStorage.setItem('focusHistory', JSON.stringify(hist));
  } catch (e) {}
}

(function migrateLegacyStats() {
  var oldSecs = parseInt(localStorage.getItem('focusSecs') || '0', 10);
  var oldDate = localStorage.getItem('focusDate');
  var hist = getHistory();
  if (oldSecs > 0 && oldDate) {
    var k = getLocalDateKey(new Date(oldDate));
    if (!hist[k]) {
      hist[k] = oldSecs;
      saveHistory(hist);
    }
  }
})();

function calculateStreak(hist, todayKey) {
  var checkDate = new Date();
  var streak = 0;
  var todaySecs = hist[todayKey] || 0;

  if (todaySecs > 0) {
    streak = 1;
    var cur = new Date(checkDate);
    while (true) {
      cur.setDate(cur.getDate() - 1);
      var k = getLocalDateKey(cur);
      if (hist[k] && hist[k] > 0) {
        streak++;
      } else {
        break;
      }
    }
  } else {
    var cur = new Date(checkDate);
    cur.setDate(cur.getDate() - 1);
    var yKey = getLocalDateKey(cur);
    if (hist[yKey] && hist[yKey] > 0) {
      streak = 1;
      while (true) {
        cur.setDate(cur.getDate() - 1);
        var k = getLocalDateKey(cur);
        if (hist[k] && hist[k] > 0) {
          streak++;
        } else {
          break;
        }
      }
    }
  }
  return streak > 0 ? streak : 1;
}

function formatStatsDuration(secs) {
  var h = Math.floor(secs / 3600);
  var m = Math.floor((secs % 3600) / 60);
  if (h > 0) {
    return h + 'h ' + m + 'm';
  }
  return m + 'm ' + (secs % 60) + 's';
}

function updateAllStatsUI() {
  var hist = getHistory();
  var now = new Date();
  var todayKey = getLocalDateKey(now);
  var todaySecs = hist[todayKey] || 0;

  var dayOfWeek = now.getDay();
  var daysToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMon);
  var weekSecs = 0;
  var weekDaily = [];
  var maxDailySecs = 1;

  for (var d = 0; d < 7; d++) {
    var cur = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + d);
    var k = getLocalDateKey(cur);
    var s = hist[k] || 0;
    weekSecs += s;
    weekDaily.push({ key: k, secs: s, isToday: k === todayKey, dayLetter: ['M','T','W','T','F','S','S'][d] });
    if (s > maxDailySecs) maxDailySecs = s;
  }

  var curYear = now.getFullYear();
  var curMonth = now.getMonth();
  var monthSecs = 0;
  for (var dateKey in hist) {
    if (hist.hasOwnProperty(dateKey)) {
      var parts = dateKey.split('-');
      if (parseInt(parts[0], 10) === curYear && parseInt(parts[1], 10) === (curMonth + 1)) {
        monthSecs += hist[dateKey];
      }
    }
  }

  var todayEl = document.getElementById('statsToday');
  var weekEl = document.getElementById('statsWeek');
  var monthEl = document.getElementById('statsMonth');
  var streakEl = document.getElementById('statsStreak');
  if (todayEl) todayEl.textContent = formatStatsDuration(todaySecs);
  if (weekEl) weekEl.textContent = Math.floor(weekSecs / 3600) + 'h ' + Math.floor((weekSecs % 3600) / 60) + 'm';
  if (monthEl) monthEl.textContent = Math.floor(monthSecs / 3600) + 'h ' + Math.floor((monthSecs % 3600) / 60) + 'm';
  if (streakEl) {
    var streakDays = calculateStreak(hist, todayKey);
    streakEl.textContent = streakDays + (streakDays === 1 ? ' Day Streak' : ' Days Streak');
  }

  var dailyGoalInput = document.getElementById('dailyGoalInput');
  var goalHours = parseFloat((dailyGoalInput && dailyGoalInput.value) || localStorage.getItem('pomodoro_daily_goal') || '2') || 2;
  var goalSecs = goalHours * 3600;
  var goalPct = Math.min(100, Math.round((todaySecs / goalSecs) * 100));
  var goalPercentEl = document.getElementById('goalPercent');
  var goalBarFillEl = document.getElementById('goalBarFill');
  var goalSubEl = document.getElementById('goalSub');

  if (goalPercentEl) {
    goalPercentEl.textContent = (goalPct >= 100 ? '🏆 ' : '') + goalPct + '%';
  }
  if (goalBarFillEl) {
    goalBarFillEl.style.width = goalPct + '%';
    if (goalPct >= 100) {
      goalBarFillEl.classList.add('reached');
    } else {
      goalBarFillEl.classList.remove('reached');
    }
  }
  if (goalSubEl) {
    goalSubEl.textContent = formatStatsDuration(todaySecs) + ' / ' + goalHours + 'h';
  }

  var chartEl = document.getElementById('statsChart');
  if (chartEl) {
    chartEl.innerHTML = '';
    weekDaily.forEach(function(day) {
      var col = document.createElement('div');
      col.className = 'chart-col';
      var pct = day.secs > 0 ? Math.max(15, Math.round((day.secs / maxDailySecs) * 100)) : 8;
      var barClass = 'chart-bar' + (day.secs > 0 ? ' active' : '') + (day.isToday ? ' today' : '');
      var title = day.key + ': ' + formatStatsDuration(day.secs);
      col.innerHTML = '<div class="chart-bar-wrap" title="' + title + '"><div class="' + barClass + '" style="height:' + pct + '%;"></div></div><span class="chart-lbl">' + day.dayLetter + '</span>';
      chartEl.appendChild(col);
    });
  }

  if (typeof renderLeaderboard === 'function') {
    renderLeaderboard();
  }
}

function addFocusSecond() {
  var hist = getHistory();
  var k = getLocalDateKey();
  hist[k] = (hist[k] || 0) + 1;
  saveHistory(hist);
  updateAllStatsUI();
}

function addFocusSeconds(n) {
  if (n <= 0) return;
  var hist = getHistory();
  var k = getLocalDateKey();
  hist[k] = (hist[k] || 0) + n;
  saveHistory(hist);
  updateAllStatsUI();
}

// Tasks & Goals Management
function getActiveGoalText() {
  for (var i = 0; i < currentGoals.length; i++) {
    if (!currentGoals[i].done) return currentGoals[i].text;
  }
  return currentGoals.length > 0 ? 'All goals done! 🎉' : '';
}

function renderGoalsList() {
  var goalsList = document.getElementById('goalsList');
  var tasksEmptyHint = document.getElementById('tasksEmptyHint');
  if (!goalsList) return;
  goalsList.innerHTML = '';

  if (currentGoals.length === 0) {
    if (tasksEmptyHint) tasksEmptyHint.style.display = 'block';
    currentTaskName = '';
    drawPipFrame();
    return;
  }
  if (tasksEmptyHint) tasksEmptyHint.style.display = 'none';

  currentGoals.forEach(function(g, idx) {
    var item = document.createElement('div');
    item.className = 'goal-item' + (g.done ? ' completed' : '');
    item.setAttribute('data-idx', idx);

    var checkbox = document.createElement('div');
    checkbox.className = 'goal-item-checkbox';
    checkbox.textContent = g.done ? '✓' : '';

    var textSpan = document.createElement('span');
    textSpan.className = 'goal-item-text';
    textSpan.textContent = g.text;

    var delBtn = document.createElement('button');
    delBtn.className = 'goal-item-delete';
    delBtn.title = 'Delete task';
    delBtn.textContent = '✕';
    delBtn.setAttribute('aria-label', 'Delete task');
    delBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      deleteGoal(idx);
    });

    item.appendChild(checkbox);
    item.appendChild(textSpan);
    item.appendChild(delBtn);

    item.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleGoal(idx);
    });

    goalsList.appendChild(item);
  });

  currentTaskName = getActiveGoalText();
  drawPipFrame();
}

function deleteGoal(idx) {
  if (idx < 0 || idx >= currentGoals.length) return;
  currentGoals.splice(idx, 1);
  renderGoalsList();
  if (typeof saveSessionState === 'function') saveSessionState();
}

function toggleGoal(idx) {
  if (idx < 0 || idx >= currentGoals.length) return;
  var g = currentGoals[idx];
  g.done = !g.done;
  if (g.done) {
    if (typeof beep === 'function') beep();
    var goalCelebrations = [
      'Goal ticked off! 🎉 You are on fire!',
      'Checked off: ' + g.text + '! 🐾 Proud of you!',
      'One step closer to victory! 🌟 Awesome job!',
      'Level up! Goal conquered! ✨',
      'Look at that momentum! 🚀 Keep shining!'
    ];
    var celebrationMsg = goalCelebrations[Math.floor(Math.random() * goalCelebrations.length)];
    if (typeof triggerCelebration === 'function') triggerCelebration(celebrationMsg);
  }
  renderGoalsList();
  if (typeof saveSessionState === 'function') saveSessionState();
}

// Picture-in-Picture Mini Float Window
function drawPipFrame() {
  var pipCanvas = document.getElementById('pipCanvas');
  if (!pipCanvas) return;
  var pipCtx = pipCanvas.getContext('2d');
  if (!pipCtx) return;

  var w = pipCanvas.width;
  var h = pipCanvas.height;

  var isLight = document.body.classList.contains('light-theme');
  pipCtx.fillStyle = isLight ? '#f5f5f7' : '#0e0e11';
  pipCtx.fillRect(0, 0, w, h);

  var p = plan && plan[index];
  var isBreak = p && p.type === 'break';
  var computedStyles = getComputedStyle(document.body);
  var accentColor = computedStyles.getPropertyValue(isBreak ? '--break' : '--focus').trim() || (isBreak ? '#9c8da6' : '#ff335c');
  var totalSec = p ? p.duration * 60 : 1500;
  var rem = remainingSeconds !== undefined ? remainingSeconds : totalSec;
  var progress = totalSec > 0 ? Math.max(0, Math.min(1, (totalSec - rem) / totalSec)) : 0;

  var hasTask = !!(currentTaskName && currentTaskName.trim());
  var cx = w / 2;
  var cy = Math.round(h / 2);
  var r = 58;

  pipCtx.beginPath();
  pipCtx.arc(cx, cy, r, 0, Math.PI * 2);
  pipCtx.strokeStyle = isLight ? '#e2e2e8' : '#232029';
  pipCtx.lineWidth = 6;
  pipCtx.stroke();

  pipCtx.beginPath();
  var startAngle = -Math.PI / 2;
  var endAngle = startAngle + (Math.PI * 2 * progress);
  pipCtx.arc(cx, cy, r, startAngle, endAngle);
  pipCtx.strokeStyle = accentColor;
  pipCtx.lineCap = 'round';
  pipCtx.lineWidth = 6;
  pipCtx.stroke();

  pipCtx.fillStyle = isLight ? '#1d1d1f' : '#faebed';
  pipCtx.font = 'bold 30px monospace';
  pipCtx.textAlign = 'center';
  pipCtx.textBaseline = 'middle';
  pipCtx.fillText(fmtCountdown(rem), cx, cy - 6);

  pipCtx.fillStyle = accentColor;
  pipCtx.font = 'bold 10px -apple-system, sans-serif';
  var labelText = p ? (p.type === 'focus' ? (p.num ? p.num + ' ' : '') + 'FOCUS' : 'BREAK') : 'FOCUS';
  pipCtx.fillText(labelText, cx, cy + 18);

  if (hasTask) {
    pipCtx.fillStyle = isLight ? '#86868b' : '#94868e';
    pipCtx.font = '10px -apple-system, sans-serif';
    var tName = currentTaskName;
    if (tName.length > 20) tName = tName.substring(0, 18) + '...';
    pipCtx.fillText('🎯 ' + tName, cx, h - 12);
  }
}

function togglePip() {
  var pipCanvas = document.getElementById('pipCanvas');
  var pipVideo = document.getElementById('pipVideo');
  if (!pipCanvas || !pipVideo) return;
  if (!document.pictureInPictureElement) {
    drawPipFrame();
    if (!pipVideo.srcObject && pipCanvas.captureStream) {
      pipVideo.srcObject = pipCanvas.captureStream(10);
    }
    pipVideo.play().then(function() {
      return pipVideo.requestPictureInPicture();
    }).catch(function(err) {
      console.warn('PiP error:', err);
    });
  } else {
    document.exitPictureInPicture().catch(function(){});
  }
}

// Theme & Accent Color Palette
function applyTheme(theme) {
  var toggleThemeSetting = document.getElementById('toggleThemeSetting');
  var themeLabel = document.getElementById('themeLabel');
  if (theme === 'light') {
    document.body.classList.add('light-theme');
    if (toggleThemeSetting) toggleThemeSetting.checked = true;
    if (themeLabel) themeLabel.textContent = '☀️ Light Theme';
  } else {
    document.body.classList.remove('light-theme');
    if (toggleThemeSetting) toggleThemeSetting.checked = false;
    if (themeLabel) themeLabel.textContent = '🌙 Dark Theme';
  }
  drawPipFrame();
}

function applyAccentColor(accent) {
  var currentAccent = accent || 'default';
  document.body.classList.remove('accent-blue', 'accent-green', 'accent-purple');
  if (currentAccent !== 'default') {
    document.body.classList.add('accent-' + currentAccent);
  }
  var swatches = document.querySelectorAll('.color-circle');
  swatches.forEach(function(btn) {
    if (btn.getAttribute('data-color') === currentAccent) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  localStorage.setItem('pomodoro_accent_color', currentAccent);
  drawPipFrame();
}
window.applyAccentColor = applyAccentColor;

// Settings Modal Management
function openSettings() {
  var settingsMenu = document.getElementById('settingsMenu');
  var toggleThemeSetting = document.getElementById('toggleThemeSetting');
  var themeLabel = document.getElementById('themeLabel');
  var toggleZenSetting = document.getElementById('toggleZenSetting');
  var toggleTasksSetting = document.getElementById('toggleTasksSetting');
  var toggleLeaderboardSetting = document.getElementById('toggleLeaderboardSetting');
  var togglePetSetting = document.getElementById('togglePetSetting');
  var toggleBubbleSetting = document.getElementById('toggleBubbleSetting');
  var toggleStatsSetting = document.getElementById('toggleStatsSetting');
  var toggleToolsSetting = document.getElementById('toggleToolsSetting');
  var toggleSoundSetting = document.getElementById('toggleSoundSetting');
  var toggleTtsSetting = document.getElementById('toggleTtsSetting');
  var togglePublicLbSetting = document.getElementById('togglePublicLbSetting');
  var toggleAnonStatsSetting = document.getElementById('toggleAnonStatsSetting');

  var tasksPanel = document.getElementById('tasksPanel');
  var leaderboardPanel = document.getElementById('leaderboardPanel');
  var petCompanion = document.getElementById('petCompanion');
  var petBubble = document.getElementById('petBubble');
  var statsPanel = document.getElementById('statsPanel');
  var toolsPanel = document.getElementById('toolsPanel');

  if (settingsMenu) {
    settingsMenu.style.display = 'block';
    if (toggleThemeSetting) toggleThemeSetting.checked = document.body.classList.contains('light-theme');
    if (themeLabel) themeLabel.textContent = document.body.classList.contains('light-theme') ? '☀️ Light Theme' : '🌙 Dark Theme';
    applyAccentColor(localStorage.getItem('pomodoro_accent_color') || 'default');
    if (toggleZenSetting) toggleZenSetting.checked = document.body.classList.contains('zen-mode');
    if (toggleTasksSetting && tasksPanel) toggleTasksSetting.checked = tasksPanel.style.display !== 'none';
    if (toggleLeaderboardSetting && leaderboardPanel) toggleLeaderboardSetting.checked = leaderboardPanel.style.display !== 'none';
    if (togglePetSetting && petCompanion) togglePetSetting.checked = petCompanion.style.display !== 'none';
    if (toggleBubbleSetting && petBubble) toggleBubbleSetting.checked = petBubble.style.display !== 'none';
    if (toggleStatsSetting && statsPanel) toggleStatsSetting.checked = statsPanel.style.display !== 'none';
    if (toggleToolsSetting && toolsPanel) toggleToolsSetting.checked = toolsPanel.style.display !== 'none';
    if (toggleSoundSetting) toggleSoundSetting.checked = soundEnabled;
    if (toggleTtsSetting) toggleTtsSetting.checked = ttsEnabled;
    if (togglePublicLbSetting) togglePublicLbSetting.checked = (typeof publicLeaderboardEnabled !== 'undefined' ? publicLeaderboardEnabled : true);
    if (toggleAnonStatsSetting) toggleAnonStatsSetting.checked = (typeof anonStatsEnabled !== 'undefined' ? anonStatsEnabled : false);
  }
}

function closeSettings() {
  var settingsMenu = document.getElementById('settingsMenu');
  if (settingsMenu) settingsMenu.style.display = 'none';
}

// Stage Rendering & Core Countdown Mechanics
function doneFocusCount() {
  var c = 0;
  for (var i = 0; i < index; i++) {
    if (plan[i].type === 'focus') c++;
  }
  return c;
}

function renderDots() {
  var progressDots = document.getElementById('progressDots');
  if (!progressDots) return;
  progressDots.innerHTML = '';
  for (var i = 0; i <= index; i++) {
    var p = plan[i];
    if (p.type !== 'focus') continue;
    var dot = document.createElement('div');
    dot.className = 'dot';
    if (i < index) dot.className += ' done';
    else if (i === index) dot.className += ' current';
    progressDots.appendChild(dot);
  }
}

function applyStage() {
  var stageCard = document.getElementById('stageCard');
  var phaseLabel = document.getElementById('phaseLabel');
  var subtextEl = document.getElementById('subtext');
  var doneCountEl = document.getElementById('doneCount');
  var clockTimeEl = document.getElementById('clockTime');

  var p = plan[index];
  stageCard.className = 'stage ' + p.type;
  if (p.type === 'focus') {
    phaseLabel.textContent = p.num + ' ' + p.label;
    subtextEl.textContent = 'Heads down. Break right after.';
    updateFavicon('⏱️');
    if (typeof setCatState === 'function') setCatState('focus');
    if (running && typeof startAmbientAudio === 'function') startAmbientAudio();
  } else {
    phaseLabel.textContent = p.label;
    subtextEl.textContent = 'Step away, stretch, drink water.';
    updateFavicon('☕');
    if (typeof setCatState === 'function') setCatState('break');
    if (typeof stopAmbientAudio === 'function') stopAmbientAudio();
  }
  var count = doneFocusCount();
  doneCountEl.textContent = count + (count === 1 ? ' focus round completed' : ' focus rounds completed');
  clockTimeEl.textContent = '';
  renderDots();
  document.title = fmtCountdown(remainingSeconds) + ' · ' + phaseLabel.textContent;
  if (typeof updatePetBubble === 'function') updatePetBubble();
  renderGoalsList();
  drawPipFrame();
}

function tick() {
  var nowMs = Date.now();
  var diffSecs = Math.max(0, Math.round((targetEndTime - nowMs) / 1000));
  
  if (plan[index].type === 'focus') {
    addFocusSecond();
  }

  remainingSeconds = diffSecs;
  if (remainingSeconds <= 0) {
    advance(true);
    return;
  }
  var clockEl = document.getElementById('clock');
  var phaseLabel = document.getElementById('phaseLabel');
  if (clockEl) clockEl.textContent = fmtCountdown(remainingSeconds);
  if (phaseLabel) document.title = fmtCountdown(remainingSeconds) + ' · ' + phaseLabel.textContent;
  if (remainingSeconds % 5 === 0) {
    saveSessionState();
  }
  drawPipFrame();
}

function advance(announce) {
  clearInterval(timerId);
  index += 1;
  if (index >= plan.length - 2) {
    var last = plan[plan.length - 1];
    var nextNum = Math.floor(plan.length / 2) + 1;
    var numStr = nextNum < 10 ? '0' + nextNum : String(nextNum);
    var focusDur = parseInt(document.getElementById('focusDur').value, 10) || 25;
    var breakDur = parseInt(document.getElementById('shortBreakDur').value, 10) || 5;
    var t = last.start + last.duration;
    plan.push({ type: 'focus', label: 'Focus', num: numStr, start: t, duration: focusDur });
    plan.push({ type: 'break', label: 'Break', start: t + focusDur, duration: breakDur });
  }
  var p = plan[index];
  remainingSeconds = p.duration * 60;
  targetEndTime = Date.now() + remainingSeconds * 1000;
  applyStage();
  var clockEl = document.getElementById('clock');
  if (clockEl) clockEl.textContent = fmtCountdown(remainingSeconds);

  if (announce) {
    if (plan[index - 1] && plan[index - 1].type === 'focus') {
      if (typeof triggerCelebration === 'function') triggerCelebration(pickRandom(focusDoneCelebrations));
    } else if (plan[index - 1] && plan[index - 1].type === 'break') {
      if (typeof triggerCelebration === 'function') triggerCelebration(pickRandom(breakDoneCelebrations));
    }
    if (typeof beep === 'function') beep();
    var ttsText = p.type === 'focus' ? 'Break finished! Ready to focus.' : 'Focus completed! Time for a break.';
    if (typeof speak === 'function') speak(ttsText);

    var msg = p.type === 'focus' ? 'Ready to focus' : 'Break time';
    if (typeof notify === 'function') notify(msg, fmtCountdown(remainingSeconds) + ' on the clock');
  }

  var playPauseBtn = document.getElementById('playPauseBtn');
  running = false;
  if (playPauseBtn) playPauseBtn.textContent = p.type === 'break' ? 'Start Break' : 'Start Focus';
  if (typeof stopAmbientAudio === 'function') stopAmbientAudio();
  saveSessionState();
  drawPipFrame();
}

function startTimer() {
  var playPauseBtn = document.getElementById('playPauseBtn');
  running = true;
  if (playPauseBtn) playPauseBtn.textContent = 'Pause';
  targetEndTime = Date.now() + remainingSeconds * 1000;
  clearInterval(timerId);
  timerId = setInterval(tick, 1000);
  if (plan && plan[index] && plan[index].type === 'focus' && typeof startAmbientAudio === 'function') {
    startAmbientAudio();
  }
  saveSessionState();
  drawPipFrame();
}

function pauseTimer() {
  var playPauseBtn = document.getElementById('playPauseBtn');
  running = false;
  if (playPauseBtn) playPauseBtn.textContent = 'Resume';
  clearInterval(timerId);
  if (typeof stopAmbientAudio === 'function') stopAmbientAudio();
  saveSessionState();
  drawPipFrame();
}

function resetSession() {
  var setupCard = document.getElementById('setupCard');
  var stageCard = document.getElementById('stageCard');
  var petBubble = document.getElementById('petBubble');

  clearInterval(timerId);
  if (typeof stopAmbientAudio === 'function') stopAmbientAudio();
  running = false;
  localStorage.removeItem('pomodoro_active_session');
  if (document.body.classList.contains('zen-mode')) {
    document.body.classList.remove('zen-mode');
  }
  if (setupCard) setupCard.style.display = '';
  if (stageCard) stageCard.style.display = 'none';
  var eyebrow = document.querySelector('.eyebrow');
  if (eyebrow) eyebrow.style.display = 'none';
  if (petBubble) petBubble.textContent = 'ready when you are!';
  updateFavicon('⏱️');
  document.title = 'Flowstate – Pomodoro Timer';
  currentGoals = [];
  renderGoalsList();
  drawPipFrame();
  if (typeof revertCatState === 'function') revertCatState();
  closeSettings();
}

// Session State Persistence (Tab Close Auto-Pause Bug Fix)
function saveSessionState(isUnloading) {
  var stageCard = document.getElementById('stageCard');
  if (!plan || !plan.length || !stageCard || stageCard.style.display === 'none') {
    localStorage.removeItem('pomodoro_active_session');
    return;
  }
  var isRunning = running;
  var currentRemaining = remainingSeconds;

  if (isRunning && targetEndTime) {
    currentRemaining = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000));
  }

  if (isUnloading && pauseOnClose && isRunning) {
    isRunning = false;
  }

  var state = {
    plan: plan,
    index: index,
    remainingSeconds: currentRemaining,
    targetEndTime: targetEndTime,
    running: isRunning,
    currentGoals: currentGoals,
    savedAt: Date.now()
  };
  try {
    localStorage.setItem('pomodoro_active_session', JSON.stringify(state));
  } catch (e) {}
}

function restoreSessionState() {
  try {
    var setupCard = document.getElementById('setupCard');
    var stageCard = document.getElementById('stageCard');
    var clockEl = document.getElementById('clock');
    var playPauseBtn = document.getElementById('playPauseBtn');

    var raw = localStorage.getItem('pomodoro_active_session');
    if (!raw) return false;
    var state = JSON.parse(raw);
    if (!state || !state.plan || !state.plan.length) return false;

    plan = state.plan;
    index = typeof state.index === 'number' ? state.index : 0;
    currentGoals = state.currentGoals || [];
    renderGoalsList();

    var wasRunning = !!state.running;
    if (wasRunning) {
      var now = Date.now();
      var diffSecs = Math.round((state.targetEndTime - now) / 1000);

      while (diffSecs <= 0 && index < plan.length - 1) {
        if (plan[index] && plan[index].type === 'focus') {
          addFocusSeconds(plan[index].duration * 60);
        }
        index++;
        diffSecs = plan[index].duration * 60;
        running = false;
        break;
      }

      if (running && diffSecs > 0) {
        if (plan[index] && plan[index].type === 'focus' && state.remainingSeconds > diffSecs) {
          var elapsedInCurrent = state.remainingSeconds - diffSecs;
          addFocusSeconds(elapsedInCurrent);
        }
        remainingSeconds = diffSecs;
        targetEndTime = Date.now() + remainingSeconds * 1000;
        running = true;
      } else {
        remainingSeconds = plan[index] ? plan[index].duration * 60 : 1500;
        running = false;
      }
    } else {
      remainingSeconds = typeof state.remainingSeconds === 'number' ? state.remainingSeconds : (plan[index] ? plan[index].duration * 60 : 1500);
      running = false;
    }

    if (setupCard) setupCard.style.display = 'none';
    if (stageCard) stageCard.style.display = '';
    var eyebrow = document.querySelector('.eyebrow');
    if (eyebrow) {
      eyebrow.textContent = 'focus session · infinite';
      eyebrow.style.display = '';
    }
    applyStage();
    if (clockEl) clockEl.textContent = fmtCountdown(remainingSeconds);

    if (running) {
      if (playPauseBtn) playPauseBtn.textContent = 'Pause';
      clearInterval(timerId);
      timerId = setInterval(tick, 1000);
      if (plan[index] && plan[index].type === 'focus' && typeof startAmbientAudio === 'function') {
        startAmbientAudio();
      }
    } else {
      if (playPauseBtn) {
        if (plan[index] && plan[index].type === 'break') {
          playPauseBtn.textContent = remainingSeconds === plan[index].duration * 60 ? 'Start Break' : 'Resume';
        } else if (plan[index] && plan[index].type === 'focus') {
          playPauseBtn.textContent = remainingSeconds === plan[index].duration * 60 ? 'Start Focus' : 'Resume';
        } else {
          playPauseBtn.textContent = 'Resume';
        }
      }
    }
    drawPipFrame();
    return true;
  } catch (e) {
    console.error('Error restoring session:', e);
    localStorage.removeItem('pomodoro_active_session');
    return false;
  }
}

// Global Event Listeners & UI Binding
document.addEventListener('DOMContentLoaded', function() {
  var focusDurInput = document.getElementById('focusDur');
  var breakDurInput = document.getElementById('shortBreakDur');
  var dailyGoalInput = document.getElementById('dailyGoalInput');
  var quickTaskInput = document.getElementById('quickTaskInput');
  var beginBtn = document.getElementById('beginBtn');
  var playPauseBtn = document.getElementById('playPauseBtn');
  var skipBtn = document.getElementById('skipBtn');
  var resetBtn = document.getElementById('resetBtn');
  var settingsBtn = document.getElementById('settingsBtn');
  var settingsCloseBtn = document.getElementById('settingsCloseBtn');
  var settingsMenu = document.getElementById('settingsMenu');
  var pipBtn = document.getElementById('pipBtn');
  var zenBtn = document.getElementById('zenBtn');
  var zenExitBtn = document.getElementById('zenExitBtn');

  // Input persistence
  var savedFocusDur = localStorage.getItem('pomodoro_focus_dur');
  var savedBreakDur = localStorage.getItem('pomodoro_break_dur');
  var savedDailyGoal = localStorage.getItem('pomodoro_daily_goal');
  if (savedFocusDur && focusDurInput) focusDurInput.value = savedFocusDur;
  if (savedBreakDur && breakDurInput) breakDurInput.value = savedBreakDur;
  if (savedDailyGoal && dailyGoalInput) dailyGoalInput.value = savedDailyGoal;

  if (focusDurInput) {
    focusDurInput.addEventListener('change', function() {
      localStorage.setItem('pomodoro_focus_dur', focusDurInput.value);
    });
  }
  if (breakDurInput) {
    breakDurInput.addEventListener('change', function() {
      localStorage.setItem('pomodoro_break_dur', breakDurInput.value);
    });
  }
  if (dailyGoalInput) {
    dailyGoalInput.addEventListener('change', function() {
      localStorage.setItem('pomodoro_daily_goal', dailyGoalInput.value);
      updateAllStatsUI();
    });
  }

  // Quick Task Input
  if (quickTaskInput) {
    quickTaskInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var val = quickTaskInput.value.trim();
        if (val) {
          var parts = val.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });
          parts.forEach(function(p) {
            currentGoals.push({ text: p, done: false });
          });
          quickTaskInput.value = '';
          renderGoalsList();
          if (typeof saveSessionState === 'function') saveSessionState();
        }
      }
    });
  }

  // Timer Controls
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', function() {
      if (running) pauseTimer(); else startTimer();
    });
  }
  if (skipBtn) {
    skipBtn.addEventListener('click', function() {
      advance(true);
      if (running) {
        targetEndTime = Date.now() + remainingSeconds * 1000;
        clearInterval(timerId);
        timerId = setInterval(tick, 1000);
      }
      saveSessionState();
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', resetSession);
  }

  if (beginBtn) {
    beginBtn.addEventListener('click', function() {
      var now = new Date();
      var startMinutes = now.getHours() * 60 + now.getMinutes();
      var taskInput = document.getElementById('taskInput');
      var setupCard = document.getElementById('setupCard');
      var stageCard = document.getElementById('stageCard');
      var clockEl = document.getElementById('clock');
      
      var focusDur = parseInt(focusDurInput ? focusDurInput.value : 25, 10) || 25;
      var shortBreak = parseInt(breakDurInput ? breakDurInput.value : 5, 10) || 5;

      localStorage.setItem('pomodoro_focus_dur', focusDur);
      localStorage.setItem('pomodoro_break_dur', shortBreak);
      
      var rawInput = (taskInput && taskInput.value.trim()) || '';
      if (rawInput) {
        var parts = rawInput.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });
        currentGoals = parts.map(function(t) { return { text: t, done: false }; });
      } else {
        currentGoals = [];
      }
      renderGoalsList();

      plan = buildPlan(startMinutes, focusDur, shortBreak);
      index = 0;

      var eyebrow = document.querySelector('.eyebrow');
      if (eyebrow) {
        eyebrow.textContent = 'focus session · infinite';
        eyebrow.style.display = '';
      }
      
      remainingSeconds = plan[0].duration * 60;
      targetEndTime = Date.now() + remainingSeconds * 1000;
      running = false;
      if (setupCard) setupCard.style.display = 'none';
      if (stageCard) stageCard.style.display = '';
      applyStage();
      if (clockEl) clockEl.textContent = fmtCountdown(remainingSeconds);
      startTimer();
      if (typeof speak === 'function') speak('Focus session 1, Begins!');
      saveSessionState();
    });
  }

  // Panel compact toggles
  var tasksToggleBtn = document.getElementById('tasksToggleBtn');
  var tasksPanel = document.getElementById('tasksPanel');
  if (tasksToggleBtn && tasksPanel) {
    tasksToggleBtn.addEventListener('click', function() {
      var isCompact = tasksPanel.classList.toggle('compact');
      tasksToggleBtn.textContent = isCompact ? '+' : '−';
    });
  }

  var leaderboardToggleBtn = document.getElementById('leaderboardToggleBtn');
  var leaderboardPanel = document.getElementById('leaderboardPanel');
  if (leaderboardToggleBtn && leaderboardPanel) {
    leaderboardToggleBtn.addEventListener('click', function() {
      var isCompact = leaderboardPanel.classList.toggle('compact');
      leaderboardToggleBtn.textContent = isCompact ? '+' : '−';
    });
  }

  var statsToggleBtn = document.getElementById('statsToggleBtn');
  var statsPanel = document.getElementById('statsPanel');
  if (statsToggleBtn && statsPanel) {
    statsToggleBtn.addEventListener('click', function() {
      var isCompact = statsPanel.classList.toggle('compact');
      statsToggleBtn.textContent = isCompact ? '+' : '−';
    });
  }

  var toolsToggleBtn = document.getElementById('toolsToggleBtn');
  var toolsPanel = document.getElementById('toolsPanel');
  if (toolsToggleBtn && toolsPanel) {
    toolsToggleBtn.addEventListener('click', function() {
      var isCompact = toolsPanel.classList.toggle('compact');
      toolsToggleBtn.textContent = isCompact ? '+' : '−';
    });
  }

  // Zen Mode
  function toggleZen() {
    document.body.classList.toggle('zen-mode');
  }
  if (zenBtn) zenBtn.addEventListener('click', toggleZen);
  if (zenExitBtn) zenExitBtn.addEventListener('click', toggleZen);

  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.body.classList.contains('zen-mode')) {
      document.body.classList.remove('zen-mode');
    } else if ((e.key === 'z' || e.key === 'Z') && document.activeElement.tagName !== 'INPUT') {
      toggleZen();
    }
  });

  // Settings Menu Logic
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (settingsMenu && settingsMenu.style.display === 'block') {
        closeSettings();
      } else {
        openSettings();
      }
    });
  }

  if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeSettings();
    });
  }

  document.addEventListener('click', function(e) {
    if (settingsMenu && settingsMenu.style.display === 'block') {
      if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
        closeSettings();
      }
    }
  });

  // Settings Tabs
  var settingsTabBtns = document.querySelectorAll('.settings-tab');
  settingsTabBtns.forEach(function(tabBtn) {
    tabBtn.addEventListener('click', function(e) {
      if (e) e.stopPropagation();
      var targetTab = tabBtn.getAttribute('data-tab');
      settingsTabBtns.forEach(function(b) { b.classList.remove('active'); });
      tabBtn.classList.add('active');

      var tabContents = document.querySelectorAll('.settings-tab-content');
      tabContents.forEach(function(content) {
        if (content.id === 'tab' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1)) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });

  // Theme & Accent Color Initial Setup
  var savedTheme = localStorage.getItem('pomodoro_theme') || 'dark';
  applyTheme(savedTheme);

  var toggleThemeSetting = document.getElementById('toggleThemeSetting');
  if (toggleThemeSetting) {
    toggleThemeSetting.addEventListener('change', function() {
      var nextTheme = toggleThemeSetting.checked ? 'light' : 'dark';
      localStorage.setItem('pomodoro_theme', nextTheme);
      applyTheme(nextTheme);
    });
  }

  var currentAccent = localStorage.getItem('pomodoro_accent_color') || 'default';
  applyAccentColor(currentAccent);

  var colorCircles = document.querySelectorAll('.color-circle');
  colorCircles.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      var chosen = btn.getAttribute('data-color');
      applyAccentColor(chosen);
    });
  });

  // Toggles inside Settings Modal
  var toggleZenSetting = document.getElementById('toggleZenSetting');
  if (toggleZenSetting) {
    toggleZenSetting.addEventListener('change', function() {
      if (toggleZenSetting.checked) {
        document.body.classList.add('zen-mode');
      } else {
        document.body.classList.remove('zen-mode');
      }
    });
  }

  var rightSidebar = document.getElementById('rightSidebar');
  function updateRightSidebarVisibility() {
    if (!rightSidebar) return;
    var tasksVis = tasksPanel && tasksPanel.style.display !== 'none';
    var lbVis = leaderboardPanel && leaderboardPanel.style.display !== 'none';
    rightSidebar.style.display = (tasksVis || lbVis) ? 'flex' : 'none';
  }

  var toggleTasksSetting = document.getElementById('toggleTasksSetting');
  if (toggleTasksSetting && tasksPanel) {
    var savedTasks = localStorage.getItem('pomodoro_show_tasks');
    if (savedTasks === 'false') {
      tasksPanel.style.display = 'none';
      toggleTasksSetting.checked = false;
      updateRightSidebarVisibility();
    }
    toggleTasksSetting.addEventListener('change', function() {
      tasksPanel.style.display = toggleTasksSetting.checked ? 'block' : 'none';
      updateRightSidebarVisibility();
      localStorage.setItem('pomodoro_show_tasks', toggleTasksSetting.checked);
    });
  }

  var toggleLeaderboardSetting = document.getElementById('toggleLeaderboardSetting');
  if (toggleLeaderboardSetting && leaderboardPanel) {
    var savedLb = localStorage.getItem('pomodoro_show_leaderboard');
    if (savedLb === 'false') {
      leaderboardPanel.style.display = 'none';
      toggleLeaderboardSetting.checked = false;
      updateRightSidebarVisibility();
    }
    toggleLeaderboardSetting.addEventListener('change', function() {
      leaderboardPanel.style.display = toggleLeaderboardSetting.checked ? 'block' : 'none';
      updateRightSidebarVisibility();
      localStorage.setItem('pomodoro_show_leaderboard', toggleLeaderboardSetting.checked);
    });
  }

  var petCompanion = document.getElementById('petCompanion');
  var togglePetSetting = document.getElementById('togglePetSetting');
  if (togglePetSetting && petCompanion) {
    var savedPet = localStorage.getItem('pomodoro_show_pet');
    if (savedPet === 'false') {
      petCompanion.style.display = 'none';
      togglePetSetting.checked = false;
    }
    togglePetSetting.addEventListener('change', function() {
      petCompanion.style.display = togglePetSetting.checked ? 'flex' : 'none';
      localStorage.setItem('pomodoro_show_pet', togglePetSetting.checked);
    });
  }

  var petBubble = document.getElementById('petBubble');
  var toggleBubbleSetting = document.getElementById('toggleBubbleSetting');
  if (toggleBubbleSetting && petBubble) {
    var savedBubble = localStorage.getItem('pomodoro_show_bubble');
    if (savedBubble === 'false') {
      petBubble.style.display = 'none';
      toggleBubbleSetting.checked = false;
    }
    toggleBubbleSetting.addEventListener('change', function() {
      petBubble.style.display = toggleBubbleSetting.checked ? 'block' : 'none';
      localStorage.setItem('pomodoro_show_bubble', toggleBubbleSetting.checked);
    });
  }

  var leftSidebar = document.getElementById('leftSidebar');
  function updateLeftSidebarVisibility() {
    if (!leftSidebar) return;
    var showStats = !statsPanel || statsPanel.style.display !== 'none';
    var showTools = !toolsPanel || toolsPanel.style.display !== 'none';
    leftSidebar.style.display = (showStats || showTools) ? 'flex' : 'none';
  }

  var toggleStatsSetting = document.getElementById('toggleStatsSetting');
  if (toggleStatsSetting && statsPanel) {
    var savedStats = localStorage.getItem('pomodoro_show_stats');
    if (savedStats === 'false') {
      statsPanel.style.display = 'none';
      toggleStatsSetting.checked = false;
    }
    toggleStatsSetting.addEventListener('change', function() {
      statsPanel.style.display = toggleStatsSetting.checked ? 'block' : 'none';
      localStorage.setItem('pomodoro_show_stats', toggleStatsSetting.checked);
      updateLeftSidebarVisibility();
    });
  }

  var toggleToolsSetting = document.getElementById('toggleToolsSetting');
  if (toggleToolsSetting && toolsPanel) {
    var savedTools = localStorage.getItem('pomodoro_show_tools');
    if (savedTools === 'false') {
      toolsPanel.style.display = 'none';
      toggleToolsSetting.checked = false;
    }
    toggleToolsSetting.addEventListener('change', function() {
      toolsPanel.style.display = toggleToolsSetting.checked ? 'flex' : 'none';
      localStorage.setItem('pomodoro_show_tools', toggleToolsSetting.checked);
      updateLeftSidebarVisibility();
    });
  }
  updateLeftSidebarVisibility();

  var toggleSoundSetting = document.getElementById('toggleSoundSetting');
  if (toggleSoundSetting) {
    toggleSoundSetting.checked = soundEnabled;
    toggleSoundSetting.addEventListener('change', function() {
      soundEnabled = toggleSoundSetting.checked;
      localStorage.setItem('pomodoro_sound_enabled', soundEnabled);
    });
  }

  var toggleTtsSetting = document.getElementById('toggleTtsSetting');
  if (toggleTtsSetting) {
    toggleTtsSetting.checked = ttsEnabled;
    toggleTtsSetting.addEventListener('change', function() {
      ttsEnabled = toggleTtsSetting.checked;
      localStorage.setItem('pomodoro_tts_enabled', ttsEnabled);
    });
  }


  // PiP Button Listener
  if (pipBtn) pipBtn.addEventListener('click', togglePip);

  // Initialize UI & Active Session State
  updateAllStatsUI();
  restoreSessionState();
});

// Page Visibility & Unload Handlers
window.addEventListener('beforeunload', function() {
  saveSessionState(true);
});
window.addEventListener('pagehide', function() {
  saveSessionState(true);
});
