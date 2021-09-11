import {
    CollectionReference,
    DocumentData,
    DocumentReference,
    Query,
} from "@google-cloud/firestore";
import {IndexEntity, fieldPaths, SearchOptions, SearchResult} from "../index";
import firebase from "firebase";
import {nGram} from "../nGram";

async function getData(ref: DocumentReference, dataOrUndef?: DocumentData): Promise<DocumentData> {
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

function getTargetFields(data: DocumentData, fieldsOrUndef?: string[]): Set<string> {
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

function docID(refID: string, field: string) {
    return refID + "." + field
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
        this.n = n ?? 3;
        this.query = ref;
    }

    where(fieldPath: string, opStr: WhereFilterOp, value: any): SearchQuery {
        this.query = this.query.where(fieldPath, opStr, value);
        return this;
    }

    orderBy(fieldPath: string, directionStr?: OrderByDirection): SearchQuery {
        const _order: OrderByDirection = directionStr ?? "asc";
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
            const _searchQuery = nGram(this.n, searchQuery);
            _searchQuery.forEach(word => {
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
        const data = snap.docs.map(doc => {
            const {__ref: {} = {}, __tokens: {} = {}, ...data} = doc.data()
            return data;
        })
        return {hits: Array.from(new Set(hits)), data: Array.from(new Set(data))};
    }
}