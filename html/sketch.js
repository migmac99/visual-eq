let mic, fft, filter, normalized;
let canvas, logo, svg, svgObject, settings, save_server, save_download, uploadSettings;

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

    settingsCreateSliders(); //Slider creation
    settingsCreateButtons(); //Button creation
    settingsMoveToDivs(); //Move inside div with id="settings"
    settingsLoad(); //Loading settings.json values
    settingsRefreshOnInput(); //refresh() on slider input change
    settingsCreateLegend(); //Creates legends for each setting
    settingsToggle(); //Toggles settings overlay

    refresh();
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
    document.getElementById("logo").setAttribute("data", image_path);

    //Change color of svg image
    svgObject = document.getElementById('logo');

    if (svgObject) {
        svgObject.addEventListener("load", function() {
            svg = svgObject.contentDocument;
            svg.getElementsByTagName('g')[0].style.fill = color(eq_r.value(), eq_g.value(), eq_b.value());
            svg.getElementsByTagName('svg')[0].setAttribute("width", height * imagesize.value());
            svg.getElementsByTagName('svg')[0].setAttribute("height", height * imagesize.value());
            // console.log(svg.getElementsByTagName('svg')[0].style.width, svg.getElementsByTagName('svg')[0].style.height);
        }, false);
    }

    canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('z-index', '-1');

    // bands = (windowWidth / 2) / bandspace.value();
    bands = (windowWidth / bandspace.value()) * (0.95 / 1);


    fft = new p5.FFT(smooth.value(), highestPowerof2(bands));
    fft.setInput(filter); //Sets the filter as the fft input


    settingsPosition(); //Settings positioning
}

function draw() {
    //Applies colors from Settings (R,G,B)
    background(color(bg_r.value(), bg_g.value(), bg_b.value())); //Background Color
    stroke(color(eq_r.value(), eq_g.value(), eq_b.value())); //EQ Color
    document.getElementById("title").style.color = color(eq_r.value(), eq_g.value(), eq_b.value()); //Title Color
    document.getElementById("artist").style.color = color(eq_r.value(), eq_g.value(), eq_b.value()); //Artist Color


    // frequency (10Hz) to the highest (22050Hz) that humans can hear
    filter.set(filterFreq.value(), filterRes.value());

    // let spectrum = fft.analyze();
    let multiplier = eq_normalize.value() * (windowHeight / 2);

    // let spectrum = normalizeArray(fft.analyze(), multiplier);
    let spectrum = normalizeArray(smoothArray(fft.analyze()), multiplier);
    // console.log(spectrum);


    settingsRightClick(); //Toggle Settings overlay on right click

    if (eq_switched.value() == 0) {
        min = eq_size.value() * windowHeight;
        max = windowHeight * eq_height.value();
        freq_cleaner = ((spectrum.length / 3) * 2);

        strokeWeight(bandstroke.value());

        for (var i = 0; i < freq_cleaner; i++) {
            var amp = spectrum[i];
            var y = map(amp, 0, 256, max, min);

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
        freq_cleaner = ((spectrum.length / 3) * 2);

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

function highestPowerof2(n) {
    var p = round((Math.log(n) / Math.log(2)));

    return round(Math.pow(2, p));
}