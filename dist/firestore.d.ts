import { CollectionReference, DocumentData, DocumentReference, FieldPath, Query } from "@google-cloud/firestore";
import { IndexEntity, SearchOptions, SearchResult } from "./index";
import firebase from "firebase";
export declare function getData(ref: DocumentReference, dataOrUndef?: DocumentData): Promise<DocumentData>;
export declare function getTargetFields(data: DocumentData, fieldsOrUndef?: string[]): Set<string>;
export declare function docID(refID: string, field: string, n: number): string;
declare type OrderByDirection = 'desc' | 'asc';
declare type WhereFilterOp = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';
export declare class SearchQuery {
    private readonly ref;
    private readonly n;
    private query;
    private charQuery?;
    private existsNGramQuery;
    constructor(ref: CollectionReference<IndexEntity> | firebase.firestore.CollectionReference<IndexEntity>, n?: number);
    where(fieldPath: string, opStr: WhereFilterOp, value: any): SearchQuery;
    orderBy(fieldPath: string, directionStr?: OrderByDirection): SearchQuery;
    startAt(...fieldValues: any[]): SearchQuery;
    startAfter(...fieldValues: any[]): SearchQuery;
    endAt(...fieldValues: any[]): SearchQuery;
    endBefore(...fieldValues: any[]): SearchQuery;
    limit(limit: number): SearchQuery;
    search(searchQuery: string, searchOptions?: SearchOptions): SearchQuery;
    get(): Promise<SearchResult>;
}
export declare function startsWith(query: Query | CollectionReference, fieldPath: string | FieldPath, value: string): Query<DocumentData>;
export declare type SearchValue = {
    words: string[];
};
export declare type ParseOptions = {
    n?: number;
};
export declare function regulate(string: string): string;
export {};
