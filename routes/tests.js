var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/leadb');

var db = mongoose.connection;

var machineSchema = new mongoose.Schema({
	name: String,
	alias: String,
	mac: String,
	IP: String,
	type: String
});

var leoSchema = mongoose.Schema({
	name:String,
	room:String,
	machines: [machineSchema]

});


var roomSchema = mongoose.Schema({
	name: String,
	newMachines: [{	
		mac: String,
		date: { type: Date, default: Date.now }
	}],
	sw_name: String,
	port_id: Number
});

var Leo = mongoose.model('User', leoSchema);
var Room = mongoose.model('Room', roomSchema);

exports.findById = function(req, res) {
  var id = req.params.id;
  console.log('Retrieving leo: ' + id);
  Leo.findById(id, 'name', function (err, leo) {
  	!err ? res.send(leo) : console.log(err);
  });
};

exports.addMachine = function(req, res) {
	var device = req.body;
	console.log('New machine:' + JSON.stringify(device));
	var machine = {mac: device['mac']};
	Room.findOneAndUpdate({sw_name: device['sw'], port_id: device['id'],"newMachines.mac":device['mac']},{$set: {"newMachines.$.date": Date.now()}}, function(err, room)
		{
			if(!room) {
				Room.findOne({sw_name: device['sw'], port_id: device['id']}, function(err, room) {
					room.newMachines.push(machine);
					console.log(room.newMachines);
					room.save();
			});
			}
		});
	
	res.send('ok');
};
db.on('error', console.error.bind(console,'connection error'));
db.once('open', function() {

});

