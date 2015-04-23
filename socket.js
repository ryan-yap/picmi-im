var dispatch_db = require('mongoskin').db('mongodb://54.153.62.38:27017/Dispatch');
var ObjectID = require('mongoskin').ObjectID

var redis = require('redis'),
    client = redis.createClient(6379, '54.67.18.228', {})
var proximity = require('geo-proximity').initialize(client)
var app = require('http').createServer()
var io = require('socket.io')(app);
app.listen(8080);

function connection(uid, socket_id) {
  this.socket_id = socket_id;
  this._id = uid
}

io.on("connection", function(socket){
    console.log("New connection")
    socket.on("setID", function(data) {
      var socket_id = socket.id;
      var uid = data
      new_connection = new connection(uid, socket_id)
      dispatch_db.collection('connection').save(new_connection, function(err, result) {
        if (err){ 
          throw err; 
        }
        console.log(result[0])
      });
    });

    socket.on("send", function(data){
      info = data.split(":");
      dispatch_db.collection('connection').find({_id:info[0]}).toArray(
        function(err, result) {
          console.log(result[0])
          io.sockets.connected[result[0].socket_id].emit("receive", info[1]);
          console.log(data)
        }
      );
    })

    socket.on("driverrequest", function(data){
      info = data.split(":!$)$@)!$:");
      console.log(data)
      var driver_id = info[0]
      console.log(info[0])
      //Need Error Handling
      dispatch_db.collection('connection').find({_id:info[0]}).toArray(
        function(err, result) {
	        console.log(result)
          io.sockets.connected[result[0].socket_id].emit("photorequest", data);
        }
      );
    })

    socket.on("driverresponse", function(data){
      info = data.split(":!$)$@)!$:");
      console.log(data)
      var driver_id = info[0]
      console.log(info[0])
      //Need Error Handling
      dispatch_db.collection('connection').find({_id:info[0]}).toArray(
        function(err, result) {
          console.log(result)
          io.sockets.connected[result[0].socket_id].emit("photoready", data);
        }
      );
    })

    socket.on("acceptrequest", function(data){
      var requester_id = data
      dispatch_db.collection('connection').find({_id:requester_id}).toArray(
        function(err, result) {
          console.log(result)
          io.sockets.connected[result[0].socket_id].emit("requestconfirmation", data);
        }
      );
    })

    socket.on("submitphoto", function(data){
      info = data.split(":");
      var user_id = info[0]
      var message = info[1]
      var image_url = info[2]

      dispatch_db.collection('connection').find({_id:info[0]}).toArray(
        function(err, result) {
          io.sockets.connected[result[0].socket_id].emit("photoready", data);
        }
      );
    })

    socket.on("test", function(data) {
        console.log("received messaged")
    })

    socket.on("disconnect", function() {
      dispatch_db.collection('connection').find({socket_id:socket.id}).toArray(
        function(err, result) {
		if(result[0]){
        		proximity.removeLocation(result[0]._id, function(err, reply){
            			if(err) console.error(err)
            			else console.log('removed location:', reply)
          		})
		}else{
			console.log("No disconnecting socket id found!")
		}
        }
      );
      dispatch_db.collection('connection').remove({socket_id:socket.id}, function(err, result) {
        if (!err) console.log('Deleted', result);
      });
      return
    });
  });
