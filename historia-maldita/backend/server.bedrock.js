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

// ─── APPROVED RULES — all rules last until end of game (duration_rounds: 99) ─

const APPROVED_RULES = {
  pt: [
    "Ninguém pode dizer o nome de {player}",
    "Quem beber tem que fazer uma careta",
    "Todo mundo bate na mesa antes de beber",
    "Ninguém pode apontar o dedo",
    "Quem falar palavrão bebe 1 gole",
    "Ninguém pode cruzar os braços",
    "Ninguém pode usar o celular",
    "Quem falar o nome de {player} bebe 1 gole",
    "Todo mundo tem que beber com a mão esquerda",
    "Ninguém pode falar diretamente com {player}",
    "Quem sorrir bebe 1 gole",
    "Todo mundo tem que bater palma antes de falar",
    "Ninguém pode colocar o copo na mesa",
    "Ninguém pode dizer 'não'",
    "Quem fizer contato visual com {player} bebe 1 gole",
    "Ninguém pode falar 'eu'",
    "Quem rir de uma regra bebe 1 gole",
    "Todo mundo tem que chamar {player} de 'chefia'",
    "Ninguém pode encostar no próprio cabelo",
    "Quem perguntar 'por quê?' bebe 1 gole",
    "Todo mundo precisa terminar a frase com 'meu consagrado'",
    "Ninguém pode falar o número 3",
    "Quem olhar para o celular bebe 1 gole",
    "Todo mundo tem que brindar antes de beber",
    "Quem falar o nome do jogo bebe 1 gole",
    "Ninguém pode falar com as mãos",
    "Todo mundo tem que responder {player} com 'sim, majestade'",
    "Ninguém pode dizer 'bebe'",
    "Quem esquecer uma regra ativa bebe 2 goles",
    "Todo mundo precisa falar sussurrando",
    "Ninguém pode chamar ninguém pelo nome",
    "Quem falar uma gíria bebe 1 gole",
    "Todo mundo tem que fazer joinha antes de falar",
    "Ninguém pode usar a palavra 'mano'",
    "Quem ficar mais de 5 segundos em silêncio quando for sua vez bebe 1 gole",
    "Todo mundo tem que beber olhando para {player}",
    "Ninguém pode falar a palavra 'jogo'",
    "Quem tocar no próprio rosto bebe 1 gole",
    "Todo mundo tem que falar como narrador de futebol",
    "Ninguém pode usar a palavra 'copo'",
    "Quem fizer uma pergunta bebe 1 gole",
    "Todo mundo tem que chamar a bebida de 'poção'",
    "Quem falar 'calma' bebe 1 gole",
    "Todo mundo tem que levantar o copo antes de responder qualquer coisa",
    "Ninguém pode encostar na mesa",
    "Quem falar o nome de uma rede social bebe 1 gole",
    "Todo mundo tem que falar com sotaque inventado",
    "Ninguém pode dizer 'verdade'",
    "Quem responder só com uma palavra bebe 1 gole",
    "Todo mundo tem que elogiar {player} antes de falar com ele",
    "Ninguém pode falar 'cara'",
    "Quem reclamar de uma regra bebe 2 goles",
    "Todo mundo precisa fazer uma pose antes de beber",
    "Ninguém pode olhar diretamente para {player}",
    "Quem falar o nome de uma bebida bebe 1 gole",
    "Todo mundo tem que começar a frase com 'com todo respeito'",
    "Ninguém pode falar no plural",
    "Quem beber sem brindar bebe mais 1 gole",
    "Todo mundo tem que chamar {player} de 'capitão'",
    "Ninguém pode dizer 'sim'",
    "Quem falar inglês sem precisar bebe 1 gole",
    "Todo mundo tem que apontar para cima antes de beber",
    "Ninguém pode falar a palavra 'rodada'",
    "Quem cantarolar alguma música bebe 1 gole",
    "Todo mundo tem que responder qualquer pergunta com outra pergunta",
    "Ninguém pode usar diminutivos",
    "Quem falar 'tipo' bebe 1 gole",
    "Todo mundo tem que fazer cara séria antes de beber",
    "Ninguém pode falar olhando para a pessoa",
    "Quem encostar no copo de outra pessoa bebe 1 gole",
    "Todo mundo tem que chamar o grupo de 'família'",
    "Ninguém pode dizer qualquer cor",
    "Quem fizer piada ruim e ninguém rir bebe 2 goles",
    "Todo mundo tem que falar como se estivesse em uma entrevista de emprego",
    "Ninguém pode falar a palavra 'tempo'",
    "Todo mundo tem que bater no peito antes de beber",
    "Quem tentar explicar demais uma regra bebe 1 gole",
    "Todo mundo tem que usar uma palavra chique em toda frase",
    "Ninguém pode falar 'nossa'",
    "Quem beber com a mão dominante bebe mais 1 gole",
    "Todo mundo tem que chamar {player} de 'lenda'",
    "Ninguém pode falar qualquer número",
    "Quem fizer silêncio constrangedor bebe 1 gole",
    "Todo mundo tem que falar como robô",
    "Ninguém pode usar a palavra 'bebida'",
    "Quem olhar para a porta bebe 1 gole",
    "Todo mundo tem que comemorar discretamente antes de beber",
    "Ninguém pode falar 'beleza'",
    "Quem esquecer de seguir uma regra acumulada bebe 2 goles",
    "Todo mundo tem que falar como vilão de novela",
    "Ninguém pode usar nomes próprios",
    "Quem fizer pergunta para {player} bebe 1 gole",
    "Todo mundo tem que fazer um brinde dramático antes de beber",
    "Ninguém pode dizer 'já'",
    "Quem falar sobre trabalho bebe 1 gole",
    "Todo mundo tem que chamar qualquer bebida de 'elixir'",
    "Ninguém pode falar a palavra 'mesa'",
    "Quem tocar no ombro de alguém bebe 1 gole",
    "Todo mundo tem que terminar frases com 'entendeu?'",
    "Ninguém pode falar com {player} sem fazer reverência",
    "Quem disser 'eu acho' bebe 1 gole",
    "Todo mundo tem que fazer um som de efeito antes de beber",
    "Ninguém pode falar 'agora'",
    "Quem mencionar ex bebe 2 goles",
    "Todo mundo tem que responder com voz de apresentador",
    "Ninguém pode falar a palavra 'amigo'",
  ],
  es: [
    "Nadie puede decir el nombre de {player}",
    "Quien beba tiene que hacer una mueca",
    "Todos golpean la mesa antes de beber",
    "Nadie puede señalar con el dedo",
    "Quien diga una mala palabra bebe 1 trago",
    "Nadie puede cruzar los brazos",
    "Nadie puede usar el celular",
    "Quien diga el nombre de {player} bebe 1 trago",
    "Todos deben beber con la mano izquierda",
    "Nadie puede hablar directamente con {player}",
    "Quien sonría bebe 1 trago",
    "Todos deben aplaudir antes de hablar",
    "Nadie puede poner el vaso en la mesa",
    "Nadie puede decir 'no'",
    "Quien haga contacto visual con {player} bebe 1 trago",
    "Nadie puede decir 'yo'",
    "Quien se ría de una regla bebe 1 trago",
    "Todos deben llamar a {player} 'jefe'",
    "Nadie puede tocarse el cabello",
    "Quien pregunte '¿por qué?' bebe 1 trago",
    "Todos deben terminar la frase con 'mi estimado'",
    "Nadie puede decir el número 3",
    "Quien mire el celular bebe 1 trago",
    "Todos deben brindar antes de beber",
    "Quien diga el nombre del juego bebe 1 trago",
    "Nadie puede hablar con las manos",
    "Todos deben responder a {player} con 'sí, majestad'",
    "Nadie puede decir 'bebe'",
    "Quien olvide una regla activa bebe 2 tragos",
    "Todos deben hablar en susurros",
    "Nadie puede llamar a nadie por su nombre",
    "Quien use jerga bebe 1 trago",
    "Todos deben hacer pulgar arriba antes de hablar",
    "Nadie puede usar la palabra 'bro'",
    "Quien tarde más de 5 segundos en responder bebe 1 trago",
    "Todos deben beber mirando a {player}",
    "Nadie puede decir la palabra 'juego'",
    "Quien se toque la cara bebe 1 trago",
    "Todos deben hablar como narrador deportivo",
    "Nadie puede usar la palabra 'vaso'",
    "Quien haga una pregunta bebe 1 trago",
    "Todos deben llamar a la bebida 'poción'",
    "Quien diga 'tranquilo' bebe 1 trago",
    "Todos deben levantar el vaso antes de responder",
    "Nadie puede apoyarse en la mesa",
    "Quien mencione una red social bebe 1 trago",
    "Todos deben hablar con acento inventado",
    "Nadie puede decir 'verdad'",
    "Quien responda con una sola palabra bebe 1 trago",
    "Todos deben elogiar a {player} antes de hablarle",
    "Nadie puede decir 'amigo'",
    "Quien se queje de una regla bebe 2 tragos",
    "Todos deben hacer una pose antes de beber",
    "Nadie puede mirar directamente a {player}",
    "Quien mencione el nombre de una bebida bebe 1 trago",
    "Todos deben empezar con 'con todo respeto'",
    "Nadie puede hablar en plural",
    "Quien beba sin brindar bebe 1 trago más",
    "Todos deben llamar a {player} 'capitán'",
    "Nadie puede decir 'sí'",
    "Quien hable inglés sin necesidad bebe 1 trago",
    "Todos deben señalar arriba antes de beber",
    "Nadie puede decir la palabra 'ronda'",
    "Quien tararee una canción bebe 1 trago",
    "Todos deben responder preguntas con otra pregunta",
    "Nadie puede usar diminutivos",
    "Quien diga 'tipo' bebe 1 trago",
    "Todos deben poner cara seria antes de beber",
    "Nadie puede mirar a la persona al hablar",
    "Quien toque el vaso de otro bebe 1 trago",
    "Todos deben llamar al grupo 'familia'",
    "Nadie puede decir ningún color",
    "Quien haga un chiste malo y nadie ría bebe 2 tragos",
    "Todos deben hablar como en una entrevista de trabajo",
    "Nadie puede decir la palabra 'tiempo'",
    "Todos deben golpearse el pecho antes de beber",
    "Quien intente explicar demasiado una regla bebe 1 trago",
    "Todos deben usar una palabra elegante en cada frase",
    "Nadie puede decir 'claro'",
    "Quien beba con la mano dominante bebe 1 trago más",
    "Todos deben llamar a {player} 'leyenda'",
    "Nadie puede decir ningún número",
    "Quien genere silencio incómodo bebe 1 trago",
    "Todos deben hablar como robot",
    "Nadie puede usar la palabra 'bebida'",
    "Quien mire hacia la puerta bebe 1 trago",
    "Todos deben celebrar discretamente antes de beber",
    "Nadie puede decir 'bueno'",
    "Todos deben hablar como villano de telenovela",
    "Nadie puede usar nombres propios",
    "Quien le haga una pregunta a {player} bebe 1 trago",
    "Todos deben hacer un brindis dramático antes de beber",
    "Nadie puede decir 'ya'",
    "Quien hable de trabajo bebe 1 trago",
    "Todos deben llamar a cualquier bebida 'elixir'",
    "Nadie puede decir la palabra 'mesa'",
    "Quien toque el hombro de alguien bebe 1 trago",
    "Todos deben terminar frases con '¿entendido?'",
    "Nadie puede hablarle a {player} sin hacer una reverencia",
    "Quien diga 'yo creo' bebe 1 trago",
    "Todos deben hacer un sonido de efecto antes de beber",
    "Nadie puede decir 'ahora'",
    "Quien mencione a un ex bebe 2 tragos",
    "Todos deben responder con voz de presentador",
    "Nadie puede decir la palabra 'amigo'",
  ],
  en: [
    "Nobody can say {player}'s name",
    "Whoever drinks must make a funny face",
    "Everyone knocks on the table before drinking",
    "Nobody can point their finger",
    "Whoever swears drinks 1 sip",
    "Nobody can cross their arms",
    "Nobody can use their phone",
    "Whoever says {player}'s name drinks 1 sip",
    "Everyone must drink with their left hand",
    "Nobody can speak directly to {player}",
    "Whoever smiles drinks 1 sip",
    "Everyone must clap before speaking",
    "Nobody can put their cup on the table",
    "Nobody can say 'no'",
    "Whoever makes eye contact with {player} drinks 1 sip",
    "Nobody can say 'I'",
    "Whoever laughs at a rule drinks 1 sip",
    "Everyone must call {player} 'boss'",
    "Nobody can touch their own hair",
    "Whoever asks 'why?' drinks 1 sip",
    "Everyone must end sentences with 'my friend'",
    "Nobody can say the number 3",
    "Whoever looks at their phone drinks 1 sip",
    "Everyone must toast before drinking",
    "Whoever says the game's name drinks 1 sip",
    "Nobody can talk with their hands",
    "Everyone must answer {player} with 'yes, your majesty'",
    "Nobody can say 'drink'",
    "Whoever forgets an active rule drinks 2 sips",
    "Everyone must whisper",
    "Nobody can call anyone by their name",
    "Whoever uses slang drinks 1 sip",
    "Everyone must give a thumbs up before speaking",
    "Nobody can say 'dude'",
    "Whoever takes more than 5 seconds to respond drinks 1 sip",
    "Everyone must drink while looking at {player}",
    "Nobody can say the word 'game'",
    "Whoever touches their face drinks 1 sip",
    "Everyone must talk like a sports commentator",
    "Nobody can say the word 'cup'",
    "Whoever asks a question drinks 1 sip",
    "Everyone must call the drink 'potion'",
    "Whoever says 'calm down' drinks 1 sip",
    "Everyone must raise their cup before answering anything",
    "Nobody can lean on the table",
    "Whoever mentions a social media platform drinks 1 sip",
    "Everyone must speak with a made-up accent",
    "Nobody can say 'true'",
    "Whoever answers with only one word drinks 1 sip",
    "Everyone must compliment {player} before speaking to them",
    "Nobody can say 'man'",
    "Whoever complains about a rule drinks 2 sips",
    "Everyone must strike a pose before drinking",
    "Nobody can look directly at {player}",
    "Whoever mentions the name of a drink drinks 1 sip",
    "Everyone must start sentences with 'with all due respect'",
    "Nobody can speak in plural",
    "Whoever drinks without toasting drinks 1 more sip",
    "Everyone must call {player} 'captain'",
    "Nobody can say 'yes'",
    "Whoever speaks unnecessarily in another language drinks 1 sip",
    "Everyone must point up before drinking",
    "Nobody can say the word 'round'",
    "Whoever hums a song drinks 1 sip",
    "Everyone must answer every question with another question",
    "Nobody can use diminutives",
    "Whoever says 'like' drinks 1 sip",
    "Everyone must keep a straight face before drinking",
    "Nobody can look at the person they're talking to",
    "Whoever touches someone else's cup drinks 1 sip",
    "Everyone must call the group 'family'",
    "Nobody can say any color",
    "Whoever tells a bad joke and nobody laughs drinks 2 sips",
    "Everyone must talk as if in a job interview",
    "Nobody can say the word 'time'",
    "Everyone must tap their chest before drinking",
    "Whoever over-explains a rule drinks 1 sip",
    "Everyone must use a fancy word in every sentence",
    "Nobody can say 'obviously'",
    "Whoever drinks with their dominant hand drinks 1 more sip",
    "Everyone must call {player} 'legend'",
    "Nobody can say any number",
    "Whoever creates an awkward silence drinks 1 sip",
    "Everyone must talk like a robot",
    "Nobody can say the word 'drink'",
    "Whoever looks at the door drinks 1 sip",
    "Everyone must celebrate quietly before drinking",
    "Nobody can say 'okay'",
    "Everyone must talk like a soap opera villain",
    "Nobody can use proper names",
    "Whoever asks {player} a question drinks 1 sip",
    "Everyone must make a dramatic toast before drinking",
    "Nobody can say 'now'",
    "Whoever mentions an ex drinks 2 sips",
    "Everyone must respond in an announcer voice",
    "Nobody can say the word 'friend'",
  ],
};

