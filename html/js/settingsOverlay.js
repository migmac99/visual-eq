let smooth, bandspace, bandstroke, bandstroke_mirrored; //Bands
let image_path, imagesize; // Image
let bg_r, bg_g, bg_b, eq_r, eq_g, eq_b; // Colors
let eq_size, eq_height, eq_mirrored, eq_switched, eq_bounce, eq_preset, eq_cutoff; //EQ Stuff
let np_enabled, np_link, np_use_link, np_x, np_y; // Now Playing

let save_server, save_download, uploadSettings, linkNowPlaying, linkSpotify; //Buttons

let settingsEnabled = true;
let hasRunMouse = false;

let setting_space = 60; //Space between each setting (vertically)
let _setting_space = 200; //Space between each setting (horizontally)
let setting_start = 70; //Where to start on the screen (0 is top of the page)
let _setting_start = setting_start - 35; //Space bewtween setting and legend (vertically)

function settingsRightClick() {
    if ((mouseIsPressed) || (touches.length >= 2)) {
        if ((mouseButton == RIGHT) || (touches.length >= 2)) {
            if (!hasRunMouse) {
                settingsToggle();
                hasRunMouse = true;
            }
        }
    } else {
        hasRunMouse = false;
    }
}

function settingsToggle() {
    settingsEnabled = !settingsEnabled;

    if (settingsEnabled) {
        document.getElementById("settings").style.display = "block";
    } else {
        document.getElementById("settings").style.display = "none";
    }
}

function settingsCreateSliders() {
    smooth = createSlider(0, 0.99, 0, 0.01); //Smoothing value (0 - 1)

    bandspace = createSlider(1, 50, 0, 1); //Space between bands
    bandstroke = createSlider(0.1, 10, 0, 0.1); //EQ StrokeWeight
    bandstroke_mirrored = createSlider(0.1, 10, 0, 0.1); //Mirrored EQ StrokeWeight

    imagesize = createSlider(0.1, 5, 0, 0.1); //Size of the image

    bg_r = createSlider(0, 255, 0, 1); //Background color (Red)
    bg_g = createSlider(0, 255, 0, 1); //Background color (Green)
    bg_b = createSlider(0, 255, 0, 1); //Background color (Blue)

    eq_r = createSlider(0, 255, 0, 1); //Equalizer color (Red)
    eq_g = createSlider(0, 255, 0, 1); //Equalizer color (Green)
    eq_b = createSlider(0, 255, 0, 1); //Equalizer color (Blue)

    eq_size = createSlider(0, 1, 0, 0.01); //Size of eq based on percentage of the screen
    eq_height = createSlider(0, 1, 0, 0.01); //Vertical position of eq based on percentage of the screen
    eq_mirrored = createSlider(0, 1, 0, 1).class("toggle"); //Whether the eq is mirrored
    eq_switched = createSlider(0, 1, 0, 1).class("toggle"); //Switch frequency order
    eq_bounce = createSlider(0, 1, 0, 1).class("toggle"); //Normalize audio data

    eq_preset = createSlider(0, 5, 0, 1); //Testing presets
    eq_cutoff = createSlider(0.01, 1, 0.01, 0.01); //Cutoff of audio spectrum

    np_enabled = createSlider(0, 1, 0, 1).class("toggle"); //Whether NowPlaying is active
    np_use_link = createSlider(0, 1, 0, 1).class("toggle"); //Whether to use link for iframe or not
    np_x = createSlider(0, 1, 0, 0.01); //Horizontal position of NowPlaying based on percentage of the screen
    np_y = createSlider(0, 1, 0, 0.01); //Vertical position of NowPlaying based on percentage of the screen
}

function settingsCreateButtons() {
    save_server = createButton(' Save Settings [Server] ');
    save_server.class('button');
    save_server.mousePressed(settingsSave);

    save_download = createButton(' Download Settings ');
    save_download.class('button');
    save_download.mousePressed(settingsDownload);

    uploadSettings = createButton(' Upload Settings ');
    uploadSettings.class('button');
    uploadSettings.mousePressed(settingsUpload);

    linkNowPlaying = createButton(' Set Widget Link ');
    linkNowPlaying.class('button');
    linkNowPlaying.mousePressed(NowPlaying_PromptLink);

    linkSpotify = createButton(' Link Spotify [Server] ');
    linkSpotify.class('button');
    linkSpotify.mousePressed(NowPlaying_LinkSpotify);
}

