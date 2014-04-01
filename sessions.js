/*
 * node_modules
 */

var express = require('express');
var app = express();
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
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

var rsOptions = {'url': 'redis://127.0.0.1:6379/dump',
                 'ttl': 86400, 'prefix': ''};

app.use(express.cookieParser());
app.use(session({store: new RedisStore(rsOptions),
                 secret: env.get('SECRETKEY'),
                 key: 'sessionID',
                 cookie: { maxAge: (60*1000), domain: 'localhost', path: '/', httpOnly: true, secure: false}
}));

app.get('/', function(req, res) {
    var output = '';
    for (var prop in req.session) {
      output += prop + ': ' + res[prop] + "\n";
    }
    res.end(output);
});

app.get('/awesome', function(req, res) {
    if (req.session.lastPage) {
        res.write('Last page was: ' + req.session.lastPage + '. ');
        res.write('Lasty page was: ' + req.session.lastPage + '. ');
    }
    req.session.lastPage = '/awesome';
    res.end("You're Awesome.");
});

app.get('/radical', function(req, res) {
    if (req.session.lastPage) {
        res.write('Last page was: ' + req.session.lastPage + '. ');
    }

    req.session.lastPage = '/radical';
    res.end('What a radical visit!');
});

app.get('/tubular', function(req, res) {
    res.end('Are you a surfer?');
});

app.listen(3000);
