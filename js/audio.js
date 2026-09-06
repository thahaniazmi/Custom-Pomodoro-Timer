// Web Audio API Sound Chimes, TTS, Notifications & Synthesized Ambient Noise Generators
var audioCtx;

function beep() {
  if (typeof soundEnabled !== 'undefined' && !soundEnabled) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    var o = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = 720;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    o.start(); o.stop(audioCtx.currentTime + 0.55);

    var o2 = audioCtx.createOscillator();
    var g2 = audioCtx.createGain();
    o2.connect(g2); g2.connect(audioCtx.destination);
    o2.frequency.value = 960;
    g2.gain.setValueAtTime(0.0001, audioCtx.currentTime + 0.18);
    g2.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.2);
    g2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.7);
    o2.start(audioCtx.currentTime + 0.18); o2.stop(audioCtx.currentTime + 0.75);
  } catch (e) {}
}

function speak(text) {
  if (typeof ttsEnabled !== 'undefined' && !ttsEnabled) return;
  if ('speechSynthesis' in window) {
    var utterance = new SpeechSynthesisUtterance(text);
    var voices = window.speechSynthesis.getVoices();
    var femaleVoice = voices.find(function(v) {
      var n = v.name.toLowerCase();
      return n.includes('female') || n.includes('zira') || n.includes('samantha') || n.includes('victoria') || n.includes('karen') || n.includes('tessa') || n.includes('moira');
    });
    if (femaleVoice) utterance.voice = femaleVoice;
    window.speechSynthesis.speak(utterance);
  }
}

function notify(title, body) {
  if (window.Notification && Notification.permission === 'granted') {
    try { new Notification(title, { body: body }); } catch (e) {}
  }
}

// Ambient Sound Synthesizer
var ambientSound = localStorage.getItem('pomodoro_ambient_sound') || 'none';
var ambientVolume = parseFloat(localStorage.getItem('pomodoro_ambient_vol') || '0.5');

var ambientAudioSource = null;
var ambientGainNode = null;
var ambientFilterNode = null;
var isAmbientActive = false;

function createNoiseBuffer(type) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  var sampleRate = audioCtx.sampleRate;
  var bufferSize = sampleRate * 5;
  var buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
  var data = buffer.getChannelData(0);

  if (type === 'brown') {
    var lastOut = 0.0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 3.5;
    }
  } else if (type === 'pink') {
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else if (type === 'rain') {
    var r0 = 0, r1 = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      r0 = 0.985 * r0 + white * 0.055;
      r1 = 0.94 * r1 + white * 0.095;
      var sample = (r0 + r1) * 0.22;
      if (Math.random() < 0.003) {
        sample += (Math.random() * 0.5 - 0.25);
      }
      data[i] = sample;
    }
  } else if (type === 'fire') {
    var f0 = 0;
    var crackleDecay = 0;
    var crackleAmp = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      f0 = (f0 + (0.015 * white)) / 1.015;
      var sample = f0 * 2.8;
      if (crackleDecay > 0) {
        sample += (Math.random() * 2 - 1) * crackleAmp;
        crackleAmp *= 0.88;
        crackleDecay--;
      } else if (Math.random() < 0.0008) {
        crackleDecay = Math.floor(Math.random() * 12) + 4;
        crackleAmp = Math.random() * 0.65 + 0.25;
      } else if (Math.random() < 0.004) {
        sample += (Math.random() * 2 - 1) * 0.28;
      }
      data[i] = Math.max(-1, Math.min(1, sample));
    }
  } else if (type === 'cafe') {
    var c0 = 0, c1 = 0;
    var clinkDecay = 0;
    var clinkFreq = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      c0 = 0.95 * c0 + white * 0.06;
      c1 = 0.98 * c1 + c0 * 0.05;
      var mod = 0.7 + 0.3 * Math.sin((i / sampleRate) * 2 * Math.PI * 0.4);
      var sample = (c0 * 0.6 + c1 * 0.8) * mod * 0.35;
      if (clinkDecay > 0) {
        var t = (500 - clinkDecay) / sampleRate;
        sample += Math.sin(2 * Math.PI * clinkFreq * t) * Math.exp(-t * 18) * 0.18;
        clinkDecay--;
      } else if (Math.random() < 0.00015) {
        clinkDecay = 400;
        clinkFreq = 2200 + Math.random() * 800;
      }
      data[i] = Math.max(-1, Math.min(1, sample));
    }
  } else if (type === 'waves') {
    var w0 = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      w0 = (w0 + (0.025 * white)) / 1.025;
      var cycle = Math.sin((i / sampleRate) * (2 * Math.PI / 8.0));
      var swell = Math.max(0, cycle) * 1.5 + 0.25;
      data[i] = w0 * swell * 2.2;
    }
  }
  return buffer;
}

function startAmbientAudio(force) {
  if (ambientSound === 'none') {
    stopAmbientAudio();
    return;
  }
  if (!force && (typeof running === 'undefined' || !running || (typeof plan !== 'undefined' && plan && plan[index] && plan[index].type === 'break'))) {
    stopAmbientAudio();
    return;
  }
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (isAmbientActive) return;

    var buffer = createNoiseBuffer(ambientSound);
    ambientAudioSource = audioCtx.createBufferSource();
    ambientAudioSource.buffer = buffer;
    ambientAudioSource.loop = true;

    ambientFilterNode = audioCtx.createBiquadFilter();
    ambientFilterNode.type = 'lowpass';
    ambientFilterNode.frequency.value = 
      ambientSound === 'brown' ? 750 :
      ambientSound === 'rain' ? 2400 :
      ambientSound === 'fire' ? 3000 :
      ambientSound === 'cafe' ? 1900 :
      ambientSound === 'waves' ? 1200 : 3400;

    ambientGainNode = audioCtx.createGain();
    ambientGainNode.gain.setValueAtTime(Math.max(0.0001, ambientVolume * 0.35), audioCtx.currentTime);

    ambientAudioSource.connect(ambientFilterNode);
    ambientFilterNode.connect(ambientGainNode);
    ambientGainNode.connect(audioCtx.destination);

    ambientAudioSource.start(0);
    isAmbientActive = true;
  } catch (e) {}
}

function stopAmbientAudio() {
  if (ambientAudioSource) {
    try {
      ambientAudioSource.stop();
      ambientAudioSource.disconnect();
    } catch (e) {}
    ambientAudioSource = null;
  }
  isAmbientActive = false;
}

document.addEventListener('DOMContentLoaded', function() {
  var ambientSoundSelect = document.getElementById('ambientSoundSelect');
  var ambientVolInput = document.getElementById('ambientVolInput');

  if (ambientSoundSelect) {
    ambientSoundSelect.value = ambientSound;
    ambientSoundSelect.addEventListener('change', function() {
      ambientSound = ambientSoundSelect.value;
      localStorage.setItem('pomodoro_ambient_sound', ambientSound);
      stopAmbientAudio();
      if (ambientSound !== 'none') {
        startAmbientAudio(true);
      }
    });
  }
  if (ambientVolInput) {
    ambientVolInput.value = ambientVolume;
    ambientVolInput.addEventListener('input', function() {
      ambientVolume = parseFloat(ambientVolInput.value);
      localStorage.setItem('pomodoro_ambient_vol', ambientVolume);
      if (ambientGainNode && audioCtx) {
        ambientGainNode.gain.setValueAtTime(Math.max(0.0001, ambientVolume * 0.35), audioCtx.currentTime);
      }
    });
  }
});
