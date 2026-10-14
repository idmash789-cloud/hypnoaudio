'use strict';
/* ════════════════════════════════════════════════════════════════
   HypnoKids Player — pemutar audio pengantar tidur anak
   Audio utama : folder audio/ di repo ini
   Backsound   : (1) suara bawaan (dibangkitkan langsung, tanpa file)
                 (2) file dari folder backsound/ (lihat backsound/manifest.json)
                 (3) file yang di-upload pengguna dari perangkatnya
   ════════════════════════════════════════════════════════════════ */

const REPO_CDN = 'https://cdn.jsdelivr.net/gh/idmash789-cloud/hypnoaudio@main/';
const REPO_RAW = 'https://raw.githubusercontent.com/idmash789-cloud/hypnoaudio/main/';

const TRACKS = [
  { n: 1,  title: 'Senang Belajar',              theme: 'Membuat anak semangat & senang belajar',        file: 'audio/Audio 1 - Senang Belajar.mp3',              emoji: '📚', color: ['#574bdb', '#8b7cf6'] },
  { n: 2,  title: 'Tenang Atur Emosi',           theme: 'Anak tenang & bisa mengatur emosinya',          file: 'audio/Audio 2 - Tenang Atur Emosi.mp3',           emoji: '🌈', color: ['#0e7490', '#38bdf8'] },
  { n: 3,  title: 'Hormat Orang Tua dan Guru',   theme: 'Menghormati orang tua & guru',                  file: 'audio/Audio 3 - Hormat Orang Tua dan Guru.mp3',   emoji: '🙏', color: ['#b45309', '#fbbf24'] },
  { n: 4,  title: 'Fokus Memahami Pelajaran',    theme: 'Fokus & konsentrasi saat belajar',              file: 'audio/Audio 4 - Fokus Memahami Pelajaran.mp3',    emoji: '🎯', color: ['#15803d', '#4ade80'] },
  { n: 5,  title: 'Atur Waktu Gadget',           theme: 'Bijak mengatur waktu bermain gadget',           file: 'audio/Audio 5 - Atur Waktu Gadget.mp3',           emoji: '📱', color: ['#be185d', '#fb7185'] },
  { n: 6,  title: 'Berani Tampil',               theme: 'Berani tampil di depan umum',                   file: 'audio/Audio 6 - Berani Tampil.mp3',               emoji: '🎤', color: ['#7c3aed', '#c084fc'] },
  { n: 7,  title: 'Mandiri & Bertanggung Jawab', theme: 'Anak mandiri & bertanggung jawab',              file: 'audio/Audio 7 - Mandiri Bertanggung Jawab.mp3',   emoji: '🌟', color: ['#0369a1', '#7dd3fc'] },
  { n: 8,  title: 'Percaya Diri',                theme: 'Anak hebat & percaya diri',                     file: 'audio/Audio 8 - Percaya Diri.mp3',                emoji: '🦁', color: ['#c2410c', '#fdba74'] },
  { n: 9,  title: 'Suka Membantu & Peduli',      theme: 'Peduli & suka membantu sesama',                 file: 'audio/Audio 9 - Suka Membantu Peduli.mp3',        emoji: '💛', color: ['#a16207', '#fde047'] },
  { n: 10, title: 'Senang Makan Sehat',          theme: 'Senang makan makanan sehat',                    file: 'audio/Audio 10 - Senang Makan Sehat.mp3',         emoji: '🥦', color: ['#3f6212', '#a3e635'] },
];

/* ---------- elemen ---------- */
const $ = (id) => document.getElementById(id);
const audio = $('mainAudio'), bgAudio = $('bgAudio');
const els = {
  list: $('trackList'), count: $('trackCount'), empty: $('emptyState'),
  npTitle: $('npTitle'), npTheme: $('npTheme'), npNumber: $('npNumber'), npState: $('npState'),
  npCover: $('npCover'), npCoverEmoji: $('npCoverEmoji'), favBtn: $('favBtn'),
  playBtn: $('playBtn'), seek: $('seekBar'), cur: $('curTime'), dur: $('durTime'),
  speedRange: $('speedRange'), speedOut: $('speedOut'), speedChips: $('speedChips'), pitch: $('pitchToggle'),
  vol: $('volRange'), volOut: $('volOut'), mute: $('muteBtn'),
  bgVol: $('bgVolRange'), bgVolOut: $('bgVolOut'),
  sleepOut: $('sleepOut'), sleepChips: $('sleepChips'), sleepBadge: $('sleepBadge'), sleepBadgeText: $('sleepBadgeText'),
  bgChips: $('bgChips'), bgOut: $('bgOut'), bgFileList: $('bgFileList'), bgUpload: $('bgUpload'),
  search: $('searchInput'), favOnly: $('favOnly'), autoNext: $('autoNext'),
  shuffle: $('shuffleBtn'), repeat: $('repeatBtn'), toast: $('toast'),
  playerCard: document.querySelector('.player-card'),
};

