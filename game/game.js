var TICK_PER_SECOND   = 30,
    MANA_PER_TICK     = 1,
    ATTACK_RATE       = 1,
    DEFAULT_HEALTH    = {'z': 150, 'a': 100, 'p': 100} // количество единиц здоровья
    DEFAULT_MANA      = {'z': 100, 'a': 150, 'p': 100} // количество единиц маны
    DEFAULT_DAMAGE    = {'z': 20,  'a': 20,  'p': 30}  // урон врагу
    DEFAULT_MANA_RATE = {'z': 55,  'a': 50,  'p': 40}  // отребление маны за атаку
    DEFAULT_DAMAGE_DEFENCE = {'z': 0.7, 'a': 0.6,  'p': 0.5} // коэффициент урона для персонажа в состоянии защиты


// Player

var Player = function(init, socket) {
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
  this.attack_timer = 0
  this.socket = socket
}

Player.prototype.is_dead = function() {
  return this.health < 1
}

Player.prototype.defence = function() {
  this.action = 'd'
}

Player.prototype.defence_off = function() {
  if(this.in_defence())
    this.action = 'n'
}

Player.prototype.in_defence = function() {
  return this.action == 'd'
}

Player.prototype.calc_damage_coeff = function() {
  return this.in_defence() ? DEFAULT_DAMAGE_DEFENCE[this.character] : 1
}

Player.prototype.can_attack = function() {
  return this.mana >= DEFAULT_MANA_RATE[this.character] && this.attack_timer == 0
}

Player.prototype.attack = function(player) {
  console.log('Player attack started')
  if(this.can_attack()) {
    console.log('Player can attack')
    this.action = 'a'
    this.attack_timer = ATTACK_RATE
    this.mana -= DEFAULT_MANA_RATE[this.character]
    player.health -= DEFAULT_DAMAGE[this.character] * player.calc_damage_coeff()
    console.log('Player after attack log: ' + JSON.stringify(this.to_json()))
    console.log('Enemy player after attack log: ' + JSON.stringify(player.to_json()))
  }
}

Player.prototype.stop_battle = function() {
  if(this.battle) {
    this.battle.stopped_by_player(this)
  }
}

Player.prototype.tick = function() {
  this.mana < DEFAULT_MANA[this.character] ? this.mana += MANA_PER_TICK : this.mana = DEFAULT_MANA[this.character]
  if(this.attack_timer > 0) {
    this.attack_timer--
    this.action = 'a'
  }
  else {
    if(!this.in_defence())
      this.action = 'n'
  }
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

var Battle = function(io, room_name, first_player, second_player) {
  if (!(this instanceof Battle)) {
    return new Battle(io, room_name, first_player, second_player)
  }
  this.io = io
  this.room_name = room_name
  this.first_player = first_player
  this.second_player = second_player
  this.loop_handler = null

  this.first_player.battle = this
  this.second_player.battle = this
}

Battle.prototype.find_by_id = function(id) {
  return this.first_player.id == id ? this.first_player : this.second_player
}

Battle.prototype.find_not_id = function(id) {
  return this.first_player.id == id ? this.second_player : this.first_player
}

Battle.prototype.stop = function() {
  clearInterval(this.loop_handler)
}

Battle.prototype.stopped_by_player = function(fooled_player) {
  this.stop()
  var json = { id: this.find_not_id(fooled_player.id).id }
  this.io.emit('end', json)
  this.logger('end battle, sended: ' + JSON.stringify(json))
  this.first_player.socket.leave(this.first_player.id)
  this.second_player.socket.leave(this.first_player.id)
}

Battle.prototype.logger = function(message) {
  console.log('battle logger: ' + message)
}

Battle.prototype.loop = function() {
  if(this.first_player) {
    if(this.first_player.is_dead()) {
      this.stopped_by_player(this.first_player)
    }
    this.first_player.tick()
  }
  if(this.second_player) {
    if(this.second_player.is_dead()) {
      this.stopped_by_player(this.second_player)
    }
    this.second_player.tick()
  }
  this.io.sockets.in(this.room_name).emit('tick', this.to_json())
}

Battle.prototype.to_json = function() {
  return { first_player: this.first_player.to_json(), second_player: this.second_player.to_json() }
}

Battle.prototype.start = function() {
  var io = this.io, $battle = this
  
  io.sockets.in(this.room_name).emit('start', this.to_json())

  // Event Out
  var out_function = function(msg) {
    $battle.logger('player out')
    $battle.stopped_by_player($battle.find_by_id(msg.id))
  }
  this.first_player.socket.on('out', out_function)
  this.second_player.socket.on('out', out_function)

  // Event Attack
  var attack_function = function(msg) {
    $battle.logger('player attack')

    var attacker = $battle.find_by_id(msg.id),
        attacked = $battle.find_not_id(msg.id)

    attacker.attack(attacked)
    io.sockets.in($battle.room_name).emit('tick', $battle.to_json())
    $battle.logger('send ' + JSON.stringify($battle.to_json()))
  }
  this.first_player.socket.on('attack', attack_function)
  this.second_player.socket.on('attack', attack_function)

  // Event Defence Start
  var defence_start_function = function(msg) {
    $battle.logger('player defence start')

    var player = $battle.find_by_id(msg.id)

    player.defence()
    io.sockets.in($battle.room_name).emit('tick', $battle.to_json())
    $battle.logger('send ' + JSON.stringify($battle.to_json()))
  }
  this.first_player.socket.on('defence_start', defence_start_function)
  this.second_player.socket.on('defence_start', defence_start_function)

  // Event Defence Stop
  var defence_stop_function = function(msg) {
    $battle.logger('player defence stop')

    var player = $battle.find_by_id(msg.id)

    player.defence_off()
    io.sockets.in($battle.room_name).emit('tick', $battle.to_json())
    $battle.logger('send ' + JSON.stringify($battle.to_json()))
  }
  this.first_player.socket.on('defence_stop', defence_stop_function)
  this.second_player.socket.on('defence_stop', defence_stop_function)

  this.loop_handler = setInterval(function() { $battle.loop() }, 1000 / TICK_PER_SECOND)
  this.logger('battle started')
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

  io.sockets.on('connection', function(socket) {
    logger('a user connected')
    var player = null

    socket.on('disconnect', function() {
      logger('user disconnected')
      if(player) {
        player.stop_battle()
        remove(players, player)
      }
    })

    socket.on('play', function(msg) {
      logger('user wants to play')
      player = new Player(msg, socket)
      if(players.length > 0) {
        var first_player = players.pop(), second_player = player
        var room_name = first_player.id
        socket.join(room_name)
        var battle = new Battle(io, room_name, first_player, second_player)
        battles.push(battle)
        battle.start()
      }
      else {
        logger('queue not full, player waiting...')
        players.push(player)
        socket.join(player.id)
        io.sockets.to(player.id).emit('waiting')
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