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
      console.log("setID","+++",data)
    });
  });

  socket.on("send", function(data){
  info = data.split(":!$)$@)!$:");
    dispatch_db.collection('connection').find({_id:info[0]}).toArray(
      function(err, result) {
        if(result[0]){
          console.log("send","+++",data)
          io.sockets.connected[result[0].socket_id].emit("receive", data);
        }else{
          proximity.removeLocation(info[0], function(err, reply){
            if(err) console.error(err)
              else console.log("send", "+++",'removed location:', reply)
            })
          dispatch_db.collection('connection').remove({socket_id:info[0]}, function(err, result) {
            if (!err) console.log("send","+++", 'Deleted', result);
          });
        }
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
          if(result[0]){
            console.log("driverrequest","+++",data)
           io.sockets.connected[result[0].socket_id].emit("photorequest", data);
         }else{
          
          var temp_list = []
          temp_list.push(info[1])
          temp_list.push(info[0])
          temp_list.push(info[4])
          var msg = temp_list.join(":!$)$@)!$:")
          io.sockets.connected[socket.id].emit("requestdeclined", msg);

          proximity.removeLocation(info[0], function(err, reply){
            if(err) console.error(err)
              else console.log("driverrequest","+++",'removed location:', reply)
            })
          dispatch_db.collection('connection').remove({socket_id:info[0]}, function(err, result) {
            if (!err) console.log("driverrequest","+++",'Deleted', result);
          });
        }
      }
      );
    })

  socket.on("cancelrequest", function(data){
    info = data.split(":!$)$@)!$:");
    console.log(data)
    var driver_id = info[0]
    console.log(info[0])
      //Need Error Handling
      dispatch_db.collection('connection').find({_id:info[0]}).toArray(
        function(err, result) {
          if(result[0]){
            console.log("cancelrequest","+++",data)
            io.sockets.connected[result[0].socket_id].emit("jobcancelled", data);
         }else{
          proximity.removeLocation(info[0], function(err, reply){
            if(err) console.error(err)
              else console.log("cancelrequest","+++",'removed location:', reply)
            })
          dispatch_db.collection('connection').remove({socket_id:info[0]}, function(err, result) {
            if (!err) console.log("cancelrequest","+++",'Deleted', result);
          });
        }
      }
      );
    })

  socket.on("endtransaction", function(data){
    info = data.split(":!$)$@)!$:");
    console.log(data)
    var driver_id = info[1]
    console.log(info[1])
      //Need Error Handling
      dispatch_db.collection('connection').find({_id:info[1]}).toArray(
        function(err, result) {
          if(result[0]){
           console.log("endtransaction","+++",data)
           io.sockets.connected[result[0].socket_id].emit("transactionended", data);
         }else{
          proximity.removeLocation(info[1], function(err, reply){
            if(err) console.error(err)
              else console.log("endtransaction","+++",'removed location:', reply)
            })
          dispatch_db.collection('connection').remove({socket_id:info[1]}, function(err, result) {
            if (!err) console.log("endtransaction","+++",'Deleted', result);
          });
        }
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
          if(result[0]){
            console.log("driverresponse","+++",data)
            io.sockets.connected[result[0].socket_id].emit("photoready", data);
          }else{
            proximity.removeLocation(info[0], function(err, reply){
              if(err) console.error(err)
                else console.log("driverresponse","+++",'removed location:', reply)
              })
            dispatch_db.collection('connection').remove({socket_id:info[0]}, function(err, result) {
              if (!err) console.log("driverresponse","+++",'Deleted', result);
            });
          }
        }
        );
    })

  socket.on("acceptrequest", function(data){
    info = data.split(":!$)$@)!$:");
    var requester_id = info[0]
    dispatch_db.collection('connection').find({_id:requester_id}).toArray(
      function(err, result) {
        console.log(result)
        if(result[0]){
          console.log("acceptrequest","+++",data)
          io.sockets.connected[result[0].socket_id].emit("requestconfirmation", data);
        }else{
          proximity.removeLocation(requester_id, function(err, reply){
            if(err) console.error(err)
              else console.log("acceptrequest","+++",'removed location:', reply)
            })
          dispatch_db.collection('connection').remove({socket_id:requester_id}, function(err, result) {
            if (!err) console.log("acceptrequest","+++",'Deleted', result);
          });
        }
      }
      );
  })

  socket.on("startstreaming", function(data){
    info = data.split(":!$)$@)!$:");
    var requester_id = info[0]
    dispatch_db.collection('connection').find({_id:requester_id}).toArray(
      function(err, result) {
        console.log(result)
        if(result[0]){
          console.log("startstreaming","+++",data)
          io.sockets.connected[result[0].socket_id].emit("streamstarted", data);
        }else{
          proximity.removeLocation(requester_id, function(err, reply){
            if(err) console.error(err)
              else console.log("startstreaming","+++",'removed location:', reply)
            })
          dispatch_db.collection('connection').remove({socket_id:requester_id}, function(err, result) {
            if (!err) console.log("startstreaming","+++",'Deleted', result);
          });
        }
      }
      );
  })

  socket.on("stopstreaming", function(data){
    info = data.split(":!$)$@)!$:");
    var requester_id = info[0]
    dispatch_db.collection('connection').find({_id:requester_id}).toArray(
      function(err, result) {
        console.log(result)
        if(result[0]){
          console.log("stopstreaming","+++",data)
          io.sockets.connected[result[0].socket_id].emit("streamstopped", data);
        }else{
          proximity.removeLocation(requester_id, function(err, reply){
            if(err) console.error(err)
              else console.log("stopstreaming","+++",'removed location:', reply)
            })
          dispatch_db.collection('connection').remove({socket_id:requester_id}, function(err, result) {
            if (!err) console.log("stopstreaming","+++",'Deleted', result);
          });
        }
      }
      );
  })

  socket.on("declinerequest", function(data){
    info = data.split(":!$)$@)!$:");
    var requester_id = info[0]
    dispatch_db.collection('connection').find({_id:requester_id}).toArray(
      function(err, result) {
        console.log(result)
        if(result[0]){
          console.log("declinerequest","+++",data)
          io.sockets.connected[result[0].socket_id].emit("requestdeclined", data);
        }else{
          proximity.removeLocation(requester_id, function(err, reply){
            if(err) console.error(err)
              else console.log("declinerequest","+++",'removed location:', reply)
            })
          dispatch_db.collection('connection').remove({socket_id:requester_id}, function(err, result) {
            if (!err) console.log("declinerequest","+++",'Deleted', result);
          });
        }
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
        if(result[0]){
          console.log("submitphoto","+++",data)
          io.sockets.connected[result[0].socket_id].emit("photoready", data);
        }else{
          proximity.removeLocation(info[0], function(err, reply){
            if(err) console.error(err)
              else console.log("submitphoto","+++",'removed location:', reply)
            })
          dispatch_db.collection('connection').remove({socket_id:info[0]}, function(err, result) {
            if (!err) console.log("submitphoto","+++",'Deleted', result);
          });
        }
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
