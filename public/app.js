const developmentMode = true;
var userName = null;
var socket;
var connectedUsers = [];

window.onload = ()=>{
    //Event to connect
    document.getElementById("connectBtn").addEventListener("click", tryConnect);
    //Event to send message
    document.querySelector("#chatForm > input[type=submit]").addEventListener("click",(e)=>{
        e.preventDefault();
        sendMessage();
    });
    //Event to close connection
    document.getElementById("disconnectBtn").addEventListener("click", ()=> socket.close());
    //Event to send message when Enter is pressed.
    document.getElementById("message").addEventListener("keypress", e =>{
        if(e.key === 'Enter'){
            e.preventDefault();
            sendMessage();
        }
    });
}

/**
 * Try to connect to the server.
 */
function tryConnect(){
    try{
        connect();
    }catch(error){
        console.error("Error trying to connect.");
        console.error(error);
        console.log("Retrying...");
        setTimeout(connect, 2000);
    }
}
/**
 * Connect to the server.
 */
function connect(){
    const userNameInput = document.getElementById("userName");
    userName = userNameInput.value;
    if(userName === null || userName === ""){
        userName = prompt("Please, write your name.");
        if(userName === null || userName === ""){
            return;
        }
        userNameInput.value = userName;
    }
    const server = developmentMode ? "ws://192.168.1.23:3000/" : "wss://gma-chat.herokuapp.com/";
    socket = new WebSocket(server);
    socket.onopen = (e)=>{
        connectedStatus();
        const data = JSON.stringify({
            operation: "setConnectedUser",
            data: {
                userName,
                connected: true
            }
        });
        socket.send(data);
        console.log("Connected");
    }
    socket.onmessage = (e)=>{
        const response = JSON.parse(e.data);
        console.log("Message from server:", response);
        switch (response.operation) {
            case 'setConnectedUser':
                setConnectedUser(response.data.connectedUsers);
                break;
            case 'newMessage':
                newMessage(response.data);
                break;
            case 'userAlreadyConnected':
                const user = response.data;
                alert(`User already connected as ${user.userName}.`);
                userName = user.userName;
                document.getElementById("userName").value = userName;
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
        alert("An error has occurred");
        console.error(e)
    }
}
/**
 * Send the message.
 */
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
/**
 * Print the connected users list.
 * @param {Array} users 
 */
function setConnectedUser(users){
    if(users.length > 0){
        const connectedUsersBlock = document.querySelector("#connectedUsers");
        const userList = connectedUsersBlock.querySelector("ul");
        const title = connectedUsersBlock.querySelector("h2");
        connectedUsers = users;
        let html = "";
        connectedUsers.forEach( user =>{
            html += `
                <li class="connectedUser">
                    <span class="connectionStatus ${user.connected ? 'connected' : 'disconnected'}"></span>
                    <span class="userName">${user.userName}</span>
                </li>
            `;
        });
        userList.innerHTML = html;
        title.innerHTML = `Connected users (${users.length})`;
    }
    
}
/**
 * It's executed when there's a new message and prints it.
 * @param {JSON} message 
 */
function newMessage(message){
    const cssClass = message.userName === userName ? 'myMessage' : '';
    const chatHTML = document.querySelector("#chat");
    chatHTML.innerHTML += `
        <div class="${cssClass}">
            ${message.userName}: ${message.message}
        </div>
    `;
    chatHTML.scrollTo(0,chatHTML.scrollHeight);
}
/**
 * Set the DOM status when the client is connected.
 */
function connectedStatus(){
    const connectedUsersBlock = document.getElementById("connectedUsers");
    const connectionStatusHTML = document.getElementById("connectionStatus");
    const connectBtn = document.getElementById("connectBtn");
    const disconnectBtn = document.getElementById("disconnectBtn");
    const userNameInput = document.getElementById("userName");
    document.getElementById("message").focus();

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
/**
 * Set the DOM status when the client is disconnected.
 */
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