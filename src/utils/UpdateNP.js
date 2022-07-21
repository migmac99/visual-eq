function UpdateNP() {
  //Only refreshes if spotify has been authorized
  if (authorized == 1) {
    spotifyApi.getMyCurrentPlaybackState()
      .then(function(data) {
        // Output items
        var item = data.body.item
        var song = item.album.name
        var artists
          // console.log("Now Playing: ", item)

        for (i = 0; i < item.artists.length; i++) {
          if (i == 0) {
            artists = item.artists[i].name
          } else {
            artists += ', ' + item.artists[i].name
          }
        }
        // console.log('\nAlbum: ', song, '\nArtists: ', artists)
        np_song = song
        np_artist = artists

      }, function(err) {
        console.log('Something went wrong!', err)
      })
  } else {
    np_song = 'Song'
    np_artist = 'Artist'
  }
}

module.exports = {
  UpdateNP,
}