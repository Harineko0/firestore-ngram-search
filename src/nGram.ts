export function nGram(n: number, value: string): string[] {
    const nGram: string[] = [];
    const max = value.length - n + 1;
    for (let index = 0; index < max; index++) {
        nGram[index] = value.slice(index, index + n)
    }

    //         |add these|
    // ABCD => ["A", "AB", "ABC"...]
    if (value.length > 0 && n >= 2)
        nGram.unshift(value.substr(0, 1));
    if (value.length > 1 && n >= 3)
        nGram.unshift(value.substr(0, 2));

    return nGram;
}