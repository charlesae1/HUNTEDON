const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// Lista de personagens
const personagens = ['Jojotap', 'Assemblas Rush'];

// Armazena o status anterior
const statusAnterior = {};

async function verificarStatus(channel) {
  for (const nome of personagens) {
    const url = `https://rubinot.com.br/?subtopic=characters&name=${encodeURIComponent(nome)}`;

    try {
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0' // Evita bloqueio 403
        }
      });

      const estaOnline = html.includes('class="green">Online');

      if (estaOnline && !statusAnterior[nome]) {
        channel.send(`${nome} está 🟢 **Online**`);
        statusAnterior[nome] = true;
      }

      if (!estaOnline) {
        statusAnterior[nome] = false;
      }

    } catch (err) {
      console.error(`Erro ao verificar ${nome}: ${err.message}`);
    }
  }
}

client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);
  const channel = client.channels.cache.get(CHANNEL_ID);

  if (!channel) {
    console.error('Canal não encontrado. Verifique o ID.');
    return;
  }

  verificarStatus(channel); // Verifica ao iniciar

  setInterval(() => {
    verificarStatus(channel);
  }, 60 * 1000); // Verifica a cada 1 minuto
});

client.login(TOKEN);
