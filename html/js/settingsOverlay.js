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
    eq_normalize = createSlider(0, 1, 0, 1).class("toggle"); //Normalize audio data

    filterFreq = createSlider(10, 22050, 10, 1);
    filterRes = createSlider(0.001, 50, 0.001, 0.001) // Max 1000
}

function settingsCreateButtons() {
    save_server = createButton(' Save Settings [Server] ');
    save_server.class('button');
    save_server.mousePressed(saveSettings);

    save_download = createButton(' Download Settings ');
    save_download.class('button');
    save_download.mousePressed(saveDownload);

    uploadSettings = createButton(' Upload Settings ');
    uploadSettings.class('button');
    uploadSettings.mousePressed(loadSettings);
}

function settingsMoveToDivs() {
    smooth.parent('smooth');

    bandspace.parent('bands');
    bandstroke.parent('bands');
    bandstroke_mirrored.parent('bands');

    imagesize.parent('imagesize');

    bg_r.parent('image_color');
    bg_g.parent('image_color');
    bg_b.parent('image_color');

    eq_r.parent('eq_color');
    eq_g.parent('eq_color');
    eq_b.parent('eq_color');

    eq_size.parent('eq');
    eq_height.parent('eq');
    eq_mirrored.parent('eq');
    eq_switched.parent('eq');
    eq_normalize.parent('eq');

    filterFreq.parent('eq');
    filterRes.parent('eq');

    save_server.parent('settings');
    save_download.parent('settings');
    uploadSettings.parent('settings');
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
    eq_normalize.value(settings.eq_normalize);
    filterFreq.value(settings.filterFreq);
    filterRes.value(settings.filterRes);
}

function settingsRefreshOnInput() {
    smooth.input(refresh);
    bandspace.input(refresh);
    bandstroke.input(refresh);
    bandstroke_mirrored.input(refresh);
    imagesize.input(refresh);
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
    eq_normalize.input(refresh);
    filterFreq.input(refresh);
    filterRes.input(refresh);
}

function settingsPosition() {
    smooth.position(((windowWidth / 2) - (smooth.width / 2)), (setting_start + (setting_space * 1)));

    bandspace.position(((windowWidth / 2) - (bandspace.width / 2) - _setting_space), (setting_start + (setting_space * 2)));
    bandstroke.position(((windowWidth / 2) - (bandstroke.width / 2)), (setting_start + (setting_space * 2)));
    bandstroke_mirrored.position(((windowWidth / 2) - (bandstroke_mirrored.width / 2) + _setting_space), (setting_start + (setting_space * 2)));

    imagesize.position(((windowWidth / 2) - (imagesize.width / 2)), (setting_start + (setting_space * 3)));

    bg_r.position(((windowWidth / 2) - (bg_r.width / 2) - _setting_space), (setting_start + (setting_space * 4)));
    bg_g.position(((windowWidth / 2) - (bg_g.width / 2)), (setting_start + (setting_space * 4)));
    bg_b.position(((windowWidth / 2) - (bg_b.width / 2) + _setting_space), (setting_start + (setting_space * 4)));

    eq_r.position(((windowWidth / 2) - (eq_r.width / 2) - _setting_space), (setting_start + (setting_space * 5)));
    eq_g.position(((windowWidth / 2) - (eq_g.width / 2)), (setting_start + (setting_space * 5)));
    eq_b.position(((windowWidth / 2) - (eq_b.width / 2) + _setting_space), (setting_start + (setting_space * 5)));

    eq_size.position(((windowWidth / 2) - (eq_size.width / 2) - _setting_space / 2), (setting_start + (setting_space * 6)));
    eq_height.position(((windowWidth / 2) - (eq_height.width / 2) + _setting_space / 2), (setting_start + (setting_space * 6)));

    eq_mirrored.position(((windowWidth / 2) - 20 - _setting_space / 2), (setting_start + (setting_space * 7)));
    eq_switched.position(((windowWidth / 2) - 20), (setting_start + (setting_space * 7)));
    eq_normalize.position(((windowWidth / 2) - 20 + _setting_space / 2), (setting_start + (setting_space * 7)));

    filterFreq.position(((windowWidth / 2) - (filterFreq.width / 2) - _setting_space / 2), (setting_start + (setting_space * 8)));
    filterRes.position(((windowWidth / 2) - (filterRes.width / 2) + _setting_space / 2), (setting_start + (setting_space * 8)));

    save_server.position(((windowWidth / 2) - (save_server.width / 2) - _setting_space), windowHeight - setting_start);
    save_download.position(((windowWidth / 2) - (save_download.width / 2)), windowHeight - setting_start);
    uploadSettings.position(((windowWidth / 2) - (save_server.width / 2) + _setting_space), windowHeight - setting_start);
}

function createSettingsLegends() {
    createElement('p', 'Smoothing').parent('smooth').position(0, (_setting_start + (setting_space * 1)));

    createElement('p', 'Space between bands').parent('bands').position(-_setting_space, (_setting_start + (setting_space * 2)));
    createElement('p', 'Band StrokeWeight').parent('bands').position(0, (_setting_start + (setting_space * 2)));
    createElement('p', 'Mirrored band StrokeWeight').parent('bands').position(_setting_space, (_setting_start + (setting_space * 2)));

    createElement('p', 'Image Size').parent('imagesize').position(0, (_setting_start + (setting_space * 3)));

    createElement('p', 'Background Red').parent('image_color').position(-_setting_space, (_setting_start + (setting_space * 4)));
    createElement('p', 'Background Green').parent('image_color').position(0, (_setting_start + (setting_space * 4)));
    createElement('p', 'Background Blue').parent('image_color').position(_setting_space, (_setting_start + (setting_space * 4)));

    createElement('p', 'EQ Red').parent('eq_color').position(-_setting_space, (_setting_start + (setting_space * 5)));
    createElement('p', 'EQ Green').parent('eq_color').position(0, (_setting_start + (setting_space * 5)));
    createElement('p', 'EQ Blue').parent('eq_color').position(_setting_space, (_setting_start + (setting_space * 5)));

    createElement('p', 'EQ size (screen %)').parent('eq').position(-_setting_space / 2, (_setting_start + (setting_space * 6)));
    createElement('p', 'EQ vertical position (screen %)').parent('eq').position(_setting_space / 2, (_setting_start + (setting_space * 6)));

    createElement('p', 'Mirror EQ').parent('eq').position(-_setting_space / 2, (_setting_start + (setting_space * 7)));
    createElement('p', 'Switch EQ').parent('eq').position(0, (_setting_start + (setting_space * 7)));
    createElement('p', 'Normalize EQ').parent('eq').position(_setting_space / 2, (_setting_start + (setting_space * 7)));

    createElement('p', 'Filter Frequency Range').parent('filter').position(-_setting_space / 2, (_setting_start + (setting_space * 8)));
    createElement('p', 'Filter Resonance').parent('filter').position(_setting_space / 2, (_setting_start + (setting_space * 8)));
}