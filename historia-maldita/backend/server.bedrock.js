require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

const app = express();
app.use(cors());
app.use(express.json());

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-haiku-20240307-v1:0';

// ─── COST TRACKER ────────────────────────────────────────────────────────────
const PRICE_INPUT  = 0.25 / 1_000_000;
const PRICE_OUTPUT = 1.25 / 1_000_000;
let costTracker = { totalInputTokens: 0, totalOutputTokens: 0, totalCostUSD: 0, callCount: 0, sessionCosts: [] };

function trackUsage(endpoint, usage) {
  if (!usage) return;
  const i = usage.inputTokens || 0;
  const o = usage.outputTokens || 0;
  const cost = i * PRICE_INPUT + o * PRICE_OUTPUT;
  costTracker.totalInputTokens += i;
  costTracker.totalOutputTokens += o;
  costTracker.totalCostUSD += cost;
  costTracker.callCount += 1;
  costTracker.sessionCosts.push({ timestamp: new Date().toISOString(), endpoint, inputTokens: i, outputTokens: o, costUSD: parseFloat(cost.toFixed(6)) });
  if (costTracker.sessionCosts.length > 200) costTracker.sessionCosts = costTracker.sessionCosts.slice(-200);
}

// ─── LANGUAGE HELPERS ────────────────────────────────────────────────────────

const LANG_NAMES = { pt: 'português do Brasil', es: 'español', en: 'English' };

// Rules that work for real players sitting around a table drinking
const RULES_EXAMPLES = {
  pt: `REGRAS VÁLIDAS (para jogadores REAIS sentados numa mesa bebendo):
- "Ninguém pode dizer o nome de [jogador] por X rodadas"
- "Quem beber tem que fazer uma careta"
- "Todo mundo bate na mesa antes de beber"
- "Ninguém pode apontar o dedo"
- "Quem falar palavrão bebe 1 gole"
- "Ninguém pode cruzar os braços"
- "Quem rir bebe 1 gole"
- "Ninguém pode usar o celular"
- "Quem falar em voz alta bebe"
REGRAS PROIBIDAS (NUNCA crie): regras para personagens da história, ações físicas impossíveis sentado (pular, correr, dar cambalhota, fazer flexão), percepções sensoriais (ouvir barulho, ver algo, pisar em algo)`,
  es: `REGLAS VÁLIDAS (para jugadores REALES sentados en una mesa bebiendo):
- "Nadie puede decir el nombre de [jugador] por X rondas"
- "Quien beba tiene que hacer una mueca"
- "Todos golpean la mesa antes de beber"
- "Nadie puede señalar con el dedo"
- "Quien diga una mala palabra bebe 1 trago"
- "Nadie puede cruzar los brazos"
- "Quien se ría bebe 1 trago"
- "Nadie puede usar el celular"
REGLAS PROHIBIDAS (NUNCA crees): reglas para personajes de la historia, acciones físicas imposibles sentado (saltar, correr, dar voltereta), percepciones sensoriales`,
  en: `VALID RULES (for REAL players sitting at a table drinking):
- "Nobody can say [player]'s name for X rounds"
- "Whoever drinks must make a funny face"
- "Everyone knocks on the table before drinking"
- "Nobody can point their finger"
- "Whoever swears drinks 1 sip"
- "Nobody can cross their arms"
- "Whoever laughs drinks 1 sip"
- "Nobody can use their phone"
FORBIDDEN RULES (NEVER create): rules for story characters, impossible physical actions while seated (jump, run, do a cartwheel), sensory perceptions`,
};

function getSystemClassic(lang = 'pt') {
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  return `You are the sarcastic narrator of a drinking party game called Bebedeira Narrada.
Style: chaotic, supernatural, sarcastic, funny, friends at a party.
CRITICAL: Respond ONLY in ${langName}. Short responses. Valid JSON without markdown. No graphic violence.
Be SARCASTIC — sometimes target a specific player on purpose.

${RULES_EXAMPLES[lang] || RULES_EXAMPLES.pt}`;
}

