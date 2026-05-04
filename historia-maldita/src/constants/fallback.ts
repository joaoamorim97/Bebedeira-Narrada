import { SceneData, RoundResult, TemporaryRule } from '../types';
import { Language } from '../store/languageStore';

// ─── FALLBACK SCENES ─────────────────────────────────────────────────────────

const FALLBACK_SCENES_PT: SceneData[] = [
  { sceneText: "Você encontra uma geladeira falando sozinha. Ela sussurra seu nome.", choices: ["Abrir a geladeira", "Falar de volta", "Chamar alguém para ver", "Fingir que não ouviu"] },
  { sceneText: "Um pombo entra pela janela com um bilhete: 'Você deve isso a mim.'", choices: ["Ler em voz alta", "Devolver o pombo", "Guardar o bilhete", "Perguntar quem mandou"] },
  { sceneText: "O espelho mostra uma versão sua de 10 anos atrás. Ela parece com raiva.", choices: ["Acenar para o reflexo", "Quebrar o espelho", "Pedir desculpas", "Chamar todo mundo"] },
  { sceneText: "Uma voz no teto anuncia que você ganhou um prêmio misterioso.", choices: ["Aceitar o prêmio", "Recusar", "Perguntar o que é", "Ignorar"] },
  { sceneText: "Seu celular toca. A tela mostra 'Você mesmo'. A ligação é de amanhã.", choices: ["Atender", "Rejeitar", "Mostrar para alguém", "Desligar"] },
  { sceneText: "Uma sombra na parede dança sem que ninguém esteja dançando. Ela aponta para você.", choices: ["Dançar junto", "Acender mais luzes", "Pedir para parar", "Ignorar e beber"] },
  { sceneText: "O dado na mesa não parou de rolar. Já faz 30 segundos.", choices: ["Soprar no dado", "Cobrir com a mão", "Apostar no número", "Jogar fora"] },
  { sceneText: "Uma mensagem aparece no grupo: 'Alguém sabe o que aconteceu com o porão?' Ninguém mandou.", choices: ["Responder", "Deletar", "Ir verificar", "Mostrar para o grupo"] },
  { sceneText: "A música começa a tocar ao contrário. A letra diz seu nome.", choices: ["Desligar", "Cantar junto", "Gravar", "Trocar a música"] },
  { sceneText: "Um gato preto aparece do nada e senta na sua frente. Ele não pisca.", choices: ["Encarar de volta", "Oferecer comida", "Pegar no colo", "Sair da sala"] },
  { sceneText: "Todas as velas acendem sozinhas. O cheiro é de bolo de aniversário.", choices: ["Fazer um pedido e apagar", "Deixar queimar", "Soprar sem pedido", "Cantar parabéns"] },
  { sceneText: "Você encontra uma nota de dinheiro com seu nome escrito à mão.", choices: ["Ficar com o dinheiro", "Mostrar para o grupo", "Rasgar", "Devolver ao universo"] },
  { sceneText: "O relógio começa a andar para trás exatamente quando você olha.", choices: ["Acertar o relógio", "Tirar a bateria", "Ignorar", "Avisar todo mundo"] },
  { sceneText: "Uma porta fechada abre sozinha. Do outro lado: escuridão e cheiro de pipoca.", choices: ["Entrar", "Fechar de volta", "Jogar algo para dentro", "Chamar alguém"] },
  { sceneText: "Seu nome aparece escrito no vapor do copo. As letras duram 5 segundos.", choices: ["Beber de uma vez", "Mostrar para alguém", "Soprar o vapor", "Trocar o copo"] },
];

