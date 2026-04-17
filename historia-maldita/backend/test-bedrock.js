require('dotenv').config();
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

console.log('Região:', process.env.AWS_REGION);
console.log('Modelo:', process.env.BEDROCK_MODEL_ID);
console.log('Key ID:', process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.slice(0, 8) + '...' : 'NÃO DEFINIDA');

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

const cmd = new ConverseCommand({
  modelId: process.env.BEDROCK_MODEL_ID,
  messages: [{ role: 'user', content: [{ text: 'Responda apenas: {"ok":true}' }] }],
  inferenceConfig: { maxTokens: 50 },
});

client.send(cmd)
  .then(r => {
    console.log('\n✅ SUCESSO!');
    console.log('Resposta:', r.output.message.content[0].text);
    console.log('Tokens usados:', r.usage);
  })
  .catch(e => {
    console.error('\n❌ ERRO:', e.name);
    console.error('Mensagem:', e.message);
    if (e.$metadata) console.error('HTTP Status:', e.$metadata.httpStatusCode);
    
    if (e.name === 'AccessDeniedException') {
      console.error('\n→ Modelo não habilitado no Bedrock ou permissão IAM faltando');
      console.error('→ Acesse: AWS Console > Bedrock > Model Access > habilite o modelo');
    }
    if (e.name === 'ValidationException') {
      console.error('\n→ Model ID inválido:', process.env.BEDROCK_MODEL_ID);
    }
    if (e.name === 'UnrecognizedClientException') {
      console.error('\n→ Credenciais AWS inválidas');
    }
  });
