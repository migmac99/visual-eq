let mic, fft, bassDetect;
let canvas, logo, svg, settings;

let min, max, freq_cleaner;

let multiplier, bands;

let _spectrum = [];
let spectrum = [];
let peakValue = 1;

function preload() {
    frameRate(60);
    settings = loadJSON("settings.json"); //Load settings
}

function setup() {
    //Audio channel connection
    mic = new p5.AudioIn(); //Request user microphone
    mic.start(); //Start the stream of sound

    //bassDetect = new p5.PeakDetect(40, 120, 0.05);
    // bassDetect = new p5.PeakDetect(15, 25, 0.35, 15);
    bassDetect = new p5.PeakDetect(10, 20, 0.35, 30);

    //Read image from specified file_path from settings.json
    logo = loadImage(settings.image_path);

    //Save settings in local vars
    image_path = settings.image_path;

    settingsCreateSliders(); //Slider creation
    settingsCreateButtons(); //Button creation
    settingsMoveToDivs(); //Move inside div with id="settings"
    settingsLoad(); //Loading settings.json values
    settingsRefreshOnInput(); //refresh() on slider input change
    settingsCreateLegend(); //Creates legends for each setting
    settingsToggle(); //Toggles settings overlay

    settingsNowPlaying();

    refresh();

    // baseURL = window.localStorage.href;
}

function windowResized() {
    refresh();
}

function touchStarted() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
}

function refresh() {
    //Change color and size of svg image
    svgObject = document.getElementById('logo');

    svgObject.setAttribute("data", image_path);

    if (svgObject) {
        svgObject.addEventListener("load", function() {
            svg = svgObject.contentDocument;
            svg.getElementsByTagName('g')[0].style.fill = color(eq_r.value(), eq_g.value(), eq_b.value());
            svg.getElementsByTagName('svg')[0].setAttribute("width", height * imagesize.value() * peakValue);
            svg.getElementsByTagName('svg')[0].setAttribute("height", height * imagesize.value() * peakValue);
            // console.log(svg.getElementsByTagName('svg')[0].style.width, svg.getElementsByTagName('svg')[0].style.height);
        }, false);
    }

    canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('z-index', '-1');

    bands = (windowWidth / 2) / bandspace.value();
    // bands = (windowWidth / bandspace.value()) * (0.95 / 1);

    // fft = new p5.FFT(smooth.value(), highestPowerof2(bands));
    fft = new p5.FFT(smooth.value(), 8192);
    fft.setInput(mic); //Sets the mic as the fft input

    settingsPosition(); //Settings positioning

    settingsNowPlaying(); //Now Playing settings
}

function refresh_NowPlaying() {
    // console.log('Refreshed!');
    document.getElementById('title_frame').contentWindow.location.reload();
    document.getElementById('artist_frame').contentWindow.location.reload();

    if (document.getElementById('title_frame').contentWindow.document.getElementsByTagName("pre")[0].innerHTML != null) {
        document.getElementById('title').innerHTML = document.getElementById('title_frame').contentWindow.document.getElementsByTagName("pre")[0].innerHTML;
    }
    if (document.getElementById('artist_frame').contentWindow.document.getElementsByTagName("pre")[0].innerHTML != null) {
        document.getElementById('artist').innerHTML = document.getElementById('artist_frame').contentWindow.document.getElementsByTagName("pre")[0].innerHTML;
    }
}

