let mic, fft, filter, normalized;
let canvas, logo, settings, save_settings;

let smooth, bandspace, image_path, imagesize, bg_r, bg_g, bg_b, eq_size, eq_height, filterFreq, filterRes;

let settingsEnabled = true;
let hasRunMouse = false;

let setting_space = 60; //Space between each setting (vertically)
let _setting_space = 200; //Space between each setting (horizontally)
let setting_start = 70; //Where to start on the screen (0 is top of the page)
let _setting_start = setting_start - 35; //Space bewtween setting and legend (vertically)

let min, max, freq_cleaner;

function preload() {
    settings = loadJSON("settings.json"); //Load settings
}

function setup() {
    //Audio channel connection
    filter = new p5.LowPass(); //creates a lowPass filter

    mic = new p5.AudioIn(); //Request user microphone
    mic.start(); //Start the stream of sound

    filter.process(mic); //Connects the filter to the source
    filter.disconnect(); //Does not output sound

    //Read image from specified file_path from settings.json
    logo = loadImage(settings.image_path);

    //Save settings in local vars
    image_path = settings.image_path;

    //Slider creation
    smooth = createSlider(0, 0.99, 0, 0.01); //smoothing value (0 - 1)
    bandspace = createSlider(0, 50, 0, 1); //space between bands
    imagesize = createSlider(0, 10, 0, 0.5); //Size of the image (lower the higher)

    bg_r = createSlider(0, 255, 0, 1); //Background color (Red)
    bg_g = createSlider(0, 255, 0, 1); //Background color (Green)
    bg_b = createSlider(0, 255, 0, 1); //Background color (Blue)

    eq_size = createSlider(0, 1, 0, 0.01); //Size of eq based on percentage of the screen
    eq_height = createSlider(0, 1, 0, 0.01); //Vertical position of eq based on percentage of the screen

    filterFreq = createSlider(10, 22050, 10, 1);
    filterRes = createSlider(0.001, 50, 0.001, 0.001) // Max 1000

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

    eq_size.parent('eq');
    eq_height.parent('eq');

    save_settings.parent('settings');

    //Loading settings.json values
    smooth.value(settings.smooth);
    bandspace.value(settings.bandspace);
    imagesize.value(settings.imagesize);
    bg_r.value(settings.bg_r);
    bg_g.value(settings.bg_g);
    bg_b.value(settings.bg_b);
    eq_size.value(settings.eq_size);
    eq_height.value(settings.eq_height);
    filterFreq.value(settings.filterFreq);
    filterRes.value(settings.filterRes);

    //refresh() on slider input change
    smooth.input(refresh);
    bandspace.input(refresh);
    bg_r.input(refresh);
    bg_g.input(refresh);
    bg_b.input(refresh);
    eq_size.input(refresh);
    eq_height.input(refresh);
    filterFreq.input(refresh);
    filterRes.input(refresh);

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

    // bands = (windowWidth / 2) / bandspace.value();
    bands = windowWidth / bandspace.value();


    fft = new p5.FFT(smooth.value(), highestPowerof2(bands));
    fft.setInput(filter); //Sets the filter as the fft input

    //Settings positioning
    smooth.position(((windowWidth / 2) - (smooth.width / 2)), (setting_start + (setting_space * 1)));
    bandspace.position(((windowWidth / 2) - (bandspace.width / 2)), (setting_start + (setting_space * 2)));
    imagesize.position(((windowWidth / 2) - (imagesize.width / 2)), (setting_start + (setting_space * 3)));

    bg_r.position(((windowWidth / 2) - (bg_r.width / 2) + _setting_space), (setting_start + (setting_space * 4)));
    bg_g.position(((windowWidth / 2) - (bg_g.width / 2)), (setting_start + (setting_space * 4)));
    bg_b.position(((windowWidth / 2) - (bg_b.width / 2) - _setting_space), (setting_start + (setting_space * 4)));

    eq_size.position(((windowWidth / 2) - (eq_size.width / 2) - _setting_space / 2), (setting_start + (setting_space * 5)));
    eq_height.position(((windowWidth / 2) - (eq_height.width / 2) + _setting_space / 2), (setting_start + (setting_space * 5)));

    filterFreq.position(((windowWidth / 2) - (filterFreq.width / 2) - _setting_space / 2), (setting_start + (setting_space * 6)));
    filterRes.position(((windowWidth / 2) - (filterRes.width / 2) + _setting_space / 2), (setting_start + (setting_space * 6)));

    save_settings.position(((windowWidth / 2) - (save_settings.width / 2) - 7.5), windowHeight - setting_start);
}

