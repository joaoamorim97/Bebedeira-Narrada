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
// Claude 3 Haiku: $0.25/1M input, $1.25/1M output
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

// ─── PROMPTS ─────────────────────────────────────────────────────────────────

const SYSTEM_CLASSIC = `Você é a narradora sarcástica de um drinking party game chamado História Maldita.
Estilo: caótico, sobrenatural, sarcástico, engraçado, festa entre amigos.
Regras:  português BR, respostas CURTAS, JSON válido sem markdown, sem violência gráfica.
Seja SARCÁSTICA — às vezes ferre com um jogador específico de propósito.

REGRAS PARA PUNIÇÕES — só crie regras FISICAMENTE POSSÍVEIS numa roda de amigos sentados:
BOAS: "ninguém pode dizer o nome de alguém", "quem beber faz uma careta", "todo mundo bate na mesa antes de beber", "ninguém pode apontar", "quem falar palavrão bebe"
RUINS (NUNCA): "quem der uma cambalhota", "quem pular", "quem correr", "quem fizer flexão"`;

const SYSTEM_STORY = `Você é a narradora de um drinking party game chamado História Maldita, modo HISTÓRIA.
O grupo está num lugar específico vivendo uma aventura coletiva. Narre como um mestre de RPG bêbado e sarcástico.
Regras absolutas:
- Português BR sempre
- Cenas CURTAS: máx 2 frases
- Escolhas CURTAS: máx 8 palavras cada
- Consequências CURTAS: máx 2 frases
- JSON válido sem markdown
- A cena DEVE continuar o fio da história anterior
- O ambiente é COMPARTILHADO: o que um jogador faz afeta o cenário para todos
- Seja SARCÁSTICA — ferre com alguém específico sem motivo aparente

REGRAS PARA PUNIÇÕES — só crie regras FISICAMENTE POSSÍVEIS numa roda de amigos sentados:
BOAS: "ninguém pode dizer o nome de alguém", "quem beber faz uma careta", "todo mundo bate na mesa antes de beber", "ninguém pode apontar", "quem falar palavrão bebe"
RUINS (NUNCA): "quem der uma cambalhota", "quem pular", "quem correr", "quem fizer flexão"

SOBRE JOGADORES — CRÍTICO:
- O jogador da vez está SEMPRE explícito no contexto
- NUNCA pergunte o que outro jogador quer fazer
- As escolhas são SEMPRE ações do jogador da vez
- Não confunda os nomes dos jogadores`;

// ─── HELPER ──────────────────────────────────────────────────────────────────

