const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Criação do cliente do WhatsApp
const client = new Client();

// Evento para mostrar o QR Code para autenticação
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Quando o cliente estiver pronto
client.on('ready', () => {
    console.log('Client is ready!');
});

// Objeto para armazenar o estado de cada usuário
let userState = {};

// Quando uma nova mensagem é recebida
client.on('message', async (message) => {
    const { from, body } = message;

    // Verifica se o usuário já iniciou a interação ou não
    if (!userState[from]) {
        // Se o usuário ainda não interagiu, envia a mensagem inicial
        await client.sendMessage(from, 'Olá! Como posso te ajudar? Responda com 1 para "Sim" ou 2 para "Não"');
        sendOptions(from); // Envia as opções interativas
        userState[from] = { step: 1 }; // Define o estado do usuário como o primeiro passo
    } else if (userState[from].step === 1) {
        // Resposta após a primeira interação
        handleResponse(from, body);
    }
    else {
        handleResponse(from, body);
    }
});

// Função para enviar as opções da enquete
const sendOptions = async (chatId) => {
    const message = 'Escolha uma opção:';
    await client.sendMessage(chatId, `${message}\n1. Sim\n2. Não\n3. Talvez`);
};

// Função para lidar com as respostas do usuário
const handleResponse = async (chatId, response) => {
    if (response === '1') {
        await client.sendMessage(chatId, 'Você escolheu SIM!');
    } else if (response === '2') {
        await client.sendMessage(chatId, 'Você escolheu NÃO!');
    } else if (response === '3') {
        await client.sendMessage(chatId, 'Você escolheu TALVEZ!');
    } else {
        await client.sendMessage(chatId, 'Opção inválida! Responda com 1 para "Sim", 2 para "Não" ou 3 para "Talvez".');
    }

    // Após responder, mudar o estado para finalizar a interação ou reiniciar se necessário
    userState[chatId].step = 2; // Finaliza o fluxo ou pode reiniciar para outra interação
};

// Inicializa o cliente do WhatsApp
client.initialize();
