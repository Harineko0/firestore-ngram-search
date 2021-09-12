export class DeepSet extends Set {
    add (o: any) {
        for (let i of this)
            if (this.deepCompare(o, i))
                return this;
        super.add.call(this, o);
        return this;
    };

    private deepCompare(o: any, i: any) {
        return JSON.stringify(o) === JSON.stringify(i)
    }
}

export class StringMap<K, V> extends Map {
    has (key: K): boolean {
        if (typeof key === 'string') {
            const thisKeys = this.keys();
            let has = false;
            for (const thisKey of thisKeys) {
                if (thisKey == key) {
                    has = true;
                    break;
                }
            }
            return has;
        }
        return false;
    }
}