function getSystemStory(lang = 'pt') {
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  return `You are the narrator of a drinking party game called Bebedeira Narrada, STORY mode.
The group is in a specific place living a collective adventure. Narrate like a drunk sarcastic RPG master.
CRITICAL: Respond ONLY in ${langName}.
Rules:
- Scenes SHORT: max 2 sentences
- Choices SHORT: max 8 words each
- Consequences SHORT: max 2 sentences
- Valid JSON without markdown
- Scene MUST continue the previous story thread
- Environment is SHARED: what one player does affects everyone
- Be SARCASTIC — target someone specifically without reason
- ABOUT PLAYERS: the current player is ALWAYS explicit in context. NEVER ask what another player wants to do.

${RULES_EXAMPLES[lang] || RULES_EXAMPLES.pt}`;
}

// ─── HELPER ──────────────────────────────────────────────────────────────────

async function callBedrock(endpoint, systemPrompt, userPrompt) {
  const command = new ConverseCommand({
    modelId: MODEL_ID,
    system: [{ text: systemPrompt }],
    messages: [{ role: 'user', content: [{ text: userPrompt }] }],
    inferenceConfig: { maxTokens: 500, temperature: 0.88 },
  });
  try {
    const response = await client.send(command);
    trackUsage(endpoint, response.usage);
    const text = response.output.message.content[0].text;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in response: ' + text.slice(0, 200));
    return JSON.parse(match[0]);
  } catch (e) {
    console.error(`[Bedrock] ERRO ${endpoint}: ${e.name} — ${e.message}`);
    if (e.$metadata) console.error(`  HTTP: ${e.$metadata.httpStatusCode}`);
    throw e;
  }
}

// ─── COST ENDPOINTS ──────────────────────────────────────────────────────────

app.get('/api/costs', (req, res) => {
  res.json({
    model: MODEL_ID,
    callCount: costTracker.callCount,
    totalInputTokens: costTracker.totalInputTokens,
    totalOutputTokens: costTracker.totalOutputTokens,
    totalCostUSD: parseFloat(costTracker.totalCostUSD.toFixed(6)),
    totalCostBRL: parseFloat((costTracker.totalCostUSD * 5.7).toFixed(4)),
    recentCalls: costTracker.sessionCosts.slice(-20),
  });
});

app.delete('/api/costs', (req, res) => {
  costTracker = { totalInputTokens: 0, totalOutputTokens: 0, totalCostUSD: 0, callCount: 0, sessionCosts: [] };
  res.json({ ok: true });
});

