var TICK_PER_SECOND   = 30,
    MANA_PER_TICK     = 1,
    DEFAULT_HEALTH    = {'z': 100, 'a': 100, 'p': 100} // количество единиц здоровья
    DEFAULT_MANA      = {'z': 100, 'a': 100, 'p': 100} // количество единиц маны
    DEFAULT_DAMAGE    = {'z': 20,  'a': 20,  'p': 20}  // урон врагу
    DEFAULT_MANA_RATE = {'z': 50,  'a': 50,  'p': 50}  // отребление маны за атаку


// Player

var Player = function(init) {
  if (!(this instanceof Player)) {
    return new Player(init)
  }
  this.id = init.id
  this.name = init.name
  this.character = init.character
  this.damage = DEFAULT_DAMAGE[this.character]
  this.mana_rate = DEFAULT_MANA_RATE[this.character]
  this.health_max = DEFAULT_HEALTH[this.character]
  this.health = this.health_max
  this.mana_max = DEFAULT_MANA[this.character]
  this.mana = this.mana_max
  this.action = 'n'
  this.battle = null
}

Player.prototype.stop_battle = function() {
  if(this.battle) {
    this.battle.stopped_by_user(this)
  }
}

Player.prototype.tick = function() {
  this.mana < DEFAULT_MANA ? this.mana += MANA_PER_TICK : this.mana = DEFAULT_MANA
}

Player.prototype.to_json = function() {
  return {
    id: this.id,
    name: this.name,
    character: this.character,
    health: to_persent(this.health, this.health_max),
    mana: to_persent(this.mana, this.mana_max),
    action: this.action
  }
}

// Battle

var Battle = function(io, first_player, second_player) {
  if (!(this instanceof Battle)) {
    return new Battle(io, first_player, second_player)
  }
  this.io = io
  this.first_player = first_player
  this.second_player = second_player
  this.loop_handler = null
}

Battle.prototype.stop = function() {
  clearInterval(this.loop_handler)
}

Battle.prototype.stopped_by_user = function(fooled_user) {
  this.stop()
  this.io.emit('end', { id: fooled_user.id == first_player.id ? second_player.id : first_player.id })
}

Battle.prototype.logger = function(message) {
  console.log('battle logger: ' + message)
}

Battle.prototype.loop = function() {
  this.first_player && this.first_player.tick()
  this.second_player && this.second_player.tick()
}

Battle.prototype.start = function() {
  this.logger('battle started')
  var io = this.io
  var $battle = this

  io.on('out', function(msg) {
    $battle.stopped_by_user(msg.id == first_player.id ? first_player : second_player)
  })

  io.on('attack', function(msg) {

  })

  io.on('defence_start', function(msg) {

  })

  io.on('defence_stop', function(msg) {

  })

  this.loop_handler = setInterval(this.loop, 1000 / TICK_PER_SECOND)
}

// Game

var Game = function(io) {
  if (!(this instanceof Game)) {
    return new Game(io)
  }
  this.io = io
  this.players = []
  this.battles = []
}

Game.prototype.logger = function(message) {
  console.log('game logger: ' + message)
}

Game.prototype.init_io = function() {
  var io = this.io,
      players = this.players,
      logger = this.logger,
      debug = this.debug,
      battles = this.battles

  io.on('connection', function(socket) {
    logger('a user connected')
    var player = null

    socket.on('disconnect', function() {
      logger('user disconnected')
      player.stop_battle()
      remove(players, player)
    })

    socket.on('play', function(msg) {
      logger('user wants to play')
      logger(JSON.stringify(msg))
      player = new Player(msg)
      if(players.length > 0) {
        var first_player = players.pop(), second_player = player
        var room_name = first_player.id
        socket.join(room_name)
        var battle = new Battle(io.to(room_name), first_player, second_player)
        io.to(room_name).emit('start', { first_player: first_player.to_json(), second_player: second_player.to_json() })
        battles.push(battle)
        battle.start()
      }
      else {
        logger('queue not full, player waiting...')
        players.push(player)
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

// Lib

function remove(arr, item) {
  for(var i = arr.length; i--;) {
    if(arr[i] === item) {
      arr.splice(i, 1);
    }
  }
}

function to_persent(cur, max) {
  return parseInt(max / 100 * cur)
}