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

const msg = 
`
✨🍕 *😋 Hummm... Fome de quê?* 😋🍕✨

Olá! 👋 Em que posso te ajudar hoje?

🔥 *Confira nosso delicioso cardápio AGORA:* 🔥
👉 [https://drive.google.com/file/d/1wYoDbR5YFoEZlZznT675AaF_GCEku7RF/view] 👈

😋 *Já escolheu suas delícias?*

➡️ Digite *1* para *REALIZAR SEU PEDIDO!*
➡️ Digite *2* para *CONSULTAR SEUS PEDIDOS*
➡️ Digite *3* para *ENCERRAR A CONVERSA*

Estamos ansiosos para te servir o melhor! 😉

`

let userState = {};

var pedidos = {};

client.on('message', async (message) => {
    const { from, body } = message;

    // Verifica se o usuário já iniciou a interação ou não
    if (!userState[from]) {
        await client.sendMessage(from, msg);
        userState[from] = { step: 1 };
    }else if (userState[from].step === 1) {
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


const handleResponse1 = async (chatId, response) => {
    if (response === '1') {
        await client.sendMessage(chatId, 'Vamos enviar o cardapio!');
        await client.sendMessage(chatId, cardapio);
        userState[chatId] = {step: 2};
    } else if (response === '2') {
        await client.sendMessage(chatId, 'Você escolheu consultar pedidos!');
        await handleResponse4(chatId); //agora executa direto pelo handle 1
        //userState[chatId] = { step: 3 };
    } else if (response === '3') {
        await client.sendMessage(chatId, 'Conversa encerrada! Obrigado pelo contato 😊');
        delete userState[chatId]; // limpa estado para caso o usuario volte depois
        pedidos[chatId] = [];
    } else {
        await client.sendMessage(chatId, 'Opção inválida! Responda com 1 para "Realizar pedido", 2 para "Consultar pedido" ou 3 para "Encerrar conversa"!.');
    }

};

const handleResponse2 = async (chatId, response) => {
    if (!pedidos[chatId]) {
        pedidos[chatId] = [];
    }

    switch(response){
        case '1':
            await client.sendMessage(chatId, 'Você escolheu o Hambúrguer Clássico!');
            pedidos[chatId].push({ item: 'Hambúrguer Clássico', price: 15.00 });
            break;
        case '2':
            await client.sendMessage(chatId, 'Você escolheu a Batata Frita!');
            pedidos[chatId].push({ item: 'Batata Frita', price: 8.00 });
            break;
        default:
            await client.sendMessage(chatId, 'Opção inválida, tente 1 ou 2!');
            return;
    }

    await handleResponse3(chatId);// agora ele não deleta o userstate, mantendo o fluxo
};

const handleResponse3 = async (chatId, response) => {
    await client.sendMessage(chatId, 'Deseja fazer outro pedido ou consultar seus pedidos?');
    await client.sendMessage(chatId, '1 - Fazer novo pedido\n2 - Consultar pedidos\n3 - Encerrar conversa');
    userState[chatId] = { step: 1 }; // volta pro menu principal aproveitando as escolhas 
};


const handleResponse4 = async (chatId) => {
    if (pedidos[chatId] && pedidos[chatId].length > 0) {
        let resposta = 'Seus pedidos são:\n\n';
        let total = 0;

        pedidos[chatId].forEach((pedido, index) => {
            resposta += `Pedido ${index + 1}:\nItem: ${pedido.item}\nPreço: R$${pedido.price.toFixed(2)}\n\n`;
            total += pedido.price;
        });

        await client.sendMessage(chatId, resposta);
        await client.sendMessage(chatId, `Valor Total: R$${total.toFixed(2)}`);
    } else {
        await client.sendMessage(chatId, 'Você ainda não fez um pedido!');
    }

    await handleResponse3(chatId);// agora ele não deleta o userstate, mantendo o fluxo
};

client.initialize();