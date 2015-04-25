// Player

var Player = function(init) {
  if (!(this instanceof Player)) {
    return new Player(init)
  }
  this.id = init.id
  this.name = init.name
  this.character = init.character
  this.health = 100
  this.mana = 100
  this.action = 'n'
}

// Battle

var Battle = function(io, first_player, second_player) {
  if (!(this instanceof Battle)) {
    return new Battle(init)
  }
  this.io = io
  this.first_player = first_player
  this.second_player = second_player
}

Battle.prototype.logger = function(message) {
  console.log('battle logger: ' + message)
}

Battle.prototype.start = function() {
  this.logger('battle started')
  var io = this.io

  io.emit('start', { first_player: first_player, second_player: second_player })

  io.on('out', function(msg) {

  })

  io.on('attack', function(msg) {

  })

  io.on('defence_start', function(msg) {

  })

  io.on('defence_stop', function(msg) {

  })
}

// Game

var Game = function(io) {
  if (!(this instanceof Game)) {
    return new Game(io)
  }
  this.io = io
  this.players = []
  this.battles = []
  this.debug_mode = true
}

Game.prototype.logger = function(message) {
  this.debug_mode && console.log('game logger: ' + message)
}

Game.prototype.init_io = function() {
  var io = this.io,
      players = this.players,
      logger = this.logger,
      debug = this.debug,
      battles = this.battles

  io.on('connection', function(socket) {
    logger('a user connected')

    socket.on('disconnect', function() { logger('user disconnected') })

    socket.on('play', function(msg) {
      logger('user wants to play')
      logger(msg)
      var player = new Player(msg)
      if(players.length > 0) {
      	var first_player = players.pop(), second_player = player
      	var room_name = first_player.id
      	socket.join(room_name)
      	var battle = new Battle(io.to(room_name), first_player, second_player)
      	battles.push(battle)
      	battle.start()
      }
      else {
      	logger('queue not full, player waiting...')
      	socket.join(player.id)
      	io.to(player.id).emit('waiting')
      }
    })
  })
}

Game.prototype.start = function() {
  this.init_io()
  this.logger('game started')
}

module.exports = Game