function getRulesPrompt(lang, players) {
  const rules = APPROVED_RULES[lang] || APPROVED_RULES.pt;
  const playerName = players && players.length > 0
    ? players[Math.floor(Math.random() * players.length)]
    : 'alguém';
  const filled = rules.map(r => r.replace(/\{player\}/g, playerName));
  // Sample 20 random rules to keep prompt short
  const sample = filled.sort(() => Math.random() - 0.5).slice(0, 20);
  return `RULES — CLOSED LIST. Pick ONE rule EXACTLY from this list (you may use any player name):
${sample.map((r, i) => `${i + 1}. "${r}"`).join('\n')}
FORBIDDEN: inventing rules outside this list. FORBIDDEN: rules based on the story or environment.
IMPORTANT: always set duration_rounds to 99 (rule lasts until end of game).`;
}

// ─── RULE VALIDATOR ──────────────────────────────────────────────────────────

const FORBIDDEN_KEYWORDS = [
  'broken glass','vidro quebrado','vidrio roto',
  'steps on','pisar','pisando',
  'loudest','mais alto','más fuerte',
  'hurls','arremessa','lança','throws',
  'shattering','quebrando','rompiendo',
  'runs','corre','correr','jumps','pula','salta',
  'cartwheel','cambalhota','voltereta',
  'push-up','flexão','flexion',
  'hears','ouve','escucha',
  'sees','vê','spots',
  'smells','cheira','huele',
];

