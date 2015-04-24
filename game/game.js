var Game = function (io) {
  var $game = this

  this.init_io = function() {
    io.on('connection', function(socket) {
      socket.on('disconnect', function() { })
      console.log('a user connected')
    })
  }

  this.start = function() {

  }
}

module.exports = Game
