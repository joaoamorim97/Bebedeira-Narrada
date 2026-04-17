import { SceneData, RoundResult, TemporaryRule } from '../types';

export const FALLBACK_SCENES: SceneData[] = [
  {
    sceneText: "Você encontra uma geladeira falando sozinha no meio da sala. Ela sussurra seu nome e pisca a luz três vezes.",
    choices: ["Abrir a geladeira", "Falar de volta com ela", "Chamar outro jogador para testemunhar", "Fingir que não ouviu nada"]
  },
  {
    sceneText: "Um pombo entra pela janela carregando um bilhete. O bilhete diz: 'Você deve isso a mim.'",
    choices: ["Ler o bilhete em voz alta", "Devolver o pombo pela janela", "Guardar o bilhete no bolso", "Perguntar quem mandou"]
  },
  {
    sceneText: "O espelho do banheiro começa a mostrar uma versão sua de 10 anos atrás. Ela parece com raiva.",
    choices: ["Acenar para o reflexo", "Quebrar o espelho", "Pedir desculpas", "Chamar todo mundo para ver"]
  },
  {
    sceneText: "Uma voz no teto anuncia que você ganhou um prêmio misterioso. Ninguém mais ouviu.",
    choices: ["Aceitar o prêmio", "Recusar educadamente", "Perguntar o que é o prêmio", "Ignorar completamente"]
  },
  {
    sceneText: "Seu celular toca, mas a tela mostra 'Você mesmo' como chamador. A ligação é de amanhã.",
    choices: ["Atender a ligação", "Rejeitar a chamada", "Mostrar para outro jogador", "Desligar o celular"]
  },
  {
    sceneText: "Uma sombra na parede começa a dançar sem que ninguém esteja dançando. Ela aponta para você.",
    choices: ["Dançar junto com a sombra", "Acender mais luzes", "Pedir para ela parar", "Ignorar e beber"]
  },
  {
    sceneText: "O dado que alguém jogou na mesa não parou de rolar. Já faz 30 segundos. Ele parece estar esperando algo.",
    choices: ["Soprar no dado", "Cobrir o dado com a mão", "Apostar no número que vai sair", "Jogar o dado fora"]
  },
  {
    sceneText: "Uma mensagem aparece no grupo do WhatsApp: 'Alguém aí sabe o que aconteceu com o porão?' Ninguém mandou.",
    choices: ["Responder a mensagem", "Deletar a mensagem", "Ir verificar o porão", "Mostrar para o grupo"]
  },
  {
    sceneText: "A música que estava tocando começa a tocar ao contrário. A letra ao contrário diz seu nome.",
    choices: ["Desligar a música", "Cantar junto ao contrário", "Gravar o momento", "Pedir para trocar a música"]
  },
  {
    sceneText: "Um gato preto aparece do nada e senta na sua frente. Ele não pisca. Ele só olha.",
    choices: ["Encarar o gato de volta", "Oferecer comida para o gato", "Pegar o gato no colo", "Sair da sala"]
  },
  {
    sceneText: "Todas as velas da mesa acendem sozinhas ao mesmo tempo. O cheiro é de bolo de aniversário.",
    choices: ["Fazer um pedido e apagar", "Deixar queimar", "Soprar sem fazer pedido", "Chamar todos para cantar parabéns"]
  },
  {
    sceneText: "Você encontra uma nota de dinheiro no chão com seu nome escrito nela à mão.",
    choices: ["Ficar com o dinheiro", "Mostrar para o grupo", "Rasgar a nota", "Devolver para o universo"]
  },
  {
    sceneText: "O relógio na parede começa a andar para trás. Exatamente na hora que você olha para ele.",
    choices: ["Acertar o relógio", "Tirar a bateria", "Ignorar e continuar jogando", "Avisar todo mundo"]
  },
  {
    sceneText: "Uma porta que estava fechada abre sozinha. Do outro lado tem apenas escuridão e o cheiro de pipoca.",
    choices: ["Entrar na escuridão", "Fechar a porta de volta", "Jogar algo para dentro", "Chamar alguém para ir junto"]
  },
  {
    sceneText: "Seu nome aparece escrito no vapor do copo de bebida. As letras duram 5 segundos antes de sumir.",
    choices: ["Beber o copo de uma vez", "Mostrar para outro jogador", "Soprar o vapor", "Trocar o copo com alguém"]
  },
  {
    sceneText: "Um alarme de incêndio toca por exatamente 3 segundos e para. Não tem fumaça. Não tem fogo.",
    choices: ["Verificar o alarme", "Evacuar a sala por precaução", "Ignorar completamente", "Culpar alguém"]
  },
  {
    sceneText: "Você percebe que está usando dois sapatos diferentes. Ninguém sabe quando isso aconteceu.",
    choices: ["Tirar os dois sapatos", "Fingir que foi intencional", "Culpar a maldição", "Pedir um sapato emprestado"]
  },
  {
    sceneText: "A luz pisca três vezes e quando volta, um copo está em lugar diferente do que estava.",
    choices: ["Acusar alguém de mover o copo", "Aceitar a maldição", "Verificar câmeras", "Beber o copo misterioso"]
  },
  {
    sceneText: "Uma notificação no celular diz: 'Lembrete: não faça isso.' Você não criou esse lembrete.",
    choices: ["Perguntar o que é 'isso'", "Deletar o lembrete", "Fazer exatamente o oposto", "Mostrar para o grupo"]
  },
  {
    sceneText: "O piso range três vezes seguidas sem ninguém andar. O padrão parece uma mensagem em código morse.",
    choices: ["Tentar decifrar o código", "Bater no piso de volta", "Sair da área", "Gravar o som"]
  }
];

