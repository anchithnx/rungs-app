// ============================================================
// RUNGS — Calisthenics Progression Tracker
// All data stored locally on-device via localStorage. Nothing
// leaves the phone.
// ============================================================

const STORE_KEY = 'rungs_v1';

// ---------- Exercise progression trees ----------
// Each rung has: name, target description, and the test to clear it.
// type: 'reps' (max reps in one set) or 'hold' (seconds) or 'manual'
const TREES = {
  push: {
    label: 'Push', tag: 'Chest / Shoulders / Triceps',
    rungs: [
      {id:'p0', name:'Wall Push-up', type:'reps', target:15, unit:'reps'},
      {id:'p1', name:'Incline Push-up', type:'reps', target:15, unit:'reps'},
      {id:'p2', name:'Knee Push-up', type:'reps', target:15, unit:'reps'},
      {id:'p3', name:'Full Push-up', type:'reps', target:20, unit:'reps'},
      {id:'p4', name:'Diamond Push-up', type:'reps', target:15, unit:'reps'},
      {id:'p5', name:'Archer Push-up', type:'reps', target:10, unit:'reps/side'},
      {id:'p6', name:'Pseudo Planche Push-up', type:'reps', target:12, unit:'reps'},
      {id:'p7', name:'One-Arm Push-up (assisted)', type:'reps', target:5, unit:'reps/side'},
      {id:'p8', name:'One-Arm Push-up', type:'reps', target:5, unit:'reps/side'},
    ]
  },
  pull: {
    label: 'Pull', tag: 'Back / Biceps / Grip',
    rungs: [
      {id:'l0', name:'Dead Hang', type:'hold', target:30, unit:'sec'},
      {id:'l1', name:'Bodyweight Row (steep angle)', type:'reps', target:15, unit:'reps'},
      {id:'l2', name:'Bodyweight Row (horizontal)', type:'reps', target:15, unit:'reps'},
      {id:'l3', name:'Negative Pull-up', type:'reps', target:8, unit:'reps'},
      {id:'l4', name:'Pull-up', type:'reps', target:10, unit:'reps'},
      {id:'l5', name:'Chin-up Wide Variations', type:'reps', target:12, unit:'reps'},
      {id:'l6', name:'Archer Pull-up', type:'reps', target:8, unit:'reps/side'},
      {id:'l7', name:'Typewriter Pull-up', type:'reps', target:6, unit:'reps'},
      {id:'l8', name:'One-Arm Pull-up (assisted)', type:'reps', target:5, unit:'reps/side'},
    ]
  },
  legs: {
    label: 'Legs', tag: 'Quads / Glutes / Hamstrings',
    rungs: [
      {id:'g0', name:'Bodyweight Squat', type:'reps', target:25, unit:'reps'},
      {id:'g1', name:'Split Squat', type:'reps', target:15, unit:'reps/side'},
      {id:'g2', name:'Bulgarian Split Squat', type:'reps', target:15, unit:'reps/side'},
      {id:'g3', name:'Assisted Pistol Squat', type:'reps', target:10, unit:'reps/side'},
      {id:'g4', name:'Shrimp Squat', type:'reps', target:8, unit:'reps/side'},
      {id:'g5', name:'Pistol Squat', type:'reps', target:10, unit:'reps/side'},
      {id:'g6', name:'Jumping Pistol Squat', type:'reps', target:6, unit:'reps/side'},
      {id:'g7', name:'Weighted Pistol Squat', type:'manual', target:1, unit:'progression'},
    ]
  },
  core: {
    label: 'Core', tag: 'Abs / Stability / Hip Flexors',
    rungs: [
      {id:'c0', name:'Plank Hold', type:'hold', target:60, unit:'sec'},
      {id:'c1', name:'Hollow Body Hold', type:'hold', target:30, unit:'sec'},
      {id:'c2', name:'Lying Leg Raise', type:'reps', target:15, unit:'reps'},
      {id:'c3', name:'Hanging Knee Raise', type:'reps', target:12, unit:'reps'},
      {id:'c4', name:'Hanging Leg Raise', type:'reps', target:10, unit:'reps'},
      {id:'c5', name:'V-Up', type:'reps', target:15, unit:'reps'},
      {id:'c6', name:'Toes-to-Bar', type:'reps', target:10, unit:'reps'},
      {id:'c7', name:'Dragon Flag (negative)', type:'reps', target:8, unit:'reps'},
      {id:'c8', name:'L-Sit Hold', type:'hold', target:20, unit:'sec'},
    ]
  }
};

