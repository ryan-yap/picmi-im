var dispatch_db = require('mongoskin').db('mongodb://54.153.62.38:27017/Dispatch');
var ObjectID = require('mongoskin').ObjectID

var app = require('http').createServer()
var io = require('socket.io')(app);
app.listen(8080);

function connection(uid, socket_id) {
  this.socket_id = socket_id;
  this._id = uid
}

io.on("connection", function(socket){
    connection_made++;
    console.log("New connection")
    socket.on("setID", function(data) {
      var socket_id = socket.id;
      var uid = data
      new_connection = connection(uid, socket_id)
      dispatch_db.collection('connection').insert(new_connection, function(err, result) {
        if (err){ 
          throw err; 
        }
        console.log(result[0])
      });
      console.log(data)
    });

    socket.on("send", function(data){
      info = data.split(":");
      dispatch_db.collection('connection').find({_id:ObjectID(info[0])}).toArray(
        function(err, result) {
          console.log(result)
          io.sockets.connected[result].emit("receive", info[1]);
          console.log(data)
        }
      );
    })

    socket.on("driverrequest", function(data){
      info = data.split(":");
      var driver_id = info[0]
      var message = info[1]
      var distance = info[2]
      var longitude = info[3]
      var latitude = info[4]
      var image_url = info[5]
      dispatch_db.collection('connection').find({_id:ObjectID(info[0])}).toArray(
        function(err, result) {
          io.sockets.connected[result].emit("photorequest", data);
        }
      );
    })

    socket.on("submitphoto", function(data){
      info = data.split(":");
      var user_id = info[0]
      var message = info[1]
      var image_url = info[2]

      dispatch_db.collection('connection').find({_id:ObjectID(info[0])}).toArray(
        function(err, result) {
          io.sockets.connected[result].emit("photoready", data);
        }
      );
    })

    socket.on("test", function(data) {
      if (data == "test"){
        count++;
        console.log("received messaged", count)
        console.log("connection_made", connection_made)
      }
    })

    socket.on("disconnect", function() {
      dispatch_db.collection('connection').remove({socket_id:socket.id}, function(err, result) {
        if (!err) console.log('Deleted', result);
      });
      return
    });
  });