/* ---------- state ---------- */
const LS_KEY = 'hypnokids-player-v1';
let S = {
  index: -1, speed: 1, pitch: true, vol: 1, bgVol: 0.4, bg: 'none', bgFileName: '',
  favs: [], positions: {}, durations: {}, repeat: 0, shuffle: false, autoNext: true,
};
try { Object.assign(S, JSON.parse(localStorage.getItem(LS_KEY) || '{}')); } catch (e) {}
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) {} }

let toastTimer = null;
function toast(msg) {
  els.toast.textContent = msg; els.toast.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { els.toast.hidden = true; }, 3200);
}
function fmt(sec) {
  if (!isFinite(sec) || sec == null) return '0:00';
  sec = Math.max(0, Math.floor(sec));
  return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}
function paintRange(el) {
  const min = parseFloat(el.min), max = parseFloat(el.max), v = parseFloat(el.value);
  el.style.setProperty('--fill', ((v - min) / (max - min)) * 100 + '%');
}
function sourceList(path) {
  const enc = encodeURI(path);
  return [enc, REPO_RAW + enc, REPO_CDN + enc];
}

/* ---------- daftar audio ---------- */
function renderList() {
  const q = els.search.value.trim().toLowerCase();
  const shown = TRACKS.filter(t =>
    (!S.favs || !els.favOnly.checked || S.favs.includes(t.n)) &&
    (!q || (t.title + ' ' + t.theme).toLowerCase().includes(q)));
  els.count.textContent = '• ' + shown.length + ' dari ' + TRACKS.length + ' audio';
  els.empty.hidden = shown.length > 0;
  els.list.innerHTML = '';
  shown.forEach((t) => {
    const idx = TRACKS.indexOf(t);
    const card = document.createElement('div');
    card.className = 'track' + (idx === S.index ? ' current' : '');
    card.setAttribute('role', 'button'); card.tabIndex = 0;
    const pos = S.positions[t.n] || 0, dur = S.durations[t.n] || 0;
    const pct = dur > 0 ? Math.min(100, (pos / dur) * 100) : 0;
    card.innerHTML =
      '<div class="track-cover" style="background:linear-gradient(135deg,' + t.color[0] + ',' + t.color[1] + ')">' + t.emoji + '</div>' +
      '<div class="track-info"><h3>' + t.n + '. ' + t.title + '</h3><p>' + t.theme + '</p>' +
      '<div class="track-meta"><span>⏱ ' + (dur ? fmt(dur) : '…') + '</span>' +
      (pos > 5 && dur && pos < dur - 10 ? '<span>▶ Lanjut dari ' + fmt(pos) + '</span>' : '') +
      (dur && pos >= dur - 10 ? '<span>✓ Selesai didengar</span>' : '') + '</div>' +
      '<div class="track-progress"><i style="width:' + pct + '%"></i></div></div>' +
      '<div class="track-actions">' +
      '<button class="mini-btn fav-toggle" title="Favorit">' + (S.favs.includes(t.n) ? '❤️' : '🤍') + '</button>' +
      '<button class="mini-btn dl" title="Unduh audio">⬇</button></div>';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.fav-toggle')) { toggleFav(t.n); return; }
      if (e.target.closest('.dl')) { downloadTrack(t); return; }
      loadTrack(idx, true);
    });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadTrack(idx, true); });
    els.list.appendChild(card);
  });
}
function toggleFav(n) {
  const i = S.favs.indexOf(n);
  if (i >= 0) S.favs.splice(i, 1); else S.favs.push(n);
  save(); renderList(); syncFavBtn();
  toast(i >= 0 ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit ❤️');
}
function downloadTrack(t) {
  const a = document.createElement('a');
  a.href = sourceList(t.file)[0]; a.download = t.file.split('/').pop();
  a.target = '_blank'; a.rel = 'noopener'; a.click();
}
function syncFavBtn() {
  const t = TRACKS[S.index];
  els.favBtn.textContent = t && S.favs.includes(t.n) ? '❤️' : '♡';
}

/* ---------- memuat & memutar audio utama ---------- */
let srcTry = 0;
function loadTrack(idx, autoplay) {
  if (idx < 0 || idx >= TRACKS.length) return;
  if (S.index >= 0 && audio.duration) { S.positions[TRACKS[S.index].n] = audio.currentTime; save(); }
  S.index = idx; srcTry = 0;
  const t = TRACKS[idx];
  audio.src = sourceList(t.file)[srcTry];
  audio.playbackRate = S.speed; applyPitch();
  els.npTitle.textContent = t.n + '. ' + t.title;
  els.npTheme.textContent = t.theme;
  els.npNumber.textContent = 'Audio ' + t.n + ' dari ' + TRACKS.length;
  els.npCoverEmoji.textContent = t.emoji;
  els.npCover.style.background = 'linear-gradient(135deg,' + t.color[0] + ',' + t.color[1] + ')';
  els.npState.textContent = 'Memuat…';
  document.title = '▶ ' + t.title + ' — HypnoKids';
  syncFavBtn(); renderList(); save();
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title, artist: 'HypnoKids', album: 'Audio Pengantar Tidur Anak',
    });
  }
  const resume = S.positions[t.n] || 0;
  const onMeta = () => {
    audio.removeEventListener('loadedmetadata', onMeta);
    if (resume > 5 && resume < audio.duration - 10) {
      audio.currentTime = resume;
      toast('Melanjutkan dari ' + fmt(resume) + ' ⏩');
    }
    if (autoplay) audio.play().catch(() => { els.npState.textContent = 'Ketuk ▶ untuk memutar'; });
  };
  audio.addEventListener('loadedmetadata', onMeta);
  audio.load();
}
audio.addEventListener('error', () => {
  if (S.index < 0) return;
  srcTry++;
  const list = sourceList(TRACKS[S.index].file);
  if (srcTry < list.length) { audio.src = list[srcTry]; audio.load(); audio.play().catch(() => {}); }
  else { els.npState.textContent = 'Gagal memuat audio'; toast('Audio gagal dimuat. Periksa koneksi internet.'); }
});
audio.addEventListener('playing', () => {
  els.playBtn.textContent = '⏸'; els.npState.textContent = 'Sedang diputar';
  els.playerCard.classList.add('playing');
});
audio.addEventListener('pause', () => {
  els.playBtn.textContent = '▶'; els.npState.textContent = 'Jeda';
  els.playerCard.classList.remove('playing');
  if (S.index >= 0) { S.positions[TRACKS[S.index].n] = audio.currentTime; save(); }
});
audio.addEventListener('loadedmetadata', () => {
  if (S.index >= 0) { S.durations[TRACKS[S.index].n] = audio.duration; }
  els.dur.textContent = fmt(audio.duration);
  audio.playbackRate = S.speed; applyPitch(); save(); renderList();
});
audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    els.seek.value = Math.round((audio.currentTime / audio.duration) * 1000);
    paintRange(els.seek);
  }
  els.cur.textContent = fmt(audio.currentTime);
});
setInterval(() => {
  if (S.index >= 0 && !audio.paused && audio.duration) {
    S.positions[TRACKS[S.index].n] = audio.currentTime; save();
  }
}, 5000);
audio.addEventListener('ended', () => {
  if (sleepMode === 'end') { stopSleepTimer(true); toast('Timer tidur: audio selesai, selamat tidur 🌙'); stopBacksound(); return; }
  if (S.repeat === 2) { audio.currentTime = 0; audio.play().catch(() => {}); return; }
  if (S.autoNext || S.repeat === 1) nextTrack(true);
  else els.npState.textContent = 'Selesai';
});

