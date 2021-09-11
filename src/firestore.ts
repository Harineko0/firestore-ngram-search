import {CollectionReference, DocumentData, DocumentReference, FieldPath, Query,} from "@google-cloud/firestore";
import {fieldPaths, HitData, IndexEntity, SearchOptions, SearchResult} from "./index";
import firebase from "firebase";
import {nGram} from "./nGram";

export async function getData(ref: DocumentReference, dataOrUndef?: DocumentData): Promise<DocumentData> {
    let data = dataOrUndef;
    if (!data) {
        const snap = await ref.get();
        if (!snap.exists) {
            throw new Error('Document does not exist.');
        }
        data = snap.data() as DocumentData;
    }
    const _data = data;
    if (!_data) {
        throw new Error('Document does not exist.');
    }
    return _data;
}

export function getTargetFields(data: DocumentData, fieldsOrUndef?: string[]): Set<string> {
    let fields = fieldsOrUndef;
    let targetFields = new Set<string>();
    if (fields) {
        targetFields = new Set(fields.filter(field => field in data && typeof data[field] === "string"))
    } else {
        for (const [fieldName, value] of Object.entries(data)) {
            if (typeof value !== "string")
                continue;
            targetFields.add(fieldName);
        }
    }
    return targetFields;
}

export function docID(refID: string, field: string, n: number) {
    return refID + "." + field + "." + n;
}

type OrderByDirection = 'desc' | 'asc';

type WhereFilterOp =
    | '<'
    | '<='
    | '=='
    | '!='
    | '>='
    | '>'
    | 'array-contains'
    | 'in'
    | 'array-contains-any'
    | 'not-in';

export class SearchQuery {
    private readonly ref: CollectionReference<IndexEntity> | firebase.firestore.CollectionReference<IndexEntity>;
    private readonly n: number;
    private query: Query<IndexEntity> | firebase.firestore.Query<IndexEntity>;

    constructor(ref: CollectionReference<IndexEntity> | firebase.firestore.CollectionReference<IndexEntity>, n?: number) {
        this.ref = ref;
        this.n = n ?? 2;
        this.query = ref;
    }

    where(fieldPath: string, opStr: WhereFilterOp, value: any): SearchQuery {
        this.query = this.query.where(fieldPath, opStr, value);
        return this;
    }

    orderBy(fieldPath: string, directionStr?: OrderByDirection): SearchQuery {
        this.query = this.query.orderBy(fieldPath, directionStr);
        return this;
    }

    startAt(...fieldValues: any[]): SearchQuery {
        this.query = this.query.startAt(fieldValues);
        return this;
    }

    startAfter(...fieldValues: any[]): SearchQuery {
        this.query = this.query.startAfter(fieldValues);
        return this;
    }

    endAt(...fieldValues: any[]): SearchQuery {
        this.query = this.query.endAt(fieldValues);
        return this;
    }

    endBefore(...fieldValues: any[]): SearchQuery {
        this.query = this.query.endBefore(fieldValues);
        return this;
    }

    limit(limit: number): SearchQuery {
        this.query = this.query.limit(limit);
        return this;
    }

    search(searchQuery: string, searchOptions?: SearchOptions): SearchQuery {
        let fields = searchOptions?.fields;
        if (fields)
            this.query = this.query.where(`${fieldPaths.tokens}.${fieldPaths.field}`, "in", fields);

        if (searchQuery) {
            const _searchQuery = parseQuery(searchQuery, {n: this.n});
            _searchQuery.words.forEach(word => {
                this.query = this.query.where(`${fieldPaths.tokens}.${word}`, "==", true);
            })
        }
        return this;
    }

    async get(): Promise<SearchResult> {
        const snap = await this.query.get();
        if (snap.empty)
            return {hits: [], data: []};
        const hits = snap.docs.map(doc => doc.data().__ref);
        const refToCount: Map<DocumentReference, number> = new Map<DocumentReference, number>();
        for (const hit of hits) {
            if (refToCount.has(hit)) {
                const _count = refToCount.get(hit) ?? 0;
                const count = _count + 1;
                refToCount.set(hit, count);
            } else {
                refToCount.set(hit, 1);
            }
        }
        const hitData: HitData[] = Array.from(refToCount.entries()).map(([ref, count]) => ({ref: ref, count: count}));
        const data = snap.docs.map(doc => {
            const {__ref: {} = {}, __tokens: {} = {}, ...data} = doc.data()
            return data;
        })
        return {hits: hitData, data: Array.from(new Set(data))};
    }
}

export function startsWith(
    query: Query | CollectionReference,
    fieldPath: string | FieldPath,
    value: string
) {
    const start = value.slice(0, value.length - 1);
    const end = value.slice(value.length - 1, value.length);
    const v = start + String.fromCharCode(end.charCodeAt(0) + 1);
    return query
        .where(fieldPath, '>=', value)
        .where(fieldPath, '<', v)
        .orderBy(fieldPath);
}

export type SearchValue = {
    words: string[];
}
export type ParseOptions = {
    n?: number;
}
export function parseQuery(stringQuery: string, options?: ParseOptions): SearchValue {
    const _n = options?.n ?? 2;
    const eachQuery: string[] = stringQuery.split(" ");
    const searchQuery: string[] = eachQuery
        .map(query => {
            if (query.length < _n) {
                const chars: string[] = [];
                for (let i = 0; i < _n; i++) {
                    if (query[i])
                        chars.push(query[i]);
                }
                return chars;
            }
            return nGram(_n, query)
        })
        .reduce((pre, current) => {
            pre.push(...current);
            return pre;
        }, []);
    return {words: searchQuery};
}