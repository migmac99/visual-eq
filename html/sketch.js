let mic, fft, canvas, logo, settings, smooth, bandspace, imagesize, save_settings;
let image_path, bg_r, bg_g, bg_b;

let settingsEnabled = true;
let hasRunMouse = false;

let setting_space = 60; //Space between each setting (vertically)
let _setting_space = 200; //Space between each setting (horizontally)
let setting_start = 70; //Where to start on the screen (0 is top of the page)
let _setting_start = setting_start - 35; //Space bewtween setting and legend (vertically)

function preload() {
    settings = loadJSON("settings.json"); //Load settings
}

function setup() {
    //Audio channel connection
    mic = new p5.AudioIn(); //Request user microphone
    mic.start(); //Start the stream of sound

    //Read image from specified file_path from settings.json
    logo = loadImage(settings.image_path);

    //Save settings in local vars
    image_path = settings.image_path;

    //Slider creation
    smooth = createSlider(0.8, 0.99, 0, 0.01); //smoothing value (0 - 1)
    bandspace = createSlider(0, 50, 0, 1); //space between bands
    imagesize = createSlider(0, 10, 0, 0.5); //Size of the image (lower the higher)
    bg_r = createSlider(0, 255, 0, 1);
    bg_g = createSlider(0, 255, 0, 1);
    bg_b = createSlider(0, 255, 0, 1);

    //Button creation
    save_settings = createButton('Save Settings');
    save_settings.class('button');
    save_settings.mousePressed(saveCurrent);

    //Move inside div with id="settings"
    smooth.parent('settings');
    bandspace.parent('settings');
    imagesize.parent('settings');
    bg_r.parent('image_color');
    bg_g.parent('image_color');
    bg_b.parent('image_color');
    save_settings.parent('settings');

    //Loading settings.json values
    smooth.value(settings.smooth);
    bandspace.value(settings.bandspace);
    imagesize.value(settings.imagesize);
    bg_r.value(settings.bg_r);
    bg_g.value(settings.bg_g);
    bg_b.value(settings.bg_b);

    //refresh() on slider input change
    smooth.input(refresh);
    bandspace.input(refresh);
    bg_r.input(refresh);
    bg_g.input(refresh);
    bg_b.input(refresh);

    createSettingsLegends();
    toggleSettings();

    refresh();
}

function windowResized() {
    refresh();
}

function refresh() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('z-index', '-1');

    bands = width / bandspace.value();

    fft = new p5.FFT(smooth.value(), highestPowerof2(bands));
    fft.setInput(mic);

    //Settings positioning
    smooth.position(((windowWidth / 2) - (smooth.width / 2)), (setting_start + (setting_space * 1)));
    bandspace.position(((windowWidth / 2) - (bandspace.width / 2)), (setting_start + (setting_space * 2)));
    imagesize.position(((windowWidth / 2) - (imagesize.width / 2)), (setting_start + (setting_space * 3)));

    bg_r.position(((windowWidth / 2) - (bg_r.width / 2) + _setting_space), (setting_start + (setting_space * 4)));
    bg_g.position(((windowWidth / 2) - (bg_g.width / 2)), (setting_start + (setting_space * 4)));
    bg_b.position(((windowWidth / 2) - (bg_b.width / 2) - _setting_space), (setting_start + (setting_space * 4)));

    save_settings.position(((windowWidth / 2) - (save_settings.width / 2) - 7.5), windowHeight - setting_start);
}

function draw() {
    background(color(bg_r.value(), bg_g.value(), bg_b.value()));

    imageMode(CENTER);
    image(logo, windowWidth / 2, windowHeight / 2, windowHeight / imagesize.value(), windowHeight / imagesize.value());

    var spectrum = fft.analyze();

    stroke(255);

    //Toggle Settings overlay on right click
    if (mouseIsPressed) {
        if (mouseButton == RIGHT) {
            if (!hasRunMouse) {
                toggleSettings();
                hasRunMouse = true;
            }
        }
    } else {
        hasRunMouse = false;
    }


    // Left Side
    for (var i = 0; i < spectrum.length; i++) {
        var amp = spectrum[i];
        var y = map(amp, 0, 256, height, 0);

        line(i * bandspace.value(), height, i * bandspace.value(), y);
    }

    // Right Side
    for (var i = 0; i < spectrum.length; i++) {
        var amp = spectrum[i];
        var y = map(amp, 0, 256, height, 0);

        line(i * (-bandspace.value()) + width, height, i * (-bandspace.value()) + width, y);
    }
}

function touchStarted() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
}

function highestPowerof2(n) {
    var p = round((Math.log(n) / Math.log(2)));

    return round(Math.pow(2, p));
}

function saveCurrent() {
    settings = {
        image_path: image_path,
        smooth: str(smooth.value()),
        bandspace: str(bandspace.value()),
        imagesize: str(imagesize.value()),
        bg_r: str(bg_r.value()),
        bg_g: str(bg_g.value()),
        bg_b: str(bg_b.value())
    };
    console.log('Settings: \n' + JSON.stringify(settings, null, 2));

    var data = JSON.stringify(settings);

    var blank = window.open(getURL() + "update-settings/" + data);
    setTimeout(() => { blank.close(); }, 100);

    // console.log(getURL() + "update-settings/" + data);
}

function toggleSettings() {
    settingsEnabled = !settingsEnabled;

    if (settingsEnabled) {
        document.getElementById("settings").style.display = "block";
    } else {
        document.getElementById("settings").style.display = "none";
    }
}

function createSettingsLegends() {
    smooth.parent('smooth');
    createElement('p', 'Smoothing').parent('smooth').position(0, (_setting_start + (setting_space * 1)));

    bandspace.parent('bandspace');
    createElement('p', 'Space between bands').parent('bandspace').position(0, (_setting_start + (setting_space * 2)));

    imagesize.parent('imagesize');
    createElement('p', 'Image Size').parent('imagesize').position(0, (_setting_start + (setting_space * 3)));


    bg_r.parent('image_color');
    createElement('p', 'Background Red').parent('image_color').position(_setting_space, (_setting_start + (setting_space * 4)));

    bg_g.parent('image_color');
    createElement('p', 'Background Green').parent('image_color').position(0, (_setting_start + (setting_space * 4)));

    bg_b.parent('image_color');
    createElement('p', 'Background Blue').parent('image_color').position(-_setting_space, (_setting_start + (setting_space * 4)));
}