const TIERS = [
  {name:'Foundation', min:0},
  {name:'Beginner', min:1},
  {name:'Intermediate', min:3},
  {name:'Advanced', min:6},
  {name:'Elite', min:8}
];

// ---------- State ----------
let state = null;

function defaultState(){
  return {
    profile: { name:'', height:null, weight:null, age:null, sex:'m', days:3 },
    rungIndex: { push:0, pull:0, legs:0, core:0 },
    cleared: { push:[], pull:[], legs:[], core:[] },
    sessions: [], // {date, entries:[{exId, sets:[{reps|sec}]}]}
    weightLog: [], // {date, weight}
    streak: 0,
    lastSessionDate: null,
    pendingLevelUp: null
  };
}

function load(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw) state = JSON.parse(raw);
    else state = null;
  }catch(e){ state = null; }
}
function save(){
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

// ---------- Onboarding flow ----------
let obStep = 0;
function renderObProgress(){
  const wrap = document.getElementById('obProgress');
  wrap.innerHTML = '';
  for(let i=0;i<4;i++){
    const d = document.createElement('div');
    if(i<=obStep) d.className='done';
    wrap.appendChild(d);
  }
}
function obNext(){
  document.querySelectorAll('.ob-step')[obStep].classList.remove('active');
  obStep++;
  document.querySelectorAll('.ob-step')[obStep].classList.add('active');
  renderObProgress();
}
function selChoice(el, hiddenId){
  el.parentElement.querySelectorAll('.choice').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById(hiddenId).value = el.dataset.val;
}

function estimateStartingRung(tree, capacity){
  // capacity is max reps/seconds at the *full bodyweight basic* movement.
  // We map raw capacity -> which rung index they should start at.
  const rungs = TREES[tree].rungs;
  if(capacity <= 0) return 0;
  // find highest rung whose target they already exceed at index 0/1 difficulty,
  // simple heuristic: scale against first 4 rungs based on ratio to target of rung index "true" move
  if(tree==='push'){
    if(capacity===0) return 0;
    if(capacity<8) return 2; // can do some knee pushups
    if(capacity<20) return 3; // can do full pushups, working volume
    if(capacity<35) return 4;
    return 5;
  }
  if(tree==='pull'){
    if(capacity===0) return 0;
    if(capacity<5) return 1;
    if(capacity<10) return 3;
    if(capacity<15) return 4;
    return 5;
  }
  if(tree==='legs'){
    if(capacity<10) return 0;
    if(capacity<25) return 0;
    if(capacity<40) return 1;
    return 3;
  }
  if(tree==='core'){
    if(capacity<20) return 0;
    if(capacity<45) return 0;
    if(capacity<75) return 1;
    return 2;
  }
  return 0;
}

function finishOnboard(){
  const name = document.getElementById('obName').value.trim() || 'Athlete';
  const height = parseFloat(document.getElementById('obHeight').value)||null;
  const weight = parseFloat(document.getElementById('obWeight').value)||null;
  const age = parseInt(document.getElementById('obAge').value)||null;
  const sex = document.getElementById('obSex').value;
  const days = parseInt(document.getElementById('obDays').value)||3;

  const capPush = parseInt(document.getElementById('capPush').value)||0;
  const capPull = parseInt(document.getElementById('capPull').value)||0;
  const capSquat = parseInt(document.getElementById('capSquat').value)||0;
  const capCore = parseInt(document.getElementById('capCore').value)||0;

  state = defaultState();
  state.profile = {name, height, weight, age, sex, days};
  state.rungIndex.push = estimateStartingRung('push', capPush);
  state.rungIndex.pull = estimateStartingRung('pull', capPull);
  state.rungIndex.legs = estimateStartingRung('legs', capSquat);
  state.rungIndex.core = estimateStartingRung('core', capCore);

  // mark rungs below starting index as cleared (assumed mastery)
  Object.keys(state.rungIndex).forEach(t=>{
    for(let i=0;i<state.rungIndex[t];i++){
      state.cleared[t].push(TREES[t].rungs[i].id);
    }
  });

  if(weight) state.weightLog.push({date: todayStr(), weight});

  save();
  document.getElementById('onboard').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('navbar').style.display='flex';
  renderAll();
}

// ---------- Utilities ----------
function todayStr(){
  return new Date().toISOString().slice(0,10);
}
function fmtDate(d){
  const dt = new Date(d+'T00:00:00');
  return dt.toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'});
}
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}