function validateRule(ruleText, lang, players) {
  if (!ruleText) return null;
  const lower = ruleText.toLowerCase();
  const isForbidden = FORBIDDEN_KEYWORDS.some(k => lower.includes(k));
  if (isForbidden) {
    const safeRules = APPROVED_RULES[lang] || APPROVED_RULES.pt;
    const playerName = players && players.length > 0 ? players[0] : 'alguém';
    return safeRules[Math.floor(Math.random() * safeRules.length)].replace(/\{player\}/g, playerName);
  }
  return ruleText;
}

function sanitizeResult(data, lang, players) {
  if (!data || !Array.isArray(data.new_rules)) return data;
  data.new_rules = data.new_rules.map(r => {
    const validated = validateRule(r.rule_text || r.ruleText, lang, players);
    return { ...r, rule_text: validated, ruleText: validated, duration_rounds: 99 };
  }).filter(r => r.rule_text);
  return data;
}

// ─── SYSTEM PROMPTS ──────────────────────────────────────────────────────────

function getSystemClassic(lang, players) {
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  return `You are the sarcastic narrator of a drinking party game called Bebedeira Narrada.
Style: chaotic, supernatural, sarcastic, funny, friends at a party.
CRITICAL: Respond ONLY in ${langName}. Short responses. Valid JSON without markdown. No graphic violence.
Be SARCASTIC — sometimes target a specific player on purpose.

${getRulesPrompt(lang, players)}`;
}