async function callBedrock(endpoint, systemPrompt, userPrompt) {
  const command = new ConverseCommand({
    modelId: MODEL_ID,
    system: [{ text: systemPrompt }],
    messages: [{ role: 'user', content: [{ text: userPrompt }] }],
    inferenceConfig: { maxTokens: 450, temperature: 0.88 },
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

  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>História Maldita — Custos</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#0D0D1A;color:#fff;padding:24px}
    h1{color:#9B59B6;margin-bottom:8px}
    .model{color:#6C6C8A;font-size:12px;margin-bottom:24px}
    .cards{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px}
    .card{background:#1A1A2E;border:1px solid #2A2A4A;border-radius:12px;padding:16px;min-width:140px}
    .val{font-size:24px;font-weight:900}.val.g{color:#27AE60}.val.p{color:#9B59B6}
    .lbl{font-size:11px;color:#6C6C8A;margin-top:4px}
    .btns{display:flex;gap:8px;margin-bottom:20px}
    button{padding:10px 18px;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700}
    .r{background:#7B2FBE;color:#fff}.d{background:#E74C3C;color:#fff}
    table{width:100%;border-collapse:collapse;background:#1A1A2E;border-radius:12px;overflow:hidden}
    th{background:#2A2A4A;padding:10px 14px;text-align:left;font-size:11px;color:#9B59B6;text-transform:uppercase;letter-spacing:1px}
    td{padding:9px 14px;font-size:12px;border-bottom:1px solid #2A2A4A;color:#B0B0C0}
    tr:last-child td{border-bottom:none}
    td:last-child{color:#F39C12;font-weight:700}
  </style>
</head>
<body>
  <h1>💀 História Maldita — Custos</h1>
  <p class="model">Modelo: ${MODEL_ID}</p>
  <div class="cards">
    <div class="card"><div class="val">${costTracker.callCount}</div><div class="lbl">chamadas</div></div>
    <div class="card"><div class="val">${costTracker.totalInputTokens.toLocaleString()}</div><div class="lbl">tokens input</div></div>
    <div class="card"><div class="val">${costTracker.totalOutputTokens.toLocaleString()}</div><div class="lbl">tokens output</div></div>
    <div class="card"><div class="val">$${usd}</div><div class="lbl">total USD</div></div>
    <div class="card"><div class="val g">R$${brl}</div><div class="lbl">total BRL</div></div>
    ${costTracker.callCount > 0 ? `<div class="card"><div class="val p">R$${((costTracker.totalCostUSD * 5.7 / costTracker.callCount) * 18).toFixed(4)}</div><div class="lbl">estimativa/partida</div></div>` : ''}
  </div>
  <div class="btns">
    <button class="r" onclick="location.reload()">↻ Atualizar</button>
    <button class="d" onclick="if(confirm('Zerar contador?'))fetch('/api/costs',{method:'DELETE'}).then(()=>location.reload())">🗑 Zerar</button>
  </div>
  <table>
    <thead><tr><th>Hora</th><th>Endpoint</th><th>Input</th><th>Output</th><th>Custo USD</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5" style="text-align:center;color:#6C6C8A;padding:20px">Nenhuma chamada ainda</td></tr>'}</tbody>
  </table>
</body></html>`);
});

// ─── STORY: DESCRIÇÃO DO LUGAR ────────────────────────────────────────────────

app.post('/api/story/describe', async (req, res) => {
  const { location, players, intensity } = req.body;
  const prompt = `O grupo (${players.join(', ')}) está em: "${location}". Intensidade: ${intensity}.
Crie uma descrição CURTA e atmosférica do lugar (máx 3 frases). Estabeleça o clima, detalhes sensoriais e algo levemente suspeito ou engraçado.
Retorne JSON: {"description":"descrição do lugar","atmosphere":"palavra que define o clima"}`;

  try { res.json(await callBedrock('story/describe', SYSTEM_STORY, prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── STORY: CENA ─────────────────────────────────────────────────────────────

app.post('/api/story/scene', async (req, res) => {
  const { players, currentPlayer, round, totalRounds, location, locationDescription,
          intensity, activeRules, history, sharedContext, isGroupEvent, allPlayers } = req.body;

  const recentContext = (history || []).slice(-2)
    .map(h => `${h.playerName} fez "${h.choiceMade}" → ${h.resultText}`)
    .join(' | ') || 'início da história';

  let prompt;
  if (isGroupEvent && allPlayers && allPlayers.length >= 2) {
    const others = allPlayers.filter(p => p !== currentPlayer).join(', ');
    prompt = `Modo história. Local: "${location}". Descrição: ${locationDescription || location}
EVENTO COLETIVO — Todos os jogadores estão envolvidos: ${allPlayers.join(', ')}
Rodada: ${round}/${totalRounds} | Intensidade: ${intensity} | Regras: ${activeRules || 'nenhuma'}
Histórico: ${recentContext} | Ambiente: ${sharedContext || 'normal'}

QUEM DECIDE: ${currentPlayer} (os outros — ${others} — sofrem as consequências também)
Crie uma cena onde TODOS são afetados. As 4 escolhas são ações de ${currentPlayer} pelo grupo.

Retorne JSON:
{"scene_text":"cena curta envolvendo todos (máx 2 frases)","choices":["opção 1","opção 2","opção 3","opção 4"],"is_group_event":true,"involved_players":${JSON.stringify(allPlayers)}}`;
  } else {
    prompt = `Modo história. Local: "${location}". Descrição: ${locationDescription || location}
Jogadores no local: ${players.join(', ')}
JOGADOR DA VEZ: ${currentPlayer} — SOMENTE ELE age nessa cena
Rodada: ${round}/${totalRounds} | Intensidade: ${intensity} | Regras: ${activeRules || 'nenhuma'}
Histórico: ${recentContext} | Ambiente: ${sharedContext || 'normal'}

Crie uma cena para ${currentPlayer} agir. As 4 escolhas são ações de ${currentPlayer}.
NÃO pergunte o que outros jogadores querem fazer.

Retorne JSON:
{"scene_text":"cena curta (máx 2 frases)","choices":["opção 1","opção 2","opção 3","opção 4"],"is_group_event":false,"involved_players":["${currentPlayer}"]}`;
  }

  try { res.json(await callBedrock('story/scene', SYSTEM_STORY, prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── STORY: RESOLUÇÃO ────────────────────────────────────────────────────────

app.post('/api/story/resolve', async (req, res) => {
  const { players, currentPlayer, sceneText, choiceMade, intensity,
          activeRules, locationDescription, sharedContext, isGroupEvent, involvedPlayers } = req.body;

  const affectedDesc = isGroupEvent
    ? `EVENTO COLETIVO — todos os jogadores (${players.join(', ')}) são afetados`
    : `Jogador que agiu: ${currentPlayer}`;

  const prompt = `Modo história. Local: ${locationDescription}
${affectedDesc}
${currentPlayer} escolheu: "${choiceMade}"
Cena: ${sceneText}
Ambiente atual: ${sharedContext || 'normal'}
Todos os jogadores: ${players.join(', ')} | Intensidade: ${intensity}

Crie uma consequência CURTA (máx 2 frases) que faça sentido com a escolha.
${isGroupEvent ? 'Como é evento coletivo, as consequências podem afetar múltiplos jogadores.' : ''}
Seja SARCÁSTICA. Varie: beber, mandar alguém beber, todos bebem, criar regra, ninguém bebe.
Máx 3 goles/jogador, máx 3 afetados, máx 1 regra.

Retorne JSON:
{
  "result_text": "consequência curta",
  "new_shared_context": "frase curta: o que mudou no ambiente para todos",
  "drinks": [{"player_name": "nome exato ou ALL ou CURRENT", "sips": 1}],
  "new_rules": [{"rule_text": "regra simples e possível numa roda de amigos", "duration_rounds": 2, "target": "all"}]
}`;

  try { res.json(await callBedrock('story/resolve', SYSTEM_STORY, prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── STORY: FINALE ───────────────────────────────────────────────────────────

app.post('/api/story/finale', async (req, res) => {
  const { players, location, mostPunished } = req.body;
  const summary = players.map(p => `${p.name}: ${p.sips} goles`).join(', ');
  const prompt = `Encerre a história em "${location}". Jogadores: ${summary} | Mais punido: ${mostPunished}
Retorne JSON: {"finale_text":"conclusão épica e sarcástica (máx 3 frases)"}`;

  try { res.json(await callBedrock('story/finale', SYSTEM_STORY, prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── CLASSIC MODE ────────────────────────────────────────────────────────────

app.post('/api/scene', async (req, res) => {
  const { players, currentPlayer, round, totalRounds, intensity, activeRules, recentHistory } = req.body;
  const prompt = `Party game. Jogadores: ${players.join(', ')} | Vez de: ${currentPlayer} | Rodada: ${round}/${totalRounds}
Intensidade: ${intensity} | Regras: ${activeRules || 'nenhuma'} | Histórico: ${recentHistory || 'início'}
Retorne JSON: {"scene_text":"cena curta (máx 2 frases)","choices":["opção 1","opção 2","opção 3","opção 4"]}`;

  try { res.json(await callBedrock('classic/scene', SYSTEM_CLASSIC, prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

app.post('/api/resolve', async (req, res) => {
  const { players, currentPlayer, intensity, sceneText, choiceMade, activeRules } = req.body;
  const prompt = `Resolva. Cena: ${sceneText} | ${currentPlayer} escolheu: "${choiceMade}"
Jogadores: ${players.join(', ')} | Intensidade: ${intensity} | Regras: ${activeRules || 'nenhuma'}
Seja SARCÁSTICO. Máx 3 goles/jogador, máx 3 afetados, máx 1 regra.
Retorne JSON: {"result_text":"consequência curta","drinks":[{"player_name":"nome ou ALL","sips":1}],"new_rules":[{"rule_text":"regra possível numa roda de amigos","duration_rounds":2,"target":"all"}]}`;

  try { res.json(await callBedrock('classic/resolve', SYSTEM_CLASSIC, prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

app.post('/api/finale', async (req, res) => {
  const { players, mostPunished } = req.body;
  const summary = players.map(p => `${p.name}: ${p.sips} goles`).join(', ');
  const prompt = `Encerre a partida. Jogadores: ${summary} | Mais punido: ${mostPunished}
Retorne JSON: {"finale_text":"conclusão sarcástica (máx 3 frases)"}`;

  try { res.json(await callBedrock('classic/finale', SYSTEM_CLASSIC, prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── START ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n💀 Historia Maldita backend — porta ${PORT}`);
  console.log(`   Modelo: ${MODEL_ID}`);
  console.log(`   Dashboard: http://localhost:${PORT}/costs\n`);
});

