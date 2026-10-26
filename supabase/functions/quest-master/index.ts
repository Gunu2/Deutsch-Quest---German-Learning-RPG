import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const allowedLevels = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST required" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({ error: "Quest Master is not configured" }), { status: 503, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const level = allowedLevels.has(body?.level) ? body.level : "A1";
    const language = ["id", "en", "de", "es"].includes(body?.language) ? body.language : "en";
    const sceneType = ["greeting", "travel", "negotiation", "mystery"].includes(body?.sceneType) ? body.sceneType : "mystery";
    const prompt = `You are Quest Master for Deutsch Quest, a German-language learning RPG. Create ONE short, coherent German-learning boss encounter for CEFR ${level}, scene type ${sceneType}. The UI explanation language is ${language}. Return only valid JSON with keys: scene (1-2 sentences, situation in the UI language), prompt (task in the UI language), options (exactly 3 plausible German response strings), correctIndex (integer 0..2), explanation (short grammar/pragmatics explanation in UI language), hint (non-answer-revealing hint in UI language), german (the correct German response). Exactly one option must be best for the situation. All distractors should be plausible language errors or context mismatches, not random unrelated nonsense. Difficulty and grammar must match ${level}. No markdown, no extra keys, no personal data requests.`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_MODEL") || "gpt-4.1-mini",
        temperature: 0.85,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Return strictly valid JSON. Educational accuracy matters more than cleverness. The correct option must be exactly the natural answer to the displayed scene." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("OpenAI request failed", response.status, detail.slice(0, 500));
      return new Response(JSON.stringify({ error: "Quest generation failed" }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const payload = await response.json();
    const raw = payload?.choices?.[0]?.message?.content;
    const quest = JSON.parse(raw || "{}");
    if (typeof quest.scene !== "string" || typeof quest.prompt !== "string" || !Array.isArray(quest.options) || quest.options.length !== 3 || !Number.isInteger(quest.correctIndex) || quest.correctIndex < 0 || quest.correctIndex > 2 || typeof quest.explanation !== "string" || typeof quest.hint !== "string") {
      return new Response(JSON.stringify({ error: "Invalid generated quest" }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(quest), { headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Quest Master error", error);
    return new Response(JSON.stringify({ error: "Unable to generate quest" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
