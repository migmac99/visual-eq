var logging = true;
var log_dependencies = true;

if (logging) {
    if (log_dependencies) {
        console.log('\x1b[31m' + 'Dependencies');
        console.log('\x1b[31m' + '--> ' + '\x1b[33m' + 'Express' + '\x1b[0m');
        console.log('\x1b[31m' + '--> ' + '\x1b[33m' + 'request' + '\x1b[0m');
        console.log('\x1b[31m' + '--> ' + '\x1b[33m' + 'cors' + '\x1b[0m');
        console.log('\x1b[31m' + '--> ' + '\x1b[33m' + 'cookie-parser' + '\x1b[0m');
        console.log('\x1b[31m' + '--> ' + '\x1b[33m' + 'spotify-web-api-js' + '\x1b[0m');
    }
    console.log('.'); //Start Spacer
    console.log('+=================================+');
    console.log('|  Starting Visual EQ by ' + '\x1b[36m%s\x1b[0m', 'AllTWay' + '\x1b[0m', ' |');
    console.log('+==+==============================+');
} else {
    console.log('Starting EQ by ' + '\x1b[36m%s\1', 'AllTWay' + '\x1b[0m');
}

//VARIABLES
var private_ipv4; //Server can be accessed through this ip if in the same network
const PORT = 8000; //server port [80 is default for web]

var os = require('os');
var fs = require('fs');

var express = require('express');

var request = require('request');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

//Spotify OAuth
var client_id = '34f843d944d144c6b096827bc3012dfb'; // Your client id
var client_secret = '6e717d5e4d894d1ea81f9bce15a5aff9'; // Your secret
var redirect_uri = 'http://localhost:8000/callback'; // Your redirect uri
var stateKey = 'spotify_auth_state';
var scope = 'user-read-currently-playing user-read-playback-state'; //Spotify auth scope

//Spotify Web API
var Spotify = require('spotify-web-api-js');
var s = new Spotify();


var ifaces = os.networkInterfaces();
var server = express();

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

//LOCAL IPV4 DETECTION
'use strict';
Object.keys(ifaces).forEach(function(ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function(iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
            // skips over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
        }

        if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            //console.log(ifname + ':' + alias, iface.address);
        } else {
            // this interface has only one ipv4 address
            //console.log(ifname, iface.address);
            private_ipv4 = iface.address;
        }
        ++alias;
    });
});

//START HTML SERVER
server.use(express.static(__dirname + "/html")); //Prevents MIME TYPE error by making html directory static and therefore usable

server.get('/', function(req, res) {
    res.statusCode = 200;
    res.sendFile('html/index.html', { root: __dirname })
    res.setHeader('Content-Type', 'text/html');
    res.end();
});

//Retrieves the data from URI and updates settings.json
server.get('/update-settings/:data', async function(req, res) {

    var data = String(req.params.data);
    var settings_obj = JSON.parse(data);

    if (logging) {
        console.log('Saving new Settings to settings.json \n');
        console.log(settings_obj);
        console.log();
    }

    var settings = JSON.stringify(settings_obj, null, 2);
    fs.writeFile('html/settings.json', settings, Finished);
});

server.get('/nowPlaying/:data', async function(req, res) {

    var data = String(req.params.data);
    var nowPlaying_obj = JSON.parse(data);

    console.log('Access_Token =', nowPlaying_obj.access_token, '\n \nRefresh_Token =', nowPlaying_obj.refresh_token);
    //DO STUFF WITH THE TOKENS


    res.redirect('/');
});

//Spotify OAuth //////////////////////////////////////////////////////////////
server.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

server.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

server.get('/callback', function(req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/nowPlaying/' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me/',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                // var options = {
                //     url: 'https://api.spotify.com/v1/me/player/currently-playing',
                //     headers: { 'Authorization': 'Bearer ' + access_token },
                //     json: true
                // };


                // use the access token to access the Spotify Web API
                request.get(options, function(error, response, body) {
                    //console.log(body);
                });

                // we can also pass the token to the browser to make requests from there
                // res.redirect('/#' +
                //     querystring.stringify({
                //         access_token: access_token,
                //         refresh_token: refresh_token
                //     }));

                res.redirect('/nowPlaying/' + JSON.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token
                }));

            } else {
                res.redirect('/nowPlaying/' + JSON.stringify({ error: 'invalid_token' }));
            }
        });
    }
});

server.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});


server.get('*', function(req, res) { res.redirect('/'); }); //Redirects any incorrect links to main page

server.listen(PORT, () => {
    console.log(`Visual EQ Server running on port ${PORT}.\n`);
});

//Callback to catch any error exceptions
function Finished(err) {
    if (err)
        console.log('error', err.message, err.stack)
    else
        console.log('\x1b[32m' + 'Successfully done! \n' + '\x1b[0m');
}

//Extra Logging
if (logging) {
    console.log('   |');
    console.log('   +--=[' + '\x1b[47m\x1b[30m' + ' Private IP ' + '\x1b[0m' + ']=--> ' + '\x1b[32m' + private_ipv4 + '\x1b[0m');
    console.log('   |');
    console.log('   .'); //End Spacer
}