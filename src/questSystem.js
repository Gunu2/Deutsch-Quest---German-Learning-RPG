const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

// Curated fallback scenarios: each option is an actual response to the displayed situation.
const BANK = {
  A1: [
    {scene:"At the village gate, a neighbour smiles and says: „Guten Morgen!“",prompt:"Choose a natural reply.",german:"Guten Morgen!",options:["Guten Morgen! Wie geht's?","Ich heiße Morgen.","Zwei Kaffee, bitte."],correct:0,why:"Mirror the greeting. „Wie geht's?“ means “How are you?”",hint:"Answer the greeting with the same greeting."},
    {scene:"You arrive at the bakery. The baker asks: „Was möchten Sie?“",prompt:"Order one bread roll politely.",german:"Ein Brötchen, bitte.",options:["Ein Brötchen, bitte.","Ich bin ein Brötchen.","Woher kommst du?"],correct:0,why:"„Ein Brötchen, bitte“ is a simple, polite order.",hint:"Use ein + the item + bitte."},
    {scene:"A guard asks: „Wie heißt du?“",prompt:"Tell the guard your name.",german:"Ich heiße ...",options:["Ich heiße ...","Ich bin zwölf Uhr.","Gute Nacht, Brot."],correct:0,why:"„Ich heiße …“ means “My name is …”.",hint:"Start with „Ich heiße …“"}
  ],
  A2: [
    {scene:"The train is delayed. A traveller asks: „Wann fährt der nächste Zug?“",prompt:"Ask for the departure time politely.",german:"Können Sie mir bitte sagen, wann der nächste Zug fährt?",options:["Können Sie mir bitte sagen, wann der nächste Zug fährt?","Ich fahre gestern mit dem Zug.","Der Zug schmeckt sehr gut."],correct:0,why:"„Können Sie mir bitte sagen …?“ is a polite request; the verb goes to the end in the embedded clause.",hint:"Use „Können Sie mir bitte sagen, wann …“ and place fährt at the end."},
    {scene:"Your teammate is lost. You want to explain how to reach the town hall.",prompt:"Choose a clear direction.",german:"Gehen Sie geradeaus und biegen Sie links ab.",options:["Gehen Sie geradeaus und biegen Sie links ab.","Ich habe gestern links gegessen.","Wenn ich ein Bahnhof."],correct:0,why:"Imperative forms „Gehen Sie“ and „biegen Sie … ab“ are polite directions.",hint:"A direction uses „Gehen Sie …“"},
    {scene:"You cannot attend a meeting and need to apologise.",prompt:"Choose the most appropriate sentence.",german:"Es tut mir leid, ich kann heute nicht kommen.",options:["Es tut mir leid, ich kann heute nicht kommen.","Es tut mir leid, ich bin ein Tisch.","Ich komme nie gestern."],correct:0,why:"This is a natural apology plus a reason you cannot attend.",hint:"Start with „Es tut mir leid …“"}
  ],
  B1: [
    {scene:"Your group must choose a meeting point. You want to suggest the station because it is easy to find.",prompt:"Make a reasoned suggestion.",german:"Wir könnten uns am Bahnhof treffen, weil er leicht zu finden ist.",options:["Wir könnten uns am Bahnhof treffen, weil er leicht zu finden ist.","Wir treffen uns, obwohl gestern Bahnhof.","Ich schlage vor, dass wir am Bahnhof treffen uns."],correct:0,why:"„Wir könnten …“ makes a polite suggestion; after „weil“, the conjugated verb goes to the end.",hint:"A subordinate clause with „weil“ sends the verb to the end."},
    {scene:"A friend misunderstood your plan. You want to clarify without blaming them.",prompt:"Choose a tactful clarification.",german:"Vielleicht habe ich mich nicht klar ausgedrückt. Ich meinte, dass wir später starten.",options:["Vielleicht habe ich mich nicht klar ausgedrückt. Ich meinte, dass wir später starten.","Du verstehst immer gar nichts.","Später starten ich meinte dass."],correct:0,why:"This phrasing takes responsibility and clarifies the intended plan; „dass“ introduces a verb-final clause.",hint:"Use a softener like „Vielleicht …“ and a „dass“ clause."},
    {scene:"The village council asks you to compare two solutions and give a reason.",prompt:"Choose a balanced argument.",german:"Einerseits ist die Lösung günstig, andererseits dauert die Umsetzung länger.",options:["Einerseits ist die Lösung günstig, andererseits dauert die Umsetzung länger.","Die Lösung ist günstig, weil andererseits.","Ich bin anderer Seite Lösung."],correct:0,why:"„Einerseits … andererseits …“ weighs two sides of an argument.",hint:"Use the paired structure „Einerseits … andererseits …“"}
  ],
  B2: [
    {scene:"You are debating whether the village should restrict cars in the old town.",prompt:"Present a nuanced position.",german:"Auch wenn eine Einschränkung unbequem wäre, könnte sie langfristig die Lebensqualität erhöhen.",options:["Auch wenn eine Einschränkung unbequem wäre, könnte sie langfristig die Lebensqualität erhöhen.","Autos sind schlecht und Ende.","Wenn Einschränkung, Lebensqualität weil."],correct:0,why:"„Auch wenn“ introduces a concession; the conditional „könnte“ makes the claim appropriately cautious.",hint:"A nuanced argument can concede a drawback before stating a benefit."},
    {scene:"A colleague challenges your evidence. You want to qualify your claim responsibly.",prompt:"Choose an evidence-aware response.",german:"Die bisherigen Daten deuten darauf hin, dass die Maßnahme wirksam sein könnte.",options:["Die bisherigen Daten deuten darauf hin, dass die Maßnahme wirksam sein könnte.","Das ist immer wahr, weil ich es sage.","Die Daten haben gestern vielleicht."],correct:0,why:"„deuten darauf hin“ and „könnte“ communicate evidence and uncertainty rather than overclaiming.",hint:"Avoid absolute claims; qualify evidence with „deuten darauf hin“."},
    {scene:"You need to disagree with a project lead while remaining constructive.",prompt:"Choose a diplomatic disagreement.",german:"Ich verstehe den Ansatz, würde jedoch gern eine Alternative zur Diskussion stellen.",options:["Ich verstehe den Ansatz, würde jedoch gern eine Alternative zur Diskussion stellen.","Dein Ansatz ist Unsinn.","Ich verstehe, Alternative stellen Diskussion würde gern."],correct:0,why:"This acknowledges the other position and introduces an alternative diplomatically.",hint:"Acknowledge first, then introduce your alternative."}
  ],
  C1: [
    {scene:"At a public forum, you need to distinguish a correlation from a cause.",prompt:"Choose the most precise statement.",german:"Aus der Korrelation allein lässt sich noch kein kausaler Zusammenhang ableiten.",options:["Aus der Korrelation allein lässt sich noch kein kausaler Zusammenhang ableiten.","Die Korrelation beweist immer die Ursache.","Kausal ist wenn ähnlich."],correct:0,why:"This carefully states that correlation alone is insufficient to infer causation.",hint:"Look for a formulation that avoids claiming more than the evidence supports."},
    {scene:"You are chairing a tense meeting and want to reframe the disagreement.",prompt:"Choose a constructive synthesis.",german:"Vielleicht lässt sich der scheinbare Widerspruch auflösen, wenn wir die unterschiedlichen Ausgangsannahmen berücksichtigen.",options:["Vielleicht lässt sich der scheinbare Widerspruch auflösen, wenn wir die unterschiedlichen Ausgangsannahmen berücksichtigen.","Es gibt keinen Sinn, weiterzureden.","Widerspruch ist auflösen weil Annahme unterschiedlich."],correct:0,why:"The sentence proposes a synthesis by examining different assumptions.",hint:"C1 discourse often reframes the issue rather than dismissing a side."},
    {scene:"You must summarize a complex report without overstating its conclusion.",prompt:"Choose the most appropriately qualified summary.",german:"Der Bericht legt nahe, dass mehrere Faktoren zusammenwirken, ohne deren jeweiliges Gewicht abschließend zu bestimmen.",options:["Der Bericht legt nahe, dass mehrere Faktoren zusammenwirken, ohne deren jeweiliges Gewicht abschließend zu bestimmen.","Der Bericht beweist, dass genau ein Faktor alles verursacht.","Der Bericht ist über Faktoren."],correct:0,why:"„legt nahe“ signals an interpretation; the second clause preserves the report's uncertainty.",hint:"Prefer careful reporting verbs such as „legt nahe“."}
  ],
  C2: [
    {scene:"A policy paper uses a rhetorically forceful but logically weak claim. You must critique it precisely.",prompt:"Choose the most rigorous critique.",german:"Die Schlussfolgerung ist insofern nicht zwingend, als sie eine notwendige Bedingung mit einer hinreichenden verwechselt.",options:["Die Schlussfolgerung ist insofern nicht zwingend, als sie eine notwendige Bedingung mit einer hinreichenden verwechselt.","Die Schlussfolgerung klingt komisch.","Notwendig ist hinreichend, weil Schluss."],correct:0,why:"The formulation identifies a precise logical error and explains why the conclusion does not follow.",hint:"Identify the exact logical relationship being confused."},
    {scene:"You need to acknowledge a strong counterargument without abandoning your central thesis.",prompt:"Choose the most sophisticated concession.",german:"So berechtigt dieser Einwand auch sein mag, entkräftet er die These nicht, sondern präzisiert vielmehr deren Geltungsbereich.",options:["So berechtigt dieser Einwand auch sein mag, entkräftet er die These nicht, sondern präzisiert vielmehr deren Geltungsbereich.","Der Einwand ist egal.","Berechtigt, These, Bereich, trotzdem."],correct:0,why:"The concessive construction acknowledges the objection and argues that it narrows rather than defeats the thesis.",hint:"A sophisticated response can concede validity while narrowing the claim's scope."},
    {scene:"You are editing a formal statement to make its claim exact and appropriately limited.",prompt:"Choose the most precise formulation.",german:"Unter den genannten Voraussetzungen ist die Annahme plausibel, wenngleich sie einer empirischen Überprüfung bedarf.",options:["Unter den genannten Voraussetzungen ist die Annahme plausibel, wenngleich sie einer empirischen Überprüfung bedarf.","Die Annahme ist hundertprozentig wahr.","Voraussetzungen haben empirisch angenommen."],correct:0,why:"„plausibel“ and „wenngleich“ convey a conditional assessment and the need for verification.",hint:"Look for precise qualification and an explicit need for verification."}
  ]
};

