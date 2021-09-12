"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
exports.parseQuery = exports.startsWith = exports.SearchQuery = exports.docID = exports.getTargetFields = exports.getData = void 0;
var index_1 = require("./index");
var nGram_1 = require("./nGram");
function getData(ref, dataOrUndef) {
    return __awaiter(this, void 0, void 0, function () {
        var data, snap, _data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = dataOrUndef;
                    if (!!data) return [3 /*break*/, 2];
                    return [4 /*yield*/, ref.get()];
                case 1:
                    snap = _a.sent();
                    if (!snap.exists) {
                        throw new Error('Document does not exist.');
                    }
                    data = snap.data();
                    _a.label = 2;
                case 2:
                    _data = data;
                    if (!_data) {
                        throw new Error('Document does not exist.');
                    }
                    return [2 /*return*/, _data];
            }
        });
    });
}
exports.getData = getData;
function getTargetFields(data, fieldsOrUndef) {
    var e_1, _a;
    var fields = fieldsOrUndef;
    var targetFields = new Set();
    if (fields) {
        targetFields = new Set(fields.filter(function (field) { return field in data && typeof data[field] === "string"; }));
    }
    else {
        try {
            for (var _b = __values(Object.entries(data)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), fieldName = _d[0], value = _d[1];
                if (typeof value !== "string")
                    continue;
                targetFields.add(fieldName);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    return targetFields;
}
exports.getTargetFields = getTargetFields;
function docID(refID, field, n) {
    return refID + "." + field + "." + n;
}
exports.docID = docID;
var SearchQuery = /** @class */ (function () {
    function SearchQuery(ref, n) {
        this.ref = ref;
        this.n = n !== null && n !== void 0 ? n : 2;
        this.query = ref;
    }
    SearchQuery.prototype.where = function (fieldPath, opStr, value) {
        this.query = this.query.where(fieldPath, opStr, value);
        return this;
    };
    SearchQuery.prototype.orderBy = function (fieldPath, directionStr) {
        this.query = this.query.orderBy(fieldPath, directionStr);
        return this;
    };
    SearchQuery.prototype.startAt = function () {
        var fieldValues = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fieldValues[_i] = arguments[_i];
        }
        this.query = this.query.startAt(fieldValues);
        return this;
    };
    SearchQuery.prototype.startAfter = function () {
        var fieldValues = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fieldValues[_i] = arguments[_i];
        }
        this.query = this.query.startAfter(fieldValues);
        return this;
    };
    SearchQuery.prototype.endAt = function () {
        var fieldValues = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fieldValues[_i] = arguments[_i];
        }
        this.query = this.query.endAt(fieldValues);
        return this;
    };
    SearchQuery.prototype.endBefore = function () {
        var fieldValues = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fieldValues[_i] = arguments[_i];
        }
        this.query = this.query.endBefore(fieldValues);
        return this;
    };
    SearchQuery.prototype.limit = function (limit) {
        this.query = this.query.limit(limit);
        return this;
    };
    SearchQuery.prototype.search = function (searchQuery, searchOptions) {
        var _this = this;
        var fields = searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.fields;
        if (fields)
            this.query = this.query.where(index_1.fieldPaths.tokens + "." + index_1.fieldPaths.field, "in", fields);
        if (searchQuery) {
            var _searchQuery = parseQuery(searchQuery, { n: this.n });
            _searchQuery.words.forEach(function (word) {
                _this.query = _this.query.where(index_1.fieldPaths.tokens + "." + word, "==", true);
            });
        }
        return this;
    };
    SearchQuery.prototype.get = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var snap, refs, idToCount, refToCount, refs_1, refs_1_1, ref, _count, count, hitData, data;
            var e_2, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.query.get()];
                    case 1:
                        snap = _c.sent();
                        if (snap.empty)
                            return [2 /*return*/, { hits: [], data: [] }];
                        refs = snap.docs.map(function (doc) { return doc.data().__ref; });
                        idToCount = new Map();
                        refToCount = new Map();
                        try {
                            for (refs_1 = __values(refs), refs_1_1 = refs_1.next(); !refs_1_1.done; refs_1_1 = refs_1.next()) {
                                ref = refs_1_1.value;
                                if (idToCount.has(ref.id)) {
                                    _count = (_a = idToCount.get(ref.id)) !== null && _a !== void 0 ? _a : 0;
                                    count = _count + 1;
                                    idToCount.set(ref.id, count);
                                    refToCount.set(ref, count);
                                }
                                else {
                                    idToCount.set(ref.id, 1);
                                    refToCount.set(ref, 1);
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (refs_1_1 && !refs_1_1.done && (_b = refs_1.return)) _b.call(refs_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        hitData = Array.from(refToCount.entries()).map(function (_a) {
                            var _b = __read(_a, 2), ref = _b[0], count = _b[1];
                            return ({ ref: ref, count: count });
                        });
                        data = snap.docs.map(function (doc) { return doc.data().values; });
                        return [2 /*return*/, { hits: hitData, data: Array.from(new Set(data)) }];
                }
            });
        });
    };
    return SearchQuery;
}());
exports.SearchQuery = SearchQuery;
function startsWith(query, fieldPath, value) {
    var start = value.slice(0, value.length - 1);
    var end = value.slice(value.length - 1, value.length);
    var v = start + String.fromCharCode(end.charCodeAt(0) + 1);
    return query
        .where(fieldPath, '>=', value)
        .where(fieldPath, '<', v)
        .orderBy(fieldPath);
}
exports.startsWith = startsWith;
function parseQuery(stringQuery, options) {
    var _a;
    var _n = (_a = options === null || options === void 0 ? void 0 : options.n) !== null && _a !== void 0 ? _a : 2;
    var eachQuery = stringQuery.split(" ");
    eachQuery = eachQuery.filter(function (value) { return value !== ''; });
    var searchQuery = eachQuery
        .map(function (query) {
        if (query.length < _n) {
            return query.split("");
        }
        return (0, nGram_1.nGram)(_n, query);
    })
        .reduce(function (pre, current) {
        pre.push.apply(pre, __spreadArray([], __read(current), false));
        return pre;
    }, []);
    return { words: searchQuery };
}
exports.parseQuery = parseQuery;
