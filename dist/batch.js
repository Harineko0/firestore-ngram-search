"use strict";
// https://github.com/k2wanko/firestore-full-text-search/blob/main/src/utils/firestore.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteBatch2 = void 0;
function flatDeep(arr, d) {
    if (d === void 0) { d = 1; }
    return d > 0
        ? arr.reduce(function (acc, val) {
            return acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val);
        }, [])
        : arr.slice();
}
// Split more than 500 document writes.
var WriteBatch2 = /** @class */ (function () {
    function WriteBatch2(db, options) {
        var _a;
        this.writeDocumentMap = new Map();
        this.committed = false;
        this.db = db;
        this.externalBatch = (_a = options === null || options === void 0 ? void 0 : options.batch) !== null && _a !== void 0 ? _a : null;
        this.committed = false;
    }
    WriteBatch2.prototype.create = function (documentRef, data) {
        this.writeDocumentMap.set(documentRef, { type: 'create', data: data });
        return this;
    };
    WriteBatch2.prototype.set = function (documentRef, data, options) {
        this.writeDocumentMap.set(documentRef, { type: 'set', data: data, options: options });
        return this;
    };
    WriteBatch2.prototype.delete = function (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    documentRef, precondition) {
        this.writeDocumentMap.set(documentRef, { type: 'delete', precondition: precondition });
        return this;
    };
    WriteBatch2.prototype.commit = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var isSmallDocs, currentBatch, batchs, i, results;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.committed) {
                            throw new Error('committed');
                        }
                        this.committed = true;
                        isSmallDocs = this.writeDocumentMap.size <= 499;
                        currentBatch = isSmallDocs
                            ? (_a = this.externalBatch) !== null && _a !== void 0 ? _a : this.db.batch()
                            : this.db.batch();
                        batchs = [currentBatch];
                        i = 0;
                        this.writeDocumentMap.forEach(function (data, ref) {
                            switch (data.type) {
                                case 'create':
                                    currentBatch.create(ref, data.data);
                                    break;
                                case 'set':
                                    if (data.options) {
                                        currentBatch.set(ref, data.data, data.options);
                                    }
                                    else {
                                        currentBatch.set(ref, data.data);
                                    }
                                    break;
                                case 'delete':
                                    currentBatch.delete(ref, data.precondition);
                                    break;
                            }
                            if (i % 500 === 0) {
                                currentBatch = _this.db.batch();
                                batchs.push(currentBatch);
                            }
                            i++;
                        });
                        if (isSmallDocs && this.externalBatch && batchs.length === 1) {
                            return [2 /*return*/, []];
                        }
                        if (isSmallDocs && this.externalBatch) {
                            batchs.shift();
                        }
                        return [4 /*yield*/, Promise.all(batchs.map(function (batch) { return batch.commit(); }))];
                    case 1:
                        results = _b.sent();
                        return [2 /*return*/, flatDeep(results)];
                }
            });
        });
    };
    return WriteBatch2;
}());
exports.WriteBatch2 = WriteBatch2;