app.get('/costs', (req, res) => {
  const usd = costTracker.totalCostUSD.toFixed(6);
  const brl = (costTracker.totalCostUSD * 5.7).toFixed(4);
  const rows = costTracker.sessionCosts.slice().reverse().map(c => `
    <tr>
      <td>${new Date(c.timestamp).toLocaleTimeString('pt-BR')}</td>
      <td>${c.endpoint}</td>
      <td>${c.inputTokens}</td>
      <td>${c.outputTokens}</td>
      <td>$${c.costUSD.toFixed(5)}</td>
    </tr>`).join('');
  res.send(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bebedeira Narrada — Custos</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#0D0D1A;color:#fff;padding:24px}h1{color:#9B59B6;margin-bottom:8px}.model{color:#6C6C8A;font-size:12px;margin-bottom:24px}.cards{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px}.card{background:#1A1A2E;border:1px solid #2A2A4A;border-radius:12px;padding:16px;min-width:140px}.val{font-size:24px;font-weight:900}.val.g{color:#27AE60}.val.p{color:#9B59B6}.lbl{font-size:11px;color:#6C6C8A;margin-top:4px}.btns{display:flex;gap:8px;margin-bottom:20px}button{padding:10px 18px;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700}.r{background:#7B2FBE;color:#fff}.d{background:#E74C3C;color:#fff}table{width:100%;border-collapse:collapse;background:#1A1A2E;border-radius:12px;overflow:hidden}th{background:#2A2A4A;padding:10px 14px;text-align:left;font-size:11px;color:#9B59B6;text-transform:uppercase;letter-spacing:1px}td{padding:9px 14px;font-size:12px;border-bottom:1px solid #2A2A4A;color:#B0B0C0}tr:last-child td{border-bottom:none}td:last-child{color:#F39C12;font-weight:700}</style></head>
<body><h1>💀 Bebedeira Narrada — Custos</h1><p class="model">Modelo: ${MODEL_ID}</p>
<div class="cards">
  <div class="card"><div class="val">${costTracker.callCount}</div><div class="lbl">chamadas</div></div>
  <div class="card"><div class="val">${costTracker.totalInputTokens.toLocaleString()}</div><div class="lbl">tokens input</div></div>
  <div class="card"><div class="val">${costTracker.totalOutputTokens.toLocaleString()}</div><div class="lbl">tokens output</div></div>
  <div class="card"><div class="val">$${usd}</div><div class="lbl">total USD</div></div>
  <div class="card"><div class="val g">R$${brl}</div><div class="lbl">total BRL</div></div>
  ${costTracker.callCount > 0 ? `<div class="card"><div class="val p">R$${((costTracker.totalCostUSD * 5.7 / costTracker.callCount) * 18).toFixed(4)}</div><div class="lbl">estimativa/partida</div></div>` : ''}
</div>
<div class="btns"><button class="r" onclick="location.reload()">↻ Atualizar</button><button class="d" onclick="if(confirm('Zerar?'))fetch('/api/costs',{method:'DELETE'}).then(()=>location.reload())">🗑 Zerar</button></div>
<table><thead><tr><th>Hora</th><th>Endpoint</th><th>Input</th><th>Output</th><th>Custo USD</th></tr></thead>
<tbody>${rows || '<tr><td colspan="5" style="text-align:center;color:#6C6C8A;padding:20px">Nenhuma chamada ainda</td></tr>'}</tbody></table>
</body></html>`);
});

// ─── STORY: DESCRIÇÃO DO LUGAR ────────────────────────────────────────────────

app.post('/api/story/describe', async (req, res) => {
  const { location, players, intensity, lang = 'pt' } = req.body;
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const prompt = `The group (${players.join(', ')}) is at: "${location}". Intensity: ${intensity}.
Create a SHORT atmospheric description of the place (max 3 sentences). Establish the mood, sensory details, and something slightly suspicious or funny.
Respond ONLY in ${langName}.
Return JSON: {"description":"place description","atmosphere":"one word for the mood"}`;

  try { res.json(await callBedrock('story/describe', getSystemStory(lang), prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── STORY: CENA ─────────────────────────────────────────────────────────────

app.post('/api/story/scene', async (req, res) => {
  const { players, currentPlayer, round, totalRounds, location, locationDescription,
          intensity, activeRules, history, sharedContext, isGroupEvent, allPlayers, lang = 'pt' } = req.body;

  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const recentContext = (history || []).slice(-2)
    .map(h => `${h.playerName}: "${h.choiceMade}" → ${h.resultText}`)
    .join(' | ') || 'start of story';

  let prompt;
  if (isGroupEvent && allPlayers && allPlayers.length >= 2) {
    const others = allPlayers.filter(p => p !== currentPlayer).join(', ');
    prompt = `Story mode. Location: "${location}". Description: ${locationDescription || location}
GROUP EVENT — All players involved: ${allPlayers.join(', ')}
Round: ${round}/${totalRounds} | Intensity: ${intensity} | Active rules: ${activeRules || 'none'}
Recent history: ${recentContext} | Environment: ${sharedContext || 'normal'}

WHO DECIDES: ${currentPlayer} (others — ${others} — also suffer consequences)
Create a scene where ALL are affected. The 4 choices are actions by ${currentPlayer} for the group.
Respond ONLY in ${langName}.

Return JSON:
{"scene_text":"short scene involving everyone (max 2 sentences)","choices":["option 1","option 2","option 3","option 4"],"is_group_event":true,"involved_players":${JSON.stringify(allPlayers)}}`;
  } else {
    prompt = `Story mode. Location: "${location}". Description: ${locationDescription || location}
Players present: ${players.join(', ')}
CURRENT PLAYER: ${currentPlayer} — ONLY THEY act in this scene
Round: ${round}/${totalRounds} | Intensity: ${intensity} | Active rules: ${activeRules || 'none'}
Recent history: ${recentContext} | Environment: ${sharedContext || 'normal'}

Create a scene for ${currentPlayer} to act. The 4 choices are ${currentPlayer}'s actions.
DO NOT ask what other players want to do.
Respond ONLY in ${langName}.

Return JSON:
{"scene_text":"short scene (max 2 sentences)","choices":["option 1","option 2","option 3","option 4"],"is_group_event":false,"involved_players":["${currentPlayer}"]}`;
  }

  try { res.json(await callBedrock('story/scene', getSystemStory(lang), prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── STORY: RESOLUÇÃO ────────────────────────────────────────────────────────

app.post('/api/story/resolve', async (req, res) => {
  const { players, currentPlayer, sceneText, choiceMade, intensity,
          activeRules, locationDescription, sharedContext, isGroupEvent, involvedPlayers, lang = 'pt' } = req.body;

  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const affectedDesc = isGroupEvent
    ? `GROUP EVENT — all players (${players.join(', ')}) are affected`
    : `Player who acted: ${currentPlayer}`;

  const prompt = `Story mode. Location: ${locationDescription}
${affectedDesc}
${currentPlayer} chose: "${choiceMade}"
Scene: ${sceneText}
Current environment: ${sharedContext || 'normal'}
All players: ${players.join(', ')} | Intensity: ${intensity}

Create a SHORT consequence (max 2 sentences) that makes sense with the choice.
${isGroupEvent ? 'As a group event, consequences can affect multiple players.' : ''}
Be SARCASTIC. Vary: drink, make someone drink, everyone drinks, create rule, nobody drinks.
Max 3 sips/player, max 3 affected, max 1 rule.
Respond ONLY in ${langName}.

Return JSON:
{
  "result_text": "short consequence",
  "new_shared_context": "short sentence: what changed in the environment for everyone",
  "drinks": [{"player_name": "exact name or ALL or CURRENT", "sips": 1}],
  "new_rules": [{"rule_text": "simple rule for real players sitting at a table", "duration_rounds": 2, "target": "all"}]
}`;

  try { res.json(await callBedrock('story/resolve', getSystemStory(lang), prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── STORY: FINALE ───────────────────────────────────────────────────────────

app.post('/api/story/finale', async (req, res) => {
  const { players, location, mostPunished, lang = 'pt' } = req.body;
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const summary = players.map(p => `${p.name}: ${p.sips} sips`).join(', ');
  const prompt = `End the story that took place at "${location}".
Players: ${summary} | Most punished: ${mostPunished}
Respond ONLY in ${langName}.
Return JSON: {"finale_text":"epic and sarcastic conclusion (max 3 sentences)"}`;

  try { res.json(await callBedrock('story/finale', getSystemStory(lang), prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── CLASSIC MODE ────────────────────────────────────────────────────────────

app.post('/api/scene', async (req, res) => {
  const { players, currentPlayer, round, totalRounds, intensity, activeRules, recentHistory, lang = 'pt' } = req.body;
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const prompt = `Party game. Players: ${players.join(', ')} | Current: ${currentPlayer} | Round: ${round}/${totalRounds}
Intensity: ${intensity} | Rules: ${activeRules || 'none'} | History: ${recentHistory || 'start'}
Respond ONLY in ${langName}.
Return JSON: {"scene_text":"short scene (max 2 sentences)","choices":["option 1","option 2","option 3","option 4"]}`;

  try { res.json(await callBedrock('classic/scene', getSystemClassic(lang), prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

app.post('/api/resolve', async (req, res) => {
  const { players, currentPlayer, intensity, sceneText, choiceMade, activeRules, lang = 'pt' } = req.body;
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const prompt = `Resolve. Scene: ${sceneText} | ${currentPlayer} chose: "${choiceMade}"
Players: ${players.join(', ')} | Intensity: ${intensity} | Rules: ${activeRules || 'none'}
Be SARCASTIC. Max 3 sips/player, max 3 affected, max 1 rule.
Respond ONLY in ${langName}.
Return JSON: {"result_text":"short consequence","drinks":[{"player_name":"name or ALL","sips":1}],"new_rules":[{"rule_text":"rule for real players at a table","duration_rounds":2,"target":"all"}]}`;

  try { res.json(await callBedrock('classic/resolve', getSystemClassic(lang), prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

app.post('/api/finale', async (req, res) => {
  const { players, mostPunished, lang = 'pt' } = req.body;
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const summary = players.map(p => `${p.name}: ${p.sips} sips`).join(', ');
  const prompt = `End the game. Players: ${summary} | Most punished: ${mostPunished}
Respond ONLY in ${langName}.
Return JSON: {"finale_text":"sarcastic conclusion (max 3 sentences)"}`;

  try { res.json(await callBedrock('classic/finale', getSystemClassic(lang), prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── START ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n💀 Bebedeira Narrada backend — porta ${PORT}`);
  console.log(`   Modelo: ${MODEL_ID}`);
  console.log(`   Dashboard: http://localhost:${PORT}/costs\n`);
});
