import {
    Firestore,
    CollectionReference,
    DocumentReference,
    DocumentData,
    Query,
    FirestoreDataConverter, WriteBatch,
} from '@google-cloud/firestore';
import {nGram} from "./nGram"
import * as functions from 'firebase-functions';
import firebase from "firebase/compat";
import {getData, getTargetFields, SearchQuery} from "./utils/firestore";
import {WriteBatch2} from "firestore-full-text-search/lib/utils/firestore";
import * as console from "console";

export interface IndexEntity {
    __ref: DocumentReference;
    __tokens: Map<string, string | boolean>;
}

export const fieldPaths = {
    tokens: "__tokens",
    field: "__field",
}

const IndexEntityConverter = {
    toFirestore(object: IndexEntity) {
        return {
            __ref: object.__ref,
            __tokens: Object.fromEntries(object.__tokens),
        }
    },
    fromFirestore(data: DocumentData | firebase.firestore.DocumentData): IndexEntity {
        return {
            __ref: data.__ref,
            __tokens: data.__tokens,
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

export type SearchOptions = {
    fields?: string[];
    limit?: number;
}

export type SearchResult = {
    hits: DocumentReference[];
}

export type DeleteOptions = {
    data?: DocumentData;
    fields?: string[];
}

export default class FirestoreSearch {
    private readonly db?: Firestore;
    private readonly indexRef: CollectionReference<IndexEntity> | firebase.firestore.CollectionReference<IndexEntity>;
    private readonly isAdmin: boolean;
    private readonly n: number;
    private logger;

    constructor(ref: CollectionReference | firebase.firestore.CollectionReference, options?: Options) {
        if (ref instanceof CollectionReference) {
            this.indexRef = ref.doc('fs.v1').collection('index').withConverter(AdminIndexEntityConverter);
            this.isAdmin = true;
            this.db = ref.firestore;
            this.logger = functions.logger;
        } else {
            this.indexRef = ref.doc('fs.v1').collection('index').withConverter(ClientIndexEntityConverter);
            this.isAdmin = false;
            this.logger = console;
        }
        this.n = options?.n ?? 3;
    }

    async set(docRef: DocumentReference, options?: SetOptions) {
        if (!this.isAdmin) {
            this.logger.error("You can only use FirestoreSearch.set() with Admin SDK.")
        } else {
            const data = await getData(docRef, options?.data);
            const targetFields = getTargetFields(data, options?.fields);

            const keyIndex: Map<string, IndexEntity> = new Map<string, IndexEntity>();
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
                        ...data,
                    };
                    keyIndex.set(field, entity);
                });

            if (this.db) {
                const batch = new WriteBatch2(this.db, {batch: options?.batch});
                for (const [key, entity] of keyIndex) {
                    if (this.indexRef instanceof CollectionReference)
                        batch.set(this.indexRef.doc(docRef.id + "." + key), entity)
                }
                try {
                    await batch.commit();
                } catch (e) {
                    this.logger.error(e);
                }
            } else {
                this.logger.error("Firestore is undefined.")
            }
        }
    }

    async delete(docRef: DocumentReference, options?: DeleteOptions) {
        if (!this.isAdmin) {
            this.logger.error("You can only use FirestoreSearch.delete() with Admin SDK.")
        } else {
            const data = getData(docRef, options?.data)
            const targetFields = getTargetFields(data, options?.fields);
        }
    }

    async search(searchQuery: string, options?: SearchOptions): Promise<SearchResult> {
        let query: Query<IndexEntity> | firebase.firestore.Query<IndexEntity> = this.indexRef;

        let fields = options?.fields;
        if (fields) {
            query = query.where(`${fieldPaths.tokens}.${fieldPaths.field}`, "in", fields);
        }

        const _searchQuery = nGram(this.n, searchQuery);
        _searchQuery.forEach(word => {
            query = query.where(`${fieldPaths.tokens}.${word}`, "==", true);
        })

        const snap = await query.get();
        if (snap.empty)
            return {hits: []};
        const hits = snap.docs.map(doc => doc.data().__ref);
        return {hits: Array.from(new Set(hits))};
    }

    query() {
        return new SearchQuery(this.indexRef);
    }
}