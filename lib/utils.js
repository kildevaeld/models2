"use strict";
function isString(a) {
    return typeof a === 'string';
}
exports.isString = isString;
function isStringArray(a) {
    if (!Array.isArray(a)) {
        return false;
    }
    return a.reduce((l, c) => {
        if (typeof c === 'string')
            return l + 1;
        return l;
    }, 0) == a.length;
}
exports.isStringArray = isStringArray;