function getSystemStory(lang, players) {
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  return `You are the narrator of a drinking party game called Bebedeira Narrada, STORY mode.
The group is in a specific place living a collective adventure. Narrate like a drunk sarcastic RPG master.
CRITICAL: Respond ONLY in ${langName}.
- Scenes SHORT: max 2 sentences. Choices SHORT: max 8 words. Consequences SHORT: max 2 sentences.
- Valid JSON without markdown. Scene MUST continue the previous story thread.
- Environment is SHARED. Be SARCASTIC. NEVER ask what another player wants to do.

${getRulesPrompt(lang, players)}`;
}

// ─── BEDROCK HELPER ──────────────────────────────────────────────────────────

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
    <tr><td>${new Date(c.timestamp).toLocaleTimeString('pt-BR')}</td><td>${c.endpoint}</td><td>${c.inputTokens}</td><td>${c.outputTokens}</td><td>$${c.costUSD.toFixed(5)}</td></tr>`).join('');
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
  const prompt = `The group (${(players||[]).join(', ')}) is at: "${location}". Intensity: ${intensity}.
Create a SHORT atmospheric description (max 3 sentences). Establish mood, sensory details, something slightly suspicious or funny.
Respond ONLY in ${langName}.
Return JSON: {"description":"place description","atmosphere":"one word for the mood"}`;
  try { res.json(await callBedrock('story/describe', getSystemStory(lang, players), prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── STORY: CENA ─────────────────────────────────────────────────────────────

app.post('/api/story/scene', async (req, res) => {
  const { players, currentPlayer, round, totalRounds, location, locationDescription,
          intensity, activeRules, history, sharedContext, isGroupEvent, allPlayers, lang = 'pt' } = req.body;
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const recentContext = (history || []).slice(-2)
    .map(h => `${h.playerName}: "${h.choiceMade}" → ${h.resultText}`).join(' | ') || 'start';

  let prompt;
  if (isGroupEvent && allPlayers && allPlayers.length >= 2) {
    const others = allPlayers.filter(p => p !== currentPlayer).join(', ');
    prompt = `Story mode. Location: "${location}". Description: ${locationDescription || location}
