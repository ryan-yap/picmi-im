var app = require('http').createServer()
var io = require('socket.io')(app);

app.listen(8080);

io.on('connection', function (socket) {
  console.log("New Connection")
  socket.on('ping', function (data) {
    console.log(data);
  });
});