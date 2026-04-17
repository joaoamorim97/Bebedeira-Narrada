# História Maldita 💀

Party game mobile com narração por LLM. Um celular, passado de mão em mão.

## Como rodar

### Backend

```bash
cd backend
cp .env.example .env
# Adicione sua OPENAI_API_KEY no .env
npm install
npm start
```

### App (Expo)

```bash
# Na raiz do projeto
cp .env.example .env
# Ajuste EXPO_PUBLIC_API_URL para o IP da sua máquina se testar no celular físico
# Ex: EXPO_PUBLIC_API_URL=http://192.168.1.100:3001

npm install
npx expo start
```

Escaneie o QR code com o app Expo Go no celular.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `OPENAI_API_KEY` | Chave da API OpenAI (backend) |
| `EXPO_PUBLIC_API_URL` | URL do backend (frontend) |

## Estrutura

```
historia-maldita/
├── src/
│   ├── screens/       # Telas do app
│   ├── components/    # Componentes reutilizáveis
│   ├── store/         # Estado global (Zustand)
│   ├── services/      # Chamadas LLM + fallback
│   ├── navigation/    # React Navigation
│   ├── types/         # TypeScript types
│   └── constants/     # Tema, fallback content, limites
├── backend/           # API Express + OpenAI
└── App.tsx
```

## Fallback

Se o backend estiver offline ou a LLM falhar, o app usa automaticamente um banco local com 20 cenas e 10 resoluções prontas. O jogo nunca trava.