function draw() {
    //Applies colors from Settings (R,G,B)
    background(color(bg_r.value(), bg_g.value(), bg_b.value())); //Background Color
    stroke(color(eq_r.value(), eq_g.value(), eq_b.value())); //EQ Color
    document.getElementById("title").style.color = color(eq_r.value(), eq_g.value(), eq_b.value()); //Title Color
    document.getElementById("artist").style.color = color(eq_r.value(), eq_g.value(), eq_b.value()); //Artist Color

    // multiplier = windowHeight;
    multiplier = 0.75 * windowHeight;

    let ffta = fft.analyze();

    //Image Bouncing
    fft.analyze();
    bassDetect.update(fft);

    if (eq_bounce.value() == 1) {
        if (bassDetect.isDetected) {
            triggerBeat(true);
        } else {
            triggerBeat();
        }
    } else {
        peakValue = 1;
    }

    spectrum = runAlgorithms(ffta, eq_preset.value());

    // console.log(_spectrum.length, spectrum.length);

    // spectrum = fft.analyze();
    // spectrum = runAlgorithms(fft.analyze(), eq_preset.value());

    settingsRightClick(); //Toggle Settings overlay on right click

    if (eq_switched.value() == 0) {
        min = eq_size.value() * windowHeight;
        max = windowHeight * eq_height.value();
        // freq_cleaner = ((spectrum.length / 3) * 2);
        freq_cleaner = bands;

        strokeWeight(bandstroke.value());

        for (var i = 0; i < freq_cleaner; i++) {
            // var amp = spectrum[i];
            var y = map(spectrum[i], 0, 256, max, min);

            //Left Side
            line(i * bandspace.value(), max, i * bandspace.value(), y);

            //Right Side
            line(i * (-bandspace.value()) + width, max, i * (-bandspace.value()) + width, y);
        }

        if (eq_mirrored.value() == 1) {
            strokeWeight(bandstroke_mirrored.value());

            for (var i = 0; i < freq_cleaner; i++) {
                var amp = spectrum[i];
                var y = map(amp, 0, 256, max, windowHeight + min);

                //Left Side
                line(i * bandspace.value(), max, i * bandspace.value(), y);

                //Right Side
                line(i * (-bandspace.value()) + width, max, i * (-bandspace.value()) + width, y);
            }
        }
    } else {
        min = eq_size.value() * windowHeight;
        max = windowHeight * eq_height.value();
        // freq_cleaner = ((spectrum.length / 3) * 2);
        freq_cleaner = bands;

        strokeWeight(bandstroke.value());

        for (var i = 0; i < freq_cleaner; i++) {
            var amp = spectrum[i];
            var y = map(amp, 0, 256, max, min);

            //Right Side
            line((i * bandspace.value()) + (windowWidth / 2), max, (i * bandspace.value()) + (windowWidth / 2), y);

            //Left Side
            if (i > 0) { //Prevents overlapping
                line((i * (-bandspace.value()) + width) - (windowWidth / 2), max, (i * (-bandspace.value()) + width) - (windowWidth / 2), y);
            }
        }

        if (eq_mirrored.value() == 1) {
            strokeWeight(bandstroke_mirrored.value());

            for (var i = 0; i < freq_cleaner; i++) {
                var amp = spectrum[i];
                var y = map(amp, 0, 256, max, windowHeight + min);

                //Right Side
                line((i * bandspace.value()) + (windowWidth / 2), max, (i * bandspace.value()) + (windowWidth / 2), y);

                //Left Side
                if (i > 0) { //Prevents overlapping
                    line((i * (-bandspace.value()) + width) - (windowWidth / 2), max, (i * (-bandspace.value()) + width) - (windowWidth / 2), y);
                }
            }
        }
    }
}

document.onkeydown = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode == 27) { //Escape key
        refresh_NowPlaying();
    }
    if (evt.keyCode == 32) { //Spacebar
        if (np_enabled.value() == 1) {
            np_enabled.value(0);
        } else {
            np_enabled.value(1);
        }
        settingsNowPlaying();
        refresh_NowPlaying();
    }
    if (evt.keyCode == 13) { //Enter
        NowPlaying_LinkSpotify();
    }
    // updateSVG();
    // console.log("=============================================");
    // console.log("fft.Analyse() -> ", fft.analyze());
    // console.log("=============================================");
    // console.log("Spectrum ------> ", spectrum);
    // console.log("=============================================");
    // console.log("_Spectrum -----> ", _spectrum);
    // console.log("=============================================");
    // console.log("fft.Analyse() Length -> ", fft.analyze().length);
    // console.log("Spectrum Length ------> ", spectrum.length);
    // console.log("_Spectrum Length -----> ", _spectrum.length);
    // console.log("=============================================");
};