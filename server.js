const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const ACTIONS = require('./src/components/Actions');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server,{
   cors:{
      origin:[
         "http://localhost:3000/",
         "http://admin.socket.io/",
      ],
      methods:["GET","POST"],
   },
});

app.use(express.static('build'));

app.use((req,res,next)=>{
   res.sendFile(path.join(__dirname,'build','index.html')); 
});

const userSocketMap = {};
function getAllConnectedClients(meetingId) {
   return Array.from(io.sockets.adapter.rooms.get(meetingId) || []).map(
      (socketId) => {
         return {
            socketId,
            username: userSocketMap[socketId],
         };
      }
   );
}

io.on('connection', (socket)=>{
   socket.on(ACTIONS.JOIN, ({ meetingId, username }) => {
      userSocketMap[socket.id] = username;
      socket.join(meetingId);
      const clients = getAllConnectedClients(meetingId);
      clients.forEach(({ socketId }) => {
         io.to(socketId).emit(ACTIONS.JOINED, {
            clients,
            username,
            socketId: socket.id,
         });
      });
   });

   socket.on(ACTIONS.CODE_CHANGE, ({ meetingId, code }) => {
      socket.in(meetingId).emit(ACTIONS.CODE_CHANGE, { code });
   });

   socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
      io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
   });

   socket.on('disconnecting', () => {
      const rooms = [...socket.rooms];
      rooms.forEach((meetingId) => {
         socket.in(meetingId).emit(ACTIONS.DISCONNECTED, {
            socketId: socket.id,
            username: userSocketMap[socket.id],
         });
      });
      delete userSocketMap[socket.id];
      socket.leave();
   });

});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));