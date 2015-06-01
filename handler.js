var dispatch_db = require('mongoskin').db('mongodb://54.153.62.38:27017/Dispatch');
var ObjectID = require('mongoskin').ObjectID
var redis = require('redis'),
client = redis.createClient(6379, '54.67.18.228', {})
var proximity = require('geo-proximity').initialize(client)

function connection(uid, socket_id) {
  this.socket_id = socket_id;
  this._id = uid
}

function Handler(data, socket) {
	this.h_data = data
	this.socket = socket
}

Handler.prototype.setID = function () {
	var socket_id = this.socket.id;
	var uid = this.h_data
	new_connection = new connection(uid, socket_id)
	console.log("Setting ID")
	dispatch_db.collection('connection').save(new_connection, function(err, result) {
		if (err){ 
			throw err; 
		}
		console.log("setID","+++",data)
	});

	dispatch_db.collection('buffer_event').find({uid:uid}).toArray(
		function(err, result) {
			console.log(result)  
		}
	); 
}

module.exports = Handler;