import { Firestore, CollectionReference, DocumentReference, DocumentData } from '@google-cloud/firestore';
import firebase from "firebase/compat";
export declare type Options = {
    n: number;
};
export declare type SetOptions = {
    data?: DocumentData;
    fields?: string[];
};
export declare type SearchOptions = {
    fields?: string[];
    limit?: number;
};
export declare type SearchResult = {
    hits: DocumentReference[];
};
export default class FirestoreSearch {
    private readonly db?;
    private readonly indexRef;
    private readonly isAdmin;
    private options;
    constructor(ref: CollectionReference | firebase.firestore.CollectionReference, options?: Options, db?: Firestore);
    set(docRef: DocumentReference, options?: SetOptions): Promise<void>;
    search(searchQuery: string, options?: SearchOptions): Promise<SearchResult>;
}
