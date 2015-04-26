var should = require('should')
var io = require('socket.io-client')
var socketURL = 'http://localhost:3003'

var options = {
  transports: ['websocket'],
  'force new connection': true
}

var player1 = function() { return { id: 'id' + Math.random(), name: 'Alexey', character: 'z' } }
var player2 = function() { return { id: 'id' + Math.random(), name: 'Andrey', character: 'a' } }
var player3 = function() { return { id: 'id' + Math.random(), name: 'Stas', character: 'p' } }
var player4 = function() { return { id: 'id' + Math.random(), name: 'Nastya', character: 'a' } }

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
      var p1 = player1()
      client1.emit('play', p1)
      client1.on('waiting', function() {
        var client2 = io.connect(socketURL, options)
        client2.on('connect', function() {
          var p2 = player2()
          client2.emit('play', p2)
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
      var p1 = player3()
      client1.emit('play', p1)
      client1.on('waiting', function() {
        var client2 = io.connect(socketURL, options)
        client2.on('connect', function() {
          var p2 = player4()
          client2.emit('play', p2)
          client2.on('start', function(msg) {
            msg.first_player.name.should.equal('Stas')
            msg.second_player.name.should.equal('Nastya')
            client1.disconnect()
            client2.disconnect()
            done()
          })
        })
      })
    })
  })

  it('should send tick after start game and second user defence', function(done) {
    var client1 = io.connect(socketURL, options)
    client1.on('connect', function() {
      var p1 = player1()
      client1.emit('play', p1)
      client1.on('waiting', function() {
        var client2 = io.connect(socketURL, options)
        client2.on('connect', function() {
          var p2 = player2()
          client2.emit('play', p2)
          client2.on('start', function(msg) {
            client2.emit('defence_start', { id: p2.id })
            client2.on('tick', function(msg) {
              msg.second_player.id.should.equal(p2.id)
              msg.second_player.name.should.equal('Andrey')
              msg.second_player.action.should.equal('d')
              client2.emit('defence_stop', { id: p2.id })
              client1.disconnect()
              client2.disconnect()
              done()
            })
          })
        })
      })
    })
  })

  it('should send tick after start game and first user attack', function(done) {
    var client1 = io.connect(socketURL, options)
    client1.on('connect', function() {
      var p1 = player1()
      client1.emit('play', p1)
      client1.on('waiting', function() {
        var client2 = io.connect(socketURL, options)
        client2.on('connect', function() {
          var p2 = player2()
          client2.emit('play', p2)
          client1.on('start', function() {
            client1.emit('attack', { id: p1.id })
            client1.on('tick', function(msg) {
              msg.first_player.id.should.equal(p1.id)
              msg.first_player.name.should.equal('Alexey')
              msg.first_player.mana.should.be.below(100)
              msg.first_player.health.should.equal(100)
              msg.second_player.health.should.be.below(100)
              msg.second_player.name.should.equal('Andrey')
              msg.second_player.mana.should.equal(100)
              client1.disconnect()
              client2.disconnect()
              done()
            })
          })
        })
      })
    })
  })
})