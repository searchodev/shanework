function clean(str) {

    str = str.replace(/(\r\n|\n|\r)/gm, '');
    return str.trim();
}

function extractNumber(num) {
    var val = clean(num);
    var ret = clean(val.replace(/Rs./g, ''));

    if (ret.indexOf(' ') > -1) {
        ret = ret.split(' ')[1];
    }
    return Number(ret.replace(/[^0-9\.]+/g, ''));
}

exports.clean = clean;
exports.extractNumber = extractNumber;