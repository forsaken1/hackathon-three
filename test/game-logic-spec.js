var should = require('should')
var io = require('socket.io-client')
var socketURL = 'http://localhost:3003'

var options = {
  transports: ['websocket'],
  'force new connection': true
}

var player1 = { id: 'uniqueID1', name: 'Alexey' }
var player2 = { id: 'uniqueID2', name: 'Andrey' }

describe("game logic", function() {
  it('should connect to game', function(done) {
    var client1 = io.connect(socketURL, options)
    client1.on('connect', function() {
      client1.connected.should.equal(true)
      client1.disconnect()
      done()
    })
  })

  it('should create game and waiting', function(done) {
    var client1 = io.connect(socketURL, options)
    client1.on('connect', function() {
      client1.emit('play', player1)
      client1.on('waiting', function() {
        client1.disconnect()
        done()
      })
    })
  })

  it('should join two players to the battle', function(done) {
    var client1 = io.connect(socketURL, options)
    client1.on('connect', function() {
      client1.emit('play', player1)
      client1.on('waiting', function() {
        var client2 = io.connect(socketURL, options)
        client1.disconnect()
        client2.disconnect()
        done()
      })
    })
  })
})