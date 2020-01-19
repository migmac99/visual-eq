let mic, fft, canvas, logo;

let w; //width of each band
let smooth = 0.9; //smoothing value (0 - 1)
let bandspace = 10; //space between bands
let imagesize = 3;

function preload() {
    logo = loadImage('logo.svg');
}

function setup() {
    mic = new p5.AudioIn();
    mic.start();

    settings();
}

function windowResized() {
    settings();
}

function settings() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('z-index', '-1');

    w = bandspace;
    bands = width / bandspace;

    fft = new p5.FFT(smooth, highestPowerof2(bands));
    fft.setInput(mic);
}

function draw() {
    background('black');

    imageMode(CENTER);
    image(logo, windowWidth / 2, windowHeight / 2, windowHeight / imagesize, windowHeight / imagesize);

    var spectrum = fft.analyze();

    stroke(255);

    // Left Side
    for (var i = 0; i < spectrum.length; i++) {
        var amp = spectrum[i];
        var y = map(amp, 0, 256, height, 0);

        line(i * w, height, i * w, y);
    }

    // Right Side
    for (var i = 0; i < spectrum.length; i++) {
        var amp = spectrum[i];
        var y = map(amp, 0, 256, height, 0);

        line(i * (-w) + width, height, i * (-w) + width, y);
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