GROUP EVENT — All players: ${allPlayers.join(', ')} | Round: ${round}/${totalRounds} | Intensity: ${intensity}
Rules: ${activeRules || 'none'} | History: ${recentContext} | Environment: ${sharedContext || 'normal'}
WHO DECIDES: ${currentPlayer} (others — ${others} — also suffer consequences)
Create a scene where ALL are affected. 4 choices are actions by ${currentPlayer} for the group.
Respond ONLY in ${langName}.
Return JSON: {"scene_text":"short scene (max 2 sentences)","choices":["opt1","opt2","opt3","opt4"],"is_group_event":true,"involved_players":${JSON.stringify(allPlayers)}}`;
  } else {
    prompt = `Story mode. Location: "${location}". Description: ${locationDescription || location}
Players: ${(players||[]).join(', ')} | CURRENT PLAYER: ${currentPlayer} | Round: ${round}/${totalRounds}
Intensity: ${intensity} | Rules: ${activeRules || 'none'} | History: ${recentContext} | Environment: ${sharedContext || 'normal'}
Create a scene for ${currentPlayer} to act. 4 choices are ${currentPlayer}'s actions. DO NOT ask what others want to do.
Respond ONLY in ${langName}.
Return JSON: {"scene_text":"short scene (max 2 sentences)","choices":["opt1","opt2","opt3","opt4"],"is_group_event":false,"involved_players":["${currentPlayer}"]}`;
  }
  try { res.json(await callBedrock('story/scene', getSystemStory(lang, players || allPlayers || []), prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── STORY: RESOLUÇÃO ────────────────────────────────────────────────────────

app.post('/api/story/resolve', async (req, res) => {
  const { players, currentPlayer, sceneText, choiceMade, intensity,
          activeRules, locationDescription, sharedContext, isGroupEvent, lang = 'pt' } = req.body;
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const affectedDesc = isGroupEvent
    ? `GROUP EVENT — all players (${(players||[]).join(', ')}) are affected`
    : `Player who acted: ${currentPlayer}`;
  const prompt = `Story mode. Location: ${locationDescription}
