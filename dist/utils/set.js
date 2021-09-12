"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringMap = exports.DeepSet = void 0;
var DeepSet = /** @class */ (function (_super) {
    __extends(DeepSet, _super);
    function DeepSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DeepSet.prototype.add = function (o) {
        var e_1, _a;
        try {
            for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
                var i = _c.value;
                if (this.deepCompare(o, i))
                    return this;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        _super.prototype.add.call(this, o);
        return this;
    };
    ;
    DeepSet.prototype.deepCompare = function (o, i) {
        return JSON.stringify(o) === JSON.stringify(i);
    };
    return DeepSet;
}(Set));
exports.DeepSet = DeepSet;
var StringMap = /** @class */ (function (_super) {
    __extends(StringMap, _super);
    function StringMap() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StringMap.prototype.has = function (key) {
        var e_2, _a;
        if (typeof key === 'string') {
            var thisKeys = this.keys();
            var has = false;
            try {
                for (var thisKeys_1 = __values(thisKeys), thisKeys_1_1 = thisKeys_1.next(); !thisKeys_1_1.done; thisKeys_1_1 = thisKeys_1.next()) {
                    var thisKey = thisKeys_1_1.value;
                    if (thisKey == key) {
                        has = true;
                        break;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (thisKeys_1_1 && !thisKeys_1_1.done && (_a = thisKeys_1.return)) _a.call(thisKeys_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return has;
        }
        return false;
    };
    return StringMap;
}(Map));
exports.StringMap = StringMap;
