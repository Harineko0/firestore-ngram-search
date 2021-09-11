"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nGram = void 0;
function nGram(n, value) {
    if (n !== 1) {
        var nGram_1 = [];
        var max = value.length - n + 1;
        for (var index = 0; index < max; index++) {
            nGram_1[index] = value.slice(index, index + n);
        }
        return nGram_1;
    }
    return value.split('');
}
exports.nGram = nGram;
