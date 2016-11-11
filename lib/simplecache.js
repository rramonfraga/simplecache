"use strict"

const net = require('net');

var server = net.createServer(handleConnection)
server.listen(11311);
var simplecache = {};


function handleConnection(socket) {
  new SocketServer(socket);
}

function SocketServer(socket) {
  socket.write('Welcome to simplecache!\r\n');
  this.socket = socket;
  socket.on('data', (data) => { this.handle(data) });
}

SocketServer.prototype.handle = function(data) {
  var message = data.toString().trim().split(" ");
  var operation = message.shift();
  var key = message.shift();
  var value = message.join(" ");
  switch (operation) {
    case "set":
      if (value == null || value == "") { this.socket.write('ERROR\r\n'); break; }
      simplecache[key] = value;
      this.socket.write('STORED\r\n');
      break;
    case "get":
      if (value != "") { this.socket.write('ERROR\r\n'); break; }
      if (simplecache[key] != undefined) {
        var value = simplecache[key]
        this.socket.write(`VALUE ${key} ${value}\r\n`);
      }else { this.socket.write('END\r\n'); }
      break;
    case "delete":
      if (value != "") { this.socket.write('ERROR\r\n'); break; }
      if (simplecache[key] != null) {
        delete simplecache[key];
        this.socket.write('DELETED\r\n');
      }else { this.socket.write('NOT FOUND\r\n'); }
      break;
    case "quit":
      if (key == undefined) {
        this.socket.end();
      }else{
        this.socket.write('ERROR\r\n')
      }
      break;
    default:
      this.socket.write('ERROR\r\n');
  }
}
