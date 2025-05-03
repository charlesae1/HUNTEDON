const { Client, GatewayIntentBits } = require('discord.js');
const puppeteer = require('puppeteer'); // Importando Puppeteer

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
      // Lógica de navegação usando Puppeteer
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);

      // Verifica se o nome do personagem está "Online"
      const estaOnline = await page.evaluate(() => {
        return document.body.innerHTML.includes('class="green">Online');
      });

      if (estaOnline && !statusAnterior[nome]) {
        channel.send(`${nome} está 🟢 **Online**`);
        statusAnterior[nome] = true;
      }

      if (!estaOnline) {
        statusAnterior[nome] = false;
      }

      await browser.close(); // Fecha o navegador
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