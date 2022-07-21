//Spotify OAuth
var client_id = '34f843d944d144c6b096827bc3012dfb' // Your client id
var client_secret = '6e717d5e4d894d1ea81f9bce15a5aff9' // Your secret
var redirect_uri = 'http://localhost:8000/callback' // Your redirect uri
var stateKey = 'spotify_auth_state'
var scope = 'user-read-currently-playing user-read-playback-state' //Spotify auth scope

//Now Playing vars
var np_song = 'Song'
var np_artist = 'Artist'

module.exports = {
  client_id,
  client_secret,
  redirect_uri,
  stateKey,
  scope,
  np_song,
  np_artist,
}