const LEVEL_ORDER = ["A1","A2","B1","B2","C1","C2"];
const STAGES = [
  {name:"The Greeting Wraith",icon:"👻",story:"A curse has erased the village's greetings. Restore a natural conversation to weaken its shield."},
  {name:"The Grammar Golem",icon:"🗿",story:"The bridge is sealed by tangled word order. Use the sentence structure the situation actually requires."},
  {name:"The Sprachwächter",icon:"🐉",story:"The final guardian twists meaning and intent. Defeat it with precise, context-aware German."}
];
const tr = (id,en) => ({id,en});

export function initQuestSystem({supabase, getProfile, addXP, getLanguage, toast}) {
  let mode = "solo", channel = null, members = [], room = "SONNENFELD", current = null;
  let stageIndex = 0, questionIndex = 0, bossHP = 3, hearts = 3, activeLevel = "A1", busy = false;
  const language = () => getLanguage() || "en";
  const uiText = (obj) => obj[language()] || obj.en || obj.id || "";
  const user = () => getProfile()?.user;
  const playerName = () => getProfile()?.displayName || "Adventurer";
  const localQuestions = () => BANK[activeLevel] || BANK.A1;
  const allQuestions = () => localQuestions();

  function status(text) { $("team-status").textContent = text; }
  function renderMeters() {
    $("boss-hp-text").textContent = `${Math.max(0,bossHP)} / 3`;
    $("boss-hp-bar").style.width = `${Math.max(0,bossHP)/3*100}%`;
    $("party-hearts").textContent = Array.from({length:Math.max(0,hearts)},()=>"♥").join(" ") || "0 hearts";
    $("raid-phase-label").textContent = `CHAPTER ${stageIndex+1} · ${activeLevel} · ${mode.toUpperCase()}`;
    $("raid-boss-visual").textContent = STAGES[stageIndex].icon;
    $("raid-boss-name").textContent = STAGES[stageIndex].name;
  }
  function showQuestion() {
    const questions = allQuestions();
    const q = questions[questionIndex % questions.length];
    current = q;
    $("raid-story").textContent = STAGES[stageIndex].story;
    $("raid-scene").textContent = q.scene;
    $("raid-prompt").textContent = q.prompt;
    $("raid-feedback").textContent = "";
    $("raid-next-button").classList.add("hidden");
    $("raid-answer-list").innerHTML = q.options.map((option,i)=>({option,i,sort:Math.random()})).sort((a,b)=>a.sort-b.sort).map(({option,i},index)=>`<button class="answer-option" data-answer="${i}"><span class="answer-letter">${String.fromCharCode(65+index)}</span><span>${esc(option)}</span></button>`).join("");
    document.querySelectorAll("#raid-answer-list .answer-option").forEach(btn=>btn.addEventListener("click",()=>answer(Number(btn.dataset.answer))));
    renderMeters();
  }
  function open(modeChoice, level) {
    if (modeChoice === "team") {
      if (!supabase || !user()) { toast("Sign in to join a team raid."); return; }
      if (members.length < 2) { toast("Team raid needs at least 2 signed-in players in the same room."); return; }
    }
    mode = modeChoice; activeLevel = LEVEL_ORDER.includes(level) ? level : (getProfile()?.level || "A1");
    stageIndex=0; questionIndex=0; bossHP=3; hearts=mode === "team" ? 5 : 3; busy=false;
    $("raid-backdrop").classList.remove("hidden"); showQuestion();
    if (mode === "team") broadcast({kind:"start",stageIndex,questionIndex,bossHP,hearts,activeLevel});
  }
  async function makeQuestion(level) {
    if (supabase && user()) {
      try {
        const {data,error} = await supabase.functions.invoke("quest-master", {body:{level, language:language(), sceneType:["greeting","travel","negotiation","mystery"][Math.floor(Math.random()*4)]}});
        if (!error && data?.scene && data?.prompt && Array.isArray(data?.options) && data.options.length === 3 && Number.isInteger(data.correctIndex) && data.correctIndex>=0 && data.correctIndex<3) {
          $("ai-status").textContent = "Quest Master connected · fresh scenario generated.";
          return {scene:data.scene,prompt:data.prompt,options:data.options,correct:data.correctIndex,why:data.explanation || "Review the grammar and context.",hint:data.hint || "Read the situation carefully."};
        }
      } catch (e) { console.warn("Quest Master unavailable",e); }
    }
    $("ai-status").textContent = "Using curated fallback scenarios. Deploy the quest-master Edge Function to enable AI-generated quests.";
    const bank = BANK[level] || BANK.A1;
    return bank[Math.floor(Math.random()*bank.length)];
  }
  async function answer(index) {
    if (busy || !current) return;
    busy = true;
    const correct = index === current.correct;
    document.querySelectorAll("#raid-answer-list .answer-option").forEach(btn=>{
      btn.disabled=true;
      if (Number(btn.dataset.answer)===current.correct) btn.classList.add("correct");
      else if (Number(btn.dataset.answer)===index) btn.classList.add("incorrect");
    });
    if (correct) {
      bossHP = Math.max(0,bossHP-1);
      $("raid-feedback").textContent = `Direct hit! ${current.german ? current.german+" · " : ""}${current.why}`;
      addXP(25 + LEVEL_ORDER.indexOf(activeLevel)*10);
      if (mode === "team") broadcast({kind:"hit",bossHP,hearts,stageIndex,questionIndex});
    } else {
      hearts = Math.max(0,hearts-1);
      $("raid-feedback").textContent = `The boss resisted. ${current.why} Hint: ${current.hint}`;
      if (mode === "team") broadcast({kind:"miss",bossHP,hearts,stageIndex,questionIndex});
    }
    renderMeters();
    if (bossHP === 0 || hearts === 0) {
      $("raid-next-button").textContent = hearts === 0 ? "Retry chapter" : (stageIndex === STAGES.length-1 ? "Claim victory" : "Next chapter");
      $("raid-next-button").classList.remove("hidden");
      $("raid-next-button").onclick = async () => {
        if (hearts === 0) { bossHP=3; hearts=mode==="team"?5:3; questionIndex=0; showQuestion(); busy=false; return; }
        if (stageIndex < STAGES.length-1) { stageIndex++; questionIndex++; bossHP=3; hearts=Math.min(mode==="team"?5:3,hearts+1); busy=false; showQuestion(); if(mode==="team") broadcast({kind:"phase",stageIndex,questionIndex,bossHP,hearts}); }
        else { $("raid-feedback").textContent="Village restored! Quest chain complete. Keep practising to unlock tougher CEFR chapters."; $("raid-next-button").textContent="Close victory screen"; $("raid-next-button").onclick=()=>$("raid-backdrop").classList.add("hidden"); }
      };
    } else {
      $("raid-next-button").textContent = "Next challenge";
      $("raid-next-button").classList.remove("hidden");
      $("raid-next-button").onclick = async () => { questionIndex++; current=await makeQuestion(activeLevel); busy=false; showQuestionFrom(current); if(mode==="team") await broadcast({kind:"question",stageIndex,questionIndex,bossHP,hearts,activeLevel,question:current}); };
    }
  }
  function showQuestionFrom(q) {
    current=q; $("raid-story").textContent=STAGES[stageIndex].story; $("raid-scene").textContent=q.scene; $("raid-prompt").textContent=q.prompt; $("raid-feedback").textContent=""; $("raid-next-button").classList.add("hidden");
    $("raid-answer-list").innerHTML=q.options.map((option,i)=>({option,i,r:Math.random()})).sort((a,b)=>a.r-b.r).map(({option,i},n)=>`<button class="answer-option" data-answer="${i}"><span class="answer-letter">${String.fromCharCode(65+n)}</span><span>${esc(option)}</span></button>`).join("");
    document.querySelectorAll("#raid-answer-list .answer-option").forEach(btn=>btn.addEventListener("click",()=>answer(Number(btn.dataset.answer)))); renderMeters();
  }
  async function joinRoom() {
    if (!supabase || !user()) { toast("Sign in first to play a team raid."); return; }
    room = ($("team-room-input").value.trim().toUpperCase().replace(/[^A-Z0-9-]/g,"").slice(0,12) || "SONNENFELD");
    $("team-room-input").value=room;
    if(channel) await supabase.removeChannel(channel);
    members=[];
    channel=supabase.channel(`dq-team-${room}`,{config:{presence:{key:user().id}}});
    channel.on("presence",{event:"sync"},()=>{
      const all=channel.presenceState(); members=Object.entries(all).flatMap(([id,metas])=>(metas||[]).map(m=>({...m,id})));
      const names=members.map(m=>m.name || "Adventurer");
      status(`${members.length}/4 players · ${names.join(", ") || "waiting"}`);
      $("team-raid-button").disabled=members.length<2 || members.length>4;
      $("team-raid-button").textContent=members.length<2?"Start team raid (need 2)":"Start team raid";
    }).on("broadcast",{event:"raid-state"},({payload})=>{
      if(!payload || payload.sender===user()?.id) return;
      if(payload.kind==="start" || payload.kind==="hit" || payload.kind==="miss" || payload.kind==="phase" || payload.kind==="question") {
        if($("raid-backdrop").classList.contains("hidden")) { mode="team"; activeLevel=payload.activeLevel || activeLevel; $("raid-backdrop").classList.remove("hidden"); }
        stageIndex=payload.stageIndex ?? stageIndex; questionIndex=payload.questionIndex ?? questionIndex; bossHP=payload.bossHP ?? bossHP; hearts=payload.hearts ?? hearts;
        renderMeters();
        if(payload.kind==="hit" || payload.kind==="miss") {
          $("raid-feedback").textContent=payload.kind==="hit"?"A teammate landed a hit!":"A teammate missed. Check the hint and coordinate your next answer.";
          $("raid-next-button").textContent="Next team challenge";
          $("raid-next-button").classList.remove("hidden");
          $("raid-next-button").onclick=async()=>{ questionIndex++; current=await makeQuestion(activeLevel); busy=false; showQuestionFrom(current); await broadcast({kind:"question",stageIndex,questionIndex,bossHP,hearts,activeLevel,question:current}); };
        }
        if(payload.kind==="question" && payload.question) { stageIndex=payload.stageIndex ?? stageIndex; questionIndex=payload.questionIndex ?? questionIndex; bossHP=payload.bossHP ?? bossHP; hearts=payload.hearts ?? hearts; busy=false; showQuestionFrom(payload.question); }
        if(payload.kind==="phase" || payload.kind==="start") showQuestion();
      }
    }).subscribe(async statusValue=>{ if(statusValue==="SUBSCRIBED") { await channel.track({name:playerName(),level:getProfile()?.level||"A1",joinedAt:Date.now()}); status(`Connected to room ${room}; waiting for another player…`); } else if(statusValue==="CHANNEL_ERROR") status("Could not connect. Check Supabase Realtime configuration."); });
  }
  async function broadcast(payload) { if(channel) await channel.send({type:"broadcast",event:"raid-state",payload:{...payload,sender:user()?.id}}); }
  $("solo-raid-button").addEventListener("click",()=>open("solo",getProfile()?.level));
  $("join-team-button").addEventListener("click",joinRoom);
  $("team-raid-button").addEventListener("click",()=>open("team",getProfile()?.level));
  $("ai-raid-button").addEventListener("click",async()=>{
    activeLevel=$("ai-level-select").value; mode="solo"; stageIndex=0; questionIndex=0; bossHP=3; hearts=3; busy=false;
    $("raid-backdrop").classList.remove("hidden");
    $("raid-feedback").textContent="Quest Master is preparing a scenario…";
    current=await makeQuestion(activeLevel); showQuestionFrom(current);
  });
  $("raid-hint-button").addEventListener("click",()=>{ if(current) $("raid-feedback").textContent=`Hint: ${current.hint}`; });
  $("raid-close").addEventListener("click",()=>$("raid-backdrop").classList.add("hidden"));
  $("raid-backdrop").addEventListener("click",e=>{if(e.target.id==="raid-backdrop")$("raid-backdrop").classList.add("hidden")});
  return {close:async()=>{if(channel && supabase) await supabase.removeChannel(channel);}};
}
