"use strict"
const net = require('net');
var testing = require('testing');


function Client(host, port) {
  this.host = host;
  this.port = port;
}

Client.prototype.connect = function(callback) {
  this.socket = net.connect(this.port, this.host, () => {
    this.socket.once('data', (data) => {
      console.log('Started: %s', data);
      return callback(null);
    });
  });
};

Client.prototype.disconnect = function(callback) {
  this.socket.end(callback);
}


Client.prototype.set = function(key, value, callback) {
  this.socket.write('set ' + key + ' ' + value + '\r\n');
  this.socket.once('data', (data) => {
    var result = String(data);
    console.log('Set %s', data);
    return callback(null);
  });
};

Client.prototype.get = function(key, callback) {
  this.socket.write('get ' + key + '\r\n');
  this.socket.once('data', (data) => {
    var result = String(data);
    if (result == 'END')
    {
      console.log(result);
      return callback(null, null);
    }
    console.log('Get: %s', result);
    return callback(null, result);
  });
};
Client.prototype.delete = function(key, callback) {
  this.socket.write('delete ' + key + '\r\n');
  this.socket.once('data', (data) => {
    var result = String(data);
    if (result == 'NOT FOUND')
    {
      console.log(result);
      return callback(null, null);
    }
    console.log('Delete: %s',result);
    return callback(null, result);
  });
};


function testClient(callback) {
  var client = new Client('192.168.1.60', 11311);
  client.connect( (error) => {
    testing.check(error, 'No connection', callback);
    client.get('foo2', (error, result) => {
      testing.check(error, 'Get key that not exists', callback);
      client.set('foo', 'bar', (error) => {
        testing.check(error, 'No set key value', callback);
        client.get('foo', (error, result) => {
          testing.check(error, 'No get key', callback);
          //testing.equals(result, '  => VALUE foo bar\r\n', "key match value", callback);
          client.set('foo', 'bar2', (error) => {
            client.get('foo', (error, result) => {
              //testing.equals(result, '  => VALUE foo bar2\r\n', "key match value", callback);
              client.delete('foo2', (error) => {
                testing.check(error, 'Delete key that not exist', callback);
                client.delete('foo', (error) => {
                  testing.check(error, 'No delete key', callback);
                  client.disconnect(callback, (error) => {
                    testing.check(error, 'No disconnect', callback);
                    testing.success(callback);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

/**
* Run package tests.
*/
exports.test = function(callback)
{
  var tests = [
    testClient
  ];
  testing.run(tests, callback);
};

// run tests if invoked directly
if (__filename == process.argv[1])
{
  exports.test(testing.show);
}
