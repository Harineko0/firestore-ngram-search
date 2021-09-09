import {
    Firestore,
    CollectionReference,
    DocumentReference,
    DocumentData,
    Query,
    FirestoreDataConverter,
} from '@google-cloud/firestore';
import {nGram} from "./nGram"
import * as functions from 'firebase-functions';
import firebase from "firebase/compat";

interface IndexEntity {
    ref: DocumentReference;
    tokens: Map<string, string | boolean>;
}

const IndexEntityConverter = {
    toFirestore(object: IndexEntity) {
        return {
            ref: object.ref,
            tokens: Object.fromEntries(object.tokens),
        }
    }
}

const AdminIndexEntityConverter: FirestoreDataConverter<IndexEntity> = {
    fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): IndexEntity {
        return snapshot.data() as IndexEntity;
    },
    toFirestore(modelObject: IndexEntity, options?: FirebaseFirestore.SetOptions): FirebaseFirestore.DocumentData {
        return IndexEntityConverter.toFirestore(modelObject);
    }

}

const ClientIndexEntityConverter: firebase.firestore.FirestoreDataConverter<IndexEntity> = {
    fromFirestore(snapshot: firebase.firestore.QueryDocumentSnapshot, options: firebase.firestore.SnapshotOptions): IndexEntity {
        return snapshot.data(options) as IndexEntity;
    },
    toFirestore(modelObject: IndexEntity, options?: firebase.firestore.SetOptions): firebase.firestore.DocumentData {
        return IndexEntityConverter.toFirestore(modelObject);
    }

}

export type Options = {
    n: number;
}

export type SetOptions = {
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

const keys = {
    tokens: "tokens",
    field: "__field",
}

export default class FirestoreSearch {
    private readonly db?: Firestore;
    private readonly indexRef: CollectionReference<IndexEntity> | firebase.firestore.CollectionReference<IndexEntity>;
    private readonly isAdmin: boolean;
    private options: Options;

    constructor(ref: CollectionReference | firebase.firestore.CollectionReference, options?: Options, db?: Firestore) {
        if (ref instanceof CollectionReference) {
            this.indexRef = ref.doc('fs.v1').collection('index').withConverter(AdminIndexEntityConverter);
            this.isAdmin = true;
            if (db) {
                this.db = db;
            } else {
                console.error("Set Firestore while using FirestoreSearch with Admin SDK.")
            }
        } else {
            this.indexRef = ref.doc('fs.v1').collection('index').withConverter(ClientIndexEntityConverter);
            this.isAdmin = false;
        }
        this.options = options ?? {n: 3};
    }

    async set(docRef: DocumentReference, options?: SetOptions) {
        if (this.isAdmin) {
            let data = options?.data;
            if (!data) {
                const snapshot = await docRef.get();
                if (!snapshot.exists) {
                    throw new Error('Document does not exist.');
                }
                data = snapshot.data() as DocumentData;
            }
            const _data = data;
            if (!_data) {
                throw new Error('Document does not exist.');
            }

            let fields = options?.fields;
            let targetFields = new Set<string>();
            if (fields) {
                targetFields = new Set(fields.filter(field => field in _data && typeof _data[field] === "string"))
            } else {
                for (const [fieldName, value] of Object.entries(_data)) {
                    if (typeof value !== "string")
                        continue;
                    targetFields.add(fieldName);
                }
            }

            const keyIndex: Map<string, IndexEntity> = new Map<string, IndexEntity>();
            Array.from(targetFields.values())
                .forEach(field => {
                    const tokens = new Map<string, string | boolean>();
                    const nGrams = nGram(this.options.n, _data[field]);
                    nGrams.forEach(nGram => {
                        if (!nGram.startsWith("__"))
                            tokens.set(nGram, true);
                    })
                    tokens.set(keys.field, field);

                    const entity: IndexEntity = {
                        ref: docRef,
                        tokens: tokens,
                    };
                    keyIndex.set(field, entity);
                });

            if (this.db) {
                const batch = this.db.batch();
                for (const [key, entity] of keyIndex) {
                    if (this.indexRef instanceof CollectionReference)
                        batch.set(this.indexRef.doc(docRef.id + "." + key), entity)
                }
                try {
                    await batch.commit();
                } catch (e) {
                    functions.logger.error(e);
                }
            } else {
                console.error("Firestore is undefined.")
            }
        } else {
            console.error("You can only use FirestoreSearch.set() with Admin SDK.")
        }
    }

    async search(searchQuery: string, options?: SearchOptions): Promise<SearchResult> {
        let query: Query<IndexEntity> | firebase.firestore.Query<IndexEntity> = this.indexRef;

        let fields = options?.fields;
        functions.logger.log("fields")
        functions.logger.log(fields)
        if (fields) {
            query = query.where(`${keys.tokens}.${keys.field}`, "in", fields);
        }

        const _searchQuery = nGram(this.options.n, searchQuery);
        functions.logger.log("_searchQuery")
        functions.logger.log(_searchQuery)
        _searchQuery.forEach(word => {
            query = query.where(`${keys.tokens}.${word}`, "==", true);
        })

        const snap = await query.get();
        if (snap.empty)
            return {hits: []};
        const hits = snap.docs.map(doc => doc.data().ref);
        functions.logger.log(hits.map(hit => hit.id))
        return {hits: Array.from(new Set(hits))};
    }
}