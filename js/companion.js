// Cat Companion Poses & Quotes State Management
var CAT_IMAGES = {
  idle: 'assets/cats/idle.png',
  focus: 'assets/cats/focus.png',
  break: 'assets/cats/break.png',
  celebration: 'assets/cats/celebration.png'
};

var currentCatState = 'idle';
var catRevertTimer = null;

function setCatState(state, tempDurationMs) {
  var petImg = document.getElementById('petImg');
  if (!petImg || !CAT_IMAGES[state]) return;

  if (catRevertTimer) {
    clearTimeout(catRevertTimer);
    catRevertTimer = null;
  }

  petImg.src = CAT_IMAGES[state];

  if (tempDurationMs && tempDurationMs > 0) {
    catRevertTimer = setTimeout(function() {
      catRevertTimer = null;
      revertCatState();
    }, tempDurationMs);
  } else {
    currentCatState = state;
  }
}

function revertCatState() {
  if (catRevertTimer) {
    clearTimeout(catRevertTimer);
    catRevertTimer = null;
  }
  var stageCard = document.getElementById('stageCard');
  if (stageCard && stageCard.style.display !== 'none' && typeof plan !== 'undefined' && plan && plan[index]) {
    setCatState(plan[index].type === 'focus' ? 'focus' : 'break');
    updatePetBubble(true);
  } else {
    setCatState('idle');
    updatePetBubble(true);
  }
}

var focusQuirks = [
  'locked in 🧠🔥',
  'typing furiously 🐾',
  'doing big cat maths 📐',
  'no thoughts, only focus 🎯',
  'grind never stops ✨',
  'chef is cooking 🍳',
  '9999 IQ moment 💡',
  'laser eyes on the prize 👁️',
  'shh, in the zone 🤫',
  'paws flying at 100wpm ⚡',
  'executing master plan 📝',
  'syntax error? not on my watch 🕵️‍♂️',
  'focusing so hard I forgot how to meow 🤐',
  'dialed in completely 📡',
  'speedrunning productivity 🚀',
  'brain is glowing 🌟',
  'do not disturb the scholar 🎓',
  'manifesting maximum output 🔮',
  'crushing tasks left and right 💥',
  'pure unadulterated focus 🗿',
  'typing like the keyboard owes me money 💸',
  'main character work ethic 🎬',
  'overthinking? nah, overachieving 🏆',
  'flow state activated 🌊'
];

var breakQuirks = [
  'snack time acquired 🐟',
  'stretching the beans 🐾',
  'drinking water rn 💧',
  'vibing peacefully 🎶',
  'recharging batteries 🔋',
  'belly warm, brain calm ☀️',
  '360 loaf rotation 🍞',
  'head empty, vibes only ☁️',
  'pat the cat for luck 🍀',
  'well-earned nap ~ 💤',
  'inspecting invisible bugs in the air 🐛',
  'time to un-shrimp your posture 🦐',
  'inhale peace, exhale bugs 🌸',
  'existential pondering time 🌌',
  'stare into the void for 5 mins 🕳️',
  'blinking slowly at you 😻',
  'catnap protocol initialized 🛌',
  'stretch those toe beans 🧘',
  'sipping tea with pinky up 🍵',
  'celebrating mini victory 🎉',
  'basking in the imaginary sunbeam ☀️'
];

