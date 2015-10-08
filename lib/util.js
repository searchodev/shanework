function clean(str) {
    return str.trim();
}

function extractNumber(num) {
    var ret = clean(num).replace('Rs. ', '');
    return Number(ret.replace(/[^0-9\.]+/g, ''));
}

exports.clean = clean;
exports.extractNumber = extractNumber;