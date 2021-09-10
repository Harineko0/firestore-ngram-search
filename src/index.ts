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
    toFirestore(modelObject: IndexEntity): FirebaseFirestore.DocumentData {
        return IndexEntityConverter.toFirestore(modelObject);
    }

}

const ClientIndexEntityConverter: firebase.firestore.FirestoreDataConverter<IndexEntity> = {
    fromFirestore(snapshot: firebase.firestore.QueryDocumentSnapshot, options: firebase.firestore.SnapshotOptions): IndexEntity {
        return snapshot.data(options) as IndexEntity;
    },
    toFirestore(modelObject: IndexEntity): firebase.firestore.DocumentData {
        return IndexEntityConverter.toFirestore(modelObject);
    }

}

export type Options = {
    n?: number;
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

export type DeleteOptions = {
    data?: DocumentData;
    fields?: string[];
}

const keys = {
    tokens: "tokens",
    field: "__field",
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
        this.n = options?.n ?? 3;
    }

    async set(docRef: DocumentReference, options?: SetOptions) {
        if (!this.isAdmin) {
            console.error("You can only use FirestoreSearch.set() with Admin SDK.")
        } else {
            const data = await FirestoreSearch.getData(docRef, options?.data);
            const targetFields = FirestoreSearch.getTargetFields(data, options?.fields);

            const keyIndex: Map<string, IndexEntity> = new Map<string, IndexEntity>();
            Array.from(targetFields.values())
                .forEach(field => {
                    const tokens = new Map<string, string | boolean>();
                    const nGrams = nGram(this.n, data[field]);
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
        }
    }

    async delete(docRef: DocumentReference, options?: DeleteOptions) {
        if (!this.isAdmin) {
            console.error("You can only use FirestoreSearch.delete() with Admin SDK.")
        } else {
            const data = FirestoreSearch.getData(docRef, options?.data)
            const targetFields = FirestoreSearch.getTargetFields(data, options?.fields);
        }
    }

    async search(searchQuery: string, options?: SearchOptions): Promise<SearchResult> {
        let query: Query<IndexEntity> | firebase.firestore.Query<IndexEntity> = this.indexRef;

        let fields = options?.fields;
        if (fields) {
            query = query.where(`${keys.tokens}.${keys.field}`, "in", fields);
        }

        const _searchQuery = nGram(this.n, searchQuery);
        _searchQuery.forEach(word => {
            query = query.where(`${keys.tokens}.${word}`, "==", true);
        })

        const snap = await query.get();
        if (snap.empty)
            return {hits: []};
        const hits = snap.docs.map(doc => doc.data().ref);
        return {hits: Array.from(new Set(hits))};
    }

    private static async getData(ref: DocumentReference, dataOrUndef?: DocumentData): Promise<DocumentData> {
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

    private static getTargetFields(data: DocumentData, fieldsOrUndef?: string[]): Set<string> {
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
}