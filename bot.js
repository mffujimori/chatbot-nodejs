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
🍽️ *CARDÁPIO - SABOR CASEIRO*  
🕰️ *Almoço das 11:30 às 14:30*  

🥘 *Pratos do Dia:*  
1️⃣ *Picadinho* — R$ 40,00  
2️⃣ *Virado à Paulista* — R$ 40,00  
3️⃣ *Filé de Carne à Parmegiana* — R$ 40,00  
4️⃣ *Filé de Frango à Parmegiana* — R$ 40,00  
5️⃣ *Frango Assado* — R$ 37,00  
6️⃣ *Frango ao Molho* — R$ 37,00  
7️⃣ *Rabada* — R$ 40,00  
8️⃣ *Peixe Tilápia* — R$ 37,00  
9️⃣ *Peixe Merluza* — R$ 37,00  

🍛 *Feijoada (diversos tamanhos):*  
🔟 *P (Pequena)* — R$ 55,00  
1️⃣1️⃣ *M (Média)* — R$ 70,00  
1️⃣2️⃣ *G (Grande)* — R$ 95,00  
1️⃣3️⃣ *GG (Família)* — R$ 125,00  

🍳 *Todos os Dias:*  
1️⃣4️⃣ *Contra Filé* — R$ 45,00  
1️⃣5️⃣ *Filé de Frango* — R$ 40,00  
1️⃣6️⃣ *Calabresa* — R$ 37,00  
1️⃣7️⃣ *Omelete* — R$ 37,00  

💬 *Digite *APENAS* o número do prato desejado para fazer seu pedido!*  
📍 *Sabor Caseiro – comida feita com amor!*

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

    const cardapio = {
        '1': { item: 'Picadinho', price: 40.00 },
        '2': { item: 'Virado à Paulista', price: 40.00 },
        '3': { item: 'Filé de Carne à Parmegiana', price: 40.00 },
        '4': { item: 'Filé de Frango à Parmegiana', price: 40.00 },
        '5': { item: 'Frango Assado', price: 37.00 },
        '6': { item: 'Frango ao Molho', price: 37.00 },
        '7': { item: 'Rabada', price: 40.00 },
        '8': { item: 'Peixe Tilápia', price: 37.00 },
        '9': { item: 'Peixe Merluza', price: 37.00 },
        '10': { item: 'Feijoada (P)', price: 55.00 },
        '11': { item: 'Feijoada (M)', price: 70.00 },
        '12': { item: 'Feijoada (G)', price: 95.00 },
        '13': { item: 'Feijoada (GG)', price: 125.00 },
        '14': { item: 'Contra Filé', price: 45.00 },
        '15': { item: 'Filé de Frango', price: 40.00 },
        '16': { item: 'Calabresa', price: 37.00 },
        '17': { item: 'Omelete', price: 37.00 }
    };

    const pedido = cardapio[response];

    if (pedido) {
        await client.sendMessage(chatId, `✅ Você escolheu: *${pedido.item}* — R$ ${pedido.price.toFixed(2)}`);
        pedidos[chatId].push(pedido);
    } else {
        await client.sendMessage(chatId, '❌ Opção inválida, por favor digite um número de 1 a 17.');
        return;
    }

    await handleResponse3(chatId); // mantém o fluxo
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