// server.js
const WebSocketServer = require('websocket').server;
const http = require('http');

// Array para armazenar todas as conexões
let clients = [];

// Cria servidor HTTP simples
const server = http.createServer((req, res) => {
    res.writeHead(404);
    res.end();
});
server.listen(8080, () => console.log('Servidor WS rodando na porta 8080'));

// Cria servidor WebSocket
const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

// Aceita todas as origens
function originIsAllowed(origin) { return true; }

wsServer.on('request', (request) => {
    
    
    const url = new URL(request.httpRequest.url, `http://${request.httpRequest.headers.host}`);
    const token = url.searchParams.get('token');

    if (token !== "esp32") {
        request.reject();
        console.log('Conexão rejeitada: token inválido');
        return;
    }



    if (!originIsAllowed(request.origin)) {
        request.reject();
        return;
    }

    const connection = request.accept('echo-protocol', request.origin);
    clients.push(connection);
    console.log('Novo cliente conectado');

    // Recebe mensagem de qualquer cliente
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            console.log('Mensagem recebida:', message.utf8Data);
            // Envia para todos os clientes (broadcast)
            clients.forEach(client => client.sendUTF(message.utf8Data));
        }
    });

    connection.on('close', () => {
        console.log('Cliente desconectado');
        clients = clients.filter(c => c !== connection);
    });
});
