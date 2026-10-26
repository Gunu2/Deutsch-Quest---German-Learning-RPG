import Phaser from "phaser";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { getLanguage, setLanguage, languages } from "./i18n.js";
import { cefrLevels, lessons, getLevelForXP } from "./content.js";
import { initQuestSystem } from "./questSystem.js";
import "./style.css";

const state = {
  language: getLanguage(),
  xp: Number(localStorage.getItem("dq-xp") || 0),
  completedLessons: JSON.parse(localStorage.getItem("dq-completed-lessons") || "[]"),
  activeLevel: "A1",
  currentLesson: null,
  lastBroadcastAt: 0,
  remoteSprites: new Map(),
  touchDirection: { up:false, down:false, left:false, right:false },
  user: null,
  displayName: localStorage.getItem("dq-display-name") || "Adventurer",
  questSystem: null,
  session: null,
  realtimeChannel: null,
  players: new Map(),
  game: null,
  scene: null,
  playerSprite: null,
  npcSprite: null,
  nearNpc: false,
  lessonAnswered: false
};

const $ = (id) => document.getElementById(id);
const t = () => languages[state.language];
let toastTimer;

function toast(message) {
  const node = $("toast");
  node.textContent = message;
  node.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("visible"), 2800);
}

function renderStaticText() {
  const d = t();
  const textMap = {
    "language-label": d.language, "auth-open": state.user ? state.displayName : d.auth,
    "world-eyebrow": d.eyebrow, "hero-title": d.heroTitle, "hero-copy": d.heroCopy,
    "xp-label": d.xp, "level-label": d.level, "online-label": d.online,
    "map-label": d.map, "map-subtitle": d.mapSubtitle,
    "controls-copy": d.controls, "talk-button": d.talk,
    "quest-kicker": d.questKicker, "quest-title": d.questTitle, "quest-copy": d.questCopy,
    "players-kicker": d.playersKicker, "players-title": d.playersTitle, "players-copy": d.playersCopy,
    "path-kicker": d.pathKicker, "path-title": d.pathTitle,
    "dialog-kicker": d.dialogKicker, "dialog-title": d.dialogTitle,
    "dialog-question": d.dialogQuestion, "next-question": d.continue,
    "auth-title": d.authTitle, "auth-description": d.authDescription,
    "email-label": d.email, "password-label": d.password,
    "login-button": d.login, "signup-button": d.signup, "logout-button": d.logout,
    "footer-note": d.footer
  };
  for (const [id, value] of Object.entries(textMap)) {
    const el = $(id);
    if (el) el.innerHTML = value;
  }
  $("language-select").value = state.language;
  $("connection-state").textContent = isSupabaseConfigured ? d.loading : d.local;
  renderStats();
  renderCEFR();
  renderPlayers();
}

function renderStats() {
  $("xp-value").textContent = `${state.xp} XP`;
  const level = getLevelForXP(state.xp);
  const idx = cefrLevels.findIndex((item) => item.id === level);
  $("level-value").textContent = `${level} · ${t().levels[idx]}`;
  const activeLessons = lessons[state.activeLevel] || [];
  const completedCount = activeLessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length;
  $("quest-progress-bar").style.width = `${activeLessons.length ? completedCount / activeLessons.length * 100 : 0}%`;
  $("quest-progress-text").textContent = `${completedCount}/${activeLessons.length} ${t().questStep}`;
  $("quest-reward").textContent = `${t().reward}: 25 XP`;
}

function renderCEFR() {
  const current = getLevelForXP(state.xp);
  const currentIndex = cefrLevels.findIndex((item) => item.id === current);
  $("cefr-path").innerHTML = cefrLevels.map((level, index) => {
    const unlocked = index <= currentIndex;
    const count = (lessons[level.id] || []).filter((lesson) => state.completedLessons.includes(lesson.id)).length;
    return `<button type="button" class="cefr-step ${unlocked ? "unlocked" : "locked"} ${state.activeLevel === level.id ? "selected" : ""}" data-level="${level.id}" ${unlocked ? "" : "disabled"} aria-label="${level.id}"><span>${level.id}</span><small>${unlocked ? `${count}/${(lessons[level.id] || []).length}` : "🔒"}</small></button>`;
  }).join("");
  document.querySelectorAll(".cefr-step[data-level]").forEach((button) => button.addEventListener("click", () => {
    state.activeLevel = button.dataset.level;
    renderCEFR();
    const levelLessons = lessons[state.activeLevel] || [];
    const next = levelLessons.find((lesson) => !state.completedLessons.includes(lesson.id)) || levelLessons[0];
    if (next) { state.currentLesson = next; $("dialog-title").textContent = next.german; $("dialog-question").textContent = next.prompt[state.language] || next.prompt.en; }
    toast(`${state.activeLevel}: ${levelLessons.length} lessons`);
  }));
}

