let svgObject;

setTimeout(function() {
    window.setInterval(function() {
        updateSVG();
    }, 10);
}, 2000)

function updateSVG() {
    if (svgObject) {
        svg.getElementsByTagName('g')[0].style.fill = color(eq_r.value(), eq_g.value(), eq_b.value());
        svg.getElementsByTagName('svg')[0].setAttribute("width", height * imagesize.value() * peakValue);
        svg.getElementsByTagName('svg')[0].setAttribute("height", height * imagesize.value() * peakValue);
        // console.log(svg.getElementsByTagName('svg')[0].style.width, svg.getElementsByTagName('svg')[0].style.height);
    }
}

function triggerBeat(beat = false) {
    if (beat) {
        peakValue = 2;
    } else {
        if (peakValue <= 1) {
            peakValue = 1;
        } else {
            peakValue *= 0.95;
        }
    }
}