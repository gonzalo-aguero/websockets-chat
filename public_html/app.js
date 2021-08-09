var socket;
var connectedUsers = [];
var chat = [];
var userName = null;
window.onload = ()=>{
    //Event to connect
    document.getElementById("connectBtn").addEventListener("click", tryConnect);
    //Event to send message
    document.querySelector("#chatForm > input[type=submit]").addEventListener("click",(e)=>{
        e.preventDefault();
        sendMessage();
    });
    //Event to close connection
    document.getElementById("disconnectBtn").addEventListener("click", disconnect);
    //Event to send message when Enter is pressed.
    document.getElementById("message").addEventListener("keypress", e =>{
        if(e.key === 'Enter'){
            e.preventDefault();
            sendMessage();
        }
    });
}
function tryConnect(){
    try{
        connect();
    }catch(error){
        console.error("Error al intentar conectar.");
        console.error(error);
        console.log("Reintentando...");
        setTimeout(connect, 2000);
    }
}
function connect(){
    const userNameInput = document.getElementById("userName");
    userName = userNameInput.value;
    if(userName === null || userName === ""){
        alert("Debe escribir su nombre.");
        return;
    }
    const server = "wss://gma-chat.herokuapp.com/";//192.168.1.23:3000
    socket = new WebSocket(server);
    socket.onopen = (e)=>{
        connectedStatus();
        const data = JSON.stringify({
            operation: "setConnectedUser",
            data: {
                userName,
                connected: false
            }
        });
        socket.send(data);
        console.log("Connected");
        lifePulse();
    }
    socket.onmessage = (e)=>{
        const response = JSON.parse(e.data);
        console.log("Mensaje del servidor:", response);
        switch (response.operation) {
            case 'setConnectedUser':
                setConnectedUser(response.data.connectedUsers);
                break;
            case 'updateChat':
                updateChat(response.data.chat);
                break;
            default:
                console.error("Undefined operation");
                break;
        }
    }
    socket.onclose = (e)=>{
        disconnectedStatus();
        console.log("Disconnected");
    }
    socket.onerror = (e)=>{
        alert("Ha ocurrido un error.");
        console.error(e)
    }
}
function disconnect(){
    socket.close();
}
function sendMessage(){
    const messageInput = document.getElementById("message");
    const message = messageInput.value;
    if(message.length > 0){
        const data = JSON.stringify({
            operation: 'newMessage',
            data: {
                userName,
                message
            }
        });
        socket.send(data);
        messageInput.value = "";
    }
}
function setConnectedUser(users){
    if(users.length > 0){
        const connectedUsersBlock = document.querySelector("#connectedUsers");
        const userList = connectedUsersBlock.querySelector("ul");
        const title = connectedUsersBlock.querySelector("h2");
        connectedUsers = users;
        let html = "";
        connectedUsers.forEach( user =>{
            html += `
                <li>
                    <span class="connectionStatus ${user.connected ? 'connected' : 'disconnected'}"></span>${user.userName}
                </li>
            `;
        });
        userList.innerHTML = html;
        title.innerHTML = `Usuarios conectados (${users.length})`;
    }
    
}
function updateChat(newChat){
    const chatHTML = document.querySelector("#chat");
    chat = newChat;
    let html = "";
    chat.forEach( element => {
        html += `
            <div>
                ${element.userName}: ${element.message}
            </div>
        `;
    });
    const htmlBefore = chatHTML.innerHTML;
    const htmlAfter = html;
    chatHTML.innerHTML = html;
    if(htmlBefore != htmlAfter){
        chatHTML.scrollTo(0,chatHTML.scrollHeight);
    }
}
function connectedStatus(){
    const connectedUsersBlock = document.getElementById("connectedUsers");
    const connectionStatusHTML = document.getElementById("connectionStatus");
    const connectBtn = document.getElementById("connectBtn");
    const disconnectBtn = document.getElementById("disconnectBtn");
    const userNameInput = document.getElementById("userName");

    connectionStatusHTML.classList.replace("disconnected", "connected");

    disconnectBtn.disabled = false;
    disconnectBtn.style = `
        opacity: 1;
        cursor: pointer;
    `;

    connectBtn.disabled = true;
    connectBtn.style = `
        opacity: .5;
        cursor: default;
    `;

    userNameInput.disabled = true;
    userNameInput.style = `
        opacity: .5;
    `;

    connectedUsersBlock.style.display = "block";
}
function disconnectedStatus(){
    const connectedUsersBlock = document.getElementById("connectedUsers");
    const connectionStatusHTML = document.getElementById("connectionStatus");
    const connectBtn = document.getElementById("connectBtn");
    const disconnectBtn = document.getElementById("disconnectBtn");
    const userNameInput = document.getElementById("userName");

    connectionStatusHTML.classList.replace("connected", "disconnected");

    disconnectBtn.disabled = true;
    disconnectBtn.style = `
        opacity: .5;
        cursor: default;
    `;

    connectBtn.disabled = false;
    connectBtn.style = `
        opacity: 1;
        cursor: pointer;
    `;

    userNameInput.disabled = false;
    userNameInput.style = `
        opacity: 1;
    `;

    connectedUsersBlock.style.display = "none";
}
function lifePulse(){
    setInterval(()=>{
        const data = JSON.stringify({
            operation: 'lifePulse',
            data: {
                userName,
                connected: true
            }
        });
        socket.send(data);
    },100);
}