function renderPlayers() {
  const list = $("players-list");
  const onlineCount = state.players.size + (state.user ? 1 : 0);
  $("online-value").textContent = isSupabaseConfigured ? String(onlineCount) : t().local;
  if (!isSupabaseConfigured) {
    list.innerHTML = `<span class="muted">${t().multiplayerNeeds}</span>`;
    return;
  }
  if (!state.user) {
    list.innerHTML = `<span class="muted">${t().playersCopy}</span>`;
    return;
  }
  const rows = [`<div class="player-row"><span class="player-dot self"></span><span>${escapeHTML(state.displayName || "Adventurer")} <small>(you)</small></span></div>`];
  for (const player of state.players.values()) {
    rows.push(`<div class="player-row"><span class="player-dot"></span><span>${escapeHTML(player.name || "Adventurer")}</span></div>`);
  }
  list.innerHTML = rows.join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

class VillageScene extends Phaser.Scene {
  constructor() { super("Village"); }
  create() {
    const width = 960, height = 480;
    this.cameras.main.setBackgroundColor("#b8dba7");
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9acb91, 1); graphics.fillRect(0, 0, width, height);
    // winding path
    graphics.fillStyle(0xe9d7a6, 1);
    graphics.fillRoundedRect(0, 330, 960, 80, 28);
    graphics.fillRoundedRect(420, 130, 90, 280, 26);
    graphics.fillRoundedRect(240, 130, 450, 70, 24);
    // decorative trees
    for (const [x, y] of [[70,80],[160,240],[800,80],[875,245],[740,395],[310,415],[570,70],[50,420]]) {
      graphics.fillStyle(0x6e9d60, 1); graphics.fillCircle(x, y, 25);
      graphics.fillStyle(0x477b4c, 1); graphics.fillCircle(x-6, y-8, 18);
      graphics.fillStyle(0x7b5638, 1); graphics.fillRect(x-4, y+13, 8, 18);
    }
    this.drawHouse(290, 85, 120, 92, 0xe9b66c);
    this.drawHouse(585, 85, 120, 92, 0xc5a7e8);
    // labels
    this.add.text(350, 35, "DORF SONNENFELD", { fontFamily: "Arial", fontSize: "17px", color: "#264a34", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(350, 54, "Lern • Sprich • Entdecke", { fontFamily: "Arial", fontSize: "12px", color: "#31583d" }).setOrigin(0.5);
    // NPC and player are simple geometric sprites, not external assets.
    this.npcSprite = this.add.container(465, 235);
    const npcBody = this.add.graphics();
    npcBody.fillStyle(0xf2d2b4, 1); npcBody.fillCircle(0, -15, 13);
    npcBody.fillStyle(0x8d5d3d, 1); npcBody.fillCircle(0, -21, 14);
    npcBody.fillStyle(0x8a6ab0, 1); npcBody.fillRoundedRect(-13, -3, 26, 29, 7);
    npcBody.fillStyle(0x34435c, 1); npcBody.fillRoundedRect(-12, 23, 9, 15, 3); npcBody.fillRoundedRect(3, 23, 9, 15, 3);
    this.npcSprite.add(npcBody);
    this.add.text(465, 277, "Frau Marta", { fontFamily: "Arial", fontSize: "13px", color: "#243447", backgroundColor: "#ffffffdd", padding: {x: 6, y: 3} }).setOrigin(0.5);
    this.add.text(465, 204, "E", { fontFamily: "Arial", fontSize: "15px", color: "#fff", backgroundColor: "#243447", padding: {x: 7, y: 3} }).setOrigin(0.5).setAlpha(0.9);
    this.playerSprite = this.add.container(350, 330);
    const player = this.add.graphics();
    player.fillStyle(0xf7d7b5, 1); player.fillCircle(0, -14, 12);
    player.fillStyle(0x253955, 1); player.fillRoundedRect(-12, -2, 24, 28, 7);
    player.fillStyle(0x415e8c, 1); player.fillRoundedRect(-11, 24, 8, 15, 3); player.fillRoundedRect(3, 24, 8, 15, 3);
    player.fillStyle(0xf4f7fb, 1); player.fillRoundedRect(-7, -20, 14, 7, 3);
    this.playerSprite.add(player);
    this.add.text(350, 363, "Du", { fontFamily: "Arial", fontSize: "12px", color: "#243447", backgroundColor: "#ffffffdd", padding: {x: 5, y: 2} }).setOrigin(0.5);
    this.physics.world.setBounds(18, 18, width-36, height-36);
    this.physics.world.enable(this.playerSprite);
    this.playerSprite.body.setCollideWorldBounds(true);
    this.playerSprite.body.setSize(22, 32).setOffset(-11, -6);
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setZoom(Math.min(this.scale.width / width, this.scale.height / height, 1));
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D,E");
    this.input.keyboard.on("keydown-E", () => { if (state.nearNpc) openLesson(); });
    state.scene = this;
    state.playerSprite = this.playerSprite;
    state.npcSprite = this.npcSprite;
    this.events.on("update", () => {});
  }
  drawHouse(x, y, w, h, wallColor) {
    const g = this.add.graphics();
    g.fillStyle(0x6d5749, 1); g.fillRoundedRect(x, y, w, h, 5);
    g.fillStyle(wallColor, 1); g.fillRect(x+5, y+13, w-10, h-15);
    g.fillStyle(0x9c6254, 1); g.fillTriangle(x-8, y+16, x+w/2, y-35, x+w+8, y+16);
    g.fillStyle(0x754e3b, 1); g.fillRect(x+w/2-13, y+h-35, 26, 35);
    g.fillStyle(0xa9d5ed, 1); g.fillRect(x+17, y+31, 22, 20); g.fillRect(x+w-39, y+31, 22, 20);
  }
  update() {
    if (!this.playerSprite?.body) return;
    const body = this.playerSprite.body;
    const speed = 180;
    const left = this.cursors.left.isDown || this.keys.A.isDown || state.touchDirection.left;
    const right = this.cursors.right.isDown || this.keys.D.isDown || state.touchDirection.right;
    const up = this.cursors.up.isDown || this.keys.W.isDown || state.touchDirection.up;
    const down = this.cursors.down.isDown || this.keys.S.isDown || state.touchDirection.down;
    body.setVelocity((right ? speed : 0) - (left ? speed : 0), (down ? speed : 0) - (up ? speed : 0));
    if (body.velocity.length() > 0) body.velocity.normalize().scale(speed);
    const distance = Phaser.Math.Distance.Between(this.playerSprite.x, this.playerSprite.y, this.npcSprite.x, this.npcSprite.y);
    const near = distance < 75;
    if (near !== state.nearNpc) {
      state.nearNpc = near;
      $("talk-button").classList.toggle("ready", near);
    }
    if (state.user && supabase && state.realtimeChannel && this.time.now - (this.lastPresenceUpdate || 0) > 180) {
      this.lastPresenceUpdate = this.time.now;
      const payload = {
        id: state.user.id,
        name: state.displayName || "Adventurer",
        x: Math.round(this.playerSprite.x),
        y: Math.round(this.playerSprite.y),
        level: getLevelForXP(state.xp)
      };
      state.realtimeChannel.track(payload);
      state.realtimeChannel.send({ type: "broadcast", event: "player-move", payload });
    }
  }
}

function startGame() {
  state.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-container",
    width: 960,
    height: 480,
    backgroundColor: "#b8dba7",
    physics: { default: "arcade", arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, pixelArt: false },
    scene: [VillageScene]
  });
}

