var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/leadb');

var db = mongoose.connection;
mongoose.set('debug', true);

var machineSchema = new mongoose.Schema({
	name: String,
	alias: String,
	mac: String,
	IP: String,
	type: String,
	n: Number
});

var leoSchema = mongoose.Schema({
	login: String,
	firstName: String,
	lastName: String,
	room: String,
	promo: String,
	mail: String,
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

var Leo = mongoose.model('Leo', leoSchema);
var Room = mongoose.model('Room', roomSchema);


exports.searchLeo = function(req, res) {
  var name = req.query.name;
  var room = req.query.room;
  var machine = req.query.machine;
  Leo.find({login:{$regex: name, $options: 'i'}},'login lastName firstName room').limit(20).sort('login').exec(function(err,results) {
  	res.send(results);
  });
}
exports.findById = function(req, res) {
  var id = req.params.id;
  console.log('Retrieving leo: ' + id);
  Leo.findById(id, function (err, leo) {
  	!err ? res.send(leo) : console.log(err);
  });
};
exports.addLeo = function(req, res) {
	var leo = req.body;
	Leo.create(leo, function(err, leo) {
		console.log('Adding Leo' + JSON.stringify(leo));
		err ? res.send(400, {'error':'when adding leo'}) : res.send(leo);
	});
}
exports.deleteLeo = function(req, res) {
	var id = req.params.id;
	console.log('Deleting Leo '+ id );
	Leo.findByIdAndRemove(id, function(err) {
		err ? res.send(400, {'error':'when deleting leo'}) : res.send(req.body);
	});
}

exports.updateLeo = function(req, res) {
	var id = req.params.id;
	var leo = req.body;
	console.log('Updating Leo ' + id);
	Leo.findByIdAndUpdate(id, leo, function(err) {
		err ? res.send(400, {'error':'when updating leo'}) : res.send(leo);
	});
}

exports.addMachine = function(req, res) {
	var id = req.params.id;
	var machine = req.body;
	Leo.findById(id).ne('machines.mac',machine.mac).exec(function(err, leo) {
		if(leo) {

			if( !leo.machines || leo.machines.length > 5) return res.send(400, {'error':'too many machines'});
			
			leo.machines.length  ? machine.name = 'l'+leo.room.toLowerCase()+'-'+(leo.machines.length +1) : machine.name = 'l'+leo.room.toLowerCase();
			leo.machines.push(machine);
			console.log(machine._id);
			leo.save(function(err,leo) {

				res.send(leo.machines[leo.machines.length - 1]);
			});
				
		}
		else res.send(400, {'error':'when adding machine'});
	});
}
exports.findMachineById = function(req, res) {
	var owner = req.params.owner;
	var id = req.params.id;

	Leo.findById(owner, function(err, leo) {
		var machine = leo.machines.id(id);
		console.log(machine);
		leo.save();
		res.send(machine);
		
	});
}
exports.updateMachine = function(req, res) {
	var id = req.params.id;
	var id_machine = req.params.id_machine;
	var machine = req.body;
	Leo.findById(id).exec(function(err, leo) {
		if(leo) {
			var machine = leo.machines.id(id_machine);
			machine.alias = req.body.alias;
			machine.mac = req.body.mac;
			leo.save();
			res.send(machine);
		}
		else send(400, {'error':'while updating machine'});
	});
}
exports.deleteMachine = function(req, res) {
	var id = req.params.id;
	var id_machine = req.params.id_machine;
	Leo.findById(id).exec(function(err, leo) {
		machine = leo.machines.id(id_machine);
		if(leo.machines.length == 1) machine.remove();
		else {if(parseInt(/-(\d)/.exec(machine.name)[1]) < leo.machines.length) return res.send(400, {'error':'wrong machine'});
}
		machine.remove();
		leo.save(function (err) {
  			err ? console.log('error deleting machine'): res.send(req.body);
		});
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


