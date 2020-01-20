var logging = true;
var log_dependencies = true;

if (logging) {
    if (log_dependencies) {
        console.log('\x1b[31m' + 'Dependencies');
        console.log('\x1b[31m' + '--> ' + '\x1b[33m' + 'Express' + '\x1b[0m');
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

//
var data = fs.readFileSync('html/settings.json');
var words = JSON.parse(data);
//

var express = require('express');

var ifaces = os.networkInterfaces();
var server = express();

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

server.get('*', function(req, res) { res.redirect('/'); }); //Redirects any incorrect links to main page

server.listen(PORT, () => {
    console.log(`Visual EQ Server running on port ${PORT}.\n`);
});

//Callback to catch any error exceptions
function Finished(err) {
    if (err)
        console.log('error', err.message, err.stack)
    else
        console.log('Successfully done!');
}

//Extra Logging
if (logging) {
    console.log('   |');
    console.log('   +--=[' + '\x1b[47m\x1b[30m' + ' Private IP ' + '\x1b[0m' + ']=--> ' + '\x1b[32m' + private_ipv4 + '\x1b[0m');
    console.log('   |');
    console.log('   .'); //End Spacer
}