// ---------- Navigation ----------
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.remove('active'));
  document.querySelector(`.navbtn[data-screen="${name}"]`).classList.add('active');
  if(name==='tree') renderTree();
  if(name==='stats') renderStats();
  if(name==='profile') renderProfile();
  if(name==='home') renderHome();
}

// ---------- Tier calculation ----------
function currentTierIndex(){
  const total = Object.values(state.rungIndex).reduce((a,b)=>a+b,0);
  let tier = 0;
  for(let i=TIERS.length-1;i>=0;i--){
    if(total>=TIERS[i].min){ tier=i; break; }
  }
  return tier;
}

// ---------- Today's session builder ----------
function getTodayExercises(){
  // Rotate focus based on day-count setting & day-of-week, always include core lightly.
  const days = state.profile.days;
  const dow = new Date().getDay(); // 0 sun .. 6 sat
  let groups;
  if(days<=3){
    groups = [['push','pull','legs','core']]; // full body every session
  } else if(days===4){
    groups = [['push','core'],['pull','legs'],['push','legs'],['pull','core']];
  } else {
    groups = [['push'],['pull'],['legs'],['core'],['push','pull']];
  }
  const idx = dow % groups.length;
  const focus = groups[idx];
  return focus.map(t=>{
    const rIdx = state.rungIndex[t];
    const rung = TREES[t].rungs[Math.min(rIdx, TREES[t].rungs.length-1)];
    return {tree:t, rung};
  });
}

function renderHome(){
  document.getElementById('homeGreeting').textContent = `Hey, ${state.profile.name}`;
  document.getElementById('streakNum').textContent = state.streak;

  // level up banner
  checkLevelUps();
  const banner = document.getElementById('levelUpBanner');
  if(state.pendingLevelUp){
    const t = state.pendingLevelUp;
    const rung = TREES[t].rungs[state.rungIndex[t]];
    document.getElementById('levelUpText').textContent = `${TREES[t].label}: unlock "${TREES[t].rungs[state.rungIndex[t]+1] ? TREES[t].rungs[state.rungIndex[t]+1].name : 'Mastery'}"`;
    banner.style.display='block';
  } else {
    banner.style.display='none';
  }

  const today = getTodayExercises();
  const wrap = document.getElementById('todaySession');
  wrap.innerHTML = '';
  today.forEach(({tree,rung})=>{
    const div = document.createElement('div');
    div.className='card';
    div.innerHTML = `
      <div class="row">
        <div>
          <div class="eyebrow">${TREES[tree].label}</div>
          <div style="font-weight:600;">${rung.name}</div>
        </div>
        <div class="muted" style="text-align:right; font-family:var(--font-mono);">
          Target<br><b style="color:var(--bone); font-size:15px;">${rung.target} ${rung.unit}</b>
        </div>
      </div>`;
    wrap.appendChild(div);
  });
}

function checkLevelUps(){
  if(state.pendingLevelUp) return; // already have one queued, don't overwrite
  for(const t of Object.keys(TREES)){
    const idx = state.rungIndex[t];
    const rung = TREES[t].rungs[idx];
    if(!rung) continue;
    if(hasMetTarget(t, rung)){
      state.pendingLevelUp = t;
      save();
      return;
    }
  }
}

function hasMetTarget(tree, rung){
  // look at last 2 sessions' best set for this exercise
  const recent = state.sessions.slice(-3);
  let bestVal = 0;
  recent.forEach(s=>{
    s.entries.forEach(e=>{
      if(e.exId===rung.id){
        e.sets.forEach(set=>{
          const v = set.reps!==undefined ? set.reps : set.sec;
          if(v>bestVal) bestVal=v;
        });
      }
    });
  });
  return bestVal >= rung.target;
}