function openLesson() {
  const levelLessons = lessons[state.activeLevel] || [];
  const lesson = levelLessons.find((item) => !state.completedLessons.includes(item.id)) || levelLessons[0];
  if (!lesson) { toast(`Materi ${state.activeLevel} sedang disiapkan.`); return; }
  state.currentLesson = lesson;
  state.lessonAnswered = false;
  $("answer-feedback").textContent = "";
  $("next-question").classList.add("hidden");
  $("answer-list").classList.remove("disabled");
  const shuffledOptions = [...lesson.options].sort(() => Math.random() - 0.5);
  $("answer-list").innerHTML = shuffledOptions.map((option, index) =>
    `<button class="answer-option" data-answer="${option.id}"><span class="answer-letter">${String.fromCharCode(65 + index)}</span><span>${option.label[state.language] || option.label.en}</span></button>`
  ).join("");
  $("dialog-question").textContent = lesson.prompt[state.language] || lesson.prompt.en;
  $("dialog-backdrop").classList.remove("hidden");
  document.querySelectorAll(".answer-option").forEach((button) => {
    button.addEventListener("click", () => answerLesson(button.dataset.answer, lesson));
  });
}
function answerLesson(answerId, lesson) {
  if (state.lessonAnswered) return;
  state.lessonAnswered = true;
  const answer = lesson.options.find((item) => item.id === answerId);
  const feedback = $("answer-feedback");
  document.querySelectorAll(".answer-option").forEach((button) => {
    button.disabled = true;
    const option = lesson.options.find((item) => item.id === button.dataset.answer);
    if (option.correct) button.classList.add("correct");
    else if (button.dataset.answer === answerId) button.classList.add("incorrect");
  });
  if (answer?.correct) {
    feedback.textContent = t().correct;
    if (!state.completedLessons.includes(lesson.id)) {
      state.xp += lesson.xp;
      state.completedLessons.push(lesson.id);
      localStorage.setItem("dq-xp", String(state.xp));
      localStorage.setItem("dq-completed-lessons", JSON.stringify(state.completedLessons));
      renderStats(); renderCEFR();
      saveProgress();
      feedback.textContent = t().completed;
    }
  } else {
    feedback.textContent = t().incorrect;
  }
  const explanation = lesson.explanation[state.language] || lesson.explanation.en;
  feedback.textContent += ` ${explanation}`;
  $("next-question").classList.remove("hidden");
  $("next-question").onclick = () => {
    $("dialog-backdrop").classList.add("hidden");
    renderStats(); renderCEFR();
    const next = (lessons[state.activeLevel] || []).find((item) => !state.completedLessons.includes(item.id));
    if (next) { state.currentLesson = next; toast(`Berikutnya: ${next.german}`); }
  };
}

