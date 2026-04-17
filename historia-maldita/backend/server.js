require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai').default;

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_NARRATOR = `Você é a narradora de um party game mobile chamado História Maldita.
Seu estilo é: divertido, caótico, surpreendente, sarcástico leve, estilo de festa entre amigos.
Regras absolutas:
- Escreva SEMPRE em português do Brasil
- Respostas CURTAS, que caibam em tela mobile
- NUNCA quebre a estrutura JSON esperada
- NUNCA crie punições impossíveis de executar
- Evite conteúdo extremo, violência gráfica, sexualização pesada
- Mantenha humor nonsense, social, sobrenatural e caótico`;

// POST /api/scene
app.post('/api/scene', async (req, res) => {
  const { players, currentPlayer, round, totalRounds, intensity, activeRules, recentHistory } = req.body;

  const prompt = `Crie uma cena para o party game História Maldita.

Contexto:
- Jogadores: ${players.join(', ')}
- Jogador da vez: ${currentPlayer}
- Rodada: ${round}/${totalRounds}
- Intensidade: ${intensity}
- Regras ativas: ${activeRules}
- Histórico recente: ${recentHistory}

Retorne APENAS JSON válido:
{
  "scene_text": "cena curta e engraçada (máx 3 frases)",
  "choices": ["opção 1", "opção 2", "opção 3", "opção 4"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_NARRATOR },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (err) {
    console.error('Scene generation error:', err.message);
    res.status(500).json({ error: 'LLM error' });
  }
});

// POST /api/resolve
app.post('/api/resolve', async (req, res) => {
  const { players, currentPlayer, round, intensity, sceneText, choiceMade, activeRules } = req.body;

  const prompt = `Resolva a escolha no party game História Maldita.

Cena: ${sceneText}
Jogador da vez: ${currentPlayer}
Escolha feita: ${choiceMade}
Todos os jogadores: ${players.join(', ')}
Intensidade: ${intensity}
Regras ativas: ${activeRules}

Regras para a resolução:
- Máximo 3 goles por jogador
- Máximo 3 jogadores afetados
- Máximo 1 nova regra temporária
- A regra temporária deve ser simples e jogável
- Use os nomes reais dos jogadores OU "ALL" para todos

Retorne APENAS JSON válido:
{
  "result_text": "consequência curta e engraçada (máx 2 frases)",
  "drinks": [
    { "player_name": "nome ou ALL", "sips": 1 }
  ],
  "new_rules": [
    {
      "rule_text": "descrição da regra",
      "duration_rounds": 2,
      "target": "all"
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_NARRATOR },
        { role: 'user', content: prompt }
      ],
      temperature: 0.85,
      max_tokens: 350,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (err) {
    console.error('Resolution error:', err.message);
    res.status(500).json({ error: 'LLM error' });
  }
});

// POST /api/finale
app.post('/api/finale', async (req, res) => {
  const { players, totalRounds, intensity, mostPunished } = req.body;

  const playersSummary = players.map(p => `${p.name}: ${p.sips} goles`).join(', ');

  const prompt = `Crie uma conclusão épica e engraçada para uma partida de História Maldita.

Resumo: ${playersSummary}
Rodadas jogadas: ${totalRounds}
Intensidade: ${intensity}
Mais punido: ${mostPunished}

Retorne APENAS JSON válido:
{
  "finale_text": "conclusão curta, engraçada e épica (máx 3 frases)"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_NARRATOR },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (err) {
    console.error('Finale error:', err.message);
    res.status(500).json({ error: 'LLM error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Historia Maldita backend running on port ${PORT}`));
