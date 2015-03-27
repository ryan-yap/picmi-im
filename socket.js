var redis = require('redis'),
    client = redis.createClient()

var proximity = require('geo-proximity').initialize(client)

var app = require('http').createServer()
var io = require('socket.io')(app);
var count = 0
app.listen(8080);

io.on("connection", function(socket){
    console.log("new connection")
    socket.on("ping", function(data) {
      info = data.split(":")
      proximity.addLocation(parseFloat(info[1]), parseFloat(info[2]), info[0], function(err, reply){
        if(err) console.error(err)
        else console.log("added " + reply + " location:" + info)
        return
      })
    });

    socket.on("test", function(data) {
      if (data == "test"){
        count++;
        console.log(count)
      }
    })

    socket.on("disconnect", function() {
      return
    });
  });