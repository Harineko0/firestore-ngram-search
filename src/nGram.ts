export function nGram(n: number, value: string): string[] {
    const nGram: string[] = [];
    const max = value.length - n + 1;
    for (let index = 0; index < max; index++) {
        nGram[index] = value.slice(index, index + n)
    }
    return nGram;
}