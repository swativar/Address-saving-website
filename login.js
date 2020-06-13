var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var admin = require("firebase-admin");
var events = require('events');

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://login-29035.firebaseio.com"
});
var db = admin.database();
var ref = db.ref("server/saving-data/fireblog");
var usersRef = ref.child("personal-info");
var app = express();
app.set('view engine', 'ejs');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use('/assests', express.static(__dirname));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/signup.html');
    //  console.log(req.body);
    app.post('/', urlencodedParser, function (req, res) {
        console.log(req.body);
        var username = req.body.username;
        var password = req.body.password;
        console.log(username, password);
        var newusersRef = usersRef.push({ username: username, password: password });
        var infokey = newusersRef.key;
        //   console.log(infokey);
        res.redirect('/login');
    })
});
/*app.get('/address', function (req, res) {
    res.sendFile(__dirname + '/address.html');
    app.post('/address', urlencodedParser, function(req, res){
        var country = req.body.country;
        var fullName = req.body.fullname;
        var tel = req.body.telephone;
        var pincode = req.body.pincode;
        var address = req.body.address;
        var town = req.body.town;
        var state = req.body.state;
        usersRef.push({ country: country, FullName: fullName, Telephone: tel , Pincode: pincode, Address:address,
        Town:town, State:state });  
    })
});*/
var eventEmitter = new events.EventEmitter();
var gotologin = function () {
    res.redirect('/login');
}
eventEmitter.on('click', gotologin);
app.get('/login', function (req, res) {
    res.sendFile(__dirname + "/login.html");
})
function login() {
    eventEmitter.emit('click');
}

app.post('/login', urlencodedParser, function (request, response) {
    var username = request.body.username;
    var password = request.body.password;
      console.log(username, password);
    if (username && password) {
        var db = admin.database();
        var ref = db.ref("server/saving-data/fireblog/personal-info");
        ref.on("value", function (snapshot) {
            for (const snap in snapshot.val()) {
                //     console.log(`${snap} ${snapshot.val()[snap]["password"]}`);
                var userid = snap;
                var user = snapshot.val()[snap]["username"];
                var pass = snapshot.val()[snap]["password"];
                console.log(user, pass, userid);
                
                if (username === user && password === pass) {
                    response.redirect('/index');
                    app.get('/index', function (req, res) {
                        res.render('index', { person: user });
                    });

                } else {
                    response.send('Incorrect Username and/or Password!');
                    response.end();
                    //  console.log(snapshot.val());
                }
            }
            });


    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});
app.listen(8080);