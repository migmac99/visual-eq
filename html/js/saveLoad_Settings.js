function saveDownload() {
    saveSettings(true);
}

function saveSettings(download = false) {
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

    if (!download) {
        var data = JSON.stringify(settings);
        var blank = window.open(getURL() + "update-settings/" + data);
        setTimeout(() => { blank.close(); }, 100);
        // console.log(getURL() + "update-settings/" + data);
    } else {
        saveJSON(settings, 'settings.json');
    }
}

function loadSettings() {
    console.log('ss');
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = e => {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file);

        reader.onload = readerEvent => {
            let content = JSON.parse(readerEvent.target.result);

            smooth.value(content.smooth);
            bandspace.value(content.bandspace);
            bandstroke.value(content.bandstroke);
            bandstroke_mirrored.value(content.bandstroke_mirrored);
            imagesize.value(content.imagesize);
            bg_r.value(content.bg_r);
            bg_g.value(content.bg_g);
            bg_b.value(content.bg_b);
            eq_r.value(content.eq_r);
            eq_g.value(content.eq_g);
            eq_b.value(content.eq_b);
            eq_size.value(content.eq_size);
            eq_height.value(content.eq_height);
            eq_mirrored.value(content.eq_mirrored);
            eq_switched.value(content.eq_switched);
            eq_normalize.value(content.eq_normalize);
            filterFreq.value(content.filterFreq);
            filterRes.value(content.filterRes);

            refresh();
        }
    }
    input.click();
}