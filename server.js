const { generateRandomString } = require("./src/utils/generateRandomString")
const { LogRunning, LogCheck, LogCustom, colors } = require("./src/utils/logging")
const { UpdateNP } = require("./src/utils/UpdateNP")

const { client_id, client_secret, redirect_uri, stateKey, scope, np_song, np_artist } = require("./src/cfg/spotify")
authorized = 0

LogRunning(true)

//VARIABLES
var private_ipv4 //Server can be accessed through this ip if in the same network
const PORT = 8008 //server port [80 is default for web]

var os = require('os')
var fs = require('fs')
var express = require('express')

var request = require('request')
var cors = require('cors')
var querystring = require('querystring')
var cookieParser = require('cookie-parser')

exports.client_id = client_id
exports.client_secret = client_secret

//Spotify Web API
var SpotifyWebApi = require('spotify-web-api-node')
var spotifyApi = new SpotifyWebApi()

var ifaces = os.networkInterfaces()
var server = express()
exports.server = server

//LOCAL IPV4 DETECTION
  'use strict'
Object.keys(ifaces).forEach(function(ifname) {
  var alias = 0

  ifaces[ifname].forEach(function(iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skips over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      //console.log(ifname + ':' + alias, iface.address)
    } else {
      // this interface has only one ipv4 address
      //console.log(ifname, iface.address)
      private_ipv4 = iface.address
    }
    ++alias
  })
})

//START HTML SERVER
server.use(express.static(__dirname + "/html")) //Prevents MIME TYPE error by making html directory static and therefore usable
server.use(express.static(__dirname + '/public')).use(cors()).use(cookieParser())

server.get('/', function(req, res) {
  res.statusCode = 200
  res.sendFile('html/index.html', { root: __dirname })
  res.setHeader('Content-Type', 'text/html')
  res.end()
})

//Retrieves the data from URI and updates settings.json
server.get('/update-settings/:data', async function(req, res) {

  var data = String(req.params.data)
  var settings_obj = JSON.parse(data)

  LogCheck('Saving new Settings to settings.json')
  LogCustom('Debug', debug, '', settings_obj)
  LogCustom('Debug', debug, '', data)

  var settings = JSON.stringify(settings_obj, null, 2)
  fs.writeFile('html/settings.json', settings, Finished)
})

server.get('/nowPlaying/:data', async function(req, res) {
  var data = String(req.params.data)
  var nowPlaying_obj = JSON.parse(data)

  // console.log('Access_Token =', nowPlaying_obj.access_token, '\n \nRefresh_Token =', nowPlaying_obj.refresh_token)

  //Set token
  spotifyApi.setAccessToken(nowPlaying_obj.access_token)
  authorized = 1
  UpdateNP()
  res.redirect('/')
})

//Refreshes NowPlaying every 1000 miliseconds
setInterval(UpdateNP, 1000)

server.get('/title', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.write(np_song)
  res.end()
})

server.get('/artist', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.write(np_artist)
  res.end()
})

//Spotify OAuth //////////////////////////////////////////////////////////////
server.use(express.static(__dirname + '/public')).use(cors()).use(cookieParser())
server.get('/login', function(req, res) {
  var state = generateRandomString(16)
  res.cookie(stateKey, state)

  // your application requests authorization
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }))
})

server.get('/callback', function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null
  var state = req.query.state || null
  var storedState = req.cookies ? req.cookies[stateKey] : null

  if (state === null || state !== storedState) {
    res.redirect('/nowPlaying/' +
      querystring.stringify({
        error: 'state_mismatch'
      }))
  } else {
    res.clearCookie(stateKey)
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
    }

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token

        var options = {
          url: 'https://api.spotify.com/v1/me/',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        }

        // var options = {
        //     url: 'https://api.spotify.com/v1/me/player/currently-playing',
        //     headers: { 'Authorization': 'Bearer ' + access_token },
        //     json: true
        // }

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {})

        // we can also pass the token to the browser to make requests from there
        // res.redirect('/#' +
        //     querystring.stringify({
        //         access_token: access_token,
        //         refresh_token: refresh_token
        //     }))

        res.redirect('/nowPlaying/' + JSON.stringify({
          access_token: access_token,
          refresh_token: refresh_token
        }))
      } else {
        res.redirect('/nowPlaying/' + JSON.stringify({ error: 'invalid_token' }))
      }
    })
  }
})

// server.get('*', function(req, res) { res.redirect('/') }) //Redirects any incorrect links to main page

server.listen(PORT, () => {
  LogCheck(`Visual EQ Server running on port ${PORT}.\n`)
})

//Callback to catch any error exceptions
function Finished(err) {
  if (err)
    console.log('error', err.message, err.stack)
  else
    LogCheck(colors.green + 'Successfully done!')
}

console.log('|')
console.log('+--=[' + '\x1b[47m\x1b[30m' + ' Private IP ' + '\x1b[0m' + ']=--> ' + '\x1b[32m' + private_ipv4 + '\x1b[0m')
console.log('|')
console.log('') //End Spacer