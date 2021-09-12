// convert two-dimensional array to one-dimensional array
export function convertOneArray(pre: string[], current: string[]): string[] {
    pre.push(...current);
    return pre;
}

export function removeDuplicate(value: object, index: number, array: object[]) {
    return array.findIndex(el => {
        if (typeof el === "object") {
            const keys = Object.keys(el);
            return !keys.map(key => {
                // @ts-ignore
                return el[key.toString()] === value[key.toString()]
            }).includes(false);
        }
        return false;
    }) === index;
}