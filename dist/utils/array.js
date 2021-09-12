"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDuplicate = exports.convertOneArray = void 0;
// convert two-dimensional array to one-dimensional array
function convertOneArray(pre, current) {
    pre.push.apply(pre, __spreadArray([], __read(current), false));
    return pre;
}
exports.convertOneArray = convertOneArray;
function removeDuplicate(value, index, array) {
    return array.findIndex(function (el) {
        if (typeof el === "object") {
            var keys = Object.keys(el);
            return !keys.map(function (key) {
                // @ts-ignore
                return el[key.toString()] === value[key.toString()];
            }).includes(false);
        }
        return false;
    }) === index;
}
exports.removeDuplicate = removeDuplicate;
