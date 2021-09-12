// convert two-dimensional array to one-dimensional array
export function convertOneArray(pre: string[], current: string[]): string[] {
    pre.push(...current);
    return pre;
}