var Game = function(io) {
  this.io = io

  if (!(this instanceof Game)) {
    return new Game(io)
  }
}

Game.prototype.init_io = function() {
  this.io.on('connection', function(socket) {
    socket.on('disconnect', function() { })
    console.log('a user connected')
  })
}

Game.prototype.start = function() {
  this.init_io()
}

module.exports = Game