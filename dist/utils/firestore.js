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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchQuery = exports.docID = exports.getTargetFields = exports.getData = void 0;
var index_1 = require("../index");
var nGram_1 = require("../nGram");
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
function docID(refID, field) {
    return refID + "." + field;
}
exports.docID = docID;
var SearchQuery = /** @class */ (function () {
    function SearchQuery(ref, n) {
        this._where = [];
        this.ref = ref;
        this.n = n !== null && n !== void 0 ? n : 3;
        this._limit = 500;
    }
    SearchQuery.prototype.where = function (fieldPath, opStr, value) {
        this._where.push({ fieldPath: fieldPath, opStr: opStr, value: value });
        return this;
    };
    SearchQuery.prototype.orderBy = function (fieldPath, directionStr) {
        var _order = directionStr !== null && directionStr !== void 0 ? directionStr : "asc";
        this._orderBy = { fieldPath: "order", directionStr: _order };
        return this;
    };
    SearchQuery.prototype.startAt = function () {
        var fieldValues = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fieldValues[_i] = arguments[_i];
        }
        this._startAt = fieldValues;
        return this;
    };
    SearchQuery.prototype.startAfter = function () {
        var fieldValues = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fieldValues[_i] = arguments[_i];
        }
        this._startAfter = fieldValues;
        return this;
    };
    SearchQuery.prototype.endAt = function () {
        var fieldValues = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fieldValues[_i] = arguments[_i];
        }
        this._endAt = fieldValues;
        return this;
    };
    SearchQuery.prototype.endBefore = function () {
        var fieldValues = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fieldValues[_i] = arguments[_i];
        }
        this._endBefore = fieldValues;
        return this;
    };
    SearchQuery.prototype.limit = function (limit) {
        this._limit = limit;
        return this;
    };
    SearchQuery.prototype.search = function (searchQuery, searchOptions) {
        this._searchQuery = searchQuery;
        this._options = searchOptions;
        return this;
    };
    SearchQuery.prototype.get = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var query, fields, _searchQuery, _b, _c, _d, fieldPath, opStr, value, snap, hits, data;
            var e_2, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        query = this.ref;
                        fields = (_a = this._options) === null || _a === void 0 ? void 0 : _a.fields;
                        if (fields)
                            query = query.where(index_1.fieldPaths.tokens + "." + index_1.fieldPaths.field, "in", fields);
                        if (this._searchQuery) {
                            _searchQuery = (0, nGram_1.nGram)(this.n, this._searchQuery);
                            _searchQuery.forEach(function (word) {
                                query = query.where(index_1.fieldPaths.tokens + "." + word, "==", true);
                            });
                        }
                        try {
                            for (_b = __values(this._where), _c = _b.next(); !_c.done; _c = _b.next()) {
                                _d = _c.value, fieldPath = _d.fieldPath, opStr = _d.opStr, value = _d.value;
                                query = query.where(fieldPath, opStr, value);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_e = _b.return)) _e.call(_b);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        if (this._orderBy)
                            query = query.orderBy(this._orderBy.fieldPath, this._orderBy.directionStr);
                        if (this._startAt)
                            query = query.startAt(this._startAt);
                        if (this._startAfter)
                            query = query.startAfter(this._startAfter);
                        if (this._endAt)
                            query = query.startAt(this._endAt);
                        if (this._endBefore)
                            query = query.startAt(this._endBefore);
                        if (this._limit)
                            query = query.limit(this._limit);
                        return [4 /*yield*/, query.get()];
                    case 1:
                        snap = _f.sent();
                        if (snap.empty)
                            return [2 /*return*/, { hits: [], data: [] }];
                        hits = snap.docs.map(function (doc) { return doc.data().__ref; });
                        data = snap.docs.map(function (doc) {
                            var _a = doc.data(), _b = _a.__ref, _c = _b === void 0 ? {} : _b, _d = _c, _e = _a.__tokens, _f = _e === void 0 ? {} : _e, _g = _f, data = __rest(_a, ["__ref", "__tokens"]);
                            return data;
                        });
                        return [2 /*return*/, { hits: Array.from(new Set(hits)), data: Array.from(new Set(data)) }];
                }
            });
        });
    };
    return SearchQuery;
}());
exports.SearchQuery = SearchQuery;
