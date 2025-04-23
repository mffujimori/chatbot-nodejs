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

const cardapio = `
🍕 *Escolha seu item:*

1. 🍔 *Hambúrguer Clássico* - R$15,00
2. 🍟 *Batata Frita* - R$8,00

`;

var pedidos = {}

// Objeto para armazenar o estado de cada usuário
let userState = {};

// Quando uma nova mensagem é recebida
client.on('message', async (message) => {
    const { from, body } = message;

    // Verifica se o usuário já iniciou a interação ou não
    if (!userState[from]) {
        // Se o usuário ainda não interagiu, envia a mensagem inicial
        await client.sendMessage(from, 'Olá! Como posso te ajudar? Responda com 1 para "Realizar pedido" ou 2 para "Consultar Pedido"');
        userState[from] = { step: 1 }; // Define o estado do usuário como o primeiro passo
    
    } else if (userState[from].step === 1) {
        handleResponse1(from, body);
    }else if (userState[from].step === 2) {
        handleResponse2(from, body);
    }else if (userState[from].step === 3) {
        handleResponse3(from, body);
    }
    else {
        handleResponse1(from, body);
    }
});



// Função para lidar com as respostas do usuário
const handleResponse1 = async (chatId, response) => {
    if (response === '1') {
        await client.sendMessage(chatId, 'Vamos enviar o cardapio!');
        await client.sendMessage(chatId, cardapio);
        userState[chatId] = {step: 2};
    } else if (response === '2') {
        await client.sendMessage(chatId, 'Você escolheu consultar pedidos!');
        userState[chatId] = { step: 3 };
    } else {
        await client.sendMessage(chatId, 'Opção inválida! Responda com 1 para "Realizar pedido", 2 para "Consultar pedido"!.');
    }

};

const handleResponse2 = async (chatId, response) => {
    switch(response){
        case '1':
            await client.sendMessage(chatId, 'Voce escolheu o Hamburguer classico!');
            pedidos[chatId] = { item: 'Hambúrguer Clássico', price: 15.00 };
        break;
        case '2':
            await client.sendMessage(chatId, 'Voce escolheu a batata frita!');
            pedidos[chatId] = { item: 'Batata Frita', price: 8.00};
        break;
        default:
            await client.sendMessage(chatId, 'Opcao invalida, tente 1 ou 2!');
            break;
    };
    delete userState[chatId];
};

const handleResponse3 = async (chatId, response) => {
    // Verifica se o usuário já tem um pedido registrado
    if (pedidos[chatId]) {
        const pedido = pedidos[chatId];
        await client.sendMessage(chatId, `Seu pedido é: \n\nItem: ${pedido.item}\nPreço: R$${pedido.price.toFixed(2)}`);
    } else {
        await client.sendMessage(chatId, 'Você ainda não fez um pedido!');
    }

    // Após consultar, deleta o estado do usuário para permitir nova interação
    delete userState[chatId];
};

// Inicializa o cliente do WhatsApp
client.initialize();