const FALLBACK_SCENES_ES: SceneData[] = [
  { sceneText: "Encuentras una nevera hablando sola. Susurra tu nombre.", choices: ["Abrir la nevera", "Hablarle de vuelta", "Llamar a alguien", "Fingir que no escuchaste"] },
  { sceneText: "Una paloma entra con una nota: 'Me debes esto.'", choices: ["Leer en voz alta", "Devolver la paloma", "Guardar la nota", "Preguntar quién la mandó"] },
  { sceneText: "El espejo muestra una versión tuya de hace 10 años. Parece enojada.", choices: ["Saludar al reflejo", "Romper el espejo", "Pedir disculpas", "Llamar a todos"] },
  { sceneText: "Una voz en el techo anuncia que ganaste un premio misterioso.", choices: ["Aceptar el premio", "Rechazarlo", "Preguntar qué es", "Ignorarlo"] },
  { sceneText: "Tu celular suena. La pantalla dice 'Tú mismo'. La llamada es de mañana.", choices: ["Contestar", "Rechazar", "Mostrar a alguien", "Apagar"] },
  { sceneText: "Una sombra en la pared baila sin que nadie esté bailando. Te señala.", choices: ["Bailar con ella", "Encender más luces", "Pedirle que pare", "Ignorar y beber"] },
  { sceneText: "El dado en la mesa no para de rodar. Ya van 30 segundos.", choices: ["Soplar el dado", "Cubrirlo con la mano", "Apostar al número", "Tirarlo"] },
  { sceneText: "La música empieza a sonar al revés. La letra dice tu nombre.", choices: ["Apagarla", "Cantar al revés", "Grabar", "Cambiar la canción"] },
  { sceneText: "Un gato negro aparece de la nada y se sienta frente a ti. No parpadea.", choices: ["Mirarlo fijo", "Ofrecerle comida", "Cargarlo", "Salir del cuarto"] },
  { sceneText: "Todas las velas se encienden solas. Huele a pastel de cumpleaños.", choices: ["Pedir un deseo y apagar", "Dejarlas arder", "Soplar sin deseo", "Cantar cumpleaños"] },
];

const FALLBACK_SCENES_EN: SceneData[] = [
  { sceneText: "You find a fridge talking to itself. It whispers your name.", choices: ["Open the fridge", "Talk back to it", "Call someone to witness", "Pretend you heard nothing"] },
  { sceneText: "A pigeon flies in with a note: 'You owe me this.'", choices: ["Read it out loud", "Return the pigeon", "Keep the note", "Ask who sent it"] },
  { sceneText: "The mirror shows a version of you from 10 years ago. It looks angry.", choices: ["Wave at the reflection", "Break the mirror", "Apologize", "Call everyone to see"] },
  { sceneText: "A voice from the ceiling announces you won a mysterious prize.", choices: ["Accept the prize", "Politely decline", "Ask what it is", "Ignore it completely"] },
  { sceneText: "Your phone rings. The screen says 'Yourself'. The call is from tomorrow.", choices: ["Answer it", "Reject the call", "Show someone", "Turn it off"] },
  { sceneText: "A shadow on the wall dances with no one dancing. It points at you.", choices: ["Dance with it", "Turn on more lights", "Ask it to stop", "Ignore and drink"] },
  { sceneText: "The dice on the table won't stop rolling. It's been 30 seconds.", choices: ["Blow on the dice", "Cover it with your hand", "Bet on the number", "Throw it away"] },
  { sceneText: "The music starts playing backwards. The lyrics say your name.", choices: ["Turn it off", "Sing along backwards", "Record it", "Change the song"] },
  { sceneText: "A black cat appears from nowhere and sits in front of you. It doesn't blink.", choices: ["Stare back", "Offer it food", "Pick it up", "Leave the room"] },
  { sceneText: "All the candles light themselves. It smells like birthday cake.", choices: ["Make a wish and blow", "Let them burn", "Blow without a wish", "Sing happy birthday"] },
];

export const FALLBACK_SCENES_BY_LANG: Record<Language, SceneData[]> = {
  pt: FALLBACK_SCENES_PT,
  es: FALLBACK_SCENES_ES,
  en: FALLBACK_SCENES_EN,
};

// ─── FALLBACK RESULTS ────────────────────────────────────────────────────────

const FALLBACK_RESULTS_PT: RoundResult[] = [
  { resultText: "A maldição aceita sua escolha e redireciona a energia para a mesa.", drinks: [{ playerName: "CURRENT", sips: 2 }], newRules: [] },
  { resultText: "Sua decisão acorda algo que estava dormindo. A consequência é molhada.", drinks: [{ playerName: "CURRENT", sips: 1 }, { playerName: "LEFT", sips: 1 }], newRules: [] },
  { resultText: "O universo aprova sua coragem. Mas aprova de um jeito muito específico.", drinks: [{ playerName: "CURRENT", sips: 3 }], newRules: [{ ruleText: "Ninguém pode dizer 'não' por 2 rodadas", durationRounds: 2, target: "all" }] },
  { resultText: "A maldição fica confusa e decide punir aleatoriamente.", drinks: [{ playerName: "ALL", sips: 1 }], newRules: [] },
  { resultText: "Você saiu ileso. Desta vez. A maldição anota seu nome.", drinks: [], newRules: [] },
  { resultText: "Sua escolha cria uma onda de consequências. Todo mundo sente.", drinks: [{ playerName: "ALL", sips: 1 }], newRules: [] },
];