function playPause() {
  if (S.index < 0) { loadTrack(0, true); return; }
  if (audio.paused) audio.play().catch(() => {}); else audio.pause();
}
function nextTrack(auto) {
  if (S.index < 0) { loadTrack(0, true); return; }
  let n;
  if (S.shuffle && TRACKS.length > 1) {
    do { n = Math.floor(Math.random() * TRACKS.length); } while (n === S.index);
  } else {
    n = S.index + 1;
    if (n >= TRACKS.length) {
      if (auto && S.repeat !== 1) { els.npState.textContent = 'Selesai — daftar audio habis'; return; }
      n = 0;
    }
  }
  loadTrack(n, true);
}
function prevTrack() {
  if (audio.currentTime > 4) { audio.currentTime = 0; return; }
  loadTrack((S.index - 1 + TRACKS.length) % TRACKS.length, true);
}

els.playBtn.addEventListener('click', playPause);
$('nextBtn').addEventListener('click', () => nextTrack(false));
$('prevBtn').addEventListener('click', prevTrack);
$('back10Btn').addEventListener('click', () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
$('fwd10Btn').addEventListener('click', () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); });
els.seek.addEventListener('input', () => {
  if (audio.duration) audio.currentTime = (els.seek.value / 1000) * audio.duration;
  paintRange(els.seek);
});
els.favBtn.addEventListener('click', () => { if (S.index >= 0) toggleFav(TRACKS[S.index].n); });

