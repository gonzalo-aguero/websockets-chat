# GMA chat

## What is it?
It's a simple group chat.
For the development I used Node JS, Express and WebSockets.

## For view this web application
[Click here](https://gma-chat.herokuapp.com/)

## For install this web application in your computer

### Clone the repository
~~~
git clone https://github.com/gonzalo90fa/gma-chat.git
~~~
### Navigate to cloned repository folder.
~~~
cd gma-chat
~~~
### Go to ./public/app.js and change const developmentMode to "true";
~~~
1 const developmentMode = false; // Line number 1
2 var userName = null;
3 var socket;
4 var connectedUsers = [];
5 var notify = true;
~~~

### Initialize the server.
~~~
npm start
~~~
Now go to [http://localhost:3000/](http://localhost:3000/)
