var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/leadb');

var db = mongoose.connection;

var machineSchema = new mongoose.Schema({
	_owner : {type: mongoose.Schema.Types.ObjectId, ref: 'Leo'},
	name : String,
	alias : String,
	mac : String,
	ip : String,
	type : String,
	dateAdded : { type: Date, default: Date.now }
});

var leoSchema = mongoose.Schema({
	login: String,
	firstName: String,
	lastName: String,
	room: String,
	promo: Number,
	machines:[{type: mongoose.Schema.Types.Objectd, ref: 'Machine'}]
});


var Leo = mongoose.model('Leo', leoSchema);
var Machine = mongoose.model('Machine', machineSchema);

exports.findById = function(req, res) {
  var id = req.params.id;
  console.log('Retrieving leo: ' + id);
  Leo.findById(id, function (err, leo) {
  	Machine.find({_owner: leo._id},'mac alias name ip type dateAdded', function(err, machines) {
  		leo.machines = machines;
  		console.log(leo);
  		!err ? res.send(leo) : console.log(err);
  	});
  	
  });
};
exports.addLeo = function(req, res) {
	var leo = req.body;
	console.log(leo);
	Leo.create(leo, function(err, leo) {
		console.log('Adding Leo' + JSON.stringify(leo));
		console.log(err);
		err ? res.send({'error':'when adding leo'}) : res.send(leo);
	});
}
exports.deleteLeo = function(req, res) {
	var id = req.params.id;
	console.log('Deleting Leo '+ id );
	Leo.findByIdAndRemove(id, function(err) {
		err ? res.send({'error':'when deleting leo'}) : res.send({'message':'success'});
	});
}

exports.updateLeo = function(req, res) {
	var id = req.params.id;
	var leo = req.body;
	console.log('Updating Leo ' + id);
	Leo.findByIdAndUpdate(id, leo, function(err) {
		err ? res.send({'error':'when updating leo'}) : res.send({'message':'success'});
	});
}

exports.addMachine = function(req, res) {
	var owner = req.params.id;
	var machine = req.body;
	machine._owner = owner;
	Machine.create(machine, function(err, machine) {
		console.log('Adding Machine' + JSON.stringify(machine));
		err ? res.send({'error':'when adding machine'}) : res.send(machine);
	});
}
exports.updateMachine = function(req, res) {
	var id = req.params.id;
	var machine = req.body;
	Leo.findById(id).new('machines.mac', machine.mac).exec(function(err,leo) {
		if(leo) {
			leo.mac
		}
	});
}

exports.logMachine = function(req, res) {
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

