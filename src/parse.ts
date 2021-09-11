import {nGram} from "./nGram";

export type SearchValue = {
    words: string[];
}
export type ParseOptions = {
    n?: number;
}

export function parseQuery(stringQuery: string, options?: ParseOptions): SearchValue {
    const _n = options?.n ?? 2;
    const splitQuery: string[] = stringQuery.split(" ");
    const searchQuery: string[] = splitQuery
        .map(query => nGram(_n, query))
        .reduce((pre, current) => {
            pre.push(...current);
            return pre;
        }, []);
    return {words: searchQuery};
}