function settingsMoveToDivs() {

    //EQ//////////////////////////////////////////
    smooth.parent('EQ');
    eq_cutoff.parent('EQ');
    //
    eq_size.parent('EQ');
    eq_height.parent('EQ');
    //
    eq_preset.parent('EQ');
    //////////////////////////////////////////////


    //Bands///////////////////////////////////////
    eq_switched.parent('Bands');
    //
    bandspace.parent('Bands');
    bandstroke.parent('Bands');
    //
    eq_mirrored.parent('Bands');
    bandstroke_mirrored.parent('Bands');
    //////////////////////////////////////////////


    //Image///////////////////////////////////////
    eq_bounce.parent('Image');
    //
    imagesize.parent('Image');
    //////////////////////////////////////////////


    //Colors//////////////////////////////////////
    bg_r.parent('Colors');
    bg_g.parent('Colors');
    bg_b.parent('Colors');
    //
    eq_r.parent('Colors');
    eq_g.parent('Colors');
    eq_b.parent('Colors');
    //////////////////////////////////////////////


    //NowPlaying//////////////////////////////////
    np_enabled.parent('NowPlaying');
    //
    np_x.parent('NowPlaying');
    np_y.parent('NowPlaying');
    //
    //np_link.parent('NowPlaying');
    np_use_link.parent('NowPlaying');
    linkNowPlaying.parent('NowPlaying');
    //
    linkSpotify.parent('NowPlaying');
    //////////////////////////////////////////////


    //Other///////////////////////////////////////
    save_server.parent('settings');
    save_download.parent('settings');
    uploadSettings.parent('settings');
    //////////////////////////////////////////////
}

function settingsLoad() {
    smooth.value(settings.smooth);
    bandspace.value(settings.bandspace);
    bandstroke.value(settings.bandstroke);
    bandstroke_mirrored.value(settings.bandstroke_mirrored);
    imagesize.value(settings.imagesize);
    bg_r.value(settings.bg_r);
    bg_g.value(settings.bg_g);
    bg_b.value(settings.bg_b);
    eq_r.value(settings.eq_r);
    eq_g.value(settings.eq_g);
    eq_b.value(settings.eq_b);
    eq_size.value(settings.eq_size);
    eq_height.value(settings.eq_height);
    eq_mirrored.value(settings.eq_mirrored);
    eq_switched.value(settings.eq_switched);
    eq_bounce.value(settings.eq_bounce);
    eq_preset.value(settings.eq_preset);
    eq_cutoff.value(settings.eq_cutoff);
    np_enabled.value(settings.np_enabled);
    np_link = settings.np_link;
    np_use_link.value(settings.np_use_link);
    np_x.value(settings.np_x);
    np_y.value(settings.np_y);
}

function settingsRefreshOnInput() {
    smooth.input(refresh);
    bandspace.input(refresh);
    bandstroke.input(refresh);
    bandstroke_mirrored.input(refresh);
    // imagesize.input(refresh);
    bg_r.input(refresh);
    bg_g.input(refresh);
    bg_b.input(refresh);
    eq_r.input(refresh);
    eq_g.input(refresh);
    eq_b.input(refresh);
    eq_size.input(refresh);
    eq_height.input(refresh);
    eq_mirrored.input(refresh);
    eq_switched.input(refresh);
    eq_bounce.input(refresh);
    eq_preset.input(refresh);
    eq_cutoff.input(refresh);
    np_enabled.input(refresh);
    np_use_link.input(refresh);
    np_x.input(NowPlaying_Move);
    np_y.input(NowPlaying_Move);
}