/* ---------- kecepatan ---------- */
function applyPitch() { try { audio.preservesPitch = S.pitch; audio.mozPreservesPitch = S.pitch; audio.webkitPreservesPitch = S.pitch; } catch (e) {} }
function setSpeed(v) {
  S.speed = Math.min(1.5, Math.max(0.5, parseFloat(v) || 1));
  audio.playbackRate = S.speed;
  els.speedRange.value = S.speed; paintRange(els.speedRange);
  els.speedOut.textContent = S.speed.toFixed(2).replace(/0$/, '') + '×';
  els.speedChips.querySelectorAll('button').forEach(b =>
    b.classList.toggle('active', Math.abs(parseFloat(b.dataset.speed) - S.speed) < 0.001));
  save();
}
els.speedRange.addEventListener('input', () => setSpeed(els.speedRange.value));
els.speedChips.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (b) { setSpeed(b.dataset.speed); toast('Kecepatan ' + b.textContent); }
});
els.pitch.addEventListener('change', () => { S.pitch = els.pitch.checked; applyPitch(); save(); });

/* ---------- volume ---------- */
let lastVol = 1;
function setVol(v) {
  S.vol = Math.min(1, Math.max(0, v));
  if (!sleepFading) audio.volume = S.vol;
  els.vol.value = S.vol; paintRange(els.vol);
  els.volOut.textContent = Math.round(S.vol * 100) + '%';
  els.mute.textContent = S.vol === 0 ? '🔇' : (S.vol < 0.5 ? '🔉' : '🔊');
  save();
}
els.vol.addEventListener('input', () => setVol(parseFloat(els.vol.value)));
els.mute.addEventListener('click', () => {
  if (S.vol > 0) { lastVol = S.vol; setVol(0); } else setVol(lastVol || 1);
});

/* ---------- mode acak & ulangi ---------- */
function syncModeBtns() {
  els.shuffle.classList.toggle('active', S.shuffle);
  els.repeat.classList.toggle('active', S.repeat > 0);
  els.repeat.textContent = S.repeat === 2 ? '🔂' : '🔁';
  els.repeat.title = 'Ulangi: ' + ['mati', 'semua audio', 'audio ini saja'][S.repeat];
}
els.shuffle.addEventListener('click', () => { S.shuffle = !S.shuffle; syncModeBtns(); save(); toast(S.shuffle ? 'Mode acak aktif 🔀' : 'Mode acak mati'); });
els.repeat.addEventListener('click', () => {
  S.repeat = (S.repeat + 1) % 3; syncModeBtns(); save();
  toast('Ulangi: ' + ['mati', 'semua audio', 'audio ini saja'][S.repeat]);
});
els.autoNext.addEventListener('change', () => { S.autoNext = els.autoNext.checked; save(); });
els.search.addEventListener('input', renderList);
els.favOnly.addEventListener('change', renderList);

/* ---------- timer tidur ---------- */
let sleepMode = null;        // null | 'end' | menit (angka)
let sleepEndAt = 0;
let sleepTick = null;
let sleepFading = false;