function confirmLevelUp(){
  const t = state.pendingLevelUp;
  if(!t) return;
  state.cleared[t].push(TREES[t].rungs[state.rungIndex[t]].id);
  if(state.rungIndex[t] < TREES[t].rungs.length-1){
    state.rungIndex[t]++;
  }
  state.pendingLevelUp = null;
  save();
  showToast(`${TREES[t].label} advanced — onward.`);
  renderHome();
}
function dismissLevelUp(){
  state.pendingLevelUp = null;
  save();
  renderHome();
}

// ---------- Progression tree screen ----------
function renderTree(){
  document.getElementById('tierLabel').textContent = TIERS[currentTierIndex()].name;
  const wrap = document.getElementById('treeContent');
  wrap.innerHTML = '';
  Object.keys(TREES).forEach(t=>{
    const tree = TREES[t];
    const curIdx = state.rungIndex[t];
    const section = document.createElement('div');
    section.className='tree-section';
    section.innerHTML = `<div class="tree-head"><h3>${tree.label}</h3><span class="tag">${tree.tag}</span></div>`;
    const ladder = document.createElement('div');
    ladder.className='ladder';
    tree.rungs.forEach((r, i)=>{
      const rung = document.createElement('div');
      let cls='rung';
      if(state.cleared[t].includes(r.id)) cls+=' done';
      else if(i===curIdx) cls+=' current';
      else if(i>curIdx) cls+=' locked';
      rung.className=cls;
      rung.innerHTML = `
        <div class="rung-row">
          <div>
            <div class="rung-name">${r.name}</div>
            <div class="rung-target">${r.target} ${r.unit}</div>
          </div>
        </div>`;
      ladder.appendChild(rung);
    });
    section.appendChild(ladder);
    wrap.appendChild(section);
  });
}

// ---------- Log screen ----------
let currentLogExercises = [];
function goLog(){
  currentLogExercises = getTodayExercises();
  document.getElementById('logDate').textContent = fmtDate(todayStr());
  const wrap = document.getElementById('logContent');
  wrap.innerHTML = '';
  currentLogExercises.forEach((item, idx)=>{
    const {tree, rung} = item;
    const card = document.createElement('div');
    card.className='card';
    const unitLabel = rung.type==='hold' ? 'sec' : 'reps';
    let setsHtml = '';
    for(let s=0;s<3;s++){
      setsHtml += `
        <div class="set-row">
          <div class="set-num">S${s+1}</div>
          <div class="stepper" style="flex:1;">
            <button type="button" onclick="stepVal('${tree}_${idx}_${s}', -1)">−</button>
            <input type="number" inputmode="numeric" id="val_${tree}_${idx}_${s}" placeholder="0">
            <button type="button" onclick="stepVal('${tree}_${idx}_${s}', 1)">+</button>
          </div>
          <div class="muted" style="width:34px; font-size:12px;">${unitLabel}</div>
        </div>`;
    }
    card.innerHTML = `
      <div class="eyebrow">${TREES[tree].label} · target ${rung.target} ${rung.unit}</div>
      <div style="font-weight:600; margin-bottom:10px;">${rung.name}</div>
      ${setsHtml}
    `;
    wrap.appendChild(card);
  });

  // bodyweight quick-log
  const wcard = document.createElement('div');
  wcard.className='card';
  wcard.innerHTML = `
    <div class="eyebrow">Bodyweight today (optional)</div>
    <input type="number" id="logWeight" placeholder="kg" inputmode="decimal" value="${state.profile.weight||''}">
  `;
  wrap.appendChild(wcard);

  showScreen('log');
}

function stepVal(id, dir){
  const el = document.getElementById('val_'+id);
  let v = parseInt(el.value)||0;
  v = Math.max(0, v+dir);
  el.value = v;
}