async function saveProgress() {
  if (!supabase || !state.user) return;
  const { error } = await supabase.from("profiles").upsert({
    id: state.user.id,
    display_name: state.displayName || "Adventurer",
    xp: state.xp,
    cefr_level: getLevelForXP(state.xp),
    completed_lessons: state.completedLessons,
    updated_at: new Date().toISOString()
  }, { onConflict: "id" });
  if (error) console.warn("Could not save profile:", error.message);
  else toast(t().saved);
}

async function startPresence() {
  if (!supabase || !state.user) return;
  if (state.realtimeChannel) await supabase.removeChannel(state.realtimeChannel);
  const channel = supabase.channel("sonnenfeld-village", {
    config: { presence: { key: state.user.id } }
  });
  channel
    .on("presence", { event: "sync" }, () => {
      const presence = channel.presenceState();
      state.players.clear();
      for (const [key, metas] of Object.entries(presence)) {
        if (key !== state.user.id && metas?.length) state.players.set(key, metas[metas.length - 1]);
      }
      renderPlayers();
    })
    .on("broadcast", { event: "player-move" }, ({ payload }) => {
      if (!payload?.id || payload.id === state.user.id) return;
      state.players.set(payload.id, payload);
      renderPlayers();
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ name: state.displayName || "Adventurer", x: 350, y: 330, level: getLevelForXP(state.xp) });
        $("connection-state").textContent = "Online";
        $("connection-state").classList.add("connected");
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        $("connection-state").textContent = "Online error";
      }
    });
  state.realtimeChannel = channel;
}

async function authAction(mode) {
  if (!supabase) {
    $("auth-message").textContent = t().needConfig;
    return;
  }
  const email = $("email-input").value.trim();
  const password = $("password-input").value;
  const requestedName = $("display-name-input").value.trim().replace(/\s+/g, " ").slice(0, 24);
  if (mode === "signup" && !requestedName) { $("auth-message").textContent = "Masukkan nama pemain yang ingin ditampilkan."; return; }
  $("auth-message").textContent = t().loading;
  const result = mode === "signup"
    ? await supabase.auth.signUp({ email, password, options: { data: { display_name: requestedName } } })
    : await supabase.auth.signInWithPassword({ email, password });
  if (result.error) {
    $("auth-message").textContent = t().authError + result.error.message;
    return;
  }
  if (mode === "signup" && !result.data.session) {
    localStorage.setItem("dq-display-name", requestedName);
    $("auth-message").textContent = t().accountCreated;
    return;
  }
  if (mode === "signup" && requestedName) state.displayName = requestedName;
  $("auth-message").textContent = t().loggedIn;
  await handleSession(result.data.session);
}

