import {
    Firestore,
    CollectionReference,
    DocumentReference,
    DocumentData,
    FirestoreDataConverter, WriteBatch,
} from '@google-cloud/firestore';
import firebase from "firebase";
import {nGram} from "./utils/nGram"
import {docID, getData, getTargetFields, SearchQuery} from "./firestore";
import {WriteBatch2} from "./batch";

export interface IndexEntity {
    __ref: DocumentReference;
    __tokens: Map<string, string | boolean>;
    values: object;
}

export const fieldPaths = {
    tokens: "__tokens",
    field: "__field",
}

const IndexEntityConverter = {
    toFirestore(object: IndexEntity) {
        return {
            ...object.values,
            __ref: object.__ref,
            __tokens: Object.fromEntries(object.__tokens),
        }
    },
    fromFirestore(data: DocumentData | firebase.firestore.DocumentData): IndexEntity {
        const {__ref: {} = {}, __tokens: {} = {}, ...values} = data;
        return {
            __ref: data.__ref,
            __tokens: data.__tokens,
            values: values,
        } as IndexEntity;
    }
}

const AdminIndexEntityConverter: FirestoreDataConverter<IndexEntity> = {
    fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): IndexEntity {
        return IndexEntityConverter.fromFirestore(snapshot.data());
    },
    toFirestore(modelObject: IndexEntity): FirebaseFirestore.DocumentData {
        return IndexEntityConverter.toFirestore(modelObject);
    }

}

const ClientIndexEntityConverter: firebase.firestore.FirestoreDataConverter<IndexEntity> = {
    fromFirestore(snapshot: firebase.firestore.QueryDocumentSnapshot, options: firebase.firestore.SnapshotOptions): IndexEntity {
        return IndexEntityConverter.fromFirestore(snapshot.data(options));
    },
    toFirestore(modelObject: IndexEntity): firebase.firestore.DocumentData {
        return IndexEntityConverter.toFirestore(modelObject);
    }

}

export type Options = {
    n?: number;
}

export type SetOptions = {
    batch?: WriteBatch;
    data?: DocumentData;
    fields?: string[];
}

export type DeleteOptions = {
    batch?: WriteBatch;
    data?: DocumentData;
    fields?: string[];
}

export type SearchOptions = {
    fields?: string[];
    searchByChar?: boolean;
}

export type HitData = {
    ref: DocumentReference;
    count: number;
    data: DocumentData;
}


export type SearchResult = {
    hits: HitData[];
}

type IndexDocument = {
    n: number,
    field: string,
    entity: IndexEntity,
}

function getIndexDocument(docRef: DocumentReference, field: string, data: DocumentData, n: number): IndexDocument {
    const tokens = new Map<string, string | boolean>();
    const nGrams = nGram(n, data[field]);
    nGrams.forEach(nGram => {
        if (!nGram.startsWith("__"))
            tokens.set(nGram, true);
    })
    tokens.set(fieldPaths.field, field);

    const entity: IndexEntity = {
        __ref: docRef,
        __tokens: tokens,
        values: {
            ...data,
        }
    };
    return {field: field, entity: entity, n: n};
}

export default class FirestoreNGramSearch {
    private readonly db?: Firestore;
    private readonly indexRef: CollectionReference<IndexEntity> | firebase.firestore.CollectionReference<IndexEntity>;
    private readonly isAdmin: boolean;
    private readonly n: number;

    constructor(ref: CollectionReference | firebase.firestore.CollectionReference, options?: Options) {
        if (ref instanceof CollectionReference) {
            this.indexRef = ref.doc('fs.v1').collection('index').withConverter(AdminIndexEntityConverter);
            this.isAdmin = true;
            this.db = ref.firestore;
        } else {
            this.indexRef = ref.doc('fs.v1').collection('index').withConverter(ClientIndexEntityConverter);
            this.isAdmin = false;
        }
        this.n = options?.n ?? 2;
    }

    async set(docRef: DocumentReference, options?: SetOptions) {
        if (!this.isAdmin) {
            throw new Error("You can only use FirestoreSearch.set() with Admin SDK.")
        } else {
            const data = await getData(docRef, options?.data);
            const targetFields = Array.from(getTargetFields(data, options?.fields).values());

            const nGramDocs: IndexDocument[] = targetFields.map(field => {
                return getIndexDocument(docRef, field, data, this.n);
            });
            const charDocs: IndexDocument[] = targetFields.map(field => {
                return getIndexDocument(docRef, field, data, 1);
            })
            const docs: IndexDocument[] = [...nGramDocs, ...charDocs];

            if (this.db) {
                const batch = new WriteBatch2(this.db, {batch: options?.batch});
                docs.forEach(doc => {
                    if (this.indexRef instanceof CollectionReference)
                        batch.set(this.indexRef.doc(docID(docRef.id, doc.field, doc.n)), doc.entity)
                })
                await batch.commit();
            } else {
                throw new Error("Firestore is undefined.")
            }
        }
    }

    async delete(docRef: DocumentReference, options?: DeleteOptions) {
        if (!this.isAdmin) {
            throw new Error("You can only use FirestoreSearch.delete() with Admin SDK.")
        } else {
            const data = await getData(docRef, options?.data)
            const targetFields = getTargetFields(data, options?.fields);
            if (this.db) {
                const batch = new WriteBatch2(this.db, {batch: options?.batch});
                targetFields.forEach(field => {
                    if (this.indexRef instanceof CollectionReference) {
                        batch.delete(this.indexRef.doc(docID(docRef.id, field, this.n)));
                        batch.delete(this.indexRef.doc(docID(docRef.id, field, 1)));
                    }
                })
                await batch.commit();
            }
        }
    }

    query() {
        return new SearchQuery(this.indexRef, this.n);
    }
}