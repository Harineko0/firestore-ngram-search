"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nGram = void 0;
function nGram(n, value) {
    var nGram = [];
    var max = value.length - n + 1;
    for (var index = 0; index < max; index++) {
        nGram[index] = value.slice(index, index + n);
    }
    return nGram;
}
exports.nGram = nGram;