function stopSleepTimer(silent) {
  sleepMode = null; sleepEndAt = 0; sleepFading = false;
  if (sleepTick) { clearInterval(sleepTick); sleepTick = null; }
  audio.volume = S.vol;
  els.sleepBadge.hidden = true; els.sleepOut.textContent = 'Mati';
  els.sleepChips.querySelectorAll('button').forEach(b =>
    b.classList.toggle('active', b.dataset.sleep === '0'));
  if (!silent) toast('Timer tidur dimatikan');
}
function startSleepTimer(mode) {
  stopSleepTimer(true);
  if (mode === 0) return;
  sleepMode = mode;
  els.sleepChips.querySelectorAll('button').forEach(b =>
    b.classList.toggle('active', b.dataset.sleep === String(mode)));
  if (mode === -1) {
    els.sleepOut.textContent = 'Akhir audio'; els.sleepBadge.hidden = false;
    els.sleepBadgeText.textContent = 'berhenti di akhir audio'; toast('Audio akan berhenti di akhir episode 💤');
    return;
  }
  sleepEndAt = Date.now() + mode * 60 * 1000;
  els.sleepBadge.hidden = false;
  sleepTick = setInterval(() => {
    const remain = sleepEndAt - Date.now();
    if (remain <= 0) {
      stopSleepTimer(true);
      audio.pause(); stopBacksound();
      els.sleepOut.textContent = 'Mati';
      toast('Waktu tidur tiba. Selamat tidur 🌙💤');
      return;
    }
    const label = 'sisa ' + fmt(remain / 1000);
    els.sleepOut.textContent = label; els.sleepBadgeText.textContent = label;
    if (remain < 30000) {           // fade-out lembut 30 detik terakhir
      sleepFading = true;
      audio.volume = S.vol * Math.max(0, remain / 30000);
    } else if (sleepFading) { sleepFading = false; audio.volume = S.vol; }
  }, 500);
  toast('Timer tidur: ' + mode + ' menit 💤');
}
els.sleepChips.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  startSleepTimer(parseInt(b.dataset.sleep, 10));
});

/* ═══════════ BACKSOUND ═══════════ */
/* --- (1) suara bawaan via Web Audio API (tanpa file) --- */
let actx = null, bgNodes = null, bgMaster = null, noiseBuf = null;
function ensureCtx() {
  if (actx) { if (actx.state === 'suspended') actx.resume(); return actx; }
  actx = new (window.AudioContext || window.webkitAudioContext)();
  bgMaster = actx.createGain(); bgMaster.gain.value = S.bgVol;
  bgMaster.connect(actx.destination);
  const len = 2 * actx.sampleRate;
  noiseBuf = actx.createBuffer(1, len, actx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {           // pink-ish noise: lebih lembut di telinga
    const white = Math.random() * 2 - 1;
    last = last * 0.94 + white * 0.06; d[i] = last * 3.2;
  }
  return actx;
}
function noiseSource() {
  const s = actx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s;
}
function lfo(freq, amount, param) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.frequency.value = freq; g.gain.value = amount;
  o.connect(g); g.connect(param); o.start(); return o;
}
function startSynth(kind) {
  ensureCtx(); stopSynth();
  const nodes = [];
  const out = actx.createGain(); out.connect(bgMaster); nodes.push(out);
  if (kind === 'rain') {
    const src = noiseSource();
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
    const g = actx.createGain(); g.gain.value = 0.55;
    src.connect(lp); lp.connect(g); g.connect(out); src.start(); nodes.push(src);
  } else if (kind === 'ocean') {
    const src = noiseSource();
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 480;
    const g = actx.createGain(); g.gain.value = 0.5;
    src.connect(lp); lp.connect(g); g.connect(out); src.start(); nodes.push(src);
    nodes.push(lfo(0.08, 0.28, g.gain)); nodes.push(lfo(0.05, 220, lp.frequency));
  } else if (kind === 'wind') {
    const src = noiseSource();
    const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 0.5;
    const g = actx.createGain(); g.gain.value = 0.4;
    src.connect(bp); bp.connect(g); g.connect(out); src.start(); nodes.push(src);
    nodes.push(lfo(0.06, 180, bp.frequency));
  } else if (kind === 'pad') {
    const g = actx.createGain(); g.gain.value = 0.10; g.connect(out);
    [196, 246.9, 294].forEach(f => {
      const o = actx.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(g); o.start(); nodes.push(o);
    });
    nodes.push(lfo(0.07, 0.035, g.gain));
  } else if (kind === 'crickets') {
    const src = noiseSource();
    const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3800;
    const g = actx.createGain(); g.gain.value = 0.06;
    src.connect(hp); hp.connect(g); g.connect(out); src.start(); nodes.push(src);
    nodes.push(lfo(1.6, 0.045, g.gain));
    const base = noiseSource();
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
    const g2 = actx.createGain(); g2.gain.value = 0.22;
    base.connect(lp); lp.connect(g2); g2.connect(out); base.start(); nodes.push(base);
  }
  bgNodes = nodes;
}
function stopSynth() {
  if (!bgNodes) return;
  bgNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} try { n.disconnect(); } catch (e) {} });
  bgNodes = null;
}

