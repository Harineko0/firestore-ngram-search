import { CollectionReference, DocumentReference, DocumentData, WriteBatch } from '@google-cloud/firestore';
import firebase from "firebase/compat";
import { SearchQuery } from "./utils/firestore";
export interface IndexEntity {
    __ref: DocumentReference;
    __tokens: Map<string, string | boolean>;
}
export declare const fieldPaths: {
    tokens: string;
    field: string;
};
export declare type Options = {
    n?: number;
};
export declare type SetOptions = {
    batch?: WriteBatch;
    data?: DocumentData;
    fields?: string[];
};
export declare type DeleteOptions = {
    batch?: WriteBatch;
    data?: DocumentData;
    fields?: string[];
};
export declare type SearchOptions = {
    fields?: string[];
    limit?: number;
};
export declare type SearchResult = {
    hits: DocumentReference[];
    data: DocumentData[];
};
export default class FirestoreSearch {
    private readonly db?;
    private readonly indexRef;
    private readonly isAdmin;
    private readonly n;
    constructor(ref: CollectionReference | firebase.firestore.CollectionReference, options?: Options);
    set(docRef: DocumentReference, options?: SetOptions): Promise<void>;
    delete(docRef: DocumentReference, options?: DeleteOptions): Promise<void>;
    query(): SearchQuery;
}
