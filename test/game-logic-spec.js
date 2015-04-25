var should = require('should')
var io = require('socket.io-client')

var socketURL = 'http://0.0.0.0:3003'

var options = {
  transports: ['websocket'],
  'force new connection': true
}

var player1 = { name: 'Tom' }
var player2 = { name: 'Sally' }

describe("game logic", function() {
  it('should connect to game', function(done) {
  	var client1 = io.connect(socketURL, options)
  	client1.disconnect()
  	done()
  })
})