"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var firestore_1 = require("@google-cloud/firestore");
var nGram_1 = require("./nGram");
var functions = __importStar(require("firebase-functions"));
var IndexEntityConverter = {
    toFirestore: function (object) {
        return {
            ref: object.ref,
            tokens: Object.fromEntries(object.tokens),
        };
    }
};
var AdminIndexEntityConverter = {
    fromFirestore: function (snapshot) {
        return snapshot.data();
    },
    toFirestore: function (modelObject, options) {
        return IndexEntityConverter.toFirestore(modelObject);
    }
};
var ClientIndexEntityConverter = {
    fromFirestore: function (snapshot, options) {
        return snapshot.data(options);
    },
    toFirestore: function (modelObject, options) {
        return IndexEntityConverter.toFirestore(modelObject);
    }
};
var keys = {
    tokens: "tokens",
    field: "__field",
};
var FirestoreSearch = /** @class */ (function () {
    function FirestoreSearch(ref, options, db) {
        if (ref instanceof firestore_1.CollectionReference) {
            this.indexRef = ref.doc('fs.v1').collection('index').withConverter(AdminIndexEntityConverter);
            this.isAdmin = true;
            if (db) {
                this.db = db;
            }
            else {
                console.error("Set Firestore while using FirestoreSearch with Admin SDK.");
            }
        }
        else {
            this.indexRef = ref.doc('fs.v1').collection('index').withConverter(ClientIndexEntityConverter);
            this.isAdmin = false;
        }
        this.options = options !== null && options !== void 0 ? options : { n: 3 };
    }
    FirestoreSearch.prototype.set = function (docRef, options) {
        return __awaiter(this, void 0, void 0, function () {
            var data, snapshot, _data_1, fields, targetFields, _a, _b, _c, fieldName, value, keyIndex_2, batch, keyIndex_1, keyIndex_1_1, _d, key, entity, e_1;
            var e_2, _e, e_3, _f;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!this.isAdmin) return [3 /*break*/, 9];
                        data = options === null || options === void 0 ? void 0 : options.data;
                        if (!!data) return [3 /*break*/, 2];
                        return [4 /*yield*/, docRef.get()];
                    case 1:
                        snapshot = _g.sent();
                        if (!snapshot.exists) {
                            throw new Error('Document does not exist.');
                        }
                        data = snapshot.data();
                        _g.label = 2;
                    case 2:
                        _data_1 = data;
                        if (!_data_1) {
                            throw new Error('Document does not exist.');
                        }
                        fields = options === null || options === void 0 ? void 0 : options.fields;
                        targetFields = new Set();
                        if (fields) {
                            targetFields = new Set(fields.filter(function (field) { return field in _data_1 && typeof _data_1[field] === "string"; }));
                        }
                        else {
                            try {
                                for (_a = __values(Object.entries(_data_1)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                    _c = __read(_b.value, 2), fieldName = _c[0], value = _c[1];
                                    if (typeof value !== "string")
                                        continue;
                                    targetFields.add(fieldName);
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                        }
                        keyIndex_2 = new Map();
                        Array.from(targetFields.values())
                            .forEach(function (field) {
                            var tokens = new Map();
                            var nGrams = (0, nGram_1.nGram)(_this.options.n, _data_1[field]);
                            nGrams.forEach(function (nGram) {
                                if (!nGram.startsWith("__"))
                                    tokens.set(nGram, true);
                            });
                            tokens.set(keys.field, field);
                            var entity = {
                                ref: docRef,
                                tokens: tokens,
                            };
                            keyIndex_2.set(field, entity);
                        });
                        if (!this.db) return [3 /*break*/, 7];
                        batch = this.db.batch();
                        try {
                            for (keyIndex_1 = __values(keyIndex_2), keyIndex_1_1 = keyIndex_1.next(); !keyIndex_1_1.done; keyIndex_1_1 = keyIndex_1.next()) {
                                _d = __read(keyIndex_1_1.value, 2), key = _d[0], entity = _d[1];
                                if (this.indexRef instanceof firestore_1.CollectionReference)
                                    batch.set(this.indexRef.doc(docRef.id + "." + key), entity);
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (keyIndex_1_1 && !keyIndex_1_1.done && (_f = keyIndex_1.return)) _f.call(keyIndex_1);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        _g.label = 3;
                    case 3:
                        _g.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, batch.commit()];
                    case 4:
                        _g.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _g.sent();
                        functions.logger.error(e_1);
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        console.error("Firestore is undefined.");
                        _g.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        console.error("You can only use FirestoreSearch.set() with Admin SDK.");
                        _g.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    FirestoreSearch.prototype.search = function (searchQuery, options) {
        return __awaiter(this, void 0, void 0, function () {
            var query, fields, _searchQuery, snap, hits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = this.indexRef;
                        fields = options === null || options === void 0 ? void 0 : options.fields;
                        functions.logger.log("fields");
                        functions.logger.log(fields);
                        if (fields) {
                            query = query.where(keys.tokens + "." + keys.field, "in", fields);
                        }
                        _searchQuery = (0, nGram_1.nGram)(this.options.n, searchQuery);
                        functions.logger.log("_searchQuery");
                        functions.logger.log(_searchQuery);
                        _searchQuery.forEach(function (word) {
                            query = query.where(keys.tokens + "." + word, "==", true);
                        });
                        return [4 /*yield*/, query.get()];
                    case 1:
                        snap = _a.sent();
                        if (snap.empty)
                            return [2 /*return*/, { hits: [] }];
                        hits = snap.docs.map(function (doc) { return doc.data().ref; });
                        functions.logger.log(hits.map(function (hit) { return hit.id; }));
                        return [2 /*return*/, { hits: Array.from(new Set(hits)) }];
                }
            });
        });
    };
    return FirestoreSearch;
}());
exports.default = FirestoreSearch;
