// ============================================================
// RUNGS — Calisthenics Progression Tracker
// All data stored locally on-device via localStorage. Nothing
// leaves the phone.
// ============================================================

const STORE_KEY = 'rungs_v1';

// ---------- Stick-figure pose diagrams ----------
// Small, fast, fully-offline SVG illustrations for each movement.
// A handful of reusable pose primitives covers every exercise in
// the database — composed below.
const POSE = (()=>{
  const STROKE = '#EDE9E1', ACCENT = '#5B8BA0', SURFACE = '#33373D';
  const limb = (x1,y1,x2,y2,c=STROKE,w=3.2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const head = (cx,cy,r=6)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${STROKE}" stroke-width="3"/>`;
  const ground = (y)=>`<line x1="5" y1="${y}" x2="95" y2="${y}" stroke="${SURFACE}" stroke-width="2"/>`;
  const wall = (x)=>`<line x1="${x}" y1="5" x2="${x}" y2="95" stroke="${SURFACE}" stroke-width="2"/>`;
  const bar = (y,x1=30,x2=70)=>`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${ACCENT}" stroke-width="4" stroke-linecap="round"/>`;
  const dot = (x,y,r=2.5,c=ACCENT)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
  const wrap = (inner)=>`<svg viewBox="0 0 100 100" width="100%" height="100%">${inner}</svg>`;

  const poses = {
    standing: ()=>wrap(`${ground(88)}${head(50,22)}${limb(50,28,50,60)}${limb(50,60,42,86)}${limb(50,60,58,86)}${limb(50,34,38,50)}${limb(50,34,62,50)}`),
    pushup_top: ()=>wrap(`${ground(84)}${head(16,68)}${limb(22,70,78,76)}${limb(30,71,26,84)}${limb(68,75,72,84)}${limb(40,72,36,52)}${limb(60,74,64,54)}`),
    pushup_bottom: ()=>wrap(`${ground(84)}${head(16,78)}${limb(22,80,78,80)}${limb(30,80,26,84)}${limb(68,80,72,84)}${limb(38,80,30,64)}${limb(60,80,68,64)}`),
    incline_push: ()=>wrap(`${ground(88)}${wall(78)}${head(70,40)}${limb(70,46,34,68)}${limb(70,46,75,60)}${limb(34,68,28,86)}${limb(34,68,42,86)}`),
    pike: ()=>wrap(`${ground(88)}${head(50,46)}${limb(50,52,50,68)}${limb(50,68,36,86)}${limb(50,68,64,86)}${limb(50,56,30,72)}${limb(50,56,70,72)}`),
    chair_dip: ()=>wrap(`${ground(86)}<rect x="58" y="64" width="26" height="5" fill="${SURFACE}"/>${head(24,44)}${limb(28,48,56,66)}${limb(56,66,72,64)}${limb(28,48,18,72)}${limb(18,72,32,82)}${limb(56,66,48,86)}`),
    dead_hang: ()=>wrap(`${bar(14)}${dot(50,14)}${head(50,28)}${limb(50,34,40,16)}${limb(50,34,60,16)}${limb(50,34,50,62)}${limb(50,62,44,86)}${limb(50,62,56,86)}`),
    pullup_top: ()=>wrap(`${bar(14)}${head(50,20)}${limb(50,26,40,16)}${limb(50,26,60,16)}${limb(50,26,50,52)}${limb(50,52,42,80)}${limb(50,52,58,80)}`),
    row: ()=>wrap(`${bar(18)}${head(78,30)}${limb(74,34,34,52)}${limb(74,34,80,20)}${limb(34,52,24,72)}${limb(34,52,44,76)}${limb(50,46,40,34)}`),
    squat_top: ()=>wrap(`${ground(88)}${head(50,22)}${limb(50,28,50,56)}${limb(50,56,38,86)}${limb(50,56,62,86)}${limb(50,36,36,48)}${limb(50,36,64,48)}`),
    squat_bottom: ()=>wrap(`${ground(86)}${head(50,48)}${limb(50,54,50,66)}${limb(50,66,30,68)}${limb(30,68,26,86)}${limb(50,66,70,68)}${limb(70,68,74,86)}${limb(50,58,32,50)}${limb(50,58,68,50)}`),
    pistol: ()=>wrap(`${ground(86)}${head(42,40)}${limb(42,46,44,62)}${limb(44,62,28,64)}${limb(28,64,22,86)}${limb(44,62,78,78)}${limb(78,78,80,86)}${limb(42,50,26,58)}${limb(42,50,58,38)}`),
    lunge: ()=>wrap(`${ground(88)}${head(46,28)}${limb(46,34,48,58)}${limb(48,58,30,86)}${limb(48,58,68,72)}${limb(68,72,72,86)}${limb(46,40,34,52)}${limb(46,40,58,52)}`),
    glute_bridge: ()=>wrap(`${ground(84)}${head(20,78)}${limb(25,78,52,58)}${limb(52,58,72,78)}${limb(72,78,72,84)}${limb(52,58,52,84)}${limb(25,78,14,76)}`),
    plank: ()=>wrap(`${ground(80)}${head(20,60)}${limb(26,62,72,70)}${limb(40,40,40,80)}${limb(26,62,30,80)}${limb(72,70,78,80)}`),
    hollow_body: ()=>wrap(`${ground(80)}${head(24,58)}${limb(28,60,55,70)}${limb(55,70,76,62)}${limb(28,60,16,68)}`),
    leg_raise: ()=>wrap(`${ground(84)}${head(18,78)}${limb(24,80,58,80)}${limb(58,80,76,38)}${limb(24,80,15,84)}`),
    hanging_knee: ()=>wrap(`${bar(14)}${head(50,26)}${limb(50,32,40,16)}${limb(50,32,60,16)}${limb(50,32,52,56)}${limb(52,56,40,64)}${limb(52,56,64,64)}`),
    vup: ()=>wrap(`${ground(84)}${head(34,58)}${limb(38,60,55,68)}${limb(55,68,72,46)}${limb(38,60,30,42)}`),
    lsit: ()=>wrap(`${ground(82)}${head(28,52)}${limb(32,54,46,66)}${limb(46,66,38,80)}${limb(46,66,76,62)}${limb(32,54,24,76)}`),
    side_plank: ()=>wrap(`${ground(80)}${head(22,58)}${limb(26,60,68,66)}${limb(40,30,40,66)}${limb(68,66,76,80)}${limb(26,60,30,80)}`),
    twist: ()=>wrap(`${ground(84)}${head(50,30)}${limb(50,36,50,64)}${limb(50,64,40,86)}${limb(50,64,60,86)}${limb(50,44,30,52)}${limb(50,44,70,36)}`),
    bird_dog: ()=>wrap(`${ground(80)}${head(72,60)}${limb(68,62,38,68)}${limb(38,68,18,52)}${limb(38,68,42,86)}${limb(68,62,72,86)}`),
    dead_bug: ()=>wrap(`${ground(86)}${head(50,80)}${limb(54,80,54,62)}${limb(54,62,32,52)}${limb(54,62,76,40)}${limb(54,80,40,82)}${limb(54,80,74,60)}`),
    mountain_climber: ()=>wrap(`${ground(82)}${head(22,62)}${limb(28,64,68,72)}${limb(28,64,32,82)}${limb(68,72,76,82)}${limb(50,68,38,52)}`),
    wall_sit: ()=>wrap(`${ground(88)}${wall(76)}${head(64,40)}${limb(64,46,64,62)}${limb(64,62,42,62)}${limb(42,62,40,86)}${limb(64,62,64,86)}`),
    calf_raise: ()=>wrap(`${ground(86)}${head(50,22)}${limb(50,28,50,54)}${limb(50,54,40,80)}${limb(50,54,60,80)}<ellipse cx="40" cy="84" rx="7" ry="2.5" fill="${SURFACE}"/><ellipse cx="60" cy="84" rx="7" ry="2.5" fill="${SURFACE}"/>${limb(40,80,40,84,SURFACE,2)}${limb(60,80,60,84,SURFACE,2)}`),
    arm_circles: ()=>wrap(`${ground(88)}${head(50,22)}${limb(50,28,50,60)}${limb(50,60,42,86)}${limb(50,60,58,86)}<circle cx="34" cy="38" r="10" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-dasharray="4 3"/><circle cx="66" cy="38" r="10" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-dasharray="4 3"/>${dot(34,28)}${dot(66,28)}`),
  };
  return poses;
})();

const EXERCISE_POSE = {
  'Wall Push-up': 'incline_push',
  'Incline Push-up': 'incline_push',
  'Knee Push-up': 'pushup_bottom',
  'Full Push-up': 'pushup_bottom',
  'Diamond Push-up': 'pushup_bottom',
  'Archer Push-up': 'pushup_bottom',
  'Pseudo Planche Push-up': 'pushup_bottom',
  'One-Arm Push-up (assisted)': 'pushup_bottom',
  'One-Arm Push-up': 'pushup_bottom',
  'Dead Hang': 'dead_hang',
  'Bodyweight Row (steep angle)': 'row',
  'Bodyweight Row (horizontal)': 'row',
  'Negative Pull-up': 'pullup_top',
  'Pull-up': 'pullup_top',
  'Chin-up Wide Variations': 'pullup_top',
  'Archer Pull-up': 'pullup_top',
  'Typewriter Pull-up': 'pullup_top',
  'One-Arm Pull-up (assisted)': 'pullup_top',
  'Bodyweight Squat': 'squat_bottom',
  'Split Squat': 'lunge',
  'Bulgarian Split Squat': 'lunge',
  'Assisted Pistol Squat': 'pistol',
  'Shrimp Squat': 'pistol',
  'Pistol Squat': 'pistol',
  'Jumping Pistol Squat': 'pistol',
  'Weighted Pistol Squat': 'pistol',
  'Plank Hold': 'plank',
  'Hollow Body Hold': 'hollow_body',
  'Lying Leg Raise': 'leg_raise',
  'Hanging Knee Raise': 'hanging_knee',
  'Hanging Leg Raise': 'hanging_knee',
  'V-Up': 'vup',
  'Toes-to-Bar': 'hanging_knee',
  'Dragon Flag (negative)': 'lsit',
  'L-Sit Hold': 'lsit',
  'Wall Pike Push-up': 'pike',
  'Chair Tricep Dip': 'chair_dip',
  'Incline Pike Push-up': 'pike',
  'Shoulder Tap Plank': 'plank',
  'Pike Push-up': 'pike',
  'Close-Grip Push-up': 'pushup_bottom',
  'Wide-Hand Push-up': 'pushup_bottom',
  'Decline Push-up (feet on chair)': 'incline_push',
  'Elevated Pike Push-up': 'pike',
  'Chair Dips (feet elevated)': 'chair_dip',
  'Explosive Clap Push-up': 'pushup_top',
  'Planche Lean Hold': 'pushup_top',
  'Scapular Pull (hang shrugs)': 'dead_hang',
  'Doorframe Row': 'row',
  'Towel Face Pull': 'row',
  'Reverse Snow Angel': 'bird_dog',
  'Wide-Grip Row': 'row',
  'Negative Chin-up': 'pullup_top',
  'Towel Pull-up Grip Hold': 'dead_hang',
  'Australian Pull-up': 'row',
  'L-Sit Pull-up': 'pullup_top',
  'Weighted Row': 'row',
  'Commando Pull-up': 'pullup_top',
  'Front Lever Tuck Hold': 'hanging_knee',
  'Glute Bridge': 'glute_bridge',
  'Calf Raise': 'calf_raise',
  'Step-Up (chair height)': 'lunge',
  'Wall Sit': 'wall_sit',
  'Single-Leg Glute Bridge': 'glute_bridge',
  'Cossack Squat': 'lunge',
  'Jump Squat': 'squat_bottom',
  'Walking Lunge': 'lunge',
  'Single-Leg Calf Raise': 'calf_raise',
  'Nordic Curl (assisted)': 'plank',
  'Broad Jump': 'squat_bottom',
  'Deep Cossack Squat': 'lunge',
  'Dead Bug': 'dead_bug',
  'Bird Dog': 'bird_dog',
  'Side Plank': 'side_plank',
  'Bicycle Crunch': 'twist',
  'Russian Twist': 'twist',
  'Flutter Kicks': 'leg_raise',
  'Side Plank Reach-Through': 'side_plank',
  'Mountain Climbers': 'mountain_climber',
  'Windshield Wiper': 'hollow_body',
  'Hanging Oblique Raise': 'hanging_knee',
  'Plank Walkout': 'plank',
  'Front Lever Raise': 'hanging_knee',
  'Arm Circles': 'arm_circles',
  'Standing Wall Press': 'incline_push',
  'Towel Shoulder Pull': 'row',
  'Standing Knee Raise': 'hanging_knee',
  'Standing Side Bend': 'twist',
};

function poseSvg(exerciseName){
  const key = EXERCISE_POSE[exerciseName] || 'standing';
  const fn = POSE[key] || POSE.standing;
  return fn();
}

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

// ---------- Accessory pools ----------
// These don't affect progression/level-ups — they round out a session
// to feel like a real PPL-style day. Picked by current tier so a
// beginner doesn't get handed an advanced accessory move.
const ACCESSORIES = {
  push: {
    beginner: [
      {name:'Knee Push-up', type:'reps', target:10, unit:'reps'},
      {name:'Incline Push-up', type:'reps', target:12, unit:'reps'},
      {name:'Wall Push-up', type:'reps', target:15, unit:'reps'},
      {name:'Arm Circles', type:'reps', target:15, unit:'reps/dir'},
      {name:'Standing Wall Press', type:'hold', target:15, unit:'sec'}
    ],
    intermediate: [
      {name:'Pike Push-up', type:'reps', target:12, unit:'reps'},
      {name:'Close-Grip Push-up', type:'reps', target:14, unit:'reps'},
      {name:'Wide-Hand Push-up', type:'reps', target:15, unit:'reps'},
      {name:'Decline Push-up (feet on chair)', type:'reps', target:15, unit:'reps'}
    ],
    advanced: [
      {name:'Elevated Pike Push-up', type:'reps', target:10, unit:'reps'},
      {name:'Chair Dips (feet elevated)', type:'reps', target:12, unit:'reps'},
      {name:'Explosive Clap Push-up', type:'reps', target:8, unit:'reps'},
      {name:'Planche Lean Hold', type:'hold', target:15, unit:'sec'}
    ]
  },
  pull: {
    beginner: [
      {name:'Dead Hang', type:'hold', target:15, unit:'sec'},
      {name:'Bodyweight Row (steep angle)', type:'reps', target:10, unit:'reps'},
      {name:'Negative Pull-up', type:'reps', target:5, unit:'reps'},
      {name:'Doorframe Row', type:'reps', target:12, unit:'reps'},
      {name:'Towel Shoulder Pull', type:'reps', target:12, unit:'reps'}
    ],
    intermediate: [
      {name:'Wide-Grip Row', type:'reps', target:12, unit:'reps'},
      {name:'Negative Chin-up', type:'reps', target:6, unit:'reps'},
      {name:'Towel Pull-up Grip Hold', type:'hold', target:20, unit:'sec'},
      {name:'Australian Pull-up', type:'reps', target:15, unit:'reps'}
    ],
    advanced: [
      {name:'L-Sit Pull-up', type:'reps', target:6, unit:'reps'},
      {name:'Weighted Row', type:'reps', target:10, unit:'reps'},
      {name:'Commando Pull-up', type:'reps', target:8, unit:'reps'},
      {name:'Front Lever Tuck Hold', type:'hold', target:12, unit:'sec'}
    ]
  },
  legs: {
    beginner: [
      {name:'Bodyweight Squat', type:'reps', target:15, unit:'reps'},
      {name:'Glute Bridge', type:'reps', target:15, unit:'reps'},
      {name:'Calf Raise', type:'reps', target:20, unit:'reps'},
      {name:'Wall Sit', type:'hold', target:20, unit:'sec'},
      {name:'Standing Knee Raise', type:'reps', target:15, unit:'reps/side'}
    ],
    intermediate: [
      {name:'Single-Leg Glute Bridge', type:'reps', target:12, unit:'reps/side'},
      {name:'Cossack Squat', type:'reps', target:10, unit:'reps/side'},
      {name:'Jump Squat', type:'reps', target:15, unit:'reps'},
      {name:'Walking Lunge', type:'reps', target:16, unit:'reps'}
    ],
    advanced: [
      {name:'Single-Leg Calf Raise', type:'reps', target:15, unit:'reps/side'},
      {name:'Nordic Curl (assisted)', type:'reps', target:6, unit:'reps'},
      {name:'Broad Jump', type:'reps', target:10, unit:'reps'},
      {name:'Deep Cossack Squat', type:'reps', target:8, unit:'reps/side'}
    ]
  },
  core: {
    beginner: [
      {name:'Plank Hold', type:'hold', target:20, unit:'sec'},
      {name:'Lying Leg Raise', type:'reps', target:10, unit:'reps'},
      {name:'Bicycle Crunch', type:'reps', target:14, unit:'reps'},
      {name:'Side Plank', type:'hold', target:15, unit:'sec/side'},
      {name:'Standing Side Bend', type:'reps', target:15, unit:'reps/side'}
    ],
    intermediate: [
      {name:'Russian Twist', type:'reps', target:20, unit:'reps'},
      {name:'Flutter Kicks', type:'reps', target:20, unit:'reps'},
      {name:'Side Plank Reach-Through', type:'reps', target:10, unit:'reps/side'},
      {name:'Mountain Climbers', type:'reps', target:20, unit:'reps'}
    ],
    advanced: [
      {name:'Windshield Wiper', type:'reps', target:10, unit:'reps/side'},
      {name:'Hanging Oblique Raise', type:'reps', target:10, unit:'reps/side'},
      {name:'Plank Walkout', type:'reps', target:8, unit:'reps'},
      {name:'Front Lever Raise', type:'reps', target:6, unit:'reps'}
    ]
  }
};

function tierKeyForTree(t){
  // maps a tree's rung progress to beginner/intermediate/advanced for accessory selection
  const idx = state.rungIndex[t];
  const len = TREES[t].rungs.length;
  const pct = idx/(len-1);
  if(pct < 0.34) return 'beginner';
  if(pct < 0.7) return 'intermediate';
  return 'advanced';
}

function pickAccessories(t, count, excludeName){
  // Fixed set per tier — same exercises every session at this level,
  // not rotated. Once you advance to a new tier, the set changes.
  // If the day's main rung happens to share a name with one of these
  // (common at the very beginner tier, since both pools draw from the
  // most basic moves), skip that one so it doesn't show up twice.
  const tierKey = tierKeyForTree(t);
  const pool = ACCESSORIES[t][tierKey].filter(ex => ex.name !== excludeName);
  return pool.slice(0, count);
}

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
    advancementLog: [], // {date, tree, rungId} — every time a rung is cleared, timestamped
    sessions: [], // {date, entries:[{exId, sets:[{reps|sec}]}]}
    weightLog: [], // {date, weight}
    streak: 0,
    lastSessionDate: null,
    pendingLevelUp: null,
    startDate: todayStr(),
    cyclePosition: 0,
    cyclePositionDate: null
  };
}