${affectedDesc} | ${currentPlayer} chose: "${choiceMade}"
Scene: ${sceneText} | Environment: ${sharedContext || 'normal'}
All players: ${(players||[]).join(', ')} | Intensity: ${intensity}
Create SHORT consequence (max 2 sentences). Be SARCASTIC. Vary: drink, make someone drink, everyone drinks, create rule, nobody drinks.
Max 3 sips/player, max 3 affected, max 1 rule.
Respond ONLY in ${langName}.
Return JSON: {"result_text":"short consequence","new_shared_context":"what changed in environment","drinks":[{"player_name":"name or ALL or CURRENT","sips":1}],"new_rules":[{"rule_text":"rule from approved list","duration_rounds":99,"target":"all"}]}`;
  try {
    const data = await callBedrock('story/resolve', getSystemStory(lang, players || []), prompt);
    res.json(sanitizeResult(data, lang, players));
  } catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── STORY: FINALE ───────────────────────────────────────────────────────────

app.post('/api/story/finale', async (req, res) => {
  const { players, location, mostPunished, lang = 'pt' } = req.body;
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const summary = (players||[]).map(p => `${p.name}: ${p.sips} sips`).join(', ');
  const prompt = `End the story at "${location}". Players: ${summary} | Most punished: ${mostPunished}