/* --- (2)+(3) backsound dari file --- */
let uploadedBgUrl = '';
function fileCandidates(path) { return sourceList(path); }
function playBgFile(path) {
  bgAudio.src = fileCandidates(path)[0];
  bgAudio.volume = S.bgVol; bgAudio.play().catch(() => {});
  bgAudio.onerror = () => {
    const cands = fileCandidates(path);
    const cur = cands.indexOf(bgAudio.src.replace(/ /g, '%20'));
    // coba sumber cadangan berikutnya
    const next = cands.find(u => u !== bgAudio.getAttribute('src'));
    if (next && bgAudio.dataset.fbk !== next) { bgAudio.dataset.fbk = next; bgAudio.src = next; bgAudio.play().catch(() => {}); }
  };
}

function setBacksound(choice, opts) {
  opts = opts || {};
  S.bg = choice;
  stopSynth(); bgAudio.pause();
  let label = 'Tidak ada';
  if (['rain', 'ocean', 'wind', 'pad', 'crickets'].includes(choice)) {
    startSynth(choice);
    label = els.bgChips.querySelector('[data-bg="' + choice + '"]').textContent.trim();
  } else if (choice === 'upload' && uploadedBgUrl) {
    bgAudio.removeAttribute('src'); bgAudio.src = uploadedBgUrl;
    bgAudio.volume = S.bgVol; bgAudio.play().catch(() => {});
    label = '📂 ' + (S.bgFileName || 'File saya');
  } else if (choice.startsWith('file:')) {
    const path = choice.slice(5);
    playBgFile(path);
    label = '🎵 ' + (opts.label || path.split('/').pop());
  }
  els.bgOut.textContent = label;
  els.bgChips.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.bg === choice));
  els.bgFileList.querySelectorAll('button').forEach(b =>
    b.classList.toggle('active', choice === 'file:' + b.dataset.path));
  save();
}
function stopBacksound() {
  stopSynth(); bgAudio.pause();
  S.bg = 'none'; els.bgOut.textContent = 'Tidak ada';
  els.bgChips.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.bg === 'none'));
  save();
}
els.bgChips.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.bg === 'none') { stopBacksound(); toast('Backsound dimatikan'); }
  else { setBacksound(b.dataset.bg); toast('Backsound: ' + b.textContent.trim()); }
});
els.bgVol.addEventListener('input', () => {
  S.bgVol = parseFloat(els.bgVol.value);
  bgAudio.volume = S.bgVol;
  if (bgMaster) bgMaster.gain.value = S.bgVol;
  els.bgVolOut.textContent = Math.round(S.bgVol * 100) + '%';
  paintRange(els.bgVol); save();
});
els.bgUpload.addEventListener('change', () => {
  const f = els.bgUpload.files[0]; if (!f) return;
  if (uploadedBgUrl) URL.revokeObjectURL(uploadedBgUrl);
  uploadedBgUrl = URL.createObjectURL(f);
  S.bgFileName = f.name;
  setBacksound('upload');
  toast('Backsound dari filemu: ' + f.name + ' 🎵');
});

/* Muat daftar backsound file dari backsound/manifest.json (kalau ada).
   Format: { "backsounds": [ { "name": "Hujan di Atap", "file": "backsound/hujan.mp3" } ] } */
