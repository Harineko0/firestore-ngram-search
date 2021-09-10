"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nGram = void 0;
function nGram(n, value) {
    var nGram = [];
    var max = value.length - n + 1;
    for (var index = 0; index < max; index++) {
        nGram[index] = value.slice(index, index + n);
    }
    //         |add these|
    // ABCD => ["A", "AB", "ABC"...]
    if (value.length > 0 && n >= 2)
        nGram.unshift(value.substr(0, 1));
    if (value.length > 1 && n >= 3)
        nGram.unshift(value.substr(0, 2));
    return nGram;
}
exports.nGram = nGram;
