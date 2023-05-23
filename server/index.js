const express = require('express')
const app = express();
const PORT = process.env.PORT || 5000;
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors');

app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: 'https://socketchat-8g9k.netlify.app',
        methods: ["GET", "POST"]
    }
})

server.listen(PORT, ()=>{
    console.log("listening on "+PORT)
})

const messages = [];
let userCount = 0;
const userNames = [];

io.on("connect", (socket) => {
    console.log("established new connection");
    console.log(io.engine.clientsCount, "users connected.")
    io.emit("update usernames", [...userNames])
    
    socket.on("join lobby", (name)=>{
        socket.data.userName = [name];
        messages.push({user: '', msg: `${socket.data.userName[0]} has entered the chat`});
        io.emit("update", [...messages], io.engine.clientsCount);
        socket.data.userName.unshift(name);
        userNames.push(name);
        io.emit("update usernames", [...userNames])
    })
    socket.on("msg", (incoming)=>{
        messages.push({user: socket.data.userName[0], msg: incoming});
        messages.length >= 50 ? messages.shift() : null;
        io.emit("update", [...messages], io.engine.clientsCount);
    })
    socket.on("change username", (newName) => {
        messages.push({user: '', msg: `${socket.data.userName[0]} changed name to ${newName}`});
        io.emit("update", [...messages], io.engine.clientsCount)
        socket.data.userName.unshift(newName);
        userNames.push(newName);
        io.emit("update usernames", [...userNames])
    })
    socket.on("erase names", (names) => {
        for (let name of names) {
            userNames.splice(userNames.indexOf(name), 1);
        }
        io.emit("update usernames", [...userNames])
    })
    socket.on("disconnect", ()=>{
        console.log(io.engine.clientsCount, "users connected.")
        if (io.engine.clientsCount === 0) {
            for (let i=0; i<messages.length; i++) {
                messages.pop();
            }
            for (let i=0; i<userNames.length; i++) {
                userNames.pop();
            }
            userCount = 0;
        } else {
            if (socket.data.hasOwnProperty('userName')) {
                messages.push({user: '', msg: `${socket.data.userName[0]} has left the chat`});
                io.emit("update", [...messages], io.engine.clientsCount)
                for (let name of socket.data.userName) {
                    userNames.splice(userNames.indexOf(name), 1)
                }
                io.emit("update usernames", [...userNames])
            }
            
        }
        
        
    })
        
})