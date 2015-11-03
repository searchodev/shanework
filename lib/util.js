function clean(str) {

    if (typeof str !== 'undefined') {
        str = str.replace(/(\r\n|\n|\r)/gm, '');
        return str.trim();
    } else {
        return '';
    }
}

function extractPrice(num) {
    if (typeof num !== 'undefined') {
        var val = clean(num);
        var ret = clean(val.replace(/Rs./g, ''));

        if (ret.indexOf(' ') > -1) {
            ret = ret.split(' ')[1];
        }
        return Number(ret.replace(/[^0-9\.]+/g, ''));
    } else {
        return 0;
    }
}


function extractNumber(num)
{
  return Number(num.replace(/[^0-9\.]+/g, ''));
}

exports.clean = clean;
exports.extractPrice = extractPrice;
exports.extractNumber = extractNumber;