async function handleSession(session) {
  state.session = session;
  state.user = session?.user || null;
  if (state.user && supabase) {
    const { data } = await supabase.from("profiles").select("display_name, xp, cefr_level, completed_lessons").eq("id", state.user.id).maybeSingle();
    const metadataName = state.user.user_metadata?.display_name;
    state.displayName = (data?.display_name || metadataName || state.displayName || "Adventurer").trim().slice(0,24);
    localStorage.setItem("dq-display-name", state.displayName);
    if (data) {
      state.xp = Math.max(state.xp, Number(data.xp || 0));
      state.completedLessons = [...new Set([...state.completedLessons, ...(Array.isArray(data.completed_lessons) ? data.completed_lessons : [])])];
      localStorage.setItem("dq-xp", String(state.xp));
      localStorage.setItem("dq-completed-lessons", JSON.stringify(state.completedLessons));
      renderStats(); renderCEFR();
    } else await saveProgress();
    await startPresence();
    $("logout-button").classList.remove("hidden");
  } else {
    if (supabase && state.realtimeChannel) await supabase.removeChannel(state.realtimeChannel);
    state.realtimeChannel = null;
    state.players.clear();
    $("logout-button").classList.add("hidden");
    $("connection-state").textContent = isSupabaseConfigured ? t().local : t().configMissing;
  }
  $("auth-open").textContent = state.user ? state.displayName : t().auth;
  if (state.user) $("display-name-input").value = state.displayName;
  renderPlayers();
}

function setupEvents() {
  document.querySelectorAll("[data-direction]").forEach((button) => {
    const direction = button.dataset.direction;
    const down = (event) => { event.preventDefault(); state.touchDirection[direction] = true; button.classList.add("pressed"); };
    const up = (event) => { event.preventDefault(); state.touchDirection[direction] = false; button.classList.remove("pressed"); };
    button.addEventListener("pointerdown", down);
    button.addEventListener("pointerup", up);
    button.addEventListener("pointercancel", up);
    button.addEventListener("pointerleave", up);
  });
  $("language-select").addEventListener("change", (event) => {
    state.language = event.target.value;
    setLanguage(state.language);
    renderStaticText();
  });
  $("talk-button").addEventListener("click", () => {
    if (state.nearNpc) openLesson();
    else toast(t().controlsHelp);
  });
  $("help-button").addEventListener("click", () => toast(t().controlsHelp));
  $("dialog-close").addEventListener("click", () => $("dialog-backdrop").classList.add("hidden"));
  $("dialog-backdrop").addEventListener("click", (event) => {
    if (event.target.id === "dialog-backdrop") $("dialog-backdrop").classList.add("hidden");
  });
  $("auth-open").addEventListener("click", () => {
    $("auth-message").textContent = "";
    $("auth-backdrop").classList.remove("hidden");
  });
  $("auth-close").addEventListener("click", () => $("auth-backdrop").classList.add("hidden"));
  $("auth-backdrop").addEventListener("click", (event) => {
    if (event.target.id === "auth-backdrop") $("auth-backdrop").classList.add("hidden");
  });
  $("login-button").addEventListener("click", async (event) => { event.preventDefault(); await authAction("login"); });
  $("signup-button").addEventListener("click", async () => await authAction("signup"));
  $("auth-form").addEventListener("submit", (event) => event.preventDefault());
  $("logout-button").addEventListener("click", async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    $("auth-message").textContent = t().loggedOut;
    await handleSession(null);
  });
}

async function initAuth() {
  if (!supabase) {
    $("connection-state").textContent = t().configMissing;
    return;
  }
  const { data: { session } } = await supabase.auth.getSession();
  await handleSession(session);
  supabase.auth.onAuthStateChange((_event, newSession) => {
    // Avoid awaiting Supabase calls directly inside this callback to prevent auth deadlocks.
    setTimeout(() => handleSession(newSession), 0);
  });
}

function init() {
  renderStaticText();
  setupEvents();
  startGame();
  state.questSystem = initQuestSystem({
    supabase,
    getProfile: () => ({ user: state.user, displayName: state.displayName, level: getLevelForXP(state.xp) }),
    addXP: (amount) => {
      state.xp += amount;
      localStorage.setItem("dq-xp", String(state.xp));
      renderStats(); renderCEFR(); saveProgress();
    },
    getLanguage: () => state.language,
    toast
  });
  initAuth();
  window.addEventListener("beforeunload", () => {
    if (supabase && state.realtimeChannel) supabase.removeChannel(state.realtimeChannel);
    if (state.questSystem) state.questSystem.close();
  });
}
init();