const express = require("express");
const app = express();
let server;
let port;
const http = require("http");
server = http.createServer(app);
port = 3434;
const io = require("socket.io")(server);
const room_service = require("./room_service")(io);
const log = require("./log");

io.sockets.on("connection", room_service.listen);
io.sockets.on("error", e => console.log(e));

app.use(express.static(__dirname + "/public"));
app.get("*", (req, res) => {
  log.info(req.headers)
  res.sendFile(`${__dirname}/public/index.html`);
});

server.listen(port, () => console.log("\n \t   - Server running on port: ", port + "\n"));
