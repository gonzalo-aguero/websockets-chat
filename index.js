const express = require('express');
const app = express();
const path = require("path");
const cors = require('cors');
const server = require('http').Server(app);
const WebSocketServer = require("websocket").server;
const { connected } = require('process');
var connectedUsers = []; 
var chat = [];
const notifyInterval = 1000;
app.set('port', 3000);
app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public_html'));
const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});
wsServer.on('request', (req)=>{
    const _connection = req.accept(null, req.origin);
    notifyConnectedUsers(_connection);
    notifyChat(_connection);
    _connection.on("message", (message)=>{
        const data = JSON.parse(message.utf8Data);
        switch (data.operation) {
            case 'setConnectedUser':
                setConnectedUser(data.data);
                break;
            case 'newMessage':
                newMessage(data.data);
                break;
            case 'lifePulse':
                lifePulse(data.data);
                break;
            default:
                console.error("Undefined operation");
                break;
        }
        // console.log("Mensaje del cliente", data);
    });
    _connection.on("close", (reasonCode, description)=>{
        console.log("Client disconnected");
    });
});



app.get('/', (req, res)=>{
    const data = {
        __dirname: __dirname,
        users: [
            {
                name: "Gonzalo",
                age: 19
            },
            {
                name: "Fauricio",
                age: 22
            }
        ]
    }
    res.render('index.ejs', data);
});
app.use((req, res, next)=>{
    res.status(404);
    // respond with html page
    if (req.accepts('html')) {
        res.render('404', { url: req.url });
        return;
    }
    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }
    // default to plain-text. send()
    res.type('txt').send('Not found');
});

// Expo Fazt
// app.listen(app.get('port'), ()=>{
//     console.log("listening in port",app.get('port'));
// });
// Expo tutorial de sockets
server.listen(app.get('port'), ()=>{
    console.log("Listening in port",app.get('port'));
})


function setConnectedUser(user){
    let index = connectedUsers.findIndex(connectedUser => connectedUser.userName === user.userName);
    if(index === -1){
        connectedUsers.push(user);
        setInterval(()=>{
            index = connectedUsers.findIndex(connectedUser => connectedUser.userName === user.userName);
            connectedUsers[index].connected = false;
        },1000);
    }
}
function notifyConnectedUsers(connection = null){
    setInterval(()=>{
        if(connection !== null && connection.connected){
            const response = {
                operation: 'setConnectedUser',
                data: {
                    connectedUsers: connectedUsers
                }
            }
            connection.sendUTF(JSON.stringify(response));
        }
    },notifyInterval);
}
function notifyChat(connection = null){
    setInterval(()=>{
        if(connection !== null && connection.connected){
            const response = {
                operation: 'updateChat',
                data: {
                    chat
                }
            }
            connection.sendUTF(JSON.stringify(response));
        }
    },notifyInterval);
}
function newMessage(message){
    chat.push(message);
}
function lifePulse(data){
    const index = connectedUsers.findIndex(user => user.userName === data.userName);
    connectedUsers[index] = {
        userName: data.userName,
        connected: data.connected
    }

}