let mic, fft, filter, normalized;
let canvas, logo, svg, svgObject, settings, save_settings;

let smooth, bandspace, bandstroke, bandstroke_mirrored, image_path, imagesize, bg_r, bg_g, bg_b, eq_r, eq_g, eq_b, eq_size, eq_height, eq_mirrored, eq_switched, eq_normalize, filterFreq, filterRes;

let settingsEnabled = true;
let hasRunMouse = false;

let setting_space = 60; //Space between each setting (vertically)
let _setting_space = 200; //Space between each setting (horizontally)
let setting_start = 70; //Where to start on the screen (0 is top of the page)
let _setting_start = setting_start - 35; //Space bewtween setting and legend (vertically)

let min, max, freq_cleaner;

function preload() {
    frameRate(60);
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
    svgObject = document.getElementById('logo');

    //Slider creation
    smooth = createSlider(0, 0.99, 0, 0.01); //Smoothing value (0 - 1)

    bandspace = createSlider(1, 50, 0, 1); //Space between bands
    bandstroke = createSlider(0.1, 10, 0, 0.1); //EQ StrokeWeight
    bandstroke_mirrored = createSlider(0.1, 10, 0, 0.1); //Mirrored EQ StrokeWeight

    imagesize = createSlider(0, 5, 0, 0.1); //Size of the image (lower the higher)

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

    //Button creation
    save_settings = createButton('Save Settings');
    save_settings.class('button');
    save_settings.mousePressed(saveCurrent);

    //Move inside div with id="settings"
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

    save_settings.parent('settings');

    //Loading settings.json values
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

    //refresh() on slider input change
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

    createSettingsLegends();
    toggleSettings();

    refresh();
}

function windowResized() {
    refresh();
}

function refresh() {
    document.getElementById("logo").setAttribute("data", image_path);

    //Change color of svg image
    svgObject = document.getElementById('logo');

    if (svgObject) {
        svgObject.addEventListener("load", function() {
            svg = svgObject.contentDocument;
            svg.getElementsByTagName('g')[0].style.fill = color(eq_r.value(), eq_g.value(), eq_b.value());
            svg.getElementsByTagName('svg')[0].setAttribute("width", height * imagesize.value());
            svg.getElementsByTagName('svg')[0].setAttribute("height", height * imagesize.value());
            console.log(svg.getElementsByTagName('svg')[0].style.width, svg.getElementsByTagName('svg')[0].style.height);
        }, false);
    }

    canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('z-index', '-1');

    // bands = (windowWidth / 2) / bandspace.value();
    bands = windowWidth / bandspace.value();


    fft = new p5.FFT(smooth.value(), highestPowerof2(bands));
    fft.setInput(filter); //Sets the filter as the fft input

    //Settings positioning
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

    save_settings.position(((windowWidth / 2) - (save_settings.width / 2) - 7.5), windowHeight - setting_start);
}

function draw() {
    //Applies colors from Settings (R,G,B)
    background(color(bg_r.value(), bg_g.value(), bg_b.value())); //Background Color
    stroke(color(eq_r.value(), eq_g.value(), eq_b.value())); //EQ Color
    document.getElementById("title").style.color = color(eq_r.value(), eq_g.value(), eq_b.value()); //Title Color
    document.getElementById("artist").style.color = color(eq_r.value(), eq_g.value(), eq_b.value()); //Artist Color


    // Map mouseX to a the cutoff frequency from the lowest
    // frequency (10Hz) to the highest (22050Hz) that humans can hear
    // filterFreq = map(50, 0, width, 10, 22050);
    // filterRes = map(mouseY, 0, height, 15, 5);
    filter.set(filterFreq.value(), filterRes.value());

    let spectrum = fft.analyze();

    // let spectrum = normalizeArray(fft.analyze());
    // console.log(spectrum);


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


    if (eq_switched.value() == 0) {
        min = eq_size.value() * windowHeight;
        max = windowHeight * eq_height.value();
        freq_cleaner = ((spectrum.length / 3) * 2);

        strokeWeight(bandstroke.value());
        //Left Side
        for (var i = 0; i < freq_cleaner; i++) {
            var amp = spectrum[i];
            var y = map(amp, 0, 256, max, min);

            line(i * bandspace.value(), max, i * bandspace.value(), y);
        }
        //Right Side
        for (var i = 0; i < freq_cleaner; i++) {
            var amp = spectrum[i];
            var y = map(amp, 0, 256, max, min);

            line(i * (-bandspace.value()) + width, max, i * (-bandspace.value()) + width, y);
        }

        if (eq_mirrored.value() == 1) {
            strokeWeight(bandstroke_mirrored.value());
            //Left Side
            for (var i = 0; i < freq_cleaner; i++) {
                var amp = spectrum[i];
                var y = map(amp, 0, 256, max, windowHeight + min);

                line(i * bandspace.value(), max, i * bandspace.value(), y);
            }
            //Right Side
            for (var i = 0; i < freq_cleaner; i++) {
                var amp = spectrum[i];
                var y = map(amp, 0, 256, max, windowHeight + min);

                line(i * (-bandspace.value()) + width, max, i * (-bandspace.value()) + width, y);
            }
        }
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
    // var _max =
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
        eq_normalize: str(eq_normalize.value()),
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