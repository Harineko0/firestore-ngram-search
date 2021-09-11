import {
    Firestore,
    CollectionReference,
    DocumentReference,
    DocumentData,
    FirestoreDataConverter, WriteBatch,
} from '@google-cloud/firestore';
import firebase from "firebase";
import {nGram} from "./nGram"
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
    limit?: number;
}

export type SearchResult = {
    hits: DocumentReference[];
    data: DocumentData[];
}


export default class FirestoreSearch {
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
            const targetFields = getTargetFields(data, options?.fields);

            const fieldIndex: Map<string, IndexEntity> = new Map<string, IndexEntity>();
            Array.from(targetFields.values())
                .forEach(field => {
                    const tokens = new Map<string, string | boolean>();
                    const nGrams = nGram(this.n, data[field]);
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
                    fieldIndex.set(field, entity);
                });

            if (this.db) {
                const batch = new WriteBatch2(this.db, {batch: options?.batch});
                for (const [field, entity] of fieldIndex) {
                    if (this.indexRef instanceof CollectionReference)
                        batch.set(this.indexRef.doc(docID(docRef.id, field)), entity)
                }
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
                    if (this.indexRef instanceof CollectionReference)
                        batch.delete(this.indexRef.doc(docID(docRef.id, field)))
                })
                await batch.commit();
            }
        }
    }

    query() {
        return new SearchQuery(this.indexRef, this.n);
    }
}