Respond ONLY in ${langName}.
Return JSON: {"finale_text":"epic sarcastic conclusion (max 3 sentences)"}`;
  try { res.json(await callBedrock('story/finale', getSystemStory(lang, (players||[]).map(p=>p.name)), prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── CLASSIC MODE ────────────────────────────────────────────────────────────

app.post('/api/scene', async (req, res) => {
  const { players, currentPlayer, round, totalRounds, intensity, activeRules, recentHistory, lang = 'pt' } = req.body;
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const prompt = `Party game. Players: ${(players||[]).join(', ')} | Current: ${currentPlayer} | Round: ${round}/${totalRounds}
Intensity: ${intensity} | Rules: ${activeRules || 'none'} | History: ${recentHistory || 'start'}
Respond ONLY in ${langName}.
Return JSON: {"scene_text":"short scene (max 2 sentences)","choices":["opt1","opt2","opt3","opt4"]}`;
  try { res.json(await callBedrock('classic/scene', getSystemClassic(lang, players || []), prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

app.post('/api/resolve', async (req, res) => {
  const { players, currentPlayer, intensity, sceneText, choiceMade, activeRules, lang = 'pt' } = req.body;
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const prompt = `Resolve. Scene: ${sceneText} | ${currentPlayer} chose: "${choiceMade}"
Players: ${(players||[]).join(', ')} | Intensity: ${intensity} | Rules: ${activeRules || 'none'}
Be SARCASTIC. Max 3 sips/player, max 3 affected, max 1 rule.
Respond ONLY in ${langName}.
Return JSON: {"result_text":"short consequence","drinks":[{"player_name":"name or ALL","sips":1}],"new_rules":[{"rule_text":"rule from approved list","duration_rounds":99,"target":"all"}]}`;
  try {
    const data = await callBedrock('classic/resolve', getSystemClassic(lang, players || []), prompt);
    res.json(sanitizeResult(data, lang, players));
  } catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

app.post('/api/finale', async (req, res) => {
  const { players, mostPunished, lang = 'pt' } = req.body;
  const langName = LANG_NAMES[lang] || LANG_NAMES.pt;
  const summary = (players||[]).map(p => `${p.name}: ${p.sips} sips`).join(', ');
  const prompt = `End the game. Players: ${summary} | Most punished: ${mostPunished}
Respond ONLY in ${langName}.
Return JSON: {"finale_text":"sarcastic conclusion (max 3 sentences)"}`;
  try { res.json(await callBedrock('classic/finale', getSystemClassic(lang, (players||[]).map(p=>p.name)), prompt)); }
  catch (e) { res.status(500).json({ error: e.message, code: e.name }); }
});

// ─── START ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n💀 Bebedeira Narrada backend — porta ${PORT}`);
  console.log(`   Modelo: ${MODEL_ID}`);
  console.log(`   Dashboard: http://localhost:${PORT}/costs\n`);
});
