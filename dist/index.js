"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.fieldPaths = void 0;
var firestore_1 = require("@google-cloud/firestore");
var nGram_1 = require("./nGram");
var firestore_2 = require("./firestore");
var batch_1 = require("./batch");
exports.fieldPaths = {
    tokens: "__tokens",
    field: "__field",
};
var IndexEntityConverter = {
    toFirestore: function (object) {
        return __assign(__assign({}, object.values), { __ref: object.__ref, __tokens: Object.fromEntries(object.__tokens) });
    },
    fromFirestore: function (data) {
        var _a = data.__ref, _b = _a === void 0 ? {} : _a, _c = _b, _d = data.__tokens, _e = _d === void 0 ? {} : _d, _f = _e, values = __rest(data, ["__ref", "__tokens"]);
        return {
            __ref: data.__ref,
            __tokens: data.__tokens,
            values: values,
        };
    }
};
var AdminIndexEntityConverter = {
    fromFirestore: function (snapshot) {
        return IndexEntityConverter.fromFirestore(snapshot.data());
    },
    toFirestore: function (modelObject) {
        return IndexEntityConverter.toFirestore(modelObject);
    }
};
var ClientIndexEntityConverter = {
    fromFirestore: function (snapshot, options) {
        return IndexEntityConverter.fromFirestore(snapshot.data(options));
    },
    toFirestore: function (modelObject) {
        return IndexEntityConverter.toFirestore(modelObject);
    }
};
function getIndexDocument(docRef, field, data, n) {
    var tokens = new Map();
    var nGrams = (0, nGram_1.nGram)(n, data[field]);
    nGrams.forEach(function (nGram) {
        if (!nGram.startsWith("__"))
            tokens.set(nGram, true);
    });
    tokens.set(exports.fieldPaths.field, field);
    var entity = {
        __ref: docRef,
        __tokens: tokens,
        values: __assign({}, data)
    };
    return { field: field, entity: entity, n: n };
}
var FirestoreSearch = /** @class */ (function () {
    function FirestoreSearch(ref, options) {
        var _a;
        if (ref instanceof firestore_1.CollectionReference) {
            this.indexRef = ref.doc('fs.v1').collection('index').withConverter(AdminIndexEntityConverter);
            this.isAdmin = true;
            this.db = ref.firestore;
        }
        else {
            this.indexRef = ref.doc('fs.v1').collection('index').withConverter(ClientIndexEntityConverter);
            this.isAdmin = false;
        }
        this.n = (_a = options === null || options === void 0 ? void 0 : options.n) !== null && _a !== void 0 ? _a : 2;
    }
    FirestoreSearch.prototype.set = function (docRef, options) {
        return __awaiter(this, void 0, void 0, function () {
            var data_1, targetFields, nGramDocs, charDocs, docs, batch_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isAdmin) return [3 /*break*/, 1];
                        throw new Error("You can only use FirestoreSearch.set() with Admin SDK.");
                    case 1: return [4 /*yield*/, (0, firestore_2.getData)(docRef, options === null || options === void 0 ? void 0 : options.data)];
                    case 2:
                        data_1 = _a.sent();
                        targetFields = Array.from((0, firestore_2.getTargetFields)(data_1, options === null || options === void 0 ? void 0 : options.fields).values());
                        nGramDocs = targetFields.map(function (field) {
                            return getIndexDocument(docRef, field, data_1, _this.n);
                        });
                        charDocs = targetFields.map(function (field) {
                            return getIndexDocument(docRef, field, data_1, 1);
                        });
                        docs = __spreadArray(__spreadArray([], __read(nGramDocs), false), __read(charDocs), false);
                        if (!this.db) return [3 /*break*/, 4];
                        batch_2 = new batch_1.WriteBatch2(this.db, { batch: options === null || options === void 0 ? void 0 : options.batch });
                        docs.forEach(function (doc) {
                            if (_this.indexRef instanceof firestore_1.CollectionReference)
                                batch_2.set(_this.indexRef.doc((0, firestore_2.docID)(docRef.id, doc.field, doc.n)), doc.entity);
                        });
                        return [4 /*yield*/, batch_2.commit()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4: throw new Error("Firestore is undefined.");
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    FirestoreSearch.prototype.delete = function (docRef, options) {
        return __awaiter(this, void 0, void 0, function () {
            var data, targetFields, batch_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isAdmin) return [3 /*break*/, 1];
                        throw new Error("You can only use FirestoreSearch.delete() with Admin SDK.");
                    case 1: return [4 /*yield*/, (0, firestore_2.getData)(docRef, options === null || options === void 0 ? void 0 : options.data)];
                    case 2:
                        data = _a.sent();
                        targetFields = (0, firestore_2.getTargetFields)(data, options === null || options === void 0 ? void 0 : options.fields);
                        if (!this.db) return [3 /*break*/, 4];
                        batch_3 = new batch_1.WriteBatch2(this.db, { batch: options === null || options === void 0 ? void 0 : options.batch });
                        targetFields.forEach(function (field) {
                            if (_this.indexRef instanceof firestore_1.CollectionReference) {
                                batch_3.delete(_this.indexRef.doc((0, firestore_2.docID)(docRef.id, field, _this.n)));
                                batch_3.delete(_this.indexRef.doc((0, firestore_2.docID)(docRef.id, field, 1)));
                            }
                        });
                        return [4 /*yield*/, batch_3.commit()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FirestoreSearch.prototype.query = function () {
        return new firestore_2.SearchQuery(this.indexRef, this.n);
    };
    return FirestoreSearch;
}());
exports.default = FirestoreSearch;
