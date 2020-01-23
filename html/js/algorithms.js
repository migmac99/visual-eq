function runAlgorithms(array, preset) {
    var newArray = array;

    if (preset == 1) {
        newArray = normalizeArray(newArray, multiplier);
        newArray = tailTransform(newArray);
        newArray = savitskyGolaySmooth(newArray, 3, 1);
    } else if (preset == 2) {
        newArray = normalizeArray(newArray, multiplier);
        newArray = averageTransform(newArray);
        newArray = tailTransform(newArray);
        newArray = savitskyGolaySmooth(newArray, 3, 1);
        newArray = exponentialTransform(newArray);
    } else if (preset == 3) {
        newArray = normalizeArray(newArray, multiplier);
        newArray = averageTransform(newArray);
        newArray = tailTransform(newArray);
        newArray = savitskyGolaySmooth(newArray, 3, 1);
        newArray = exponentialTransform(newArray, 10, 2);
    }
    return newArray;
}


//Normalizes array, all values are between 0 - 1
function normalizeArray(array, multiplier) {
    if (eq_normalize.value() == 0) {
        return (array);
    } else {
        return normalize(array).map(function(x) { return x * multiplier; });;
    }
}

function normalize(arr, dim, bounds) {
    if (!arr || arr.length == null) throw Error('Argument should be an array')

    if (dim == null) dim = 1
    if (bounds == null) bounds = getBounds(arr, dim)

    for (var offset = 0; offset < dim; offset++) {
        var max = bounds[dim + offset],
            min = bounds[offset],
            i = offset,
            l = arr.length;

        if (max === Infinity && min === -Infinity) {
            for (i = offset; i < l; i += dim) {
                arr[i] = arr[i] === max ? 1 : arr[i] === min ? 0 : .5
            }
        } else if (max === Infinity) {
            for (i = offset; i < l; i += dim) {
                arr[i] = arr[i] === max ? 1 : 0
            }
        } else if (min === -Infinity) {
            for (i = offset; i < l; i += dim) {
                arr[i] = arr[i] === min ? 0 : 1
            }
        } else {
            var range = max - min
            for (i = offset; i < l; i += dim) {
                if (!isNaN(arr[i])) {
                    arr[i] = range === 0 ? .5 : (arr[i] - min) / range
                }
            }
        }
    }
    return arr;
}

function getBounds(arr, dim) {
    if (!arr || arr.length == null) throw Error('Argument should be an array')

    if (dim == null) dim = 1
    else dim = Math.floor(dim)

    var bounds = Array(dim * 2)

    for (var offset = 0; offset < dim; offset++) {
        var max = -Infinity,
            min = Infinity,
            i = offset,
            l = arr.length;
        for (; i < l; i += dim) {
            if (arr[i] > max) max = arr[i];
            if (arr[i] < min) min = arr[i];
        }
        bounds[offset] = min
        bounds[dim + offset] = max
    }
    return bounds;
}

function averageTransform(array) {
    var values = [];
    var length = array.length;

    for (var i = 0; i < length; i++) {
        var value = 0;
        if (i == 0) {
            value = array[i];
        } else if (i == length - 1) {
            value = (array[i - 1] + array[i]) / 2;
        } else {
            var prevValue = array[i - 1];
            var curValue = array[i];
            var nextValue = array[i + 1];

            if (curValue >= prevValue && curValue >= nextValue) {
                value = curValue;
            } else {
                value = (curValue + Math.max(nextValue, prevValue)) / 2;
            }
        }
        value = Math.min(value + 1, max);

        values[i] = value;
    }

    var newValues = [];
    for (var i = 0; i < length; i++) {
        var value = 0;
        if (i == 0) {
            value = values[i];
        } else if (i == length - 1) {
            value = (values[i - 1] + values[i]) / 2;
        } else {
            var prevValue = values[i - 1];
            var curValue = values[i];
            var nextValue = values[i + 1];

            if (curValue >= prevValue && curValue >= nextValue) {
                value = curValue;
            } else {
                value = ((curValue / 2) + (Math.max(nextValue, prevValue) / 3) + (Math.min(nextValue, prevValue) / 6));
            }
        }
        value = Math.min(value + 1, max);

        newValues[i] = value;
    }
    return newValues;
}

function tailTransform(array, headMargin = 7, tailMargin = 10, minMarginWeight = 0.4) {

    var marginDecay = 1.6; // I admittedly forget how this works but it probably shouldn't be changed from 1.6
    var headMarginSlope = (1 - minMarginWeight) / Math.pow(headMargin, marginDecay);
    var tailMarginSlope = (1 - minMarginWeight) / Math.pow(tailMargin, marginDecay);

    var values = [];
    for (var i = 0; i < bands; i++) {
        var value = array[i];
        if (i < headMargin) {
            value *= headMarginSlope * Math.pow(i + 1, marginDecay) + minMarginWeight;
        } else if (bands - i <= tailMargin) {
            value *= tailMarginSlope * Math.pow(bands - i, marginDecay) + minMarginWeight;
        }
        values[i] = value;
    }
    return values;
}

function savitskyGolaySmooth(array, smoothingPoints = 3, smoothingPasses = 1) {
    // smoothingPoints | points to use for algorithmic smoothing. Must be an odd number.
    // smoothingPasses | number of smoothing passes to execute

    var lastArray = array;
    for (var pass = 0; pass < smoothingPasses; pass++) {
        var sidePoints = Math.floor(smoothingPoints / 2); // our window is centered so this is both nL and nR
        var cn = 1 / (2 * sidePoints + 1); // constant
        var newArr = [];
        for (var i = 0; i < sidePoints; i++) {
            newArr[i] = lastArray[i];
            newArr[lastArray.length - i - 1] = lastArray[lastArray.length - i - 1];
        }
        for (var i = sidePoints; i < lastArray.length - sidePoints; i++) {
            var sum = 0;
            for (var n = -sidePoints; n <= sidePoints; n++) {
                sum += cn * lastArray[i + n] + n;
            }
            newArr[i] = sum;
        }
        lastArray = newArr;
    }
    return newArr;
}

function exponentialTransform(array, spectrumMaxExponent = 6, spectrumMinExponent = 2, spectrumExponentScale = 2) {
    //spectrumMaxExponent | The max exponent to raise spectrum values to
    //spectrumMinExponent | The min exponent to raise spectrum values to
    //spectrumExponentScale | The scale for spectrum exponents

    var newArr = [];
    for (var i = 0; i < array.length; i++) {
        var exp = (spectrumMaxExponent - spectrumMinExponent) * (1 - Math.pow(i / bands, spectrumExponentScale)) + spectrumMinExponent;
        newArr[i] = Math.max(Math.pow(array[i] / max, exp) * max, 1);
    }
    return newArr;
}

function highestPowerof2(n) {
    var p = round((Math.log(n) / Math.log(2)));

    return round(Math.pow(2, p));
}