function settingsPosition() {

    //EQ//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    smooth.position(((windowWidth / 2) - (smooth.width / 2) - _setting_space / 2), (setting_start + (setting_space * 2)));
    eq_cutoff.position(((windowWidth / 2) - (eq_cutoff.width / 2) + _setting_space / 2), (setting_start + (setting_space * 2)));
    //
    eq_size.position(((windowWidth / 2) - (eq_size.width / 2) - _setting_space / 2), (setting_start + (setting_space * 3)));
    eq_height.position(((windowWidth / 2) - (eq_height.width / 2) + _setting_space / 2), (setting_start + (setting_space * 3)));
    //
    eq_preset.position(((windowWidth / 2) - (eq_preset.width / 2)), (setting_start + (setting_space * 4)));
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //Bands///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    eq_switched.position(((windowWidth / 2) - 20), (setting_start + (setting_space * 2)));
    //
    bandspace.position(((windowWidth / 2) - (bandspace.width / 2) - _setting_space / 2), (setting_start + (setting_space * 3)));
    bandstroke.position(((windowWidth / 2) - (bandstroke.width / 2) + _setting_space / 2), (setting_start + (setting_space * 3)));
    //
    eq_mirrored.position(((windowWidth / 2) - 20 - _setting_space / 2), (setting_start + (setting_space * 4)));
    bandstroke_mirrored.position(((windowWidth / 2) - (bandstroke_mirrored.width / 2) + _setting_space / 2), (setting_start + (setting_space * 4)));
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //Image///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    eq_bounce.position(((windowWidth / 2) - 20), (setting_start + (setting_space * 2)));
    //
    imagesize.position(((windowWidth / 2) - (imagesize.width / 2)), (setting_start + (setting_space * 3)));
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //Colors//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    bg_r.position(((windowWidth / 2) - (bg_r.width / 2) - _setting_space), (setting_start + (setting_space * 2)));
    bg_g.position(((windowWidth / 2) - (bg_g.width / 2)), (setting_start + (setting_space * 2)));
    bg_b.position(((windowWidth / 2) - (bg_b.width / 2) + _setting_space), (setting_start + (setting_space * 2)));
    //
    eq_r.position(((windowWidth / 2) - (eq_r.width / 2) - _setting_space), (setting_start + (setting_space * 3)));
    eq_g.position(((windowWidth / 2) - (eq_g.width / 2)), (setting_start + (setting_space * 3)));
    eq_b.position(((windowWidth / 2) - (eq_b.width / 2) + _setting_space), (setting_start + (setting_space * 3)));
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //NowPlaying//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    np_enabled.position(((windowWidth / 2) - 20), (setting_start + (setting_space * 2)));
    //
    np_x.position(((windowWidth / 2) - (np_x.width / 2) - _setting_space / 2), (setting_start + (setting_space * 3)));
    np_y.position(((windowWidth / 2) - (np_y.width / 2) + _setting_space / 2), (setting_start + (setting_space * 3)));
    //
    np_use_link.position(((windowWidth / 2) - 20 - _setting_space / 2), (setting_start + (setting_space * 4)));
    linkNowPlaying.position((windowWidth / 2) - (linkNowPlaying.width / 2) + _setting_space / 2, (setting_start - 5 + (setting_space * 4)));
    //
    linkSpotify.position((windowWidth / 2) - (linkNowPlaying.width / 2), (setting_start - 5 + (setting_space * 5)));
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //Other///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    save_server.position(((windowWidth / 2) - (save_server.width / 2) - _setting_space), windowHeight - setting_start);
    save_download.position(((windowWidth / 2) - (save_download.width / 2)), windowHeight - setting_start);
    uploadSettings.position(((windowWidth / 2) - (save_server.width / 2) + _setting_space), windowHeight - setting_start);
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

function settingsCreateLegend() {

    //EQ//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    createElement('p', 'Smoothing').parent('EQ').position(-_setting_space / 2, (_setting_start + (setting_space * 2)));
    createElement('p', 'Freq Cutoff').parent('EQ').position(_setting_space / 2, (_setting_start + (setting_space * 2)));
    //
    createElement('p', 'Size (screen %)').parent('EQ').position(-_setting_space / 2, (_setting_start + (setting_space * 3)));
    createElement('p', 'Vertical position (%)').parent('EQ').position(_setting_space / 2, (_setting_start + (setting_space * 3)));
    //
    createElement('p', 'Preset').parent('EQ').position(0, (_setting_start + (setting_space * 4)));
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //Bands///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    createElement('p', 'Switch Freq').parent('Bands').position(0, (_setting_start + (setting_space * 2)));
    //
    createElement('p', 'Space between bands').parent('Bands').position(-_setting_space / 2, (_setting_start + (setting_space * 3)));
    createElement('p', 'Band StrokeWeight').parent('Bands').position(_setting_space / 2, (_setting_start + (setting_space * 3)));
    //
    createElement('p', 'Mirror EQ').parent('Bands').position(-_setting_space / 2, (_setting_start + (setting_space * 4)));
    createElement('p', 'Mirrored band StrokeWeight').parent('Bands').position(_setting_space / 2, (_setting_start + (setting_space * 4)));
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //Image///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    createElement('p', 'Bounce Image').parent('Image').position(0, (_setting_start + (setting_space * 2)));
    //
    createElement('p', 'Image Size').parent('Image').position(0, (_setting_start + (setting_space * 3)));
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //Colors//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    createElement('p', 'Background Red').parent('Colors').position(-_setting_space, (_setting_start + (setting_space * 2)));
    createElement('p', 'Background Green').parent('Colors').position(0, (_setting_start + (setting_space * 2)));
    createElement('p', 'Background Blue').parent('Colors').position(_setting_space, (_setting_start + (setting_space * 2)));
    //
    createElement('p', 'EQ Red').parent('Colors').position(-_setting_space, (_setting_start + (setting_space * 3)));
    createElement('p', 'EQ Green').parent('Colors').position(0, (_setting_start + (setting_space * 3)));
    createElement('p', 'EQ Blue').parent('Colors').position(_setting_space, (_setting_start + (setting_space * 3)));
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //NowPlaying//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    createElement('p', 'Enable NowPlaying').parent('NowPlaying').position(0, (_setting_start + (setting_space * 2)));
    //
    createElement('p', 'Horiontal Position (%)').parent('NowPlaying').position(-_setting_space / 2, (_setting_start + (setting_space * 3)));
    createElement('p', 'Vertical Position (%)').parent('NowPlaying').position(_setting_space / 2, (_setting_start + (setting_space * 3)));
    //
    createElement('p', 'Use Link').parent('NowPlaying').position(-_setting_space / 2, (_setting_start + (setting_space * 4)));
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}

function settingsDownload() {
    settingsSave(true);
}

function settingsSave(download = false) {
    settings = {
        image_path: image_path,
        smooth: str(smooth.value()),
        bandspace: str(bandspace.value()),
        bandstroke: str(bandstroke.value()),
        bandstroke_mirrored: str(bandstroke_mirrored.value()),
        imagesize: str(imagesize.value()),
        bg_r: str(bg_r.value()),
        bg_g: str(bg_g.value()),
        bg_b: str(bg_b.value()),
        eq_r: str(eq_r.value()),
        eq_g: str(eq_g.value()),
        eq_b: str(eq_b.value()),
        eq_size: str(eq_size.value()),
        eq_height: str(eq_height.value()),
        eq_mirrored: str(eq_mirrored.value()),
        eq_switched: str(eq_switched.value()),
        eq_bounce: str(eq_bounce.value()),
        eq_preset: str(eq_preset.value()),
        eq_cutoff: str(eq_cutoff.value()),
        np_enabled: str(np_enabled.value()),
        np_link: np_link,
        np_use_link: str(np_use_link.value()),
        np_x: str(np_x.value()),
        np_y: str(np_y.value())
    };

    console.log('Settings: \n' + JSON.stringify(settings, null, 2));
    //console.log(download);
    if (!download) {
        // var data_ = JSON.stringify(settings); 
        var data_ = encodeURIComponent(JSON.stringify(settings));
        var blank_ = window.open(getURL() + "update-settings/" + data_);
        setTimeout(() => { blank_.close(); }, 100);
        console.log(getURL() + "update-settings/" + data_);
    } else {
        saveJSON(settings, 'settings.json');
    }
}

function settingsUpload() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = e => {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file);

        reader.onload = readerEvent => {
            let content = JSON.parse(readerEvent.target.result);

            if (content.image_path) { image_path = content.image_path; } else { image_path = settings.image_path; }

            if (content.smooth) { smooth.value(content.smooth); } else { smooth.value(settings.smooth); }

            if (content.bandspace) { bandspace.value(content.bandspace); } else { bandspace.value(settings.bandspace); }
            if (content.bandstroke) { bandstroke.value(content.bandstroke); } else { bandstroke.value(settings.bandstroke); }
            if (content.bandstroke_mirrored) { bandstroke_mirrored.value(content.bandstroke_mirrored); } else { bandstroke_mirrored.value(settings.bandstroke_mirrored); }
            if (content.imagesize) { imagesize.value(content.imagesize); } else { imagesize.value(settings.imagesize); }
            if (content.bg_r) { bg_r.value(content.bg_r); } else { bg_r.value(settings.bg_r); }
            if (content.bg_g) { bg_g.value(content.bg_g); } else { bg_g.value(settings.bg_g); }
            if (content.bg_b) { bg_b.value(content.bg_b); } else { bg_b.value(settings.bg_b); }
            if (content.eq_r) { eq_r.value(content.eq_r); } else { eq_r.value(settings.eq_r); }
            if (content.eq_g) { eq_g.value(content.eq_g); } else { eq_g.value(settings.eq_g); }
            if (content.eq_b) { eq_b.value(content.eq_b); } else { eq_b.value(settings.eq_b); }
            if (content.eq_size) { eq_size.value(content.eq_size); } else { eq_size.value(settings.eq_size); }
            if (content.eq_height) { eq_height.value(content.eq_height); } else { eq_height.value(settings.eq_height); }
            if (content.eq_mirrored) { eq_mirrored.value(content.eq_mirrored); } else { eq_mirrored.value(settings.eq_mirrored); }
            if (content.eq_switched) { eq_switched.value(content.eq_switched); } else { eq_switched.value(settings.eq_switched); }
            if (content.eq_bounce) { eq_bounce.value(content.eq_bounce); } else { eq_bounce.value(settings.eq_bounce); }
            if (content.eq_preset) { eq_preset.value(content.eq_preset); } else { eq_preset.value(settings.eq_preset); }
            if (content.eq_cutoff) { eq_cutoff.value(content.eq_cutoff); } else { eq_cutoff.value(settings.eq_cutoff); }

            if (content.np_enabled) { np_enabled.value(content.np_enabled); } else { np_enabled.value(settings.np_enabled); }
            if (content.np_link) { np_link = content.np_link; } else { np_link = settings.np_link; }
            if (content.np_use_link) { np_use_link.value(content.np_use_link); } else { np_use_link.value(settings.np_use_link); }
            if (content.np_x) { np_x.value(content.np_x); } else { np_x.value(settings.np_x); }
            if (content.np_y) { np_y.value(content.np_y); } else { np_y.value(settings.np_y); }

            refresh();
        }
    }
    input.click();
}

