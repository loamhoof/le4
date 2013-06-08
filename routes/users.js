var mongo = require('mongodb');

var Server = mongo.Server,
  Db = mongo.Db,
  BSON = mongo.BSONPure;

var server = new Server('localhost',27017,{auto_reconnect: true});

db = new Db('userdb',server,{safe:true});

db.open(function(err, db) {
  if(!err) {
    console.log("Connected to 'userdb' database");
    db.collection('users',{strict:true}, function(err, collection) {
      if(err) {
        console.log("The 'users' collection doesn't exist. Creating it with sample data...");
        populateDB();
      }
    });
  }
});




exports.findAll = function(req, res) {
  var name = req.query.name;
  var room = req.query.room;
  var machine = req.query.machine;
  db.collection('users',function(err, collection) {
    collection.find({name: {$regex: name, $options: 'i'}},{name: 1, room: 1}).sort( { name: 1 } ).limit(20).toArray(function(err, items) {
      console.log('Found '+ items.length + ' user(s) for search: '+ name + '/' + room + '/' + machine);
      res.send(items);
    });
  });
};

exports.findById = function(req, res) {
  var id = req.params.id;
  console.log('Retrieving user: ' + id);
  db.collection('users',function(err, collection) {
    collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
      res.send(item);
    });
  });
};

exports.addUser = function(req, res) {
  var user = req.body;
  console.log('Adding user: ' + JSON.stringify(user));
  db.collection('users', function(err, collection) {
    collection.insert(user, {safe:true}, function(err, result) {
      if (err) {
        res.send({'error':'An error has occured'});
      } else {
        console.log('Success: ' + JSON.stringify(result[0]));
        res.send(result[0]);
      }
    });
  });
}

exports.updateUser = function(req, res) {
  var id = req.params.id;
  var user = req.body;
  console.log('Updating user: ' + id);
  console.log(JSON.stringify(user));
  db.collection('users', function(err, collection) {
    collection.update({'_id':new BSON.ObjectID(id)}, user, {safe:true}, function(err, result) {
      if (err) {
        console.log('Error updating user: ' + err);
        res.send({'error':'An error has occurred'});
      } else {
        console.log('' + result + ' document(s) updated');
        res.send(user);
      }
    });
  });
}

exports.deleteUser = function(req, res) {
  var id = req.params.id;
  console.log('Deleting user: ' + id);
  db.collection('users', function(err, collection) {
    collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
      if (err) {
        res.send({'error':'An error has occured - ' + err});
      } else {
        console.log('' + result + ' document(s) deleted');
        res.send(req.body);
      }
    });
  });
}
exports.addMachine = function(req, res) {
  var machine = req.body;
  console.log('Adding machine: ' + JSON.stringify(machine));
}

exports.updateMachine = function(req, res) {
  var id = req.params.id;
  var id_machine = req.params.id_machine;
  var machine = req.body;
  console.log('Updating machine: ' + id_machine);
  console.log(JSON.stringify(machine));
}

exports.deleteMachine = function(req, res) {
  var id = req.params.id;
  console.log('Deleting machine' + id);
}

exports.searchUsers = function(req, res) {
  var id = req.params.id;
  db.collection('users',function(err, collection) {
    collection.find({name: {$regex: id, $options: 'i'}},{_id: 1, name: 1}).toArray(function(err, items) {
      console.log('Found '+ items.length + ' user(s) for search: '+id);
      res.send(items);
    });
  });
}
var populateDB = function() {
  var users = [
    {
      name: "noone",
      dateAdded: new Date('12-01-2012'),
      machines:[{
        alias: "le106",
        mac: "aa:bb:cc:dd:ee",
        type: "PC"
      },
      {
        alias: "le106-2",
        mac:"aa:bb:dd:ee:ff",
        type: "AP"
      }]
    },
    {
      name: "loamhoof",
      dateAdded: new Date('12-02-2012')
    },
    {
      name: "theox",
      dateAdded: new Date('11-02-2012')
    },
    {
      name: "shak",
      dateAdded: new Date('12-04-2012')
    }
    ];
  db.collection('users',function(err, collection) {
    collection.insert(users,{safe:true}, function(err, result){});
  });

};
