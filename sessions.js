/*
 * node_modules
 */

var express = require('express');
var app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var RedisStore = require('connect-redis')(session);
var storeRedis = new RedisStore({url: 'redis://127.0.0.1:6379/dump', ttl: (3600 * 1), db: 0, prefix: ''});
var env = (function(){
    var Habitat = require('habitat');
    Habitat.load(); // file called .env (add to .gitignore)
    return new Habitat('SESSION'); // export SESSION is prefix (SESSION_EXAMPLE)
}());

/*
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
var db = MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if (err) throw err;
    return db;
});
var collection = db.collection('test_insert');
*/

var sessionCookieParams = { domain: '10.10.10.25', path: '/', httpOnly: true, secure: false };

//app.use(bodyParser());
app.use(cookieParser());
app.use(session({store: storeRedis,
                 secret: env.get('SECRETKEY'),
                 key: 'sessionID',
                 cookie: sessionCookieParams
}));

app.get('/', function(req, res) {
    var output = '';
    for (var prop in res) {
        output += prop + ': ' + req[prop] + "\n";
    }
    res.end(output);
});

app.get('/home', function(req, res) {
    res.end('Welcome Home!');
});

app.get('/awesome', function(req, res) {
    if (req.session.lastPage) {
        res.write('Last page was: ' + req.session.lastPage + '. ');
    }
    req.session.lastPage = '/awesome';
    res.end('You\'re Awesome.');
});

app.get('/radical', function(req, res) {
    if (req.session.lastPage) {
        res.write('Last page was: ' + req.session.lastPage + '. ');
    }
    req.session.lastPage = '/radical';
    res.end('What a radical visit!');
});

// http://10.10.10.25:3000/tubular/321 --> req.params.id
// http://10.10.10.25:3000/tubular/321/?id=123 --> req.params.id=321 and req.query.id=123
app.get('/tubular/:id', function(req, res) {
    res.end(req.params.id + ' Are you a surfer? ' + req.query.id);
});

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
      res.clearCookie(req.sessionID, sessionCookieParams);
      res.redirect('home');
    });
});

app.listen(3000);
