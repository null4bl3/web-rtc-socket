/**
  @type {SocketIO.Server}
*/
let _io;
const log = require('./log.js');
const MAX_CLIENTS = 2;

/**
  @param {SocketIO.Socket} socket
*/
let listen = socket => {
  const io = _io;
  const rooms = io.nsps["/"].adapter.rooms;

  socket.on("join", room => {
    let numClients = 0;
    if (rooms[room]) {
      numClients = rooms[room].length;
    }
    if (numClients < MAX_CLIENTS) {
      socket.on("ready", () => {
        log.info(`USER JOINED ROOM: ${room}`);
        socket.broadcast.to(room).emit("ready", socket.id);
      });
      socket.on("offer", (id, message) => {
        socket.to(id).emit("offer", socket.id, message);
      });
      socket.on("answer", (id, message) => {
        socket.to(id).emit("answer", socket.id, message);
      });
      socket.on("candidate", (id, message) => {
        socket.to(id).emit("candidate", socket.id, message);
      });
      socket.on("disconnect", () => {
        socket.broadcast.to(room).emit("bye", socket.id);
      });
      socket.join(room);
    } else {
      socket.emit("full", room);
    }
  });
};

/**
  @param {SocketIO.Server} io
*/
module.exports = io => {
  _io = io;
  return { listen };
};