export const FALLBACK_RESULTS: RoundResult[] = [
  {
    resultText: "A maldição aceita sua escolha e redireciona a energia para a mesa. O caos se espalha.",
    drinks: [{ playerName: "CURRENT", sips: 2 }],
    newRules: []
  },
  {
    resultText: "Sua decisão acorda algo que estava dormindo. A consequência é imediata e molhada.",
    drinks: [{ playerName: "CURRENT", sips: 1 }, { playerName: "LEFT", sips: 1 }],
    newRules: []
  },
  {
    resultText: "O universo aprova sua coragem. Mas aprova de um jeito muito específico.",
    drinks: [{ playerName: "CURRENT", sips: 3 }],
    newRules: [{ ruleText: "Ninguém pode dizer 'não' por 2 rodadas", durationRounds: 2, target: "all" }]
  },
  {
    resultText: "A maldição fica confusa com sua escolha e decide punir aleatoriamente.",
    drinks: [{ playerName: "ALL", sips: 1 }],
    newRules: []
  },
  {
    resultText: "Você saiu ileso. Desta vez. A maldição anota seu nome para depois.",
    drinks: [],
    newRules: [{ ruleText: "O jogador atual não pode usar o celular por 2 rodadas", durationRounds: 2, target: "current" }]
  },
  {
    resultText: "Sua escolha cria uma onda de consequências. Todo mundo sente.",
    drinks: [{ playerName: "ALL", sips: 1 }],
    newRules: []
  },
  {
    resultText: "A entidade fica impressionada com sua audácia. Ela pune você com admiração.",
    drinks: [{ playerName: "CURRENT", sips: 2 }],
    newRules: []
  },
  {
    resultText: "Isso não era o que a maldição esperava. Ela precisa de um momento. Enquanto isso, beba.",
    drinks: [{ playerName: "CURRENT", sips: 1 }],
    newRules: [{ ruleText: "Ninguém pode apontar para nada por 1 rodada", durationRounds: 1, target: "all" }]
  },
  {
    resultText: "A escolha errada. Mas pelo menos foi corajosa.",
    drinks: [{ playerName: "CURRENT", sips: 3 }],
    newRules: []
  },
  {
    resultText: "Sua decisão ressoa pelo espaço-tempo. O jogador à sua esquerda sente primeiro.",
    drinks: [{ playerName: "CURRENT", sips: 1 }, { playerName: "LEFT", sips: 2 }],
    newRules: []
  }
];

export const FALLBACK_RULES: Omit<TemporaryRule, 'id' | 'createdAtRound'>[] = [
  { ruleText: "Ninguém pode dizer 'beber' por 2 rodadas", durationRounds: 2, target: "all" },
  { ruleText: "Todo mundo deve falar em voz baixa por 1 rodada", durationRounds: 1, target: "all" },
  { ruleText: "Ninguém pode rir por 1 rodada", durationRounds: 1, target: "all" },
  { ruleText: "Ninguém pode usar o celular por 2 rodadas", durationRounds: 2, target: "all" },
  { ruleText: "Todo mundo deve aplaudir antes de beber por 2 rodadas", durationRounds: 2, target: "all" },
  { ruleText: "Ninguém pode dizer 'não' por 1 rodada", durationRounds: 1, target: "all" },
  { ruleText: "Ninguém pode apontar para nada por 2 rodadas", durationRounds: 2, target: "all" },
  { ruleText: "Todo mundo deve falar em terceira pessoa por 1 rodada", durationRounds: 1, target: "all" },
  { ruleText: "Ninguém pode cruzar os braços por 2 rodadas", durationRounds: 2, target: "all" },
  { ruleText: "Todo mundo deve bater na mesa antes de falar por 1 rodada", durationRounds: 1, target: "all" }
];

export const GAME_DURATION_ROUNDS = {
  curta: 8,
  média: 12,
  longa: 16
};

export const GAME_LIMITS = {
  maxSipsPerPlayer: 3,
  maxPlayersAffected: 3,
  maxNewRulesPerRound: 2,
  maxRuleDuration: 3
};
