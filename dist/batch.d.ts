import type { Firestore, WriteBatch, DocumentReference, SetOptions, Precondition, WriteResult } from '@google-cloud/firestore';
export declare type WriteBatch2Options = {
    batch?: WriteBatch;
};
export declare class WriteBatch2 {
    private readonly externalBatch;
    private db;
    private writeDocumentMap;
    private committed;
    constructor(db: Firestore, options?: WriteBatch2Options);
    create<T>(documentRef: DocumentReference<T>, data: T): WriteBatch2;
    set<T>(documentRef: DocumentReference<T>, data: Partial<T>, options?: SetOptions): WriteBatch2;
    delete(documentRef: DocumentReference<any>, precondition?: Precondition): WriteBatch2;
    commit(): Promise<WriteResult[]>;
}
