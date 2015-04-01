var redis = require('redis'),
    client = redis.createClient()

var app = require('http').createServer()
var io = require('socket.io')(app);
var count = 0
var connection_made = 0
app.listen(8080);

io.on("connection", function(socket){
    connection_made++;
    console.log("New connection")
    socket.on("setID", function(data) {
      var socket_id = socket.id;
      client.set(data, socket_id, function(err) {
        if (err) throw err;
      });
      console.log(data)
    });

    socket.on("send", function(data){
      info = data.split(":");
      client.get(info[0], function (err, result) {
          console.log(result)
          io.sockets.connected[result].emit("receive", info[1]);
          console.log(data)
      });
    })

    socket.on("driverrequest", function(data){
      info = data.split(":");
      var driver_id = info[0]
      var message = info[1]
      var distance = info[2]
      var longitude = info[3]
      var latitude = info[4]
      var image_url = info[5]
      client.get(info[0], function (err, result) {
          io.sockets.connected[result].emit("photorequest", data);
      });
    })

    socket.on("test", function(data) {
      if (data == "test"){
        count++;
        console.log("received messaged", count)
        console.log("connection_made", connection_made)
      }
    })

    socket.on("disconnect", function() {
      return
    });
  });
