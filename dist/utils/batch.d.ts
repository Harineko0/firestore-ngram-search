import type { Firestore, WriteBatch, DocumentReference, SetOptions, Precondition, WriteResult, Query, CollectionReference, FieldPath } from '@google-cloud/firestore';
export declare type WriteBatch2Options = {
    batch?: WriteBatch;
};
export declare class WriteBatch2 {
    private db;
    private externalBatch;
    private writeDocumentMap;
    private committed;
    constructor(db: Firestore, options?: WriteBatch2Options);
    create<T>(documentRef: DocumentReference<T>, data: T): WriteBatch2;
    set<T>(documentRef: DocumentReference<T>, data: Partial<T>, options?: SetOptions): WriteBatch2;
    delete(documentRef: DocumentReference<any>, precondition?: Precondition): WriteBatch2;
    commit(): Promise<WriteResult[]>;
}
export declare function startsWith(query: Query | CollectionReference, fieldPath: string | FieldPath, value: string): Query<FirebaseFirestore.DocumentData>;
