let mic, fft, canvas, bg;

let w; //width of each band
let smooth = 0.9; //smoothing value (0 - 1)
let bands = 64; //number of bands

function preload() {
    bg = loadImage('image.png');
}

function setup() {
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT(smooth, bands);
    fft.setInput(mic);

    settings();
}

function windowResized() {
    settings();
}

function settings() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('z-index', '-1')

    image(bg, 0, 0);

    w = width / bands;
    ww = -width / bands;
}

function draw() {
    // document.querySelectorAll("p5Canvas").forEach(element => element.style.backgroundImage = "url(image.png)");
    background(bg);
    var spectrum = fft.analyze();
    // console.log(spectrum);

    stroke(255);
    // noStroke();

    // Left Side
    for (var i = 0; i < spectrum.length; i++) {
        var amp = spectrum[i];
        var y = map(amp, 0, 256, height, 0);

        // fill(i, 255, 255);
        // rect(i * w, y, w, height - i);

        line(i * w, height, i * w, y);
    }

    // Right Side
    for (var i = 0; i < spectrum.length; i++) {
        var amp = spectrum[i];
        var y = map(amp, 0, 256, height, 0);

        // fill(i, 255, 255);
        // rect(i * w, y, w, height - i);

        line(i * ww + width, height, i * ww + width, y);
    }
}

function touchStarted() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
}