const FALLBACK_RESULTS_ES: RoundResult[] = [
  { resultText: "La maldición acepta tu elección y redirige la energía a la mesa.", drinks: [{ playerName: "CURRENT", sips: 2 }], newRules: [] },
  { resultText: "Tu decisión despierta algo que dormía. La consecuencia es húmeda.", drinks: [{ playerName: "CURRENT", sips: 1 }, { playerName: "LEFT", sips: 1 }], newRules: [] },
  { resultText: "El universo aprueba tu valentía. Pero de una manera muy específica.", drinks: [{ playerName: "CURRENT", sips: 3 }], newRules: [{ ruleText: "Nadie puede decir 'no' por 2 rondas", durationRounds: 2, target: "all" }] },
  { resultText: "La maldición se confunde y decide castigar aleatoriamente.", drinks: [{ playerName: "ALL", sips: 1 }], newRules: [] },
  { resultText: "Saliste ileso. Esta vez. La maldición anota tu nombre.", drinks: [], newRules: [] },
  { resultText: "Tu elección crea una ola de consecuencias. Todos lo sienten.", drinks: [{ playerName: "ALL", sips: 1 }], newRules: [] },
];

const FALLBACK_RESULTS_EN: RoundResult[] = [
  { resultText: "The curse accepts your choice and redirects the energy to the table.", drinks: [{ playerName: "CURRENT", sips: 2 }], newRules: [] },
  { resultText: "Your decision wakes something that was sleeping. The consequence is wet.", drinks: [{ playerName: "CURRENT", sips: 1 }, { playerName: "LEFT", sips: 1 }], newRules: [] },
  { resultText: "The universe approves your courage. But in a very specific way.", drinks: [{ playerName: "CURRENT", sips: 3 }], newRules: [{ ruleText: "Nobody can say 'no' for 2 rounds", durationRounds: 2, target: "all" }] },
  { resultText: "The curse gets confused and decides to punish randomly.", drinks: [{ playerName: "ALL", sips: 1 }], newRules: [] },
  { resultText: "You got away unscathed. This time. The curse notes your name.", drinks: [], newRules: [] },
  { resultText: "Your choice creates a wave of consequences. Everyone feels it.", drinks: [{ playerName: "ALL", sips: 1 }], newRules: [] },
];

export const FALLBACK_RESULTS_BY_LANG: Record<Language, RoundResult[]> = {
  pt: FALLBACK_RESULTS_PT,
  es: FALLBACK_RESULTS_ES,
  en: FALLBACK_RESULTS_EN,
};

// Keep old exports for backward compat
export const FALLBACK_SCENES = FALLBACK_SCENES_PT;
export const FALLBACK_RESULTS = FALLBACK_RESULTS_PT;

export const FALLBACK_RULES: Omit<TemporaryRule, 'id' | 'createdAtRound'>[] = [
  { ruleText: "Ninguém pode dizer o nome de alguém por 2 rodadas", durationRounds: 2, target: "all" },
  { ruleText: "Quem beber tem que fazer uma careta", durationRounds: 2, target: "all" },
  { ruleText: "Todo mundo bate na mesa antes de beber por 1 rodada", durationRounds: 1, target: "all" },
  { ruleText: "Ninguém pode apontar o dedo por 2 rodadas", durationRounds: 2, target: "all" },
  { ruleText: "Quem falar palavrão bebe 1 gole", durationRounds: 2, target: "all" },
  { ruleText: "Ninguém pode cruzar os braços por 1 rodada", durationRounds: 1, target: "all" },
  { ruleText: "Quem rir bebe 1 gole por 2 rodadas", durationRounds: 2, target: "all" },
  { ruleText: "Ninguém pode usar o celular por 1 rodada", durationRounds: 1, target: "all" },
];

export const GAME_DURATION_ROUNDS = { curta: 8, média: 12, longa: 16 };

export const GAME_LIMITS = {
  maxSipsPerPlayer: 3,
  maxPlayersAffected: 3,
  maxNewRulesPerRound: 2,
  maxRuleDuration: 3,
};