function NowPlaying_PromptLink() {
    np_link = prompt("Paste the widget link here! \n \nIf you don't have one, create it from here: \nhttps://spotify.aidenwallis.co.uk/", "https://nowplaying.aidenwallis.co.uk/5e3207f18bdd560a8e9d515d");
    if (np_link == null) {
        np_link = settings.np_link;
    }
    refresh();
}

function NowPlaying_LinkSpotify() {
    window.location.href = 'http://localhost:8000/login';
}

function NowPlaying_Move() {
    //Position songInfo
    document.getElementById("songInfo").style.left = (windowWidth * np_x.value()) + "px";
    document.getElementById("songInfo").style.bottom = (windowHeight * np_y.value()) + "px";

    //Position title
    document.getElementById("title").style.left = (windowWidth * np_x.value()) + "px";
    document.getElementById("title").style.bottom = (windowHeight * np_y.value() + 20) + "px";

    //Position artist
    document.getElementById("artist").style.left = (windowWidth * np_x.value()) + "px";
    document.getElementById("artist").style.bottom = (windowHeight * np_y.value()) + "px";
}

function settingsNowPlaying() {
    if (np_enabled.value() == 1) {
        if (np_use_link.value() == 1) {
            //Enable songInfo
            document.getElementById("songInfo").style.display = "block";
            document.getElementById("songInfo").src = np_link;

            //Disable title and artist
            document.getElementById("title").style.display = "none";
            document.getElementById("artist").style.display = "none";
        } else {
            //Disable songInfo
            document.getElementById("songInfo").style.display = "none";

            //Enable title and artist
            document.getElementById("title").style.display = "block";
            document.getElementById("artist").style.display = "block";
        }
    } else {
        //Disable songInfo
        document.getElementById("songInfo").style.display = "none";

        //Disable title and artist
        document.getElementById("title").style.display = "none";
        document.getElementById("artist").style.display = "none";
    }
}

setInterval(function() {
    if (np_use_link.value() == 0) {
        refresh_NowPlaying();
    }
}, 1000);


// currentSong = https://spotify.aidenwallis.co.uk/u/5e3207f18bdd560a8e9d515d