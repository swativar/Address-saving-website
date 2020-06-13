var express = require('express');
var bodyParser = require('body-parser');
var admin = require("firebase-admin");
//var events = require('events');
var serviceAccount = require("./serviceAccountKey.json");

//firebase initialization

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://login-29035.firebaseio.com"
});
var db = admin.database();
var ref = db.ref("server/saving-data/fireblog");
var usersRef = ref.child("personal-info");

//express

var app = express();
app.set('view engine', 'ejs');

//bodyParser

var urlencodedParser = bodyParser.urlencoded({ extended: false });

//signup and login

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/signup.html');
});
app.get('/login', function (req, res) {
    res.sendFile(__dirname + "/login.html");
});
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
});

app.post('/login', urlencodedParser, function (request, response) {
    var username = request.body.username;
    var password = request.body.password;
     // console.log(username, password);
    if (username && password) {
        var check=0;
        usersRef.on("value", function (snapshot) {
            for (const snap in snapshot.val()) {
                //     console.log(`${snap} ${snapshot.val()[snap]["password"]}`);
                var userid = snap;
                var user = snapshot.val()[snap]["username"];
                var pass = snapshot.val()[snap]["password"];
             //   console.log(user, pass, userid);
            
            if (username === user && password === pass) {
                var userid1 = userid;
                var uRef = usersRef.child(userid1);
                app.post('/address', urlencodedParser, function(req, res){
                  //  var country = req.body.country;
                    var fullName = req.body.fullname;
                    var tel = req.body.telephone;
                    var pincode = req.body.pincode;
                    var address = req.body.address;
                    var town = req.body.town;
                  //  var state = req.body.state;
                    uRef.update({FullName: fullName, Telephone: tel , Pincode: pincode, Address:address,
                    Town:town});  
                });
                usersRef.child(userid1).on('value',function(snap){
                    console.log(snap.val());
                })
               // console.log(userid1);
                
                check=1;
                app.get('/index', function (req, res) {
                    res.render('index', { person: user });
                }); 
                response.redirect('/index');
                break;
            } 
        }
        if(!check)
        {

                response.send('Incorrect Username and/or Password!');
                response.end();
            
        }
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});
//get add page

app.get('/address', function (req, res) {
    res.sendFile(__dirname + '/address.html');
});
app.listen(8080);
