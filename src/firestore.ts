import {
    CollectionReference,
    DocumentData,
    DocumentReference,
    FieldPath,
    Query, QueryDocumentSnapshot,
    QuerySnapshot
} from "@google-cloud/firestore";
import {fieldPaths, HitData, IndexEntity, SearchOptions, SearchResult} from "./index";
import firebase from "firebase";
import {nGram} from "./utils/nGram";
import {convertOneArray} from "./utils/array";

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
    private charQuery?: Query<IndexEntity> | firebase.firestore.Query<IndexEntity>;
    private existsNGramQuery: boolean = false;

    constructor(ref: CollectionReference<IndexEntity> | firebase.firestore.CollectionReference<IndexEntity>, n?: number) {
        this.ref = ref;
        this.n = n ?? 2;
        this.query = this.ref;
    }

    where(fieldPath: string, opStr: WhereFilterOp, value: any): SearchQuery {
        this.query = this.query.where(fieldPath, opStr, value);
        if (this.charQuery)
            this.charQuery = this.charQuery.where(fieldPath, opStr, value);
        return this;
    }

    orderBy(fieldPath: string, directionStr?: OrderByDirection): SearchQuery {
        this.query = this.query.orderBy(fieldPath, directionStr);
        if (this.charQuery)
            this.charQuery = this.charQuery.orderBy(fieldPath, directionStr);
        return this;
    }

    startAt(...fieldValues: any[]): SearchQuery {
        this.query = this.query.startAt(fieldValues);
        if (this.charQuery)
            this.charQuery = this.charQuery.startAt(fieldValues);
        return this;
    }

    startAfter(...fieldValues: any[]): SearchQuery {
        this.query = this.query.startAfter(fieldValues);
        if (this.charQuery)
            this.charQuery = this.charQuery.startAfter(fieldValues);
        return this;
    }

    endAt(...fieldValues: any[]): SearchQuery {
        this.query = this.query.endAt(fieldValues);
        if (this.charQuery)
            this.charQuery = this.charQuery.endAt(fieldValues);
        return this;
    }

    endBefore(...fieldValues: any[]): SearchQuery {
        this.query = this.query.endBefore(fieldValues);
        if (this.charQuery)
            this.charQuery = this.charQuery.endBefore(fieldValues);
        return this;
    }

    limit(limit: number): SearchQuery {
        this.query = this.query.limit(limit);
        if (this.charQuery)
            this.charQuery = this.charQuery.limit(limit);
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
            if (_searchQuery.words.length > 0)
                this.existsNGramQuery = true;
        }

        const searchByChar = searchOptions?.searchByChar ?? true;
        if (searchByChar) {
            this.charQuery = this.query;
            const chars = splitSpace(searchQuery).map(value => value.split('')).reduce(convertOneArray, []);
            chars.forEach(char => {
                this.charQuery = this.charQuery?.where(`${fieldPaths.tokens}.${char}`, "==", true);
            })
        }
        return this;
    }

    async get(): Promise<SearchResult> {
        let snap: QuerySnapshot | firebase.firestore.QuerySnapshot | undefined;
        if (this.existsNGramQuery)
            snap = await this.query.get();
        let charSnap: QuerySnapshot | firebase.firestore.QuerySnapshot | undefined;
        if (this.charQuery)
            charSnap = await this.charQuery.get();

        if (snap && snap.empty)
            return {hits: []};

        let docs: QueryDocumentSnapshot[] | firebase.firestore.QueryDocumentSnapshot[] = [];
        if (snap)
            docs = snap.docs;
        if (charSnap)
            // @ts-ignore
            docs = [...docs, ...charSnap.docs];

        const idToCount: Map<string, number> = new Map<string, number>();
        const idToRef: Map<string, DocumentReference> = new Map<string, FirebaseFirestore.DocumentReference>();
        const idToData: Map<string, DocumentData> = new Map<string, FirebaseFirestore.DocumentData>();
        docs.forEach(doc => {
            const data = doc.data()

            idToData.set(data.__ref.id, data.values);
            idToRef.set(data.__ref.id, data.__ref);
            if (idToCount.has(data.__ref.id)) {
                const _count = idToCount.get(data.__ref.id) ?? 0;
                const count = _count + 1;
                idToCount.set(data.__ref.id, count);
            } else {
                idToCount.set(data.__ref.id, 1);
            }
        })

        const hitData: HitData[] = Array.from(idToCount.entries())
            .map(([id, count]): HitData | null => {
                const ref = idToRef.get(id);
                const data = idToData.get(id);
                if (ref && data) {
                    return ({ref: ref, count: count, data: data});
                }
                return null;
            })
            .filter((value): value is HitData => value !== null);
        return {hits: hitData};
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
function splitSpace(string: string): string[] {
    const eachQuery: string[] = string.split(' ');
    return  eachQuery.filter(value => value !== '');
}
export function parseQuery(stringQuery: string, options?: ParseOptions): SearchValue {
    const _n = options?.n ?? 2;
    const eachQuery: string[] = splitSpace(stringQuery);
    const searchQuery: string[] = eachQuery.map(query =>  nGram(_n, query)).reduce(convertOneArray, []);
    return {words: searchQuery};
}