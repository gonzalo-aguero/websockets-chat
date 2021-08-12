const express = require('express');
const app = express();
const path = require("path");
const cors = require('cors');
const server = require('http').Server(app);
const WebSocketServer = require("websocket").server;
const functions = require('./modules/functions');

var connections = [];
var connectedUsers = []; 

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

wsServer.on('request', (req)=>{
    const _connection = req.accept(null, req.origin);
    const _remoteAddress = _connection.remoteAddress;
    connections.push(_connection);
    console.log(`New client connected at ${functions.useDate()} ---> ${_remoteAddress}`);
    
    //Event when receiving a new message.
    _connection.on("message", (message)=>{
        const data = JSON.parse(message.utf8Data);
        switch (data.operation) {
            case 'setConnectedUser':
                setConnectedUser(data.data, _connection);
                break;
            case 'newMessage':
                newMessage(data.data);
                break;
            default:
                console.error("Undefined operation");
                break;
        }
    });

    //Event when connection is closed.
    _connection.on("close", (reasonCode, description)=>{
        console.log(`Client ${_remoteAddress} disconnected at ${functions.useDate()}.`);
        
        //Close and delete all websocket connections with that remote address.
        connections.forEach( (connection, i) => {
            if(connection.remoteAddress === _remoteAddress){
                connection.close();
                connections.splice(i, 1);
            }
        });
        //Set the user as disconnected.
        const userIndex = connectedUsers.findIndex(user => user.remoteAddress === _remoteAddress);
        connectedUsers[userIndex].connected = false;
        notifyConnectedUsers();
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

server.listen(app.get('port'), ()=>{
    console.log("Listening in port",app.get('port'));
})

function setConnectedUser(user, connection){
    let index = connectedUsers.findIndex(connectedUser => connectedUser.remoteAddress === connection.remoteAddress);
    if(index === -1){
        //User not found. Register the new user.
        user.remoteAddress = connection.remoteAddress;
        connectedUsers.push(user);
    }else{
        if(connectedUsers[index].connected === false){
            //User disconnected but who was recently connected.
            connectedUsers[index].connected = true;
            connectedUsers[index].userName = user.userName;
        }else if(connectedUsers[index].connected === true){
            //User already connected.
            connectedUsers[index].connected = true;
            const msg = {
                operation: 'userAlreadyConnected',
                data: connectedUsers[index]
            }
            connection.sendUTF(JSON.stringify(msg));
        }
    }
    notifyConnectedUsers();
}
function notifyConnectedUsers(){
    connections.forEach( connection => {
        const response = {
            operation: 'setConnectedUser',
            data: {
                connectedUsers
            }
        }
        connection.sendUTF(JSON.stringify(response));
    });
}
function newMessage(message){
    connections.forEach( connection => {
        const msg = {
            operation: 'newMessage',
            data: {
                userName: message.userName,
                message: message.message
            }
        }
        connection.sendUTF(JSON.stringify(msg));
        console.log(msg);
    });
}