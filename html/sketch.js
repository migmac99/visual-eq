let mic, fft, canvas, logo, settings, smooth, bandspace, imagesize, save_settings;
let image_path, bg_r, bg_g, bg_b;

let settingsEnabled = true;
let hasRunMouse = false;

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
    bg_r = settings.bg_r;
    bg_g = settings.bg_g;
    bg_b = settings.bg_b;

    //Slider creation
    smooth = createSlider(0, 1, 0, 0.1); //smoothing value (0 - 1)
    bandspace = createSlider(0, 50, 0, 1); //space between bands
    imagesize = createSlider(0, 10, 0, 0.5); //Size of the image (lower the higher)

    //Button creation
    save_settings = createButton('Save Settings');
    save_settings.class('button');
    save_settings.mousePressed(saveCurrent);

    //Move inside div with id="settings"
    smooth.parent('settings');
    bandspace.parent('settings');
    imagesize.parent('settings');
    save_settings.parent('settings');

    //Loading settings.json values
    smooth.value(settings.smooth);
    bandspace.value(settings.bandspace);
    imagesize.value(settings.imagesize);

    //refresh() on slider input change
    smooth.input(refresh);
    bandspace.input(refresh);

    //Clear positions
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
    smooth.position(((windowWidth / 2) - (smooth.width / 2)), windowHeight - 250);
    // createElement('div', 'Smoothing').parent('settings').child(smooth);

    bandspace.position(((windowWidth / 2) - (bandspace.width / 2)), windowHeight - 200);
    imagesize.position(((windowWidth / 2) - (imagesize.width / 2)), windowHeight - 150);
    save_settings.position(((windowWidth / 2) - (save_settings.width / 2) - 7.5), windowHeight - 100);
}

function draw() {
    background(settings.bg_r, settings.bg_g, settings.bg_b);

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
        bg_r: bg_r,
        bg_g: bg_g,
        bg_b: bg_b
    };
    console.log('Settings: \n' + JSON.stringify(settings, null, 2));

    var data = JSON.stringify(settings);

    var blank = window.open(getURL() + "update-settings/" + data);
    setTimeout(() => { blank.close(); }, 100);

    // console.log(getURL() + "update-settings/" + data);
}

// function toggleSettings() {
//     settingsEnabled = !settingsEnabled;

//     if (settingsEnabled) {
//         smooth.hide();
//         bandspace.hide();
//         imagesize.hide();
//         save_settings.hide();
//     } else {
//         smooth.show();
//         bandspace.show();
//         imagesize.show();
//         save_settings.show();
//     }
// }

function toggleSettings() {
    settingsEnabled = !settingsEnabled;

    if (settingsEnabled) {
        document.getElementById("settings").style.display = "block";
    } else {
        document.getElementById("settings").style.display = "none";
    }
}