(async function loadBgManifest() {
  const urls = ['backsound/manifest.json', REPO_RAW + 'backsound/manifest.json', REPO_CDN + 'backsound/manifest.json'];
  for (const u of urls) {
    try {
      const r = await fetch(u, { cache: 'no-store' });
      if (!r.ok) continue;
      const data = await r.json();
      const items = (data.backsounds || []).filter(x => x && x.file);
      if (!items.length) return;
      const head = document.createElement('span');
      head.className = 'hint'; head.textContent = 'File backsound di aplikasi:';
      els.bgFileList.appendChild(head);
      items.forEach(it => {
        const b = document.createElement('button');
        b.className = 'mini-chip'; b.textContent = '🎵 ' + (it.name || it.file.split('/').pop());
        b.dataset.path = it.file;
        b.style.cssText = 'background:rgba(255,255,255,.09);color:var(--text);border:1px solid transparent;border-radius:999px;padding:6px 12px;font-size:13px;cursor:pointer';
        b.addEventListener('click', () => { setBacksound('file:' + it.file, { label: it.name }); toast('Backsound: ' + (it.name || it.file)); });
        els.bgFileList.appendChild(b);
      });
      return;
    } catch (e) { /* coba sumber berikutnya */ }
  }
})();

/* ---------- media session & keyboard ---------- */
if ('mediaSession' in navigator) {
  const ms = navigator.mediaSession;
  ms.setActionHandler('play', () => audio.play().catch(() => {}));
  ms.setActionHandler('pause', () => audio.pause());
  ms.setActionHandler('previoustrack', prevTrack);
  ms.setActionHandler('nexttrack', () => nextTrack(false));
  ms.setActionHandler('seekbackward', () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
  ms.setActionHandler('seekforward', () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); });
}
document.addEventListener('keydown', (e) => {
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea') return;
  if (e.code === 'Space') { e.preventDefault(); playPause(); }
  else if (e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  else if (e.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 10);
  else if (e.key === 'ArrowUp') { e.preventDefault(); setVol(Math.min(1, S.vol + 0.05)); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); setVol(Math.max(0, S.vol - 0.05)); }
});

/* ---------- PWA ---------- */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredInstall = e; $('installBtn').hidden = false;
});
$('installBtn').addEventListener('click', async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt(); await deferredInstall.userChoice;
  deferredInstall = null; $('installBtn').hidden = true;
});
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

/* ---------- ambil durasi semua audio (pelan, satu-satu) ---------- */
async function probeDurations() {
  for (const t of TRACKS) {
    if (S.durations[t.n]) continue;
    await new Promise((resolve) => {
      const probe = new Audio(); probe.preload = 'metadata';
      const done = () => { resolve(); };
      probe.addEventListener('loadedmetadata', () => {
        if (isFinite(probe.duration)) { S.durations[t.n] = probe.duration; save(); renderList(); }
        probe.removeAttribute('src'); done();
      });
      probe.addEventListener('error', done);
      setTimeout(done, 6000);
      probe.src = sourceList(t.file)[0];
    });
    await new Promise(r => setTimeout(r, 400));
  }
}

/* ---------- init ---------- */
(function init() {
  els.pitch.checked = S.pitch;
  els.autoNext.checked = S.autoNext;
  els.bgVol.value = S.bgVol; els.bgVolOut.textContent = Math.round(S.bgVol * 100) + '%';
  bgAudio.volume = S.bgVol;
  setVol(S.vol); setSpeed(S.speed); syncModeBtns();
  paintRange(els.seek); paintRange(els.bgVol);
  renderList();
  if (S.index >= 0 && TRACKS[S.index]) {
    const keepAuto = false; loadTrack(S.index, keepAuto);
  }
  if (S.bg && S.bg !== 'none' && ['rain', 'ocean', 'wind', 'pad', 'crickets'].includes(S.bg)) {
    // backsound bawaan tidak auto-play sebelum ada interaksi pengguna (aturan browser);
    // aktifkan saat pengguna menekan play pertama kali:
    const resumeBg = () => { setBacksound(S.bg); document.removeEventListener('pointerdown', resumeBg); };
    document.addEventListener('pointerdown', resumeBg);
    els.bgOut.textContent = els.bgChips.querySelector('[data-bg="' + S.bg + '"]').textContent.trim();
    els.bgChips.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.bg === S.bg));
  }
  setTimeout(probeDurations, 2500);
})();