function draw() {
    background(color(bg_r.value(), bg_g.value(), bg_b.value()));

    imageMode(CENTER);
    image(logo, windowWidth / 2, windowHeight / 2, windowHeight / imagesize.value(), windowHeight / imagesize.value());


    // Map mouseX to a the cutoff frequency from the lowest
    // frequency (10Hz) to the highest (22050Hz) that humans can hear
    // filterFreq = map(50, 0, width, 10, 22050);
    // filterRes = map(mouseY, 0, height, 15, 5);
    filter.set(filterFreq.value(), filterRes.value());

    let spectrum = fft.analyze();

    // let spectrum = normalizeArray(fft.analyze());
    // console.log(spectrum);



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

    min = eq_size.value() * windowHeight;
    max = windowHeight * eq_height.value();
    freq_cleaner = ((spectrum.length / 3) * 2);

    //Left Side
    for (var i = 0; i < freq_cleaner; i++) {
        var amp = spectrum[i];
        var y = map(amp, 0, 256, max, min);

        line(i * bandspace.value(), max, i * bandspace.value(), y);
    }

    // console.log(spectrum.length);
    //Right Side
    for (var i = 0; i < freq_cleaner; i++) {
        var amp = spectrum[i];
        var y = map(amp, 0, 256, max, min);

        line(i * (-bandspace.value()) + width, max, i * (-bandspace.value()) + width, y);
    }


    // min = eq_size.value() * windowHeight;
    // max = windowHeight * eq_height.value();
    // freq_cleaner = ((spectrum.length / 3) * 2);
    // //Left Side
    // for (var i = 0; i < freq_cleaner; i++) {
    //     var amp = spectrum[i];
    //     var y = map(amp, 0, 256, max, min);

    //     line(i * bandspace.value(), max, i * bandspace.value(), y);
    // }
    // console.log(spectrum.length);
    // //Right Side
    // for (var i = 0; i < freq_cleaner; i++) {
    //     var amp = spectrum[i];
    //     var y = map(amp, 0, 256, max, min);

    //     line(i * (-bandspace.value()) + width, max, i * (-bandspace.value()) + width, y);
    // }
}

function normalizeArray(_array) {
    //
    // var _max = Math.max(Math.max(_array), 0);
    // return (_array.map(function(_v) { return _v / _max; }));
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
        bg_b: str(bg_b.value()),
        eq_size: str(eq_size.value()),
        eq_height: str(eq_height.value()),
        filterFreq: str(filterFreq.value()),
        filterRes: str(filterRes.value())

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

    ////////////////////////////////

    bg_r.parent('image_color');
    createElement('p', 'Background Red').parent('image_color').position(_setting_space, (_setting_start + (setting_space * 4)));

    bg_g.parent('image_color');
    createElement('p', 'Background Green').parent('image_color').position(0, (_setting_start + (setting_space * 4)));

    bg_b.parent('image_color');
    createElement('p', 'Background Blue').parent('image_color').position(-_setting_space, (_setting_start + (setting_space * 4)));

    ////////////////////////////////

    eq_size.parent('eq');
    createElement('p', 'EQ size (screen %)').parent('eq').position(-_setting_space / 2, (_setting_start + (setting_space * 5)));

    eq_height.parent('eq');
    createElement('p', 'EQ vertical position (screen %)').parent('eq').position(_setting_space / 2, (_setting_start + (setting_space * 5)));

    ////////////////////////////////

    filterFreq.parent('eq');
    createElement('p', 'Filter Frequency Range').parent('filter').position(-_setting_space / 2, (_setting_start + (setting_space * 6)));

    filterRes.parent('eq');
    createElement('p', 'Filter Resonance').parent('filter').position(_setting_space / 2, (_setting_start + (setting_space * 6)));
}