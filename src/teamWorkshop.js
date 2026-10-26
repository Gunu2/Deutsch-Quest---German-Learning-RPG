const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const MISSIONS = [
  {tag:"TEAM MISSION 01", title:"The festival plan is falling apart", story:"The rain is coming. Suggest a new plan to the village team in German. Include a suggestion and a reason.", goal:"Create one natural German sentence together. Include a suggestion and a reason.", level:"B1"},
  {tag:"TEAM MISSION 02", title:"Help a visitor who missed the train", story:"A visitor has missed the last train and is worried. Brainstorm a helpful response with two practical options and a polite question.", goal:"Write a supportive response and offer two practical options.", level:"A2"},
  {tag:"TEAM MISSION 03", title:"Negotiate the market budget", story:"The market budget is smaller than expected. Propose a compromise and explain its advantages and disadvantages.", goal:"Build a balanced proposal using a reason and a concession.", level:"B2"}
];

export function initTeamWorkshop({supabase, getUser, getPlayerName, toast}) {
  let channel = null;
  let room = "";
  let members = [];
  let shared = {ideas: [], words: [], votes: {}, draft: "", missionIndex: 0, revision: 0};
  let subscribed = false;
  const currentMission = () => MISSIONS[shared.missionIndex % MISSIONS.length];

  function render() {
    const mission = currentMission();
    $("workshop-scenario-title").textContent = mission.title;
    $("workshop-scenario").textContent = mission.story;
    const goal = document.querySelector(".workshop-goal");
    if (goal) goal.innerHTML = `<b>Goal:</b> ${escapeHTML(mission.goal)} <b>Level:</b> ${escapeHTML(mission.level)}`;
    $("workshop-ideas").innerHTML = shared.ideas.length ? shared.ideas.map((idea, index) => {
      const votes = Object.values(shared.votes).filter(v => v === idea.id).length;
      const ownVote = shared.votes[getUser()?.id] === idea.id;
      return `<article class="workshop-idea"><div><strong>${escapeHTML(idea.name)}</strong><small>${new Date(idea.at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</small></div><p>${escapeHTML(idea.text)}</p><button class="workshop-vote-button ${ownVote ? "voted" : ""}" data-vote="${escapeHTML(idea.id)}">${ownVote ? "✓ Voted" : "☆ Vote idea"} · ${votes}</button></article>`;
    }).join("") : `<p class="muted">No ideas yet. Be the first to suggest something.</p>`;
    $("workshop-sentence").textContent = shared.words.length ? shared.words.join(" ") : "Your team's sentence will appear here…";
    $("workshop-votes").innerHTML = shared.ideas.length ? [...shared.ideas].sort((a,b) => Object.values(shared.votes).filter(v=>v===b.id).length - Object.values(shared.votes).filter(v=>v===a.id).length).map(idea => `<div class="vote-row"><span>${escapeHTML(idea.text)}</span><b>${Object.values(shared.votes).filter(v=>v===idea.id).length} votes</b></div>`).join("") : "No votes yet.";
    $("workshop-members").innerHTML = members.length ? members.map(m=>`<div class="workshop-member"><span class="player-dot ${m.id===getUser()?.id ? "self" : ""}"></span><span>${escapeHTML(m.name || "Adventurer")} ${m.id===getUser()?.id ? "(you)" : ""}</span><small>${escapeHTML(m.level || "A1")}</small></div>`).join("") : "No teammates connected.";
    $("workshop-member-count").textContent = String(members.length);
    $("workshop-undo").disabled = !shared.words.length;
    $("workshop-clear").disabled = !shared.words.length;
    document.querySelectorAll("#workshop-phrases button").forEach(button => button.disabled = !subscribed);
    $("workshop-idea-input").disabled = !subscribed;
    $("workshop-idea-form").querySelector("button").disabled = !subscribed;
    $("workshop-submit").disabled = !subscribed || !shared.words.length;
  }
  function status(message) { $("workshop-status").textContent = message; }
  async function publish(next) {
    shared = {...shared, ...next, revision: shared.revision + 1};
    render();
    if (channel && subscribed) await channel.send({type:"broadcast", event:"workshop-state", payload:{sender:getUser()?.id, state:shared}});
  }
  async function join() {
    if (!supabase || !getUser()) { toast("Please sign in before joining the team language lab."); return; }
    room = $("workshop-room-input").value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0,12) || "SONNENFELD";
    $("workshop-room-input").value = room;
    if (channel) await supabase.removeChannel(channel);
    subscribed = false; members = []; status(`Connecting to ${room}…`); render();
    channel = supabase.channel(`dq-workshop-${room}`, {config:{presence:{key:getUser().id}}});
    channel.on("presence", {event:"sync"}, () => {
      const presence = channel.presenceState();
      members = Object.entries(presence).flatMap(([id, metas]) => (metas || []).map(meta => ({...meta, id})));
      status(`${members.length} connected · ${room}${members.length < 2 ? " · invite a teammate to collaborate" : " · team lab ready"}`);
      render();
    }).on("broadcast", {event:"workshop-state"}, ({payload}) => {
      if (!payload?.state || payload.sender === getUser()?.id) return;
      // Realtime snapshots let everyone see shared edits immediately. For public competitive rewards, use server-authoritative storage.
      if ((payload.state.revision || 0) >= (shared.revision || 0)) { shared = payload.state; render(); }
    }).subscribe(async result => {
      if (result === "SUBSCRIBED") {
        subscribed = true;
        await channel.track({name:getPlayerName() || "Adventurer", level:"A1", joinedAt:Date.now()});
        status(`Connected to ${room}. ${members.length} player(s) present; invite a teammate to brainstorm live.`);
        await channel.send({type:"broadcast", event:"workshop-state", payload:{sender:getUser().id, state:shared}});
        render();
      } else if (result === "CHANNEL_ERROR" || result === "TIMED_OUT") {
        subscribed = false; status("Could not connect. Check Supabase Realtime and try again."); render();
      }
    });
  }
  $("workshop-join").addEventListener("click", join);
  $("workshop-idea-form").addEventListener("submit", async event => {
    event.preventDefault();
    if (!subscribed) return toast("Join a workshop room first.");
    const input = $("workshop-idea-input"); const text = input.value.trim();
    if (!text) return;
    const idea = {id: crypto.randomUUID(), name:getPlayerName() || "Adventurer", text, at:Date.now()};
    input.value = "";
    await publish({ideas:[...shared.ideas, idea].slice(-30)});
  });
  $("workshop-phrases").addEventListener("click", async event => {
    const button = event.target.closest("[data-phrase]");
    if (!button || !subscribed) return;
    await publish({words:[...shared.words, button.dataset.phrase].slice(0,24)});
  });
  $("workshop-undo").addEventListener("click", async () => { if (subscribed && shared.words.length) await publish({words:shared.words.slice(0,-1)}); });
  $("workshop-clear").addEventListener("click", async () => { if (subscribed && confirm("Clear the shared sentence for everyone in this room?")) await publish({words:[]}); });
  $("workshop-ideas").addEventListener("click", async event => {
    const button = event.target.closest("[data-vote]");
    if (!button || !subscribed) return;
    const votes = {...shared.votes};
    if (votes[getUser().id] === button.dataset.vote) delete votes[getUser().id]; else votes[getUser().id] = button.dataset.vote;
    await publish({votes});
  });
  $("workshop-submit").addEventListener("click", () => {
    if (!subscribed || !shared.words.length) return;
    const sentence = shared.words.join(" ").replace(/\s+([,.!?])/g, "$1");
    const hasSuggestion = /könnten|sollten|vorschlagen|vielleicht/i.test(sentence);
    const hasReason = /weil|denn|da/i.test(sentence);
    const feedback = hasSuggestion && hasReason ? "Team draft submitted. You included a proposal and a reason; review word order and punctuation together." : !hasSuggestion ? "Your draft needs a clear suggestion (for example: Wir könnten …). Brainstorm and add a proposal." : "Your draft needs a reason (for example: …, weil es draußen regnet). Add a reason clause and check verb position.";
    $("workshop-feedback").textContent = `${sentence}\n${feedback}`;
    toast("Team draft reviewed. Discuss the feedback and revise together.");
  });
  render();
  return {close:async()=>{if(channel && supabase) await supabase.removeChannel(channel);}};
}