var idleQuirks = [
  'ready when you are! 🐾',
  'stretching my paws 🐱',
  'today is a good focus day ☕',
  'waiting patiently 🍞',
  'here to cheer you on! ✨',
  'awaiting orders, captain 🫡',
  'pre-focus nap completed 😴',
  'ready to lock in whenever you hit start 🚀',
  'calibrating motivation levels 📈',
  'whisker sensors detecting greatness 🎯',
  'let us conquer today 👑'
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function updatePetBubble(force) {
  if (catRevertTimer && !force) return;
  var petBubble = document.getElementById('petBubble');
  if (!petBubble) return;
  var stageCard = document.getElementById('stageCard');
  if (stageCard && stageCard.style.display !== 'none' && typeof plan !== 'undefined' && plan && plan[index]) {
    petBubble.textContent = plan[index].type === 'focus' ? pickRandom(focusQuirks) : pickRandom(breakQuirks);
  } else {
    petBubble.textContent = pickRandom(idleQuirks);
  }
}

// Celebration Engine (Pastel Confetti + Floating Cat Hearts)
var confettiCanvas = document.getElementById('confettiCanvas');
var confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
var confettiParticles = [];
var confettiAnimId = null;

function launchConfetti() {
  confettiCanvas = confettiCanvas || document.getElementById('confettiCanvas');
  confettiCtx = confettiCtx || (confettiCanvas ? confettiCanvas.getContext('2d') : null);
  if (!confettiCanvas || !confettiCtx) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiCanvas.style.display = 'block';

  var pastelColors = ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e8c5ff', '#ffd1dc', '#c1e1c1', '#ffe4e1'];
  confettiParticles = [];
  var count = 75;
  for (var i = 0; i < count; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * (confettiCanvas.height * 0.4) - 20,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 7 + 5,
      color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 8,
      opacity: 1,
      shape: Math.random() > 0.4 ? 'rect' : 'circle'
    });
  }

  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  var startTime = Date.now();

  function frame() {
    var elapsed = Date.now() - startTime;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    var alive = 0;

    for (var i = 0; i < confettiParticles.length; i++) {
      var p = confettiParticles[i];
      p.x += p.vx;
      p.vy += 0.12;
      p.y += p.vy;
      p.rotation += p.vRot;
      if (elapsed > 1800) {
        p.opacity -= 0.025;
      }

      if (p.opacity > 0 && p.y < confettiCanvas.height + 20) {
        alive++;
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.globalAlpha = Math.max(0, p.opacity);
        confettiCtx.fillStyle = p.color;
        if (p.shape === 'rect') {
          confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          confettiCtx.beginPath();
          confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          confettiCtx.fill();
        }
        confettiCtx.restore();
      }
    }

    if (alive > 0 && elapsed < 3500) {
      confettiAnimId = requestAnimationFrame(frame);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiCanvas.style.display = 'none';
      confettiAnimId = null;
    }
  }
  confettiAnimId = requestAnimationFrame(frame);
}

function spawnCatHearts() {
  var pet = document.getElementById('petCompanion');
  if (!pet || pet.style.display === 'none') return;
  var rect = pet.getBoundingClientRect();
  var emojis = ['💖', '✨', '🌸', '💕', '⭐', '🐾'];
  var numHearts = 7;
  for (var i = 0; i < numHearts; i++) {
    (function(idx) {
      setTimeout(function() {
        var el = document.createElement('div');
        el.className = 'floating-cat-heart';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        var startX = rect.left + rect.width / 2 + (Math.random() - 0.5) * 40;
        var startY = rect.top + (Math.random() - 0.5) * 20;
        el.style.left = startX + 'px';
        el.style.top = startY + 'px';
        el.style.setProperty('--rx', ((Math.random() - 0.5) * 60) + 'px');
        el.style.setProperty('--rot', ((Math.random() - 0.5) * 30) + 'deg');
        document.body.appendChild(el);
        setTimeout(function() {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 1900);
      }, idx * 100);
    })(i);
  }
}

var focusDoneCelebrations = [
  'Focus session complete! 🎉 Amazing work!',
  'You crushed that focus round! 🌟 Time to recharge!',
  'Round finished! 🐾 So proud of you!',
  'Woohoo! Focus time conquered! ✨ Enjoy your break!',
  'Outstanding focus! 🏆 Treat yourself!',
  'Mission accomplished! 🚀 Rest up for the next round!'
];

var breakDoneCelebrations = [
  'Break complete! 🚀 Ready to lock in!',
  'Recharged and energized! ⚡ Let us conquer this!',
  'Back in action! 🎯 Time for greatness!',
  'Feeling refreshed! 🌟 Focus mode activated!'
];

function triggerCelebration(customBubbleText) {
  launchConfetti();
  spawnCatHearts();
  if (typeof setCatState === 'function') {
    setCatState('celebration', 10000);
  }
  var petBubble = document.getElementById('petBubble');
  if (petBubble) {
    petBubble.textContent = customBubbleText || pickRandom(focusDoneCelebrations);
  }
}

// Click handlers for pet companion
document.addEventListener('DOMContentLoaded', function() {
  var petBubble = document.getElementById('petBubble');
  if (petBubble) {
    petBubble.addEventListener('click', function() {
      petBubble.classList.toggle('compact');
    });
  }
  var petImg = document.getElementById('petImg');
  if (petImg) {
    petImg.addEventListener('click', function() {
      spawnCatHearts();
      petImg.classList.remove('bounce');
      petImg.classList.remove('purring');
      void petImg.offsetWidth;
      petImg.classList.add('bounce');
      if (!catRevertTimer && typeof updatePetBubble === 'function') {
        updatePetBubble(true);
      }
    });
  }
});

// Rotate quotes periodically during active session
setInterval(function() {
  if (typeof running !== 'undefined' && running) {
    updatePetBubble();
  }
}, 25000);