function load(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw) state = JSON.parse(raw);
    else state = null;
  }catch(e){ state = null; }
  if(state) migrateState();
}
function migrateState(){
  // backfill fields added in later versions so existing saved progress
  // never breaks when the app is updated
  if(!state.advancementLog) state.advancementLog = [];
  if(!state.startDate){
    // best guess: earliest session date, or today if no sessions yet
    state.startDate = state.sessions.length>0 ? state.sessions[0].date : todayStr();
  }
  if(state.cyclePosition===undefined){
    // best guess so existing users don't get reset back to Push day:
    // count training sessions completed so far as a proxy for position
    state.cyclePosition = state.sessions.length;
  }
  if(state.cyclePositionDate===undefined) state.cyclePositionDate = null;
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
  if(name==='roadmap') renderRoadmap();
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
function buildSchedule(daysPerWeek){
  // Returns an ordered array mixing tree names and 'rest', sized so the
  // ratio of rest days roughly matches the days/week setting.
  if(daysPerWeek>=5) return ['push','pull','legs','core','rest'];
  if(daysPerWeek===4) return ['push','pull','rest','legs','core','rest'];
  return ['push','rest','pull','rest','legs','rest','core','rest']; // 3 or fewer
}

function resolveTodaySlot(){
  // Decides what today's schedule slot is ('rest' or a tree name) and
  // updates state.cyclePosition / state.cyclePositionDate as needed.
  // Model:
  //  - cyclePositionDate is the last calendar date we "settled" on the
  //    current cyclePosition.
  //  - If that date is today, nothing to decide — return the same slot.
  //  - If it's a past date, a new day has begun:
  //      - if we were sitting on 'rest', move forward one slot (rest
  //        consumed) and settle on today.
  //      - if we were sitting on a training slot, only move forward if
  //        that day's session was actually saved; otherwise stay put
  //        (skipping a day delays a muscle group, doesn't skip it).
  const schedule = buildSchedule(state.profile.days);
  if(state.cyclePosition===undefined) state.cyclePosition = 0;
  const today = todayStr();

  if(state.cyclePositionDate === today){
    return schedule[state.cyclePosition % schedule.length];
  }

  // a new day has begun relative to what we last settled on
  let pos = state.cyclePosition % schedule.length;
  let slot = schedule[pos];

  if(slot==='rest'){
    // We were owed a rest day. If we already showed it (settled) on a
    // previous date, move past it now that another new day has begun.
    // Otherwise, this is the first time landing on it — show it today.
    if(state.cyclePositionDate !== null){
      state.cyclePosition++;
      pos = state.cyclePosition % schedule.length;
      slot = schedule[pos];
    }
  } else {
    // was a training slot — only advance past it if that day was logged
    const wasLogged = state.sessions.some(s=>s.tree===slot && s.date===state.cyclePositionDate);
    if(wasLogged){
      state.cyclePosition++;
      pos = state.cyclePosition % schedule.length;
      slot = schedule[pos];
    }
    // else: stay on the same training slot, it's still owed
  }

  state.cyclePositionDate = today;
  save();
  return slot;
}

function getTodayExercises(){
  const slot = resolveTodaySlot();
  if(slot==='rest') return [];

  const t = slot;
  const rIdx = state.rungIndex[t];
  const mainRung = TREES[t].rungs[Math.min(rIdx, TREES[t].rungs.length-1)];
  const items = [{tree:t, kind:'main', exId:mainRung.id, name:mainRung.name, type:mainRung.type, target:mainRung.target, unit:mainRung.unit}];

  const accessories = pickAccessories(t, 4, mainRung.name);
  accessories.forEach((a, i)=>{
    items.push({tree:t, kind:'accessory', exId:`acc_${t}_${i}_${a.name.replace(/\s+/g,'_')}`, name:a.name, type:a.type, target:a.target, unit:a.unit});
  });
  return items;
}

let currentLogExercises = [];
let checkedState = {}; // idx -> {checked:bool, value:number}

function renderHome(){
  document.getElementById('homeGreeting').textContent = `Hey, ${state.profile.name}`;
  document.getElementById('streakNum').textContent = state.streak;

  // level up banner
  checkLevelUps();
  const banner = document.getElementById('levelUpBanner');
  if(state.pendingLevelUp){
    const t = state.pendingLevelUp;
    document.getElementById('levelUpText').textContent = `${TREES[t].label}: unlock "${TREES[t].rungs[state.rungIndex[t]+1] ? TREES[t].rungs[state.rungIndex[t]+1].name : 'Mastery'}"`;
    banner.style.display='block';
  } else {
    banner.style.display='none';
  }

  // Re-roll today's exercises only if we don't already have an in-progress
  // checklist for today (so checking boxes doesn't reshuffle accessories mid-session)
  const today = todayStr();
  if(!state._homeDraftDate || state._homeDraftDate !== today){
    currentLogExercises = getTodayExercises();
    checkedState = {};
    currentLogExercises.forEach((item,idx)=>{ checkedState[idx] = {rounds:[false,false,false], value:null}; });
    state._homeDraftDate = today;
  }

  renderChecklist();
}

function renderChecklist(){
  const wrap = document.getElementById('todaySession');
  wrap.innerHTML = '';

  if(currentLogExercises.length===0){
    wrap.innerHTML = `
      <div class="empty">
        <div class="glyph">○</div>
        Rest day.<br>
        <span class="muted">Recovery is part of the program. Back to training next time you open the app.</span>
      </div>`;
    document.getElementById('completeBtn').style.display = 'none';
    document.getElementById('sessionCount').textContent = 'Rest day';
    return;
  }
  document.getElementById('completeBtn').style.display = 'block';

  const header = document.createElement('div');
  header.className='tree-group-header';
  header.textContent = TREES[currentLogExercises[0].tree].label + ' Day · 3 rounds';
  wrap.appendChild(header);

  currentLogExercises.forEach((item, idx)=>{
    const cs = checkedState[idx];
    const unitLabel = item.type==='hold' ? 'sec' : 'reps';
    const roundsDone = cs.rounds.filter(r=>r).length;
    const card = document.createElement('div');
    card.className = 'ex-card' + (roundsDone===3 ? ' checked' : '');
    const roundDots = cs.rounds.map((done, r)=>
      `<div class="round-dot ${done?'on':''}" onclick="toggleRound(${idx},${r})">${done?'✓':r+1}</div>`
    ).join('');
    card.innerHTML = `
      <div class="ex-pose" onclick="showPoseModal('${item.name.replace(/'/g,"\\'")}')">${poseSvg(item.name)}</div>
      <div class="ex-body">
        ${item.kind==='accessory' ? `<span class="ex-badge">Accessory</span>` : ''}
        <div class="ex-name">${item.name}</div>
        <div class="ex-target">${item.target} ${item.unit} × 3 rounds</div>
        <div class="round-row">${roundDots}</div>
      </div>
      <input class="ex-input" type="number" inputmode="numeric" placeholder="${unitLabel}"
        value="${cs.value!==null?cs.value:''}"
        onchange="setVal(${idx}, this.value)" onclick="event.stopPropagation()">
    `;
    wrap.appendChild(card);
  });
  updateSessionCount();
}

function showPoseModal(name){
  const modal = document.getElementById('modalContent');
  modal.innerHTML = `
    <div class="modal-handle"></div>
    <div style="display:flex; justify-content:center; margin-bottom:14px;">
      <div style="width:160px; height:160px;">${poseSvg(name)}</div>
    </div>
    <div style="text-align:center; font-weight:600; font-family:var(--font-display); text-transform:uppercase; letter-spacing:0.03em; font-size:16px; margin-bottom:18px;">${name}</div>
    <button class="btn btn-ghost" onclick="closeModal()">Close</button>
  `;
  document.getElementById('modalBg').classList.add('show');
}
function closeModal(){
  document.getElementById('modalBg').classList.remove('show');
}

function toggleRound(idx, roundNum){
  const cs = checkedState[idx];
  cs.rounds[roundNum] = !cs.rounds[roundNum];
  if(cs.value===null || cs.value===''){
    // default to the target value if nothing entered yet, so a completed round always has a number
    cs.value = currentLogExercises[idx].target;
  }
  renderChecklist();
}
function setVal(idx, v){
  const n = parseInt(v);
  checkedState[idx].value = (v==='') ? null : (isNaN(n)?null:n);
  renderChecklist();
}
function updateSessionCount(){
  const total = currentLogExercises.length;
  const done = Object.values(checkedState).filter(c=>c.rounds.filter(r=>r).length===3).length;
  document.getElementById('sessionCount').textContent = `${done} / ${total} exercises × 3 rounds done`;
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
  const clearedId = TREES[t].rungs[state.rungIndex[t]].id;
  state.cleared[t].push(clearedId);
  state.advancementLog.push({date: todayStr(), tree: t, rungId: clearedId});
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

// ---------- Roadmap screen ----------
function totalRungSteps(){
  // max possible sum of rungIndex across all trees (full mastery)
  return Object.keys(TREES).reduce((sum,t)=>sum + (TREES[t].rungs.length-1), 0);
}
function currentRungSteps(){
  return Object.values(state.rungIndex).reduce((a,b)=>a+b,0);
}
function daysBetween(d1,d2){
  return Math.round((new Date(d2+'T00:00:00') - new Date(d1+'T00:00:00')) / 86400000);
}
function computePace(){
  // rungs cleared per week, based on advancementLog history.
  // Falls back gracefully when there's not enough history yet.
  const log = state.advancementLog;
  if(log.length < 2){
    return {rungsPerWeek: null, sampleSize: log.length};
  }
  const first = log[0].date;
  const last = log[log.length-1].date;
  const days = Math.max(1, daysBetween(first, last));
  const weeks = days/7;
  const rungsPerWeek = log.length / weeks;
  return {rungsPerWeek, sampleSize: log.length};
}
function projectDateForSteps(stepsAhead, rungsPerWeek){
  if(!rungsPerWeek || rungsPerWeek<=0) return null;
  const weeksAhead = stepsAhead / rungsPerWeek;
  const d = new Date();
  d.setDate(d.getDate() + Math.round(weeksAhead*7));
  return d;
}
function fmtMonthYear(d){
  return d.toLocaleDateString('en-US', {month:'short', year:'numeric'});
}

function renderRoadmap(){
  const wrap = document.getElementById('roadmapContent');
  wrap.innerHTML = '';

  const cur = currentRungSteps();
  const max = totalRungSteps();
  const pct = Math.min(100, Math.round((cur/max)*100));
  const pace = computePace();
  const daysTraining = Math.max(1, daysBetween(state.startDate, todayStr()));

  // ---- summary card ----
  const summary = document.createElement('div');
  summary.className = 'card';
  summary.innerHTML = `
    <div class="eyebrow">Since you started</div>
    <div class="row" style="align-items:baseline;">
      <div style="font-family:var(--font-display); font-size:30px;">${daysTraining} <span style="font-size:14px; color:var(--bone-dim); text-transform:uppercase;">days</span></div>
      <div style="text-align:right;">
        <div style="font-family:var(--font-mono); color:var(--chalk); font-size:20px;">${cur}<span style="color:var(--bone-dim); font-size:13px;"> / ${max}</span></div>
        <div class="muted" style="font-size:11px;">rungs climbed</div>
      </div>
    </div>
  `;
  wrap.appendChild(summary);

  // ---- visual progress bar across tiers ----
  const tierCard = document.createElement('div');
  tierCard.className = 'card';
  tierCard.innerHTML = `<div class="eyebrow">Tier progress</div>`;
  const barWrap = document.createElement('div');
  barWrap.style.position = 'relative';
  barWrap.style.margin = '18px 4px 8px';
  barWrap.style.height = '6px';
  barWrap.style.background = 'var(--line)';
  barWrap.style.borderRadius = '3px';

  const fill = document.createElement('div');
  fill.style.position = 'absolute';
  fill.style.left = '0'; fill.style.top='0'; fill.style.height='100%';
  fill.style.width = pct+'%';
  fill.style.background = 'var(--chalk)';
  fill.style.borderRadius = '3px';
  barWrap.appendChild(fill);

  // tier markers
  TIERS.forEach(tier=>{
    const tierPct = Math.min(100, (tier.min/max)*100);
    const marker = document.createElement('div');
    marker.style.position='absolute';
    marker.style.left = tierPct+'%';
    marker.style.top = '-5px';
    marker.style.width='3px'; marker.style.height='16px';
    marker.style.background = cur>=tier.min ? 'var(--amber)' : 'var(--bone-dim)';
    marker.style.borderRadius='2px';
    marker.style.transform='translateX(-1.5px)';
    barWrap.appendChild(marker);
  });
  tierCard.appendChild(barWrap);

  const labelsRow = document.createElement('div');
  labelsRow.style.display='flex';
  labelsRow.style.justifyContent='space-between';
  labelsRow.style.marginTop='6px';
  TIERS.forEach(tier=>{
    const lbl = document.createElement('div');
    lbl.style.fontSize='10px';
    lbl.style.color = cur>=tier.min ? 'var(--amber)' : 'var(--bone-dim)';
    lbl.style.textAlign='center';
    lbl.style.flex='1';
    lbl.textContent = tier.name;
    labelsRow.appendChild(lbl);
  });
  tierCard.appendChild(labelsRow);
  wrap.appendChild(tierCard);

  // ---- pace + projection card ----
  const paceCard = document.createElement('div');
  paceCard.className = 'card card-rust';
  if(pace.rungsPerWeek===null){
    paceCard.innerHTML = `
      <div class="eyebrow" style="color:var(--amber);">Building your pace</div>
      <div class="muted">Advance at least 2 rungs to unlock a projected timeline. Keep logging — the roadmap learns your actual speed, not a guess.</div>
    `;
  } else {
    const currentTier = TIERS[currentTierIndex()];
    const nextTier = TIERS[currentTierIndex()+1];
    paceCard.innerHTML = `
      <div class="eyebrow" style="color:var(--amber);">Your pace</div>
      <div style="font-weight:600; margin-bottom:8px;">~${pace.rungsPerWeek.toFixed(1)} rungs cleared / week</div>
    `;
    if(nextTier){
      const stepsAhead = nextTier.min - cur;
      const projDate = projectDateForSteps(stepsAhead, pace.rungsPerWeek);
      const projStr = projDate ? fmtMonthYear(projDate) : '—';
      paceCard.innerHTML += `<div class="muted">At this pace, you'll reach <b style="color:var(--bone);">${nextTier.name}</b> around <b style="color:var(--bone);">${projStr}</b>.</div>`;
    } else {
      paceCard.innerHTML += `<div class="muted">You've reached the top tier — Elite. Keep refining toward full mastery of every movement.</div>`;
    }
  }
  wrap.appendChild(paceCard);

  // ---- per-tree mini roadmaps ----
  const perTreeHeader = document.createElement('div');
  perTreeHeader.className = 'eyebrow';
  perTreeHeader.style.margin = '20px 2px 10px';
  perTreeHeader.textContent = 'By movement pattern';
  wrap.appendChild(perTreeHeader);

  Object.keys(TREES).forEach(t=>{
    const tree = TREES[t];
    const idx = state.rungIndex[t];
    const tmax = tree.rungs.length-1;
    const tpct = Math.min(100, Math.round((idx/tmax)*100));
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="row" style="margin-bottom:8px;">
        <div style="font-weight:600;">${tree.label}</div>
        <div class="muted" style="font-family:var(--font-mono); font-size:12px;">${idx} / ${tmax}</div>
      </div>
      <div style="height:5px; background:var(--line); border-radius:3px; overflow:hidden;">
        <div style="height:100%; width:${tpct}%; background:var(--chalk);"></div>
      </div>
      <div class="muted" style="margin-top:8px; font-size:12.5px;">Currently: ${tree.rungs[idx].name}</div>
    `;
    wrap.appendChild(card);
  });
}


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
          <div class="ex-pose" style="cursor:pointer;" onclick="showPoseModal('${r.name.replace(/'/g,"\\'")}')">${poseSvg(r.name)}</div>
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

// ---------- Complete session (was the separate Log screen; now inline on Train) ----------
function saveLog(){
  const entries = [];
  currentLogExercises.forEach((item, idx)=>{
    const cs = checkedState[idx];
    const roundsCompleted = cs.rounds.filter(r=>r).length;
    if(roundsCompleted>0 && cs.value!==null && cs.value>0){
      const sets = [];
      for(let r=0;r<roundsCompleted;r++){
        sets.push(item.type==='hold' ? {sec:cs.value} : {reps:cs.value});
      }
      entries.push({exId: item.exId, tree: item.tree, name: item.name, kind: item.kind, sets});
    }
  });

  if(entries.length===0){
    showToast('Complete at least one round to save.');
    return;
  }

  const date = todayStr();
  const dayTree = currentLogExercises.length>0 ? currentLogExercises[0].tree : null;
  const existingIdx = state.sessions.findIndex(s=>s.date===date);
  if(existingIdx>=0) state.sessions[existingIdx] = {date, tree: dayTree, entries};
  else state.sessions.push({date, tree: dayTree, entries});
  // Note: the schedule pointer (cyclePosition) is advanced lazily by
  // resolveTodaySlot() the next time the app is opened on a later date,
  // once it sees this date's session was logged — not here.

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
      const setsStr = e.sets.map(set=> set.reps!==undefined? set.reps : set.sec+'s').join(' / ');
      const label = e.name || e.exId;
      return `<div class="row" style="padding:4px 0; font-size:13px;"><span class="muted">${label}</span><span style="font-family:var(--font-mono);">${setsStr}</span></div>`;
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
