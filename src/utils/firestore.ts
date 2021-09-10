import {
    CollectionReference,
    DocumentData,
    DocumentReference,
    Query,
} from "@google-cloud/firestore";
import {IndexEntity, fieldPaths, SearchOptions, SearchResult} from "../index";
import firebase from "firebase/compat";
import {nGram} from "../nGram";

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

interface WhereFilter {
    fieldPath: string;
    opStr: WhereFilterOp;
    value: any;
}

interface OrderByFilter {
    fieldPath: string;
    directionStr: OrderByDirection
}

export class SearchQuery {
    private readonly ref: CollectionReference<IndexEntity> | firebase.firestore.CollectionReference<IndexEntity>;
    private readonly n: number;
    private _where: WhereFilter[] = [];
    private _orderBy?: OrderByFilter;
    private _limit: number;
    private _startAt?: any[];
    private _startAfter?: any[];
    private _endAt?: any[];
    private _endBefore?: any[];
    private _searchQuery?: string;
    private _options?: SearchOptions;

    constructor(ref: CollectionReference<IndexEntity> | firebase.firestore.CollectionReference<IndexEntity>, n?: number) {
        this.ref = ref;
        this.n = n ?? 3;
        this._limit = 500;
    }

    where(fieldPath: string, opStr: WhereFilterOp, value: any): SearchQuery {
        this._where.push({fieldPath: fieldPath, opStr: opStr, value: value})
        return this;
    }

    orderBy(fieldPath: string, directionStr?: OrderByDirection): SearchQuery {
        const _order: OrderByDirection = directionStr ?? "asc"
        this._orderBy = {fieldPath: "order", directionStr: _order};
        return this;
    }

    startAt(...fieldValues: any[]): SearchQuery {
        this._startAt = fieldValues;
        return this;
    }

    startAfter(...fieldValues: any[]): SearchQuery {
        this._startAfter = fieldValues;
        return this;
    }

    endAt(...fieldValues: any[]): SearchQuery {
        this._endAt = fieldValues;
        return this;
    }

    endBefore(...fieldValues: any[]): SearchQuery {
        this._endBefore = fieldValues;
        return this;
    }

    limit(limit: number): SearchQuery {
        this._limit = limit;
        return this;
    }

    search(searchQuery: string, searchOptions?: SearchOptions): SearchQuery {
        this._searchQuery = searchQuery;
        this._options = searchOptions;
        return this;
    }

    async get(): Promise<SearchResult> {
        let query: Query<IndexEntity> | firebase.firestore.Query<IndexEntity> = this.ref;

        let fields = this._options?.fields;
        if (fields)
            query = query.where(`${fieldPaths.tokens}.${fieldPaths.field}`, "in", fields);

        if (this._searchQuery) {
            const _searchQuery = nGram(this.n, this._searchQuery);
            _searchQuery.forEach(word => {
                query = query.where(`${fieldPaths.tokens}.${word}`, "==", true);
            })
        }

        for (const {fieldPath, opStr, value} of this._where) {
            query = query.where(fieldPath, opStr, value);
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

        const snap = await query.get();
        if (snap.empty)
            return {hits: [], data: []};
        const hits = snap.docs.map(doc => doc.data().__ref);
        const data = snap.docs.map(doc => {
            const {__ref: {} = {}, __tokens: {} = {}, ...data} = doc.data()
            return data;
        })
        return {hits: Array.from(new Set(hits)), data: Array.from(new Set(data))};
    }
}