function saveLog(){
  const entries = [];
  currentLogExercises.forEach((item, idx)=>{
    const {tree, rung} = item;
    const sets = [];
    for(let s=0;s<3;s++){
      const el = document.getElementById(`val_${tree}_${idx}_${s}`);
      const v = parseInt(el.value);
      if(v && v>0){
        if(rung.type==='hold') sets.push({sec:v});
        else sets.push({reps:v});
      }
    }
    if(sets.length>0){
      entries.push({exId: rung.id, tree, sets});
    }
  });

  if(entries.length===0){
    showToast('Log at least one set to save.');
    return;
  }

  const date = todayStr();
  const existingIdx = state.sessions.findIndex(s=>s.date===date);
  if(existingIdx>=0) state.sessions[existingIdx] = {date, entries};
  else state.sessions.push({date, entries});

  // streak logic
  if(state.lastSessionDate !== date){
    const yest = new Date(); yest.setDate(yest.getDate()-1);
    const yestStr = yest.toISOString().slice(0,10);
    if(state.lastSessionDate === yestStr) state.streak++;
    else state.streak = 1;
    state.lastSessionDate = date;
  }

  const wEl = document.getElementById('logWeight');
  if(wEl && wEl.value){
    const w = parseFloat(wEl.value);
    state.profile.weight = w;
    const existingW = state.weightLog.find(x=>x.date===date);
    if(existingW) existingW.weight = w;
    else state.weightLog.push({date, weight:w});
  }

  save();
  showToast('Session saved.');
  showScreen('home');
}

// ---------- Stats screen ----------
function renderStats(){
  document.getElementById('statSessions').textContent = state.sessions.length;
  document.getElementById('statWeight').textContent = state.profile.weight ? state.profile.weight : '—';

  // weight chart - last 14 entries
  const chart = document.getElementById('weightChart');
  chart.innerHTML='';
  const log = state.weightLog.slice(-14);
  if(log.length===0){
    chart.innerHTML = '<div class="empty" style="padding:10px;"><span class="muted">No weight logged yet</span></div>';
  } else {
    const max = Math.max(...log.map(l=>l.weight));
    const min = Math.min(...log.map(l=>l.weight));
    const range = (max-min) || 1;
    log.forEach(l=>{
      const pct = 15 + ((l.weight-min)/range)*85;
      const bar = document.createElement('div');
      bar.className = 'bar' + (l.weight===max?' peak':'');
      bar.style.height = pct+'%';
      bar.title = `${l.weight}kg on ${l.date}`;
      chart.appendChild(bar);
    });
  }

  const hist = document.getElementById('historyList');
  hist.innerHTML='';
  if(state.sessions.length===0){
    hist.innerHTML = '<div class="empty"><div class="glyph">○</div>No sessions logged yet.<br>Your first one starts the chain.</div>';
    return;
  }
  state.sessions.slice().reverse().forEach(s=>{
    const card = document.createElement('div');
    card.className='card';
    let lines = s.entries.map(e=>{
      const rung = TREES[e.tree].rungs.find(r=>r.id===e.exId);
      const setsStr = e.sets.map(set=> set.reps!==undefined? set.reps : set.sec+'s').join(' / ');
      return `<div class="row" style="padding:4px 0; font-size:13px;"><span class="muted">${rung?rung.name:e.exId}</span><span style="font-family:var(--font-mono);">${setsStr}</span></div>`;
    }).join('');
    card.innerHTML = `<div class="eyebrow">${fmtDate(s.date)}</div>${lines}`;
    hist.appendChild(card);
  });
}

// ---------- Profile screen ----------
function renderProfile(){
  document.getElementById('profName').textContent = state.profile.name;
  document.getElementById('profWeight').value = state.profile.weight||'';
  document.getElementById('profHeight').value = state.profile.height||'';
  document.getElementById('profDays').value = state.profile.days;
}
function saveProfile(){
  state.profile.weight = parseFloat(document.getElementById('profWeight').value)||state.profile.weight;
  state.profile.height = parseFloat(document.getElementById('profHeight').value)||state.profile.height;
  state.profile.days = parseInt(document.getElementById('profDays').value);
  const date = todayStr();
  if(state.profile.weight){
    const existingW = state.weightLog.find(x=>x.date===date);
    if(existingW) existingW.weight = state.profile.weight;
    else state.weightLog.push({date, weight: state.profile.weight});
  }
  save();
  showToast('Profile updated.');
}
function resetApp(){
  if(confirm('This will erase all your progress permanently. Continue?')){
    localStorage.removeItem(STORE_KEY);
    location.reload();
  }
}

// ---------- Boot ----------
function renderAll(){
  renderHome();
}

window.addEventListener('DOMContentLoaded', ()=>{
  load();
  if(state){
    document.getElementById('onboard').style.display='none';
    document.getElementById('app').style.display='block';
    document.getElementById('navbar').style.display='flex';
    renderAll();
  } else {
    renderObProgress();
  }

  // register service worker for PWA installability
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
});
