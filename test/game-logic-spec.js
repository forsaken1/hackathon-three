var should = require('should')
var io = require('socket.io-client')
var socketURL = 'http://localhost:3003'

var options = {
  transports: ['websocket'],
  'force new connection': true
}

var player1 = function() { return { id: 'id' + Math.random(), name: 'Alexey', character: 'z' } }
var player2 = function() { return { id: 'id' + Math.random(), name: 'Andrey', character: 'a' } }

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
      client1.connected.should.equal(true)
      client1.emit('play', player1())
      client1.on('waiting', function() {
        client1.disconnect()
        done()
      })
    })
  })

  it('should join two players to the battle', function(done) {
    var client1 = io.connect(socketURL, options)
    client1.on('connect', function() {
      client1.emit('play', player1())
      client1.on('waiting', function() {
        var client2 = io.connect(socketURL, options)
        client2.on('connect', function() {
          client1.connected.should.equal(true)
          client2.connected.should.equal(true)
          client1.disconnect()
          client2.disconnect()
          done()
        })
      })
    })
  })

  it('should get start game event and check first user data', function(done) {
    var client1 = io.connect(socketURL, options)
    client1.on('connect', function() {
      client1.emit('play', player1())
      client1.on('waiting', function() {
        var client2 = io.connect(socketURL, options)
        client2.on('connect', function() {
          client2.emit('play', player2())
          client1.on('start', function(msg) {
            msg.first_player.name.should.equal('Alexey')
            msg.second_player.name.should.equal('Andrey')
            client1.disconnect()
            client2.disconnect()
            done()
          })
        })
      })
    })
  })

  it('should get start game event and check second user data', function(done) {
    var client1 = io.connect(socketURL, options)
    client1.on('connect', function() {
      client1.emit('play', player1())
      client1.on('waiting', function() {
        var client2 = io.connect(socketURL, options)
        client2.on('connect', function() {
          client2.emit('play', player2())
          client2.on('start', function(msg) {
            msg.first_player.name.should.equal('Alexey')
            msg.second_player.name.should.equal('Andrey')
            client1.disconnect()
            client2.disconnect()
            done()
          })
        })
      })
    })
  })
})