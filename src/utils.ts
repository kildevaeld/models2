

export function isString(a:any): a is string {
    return typeof a === 'string';
}

export function isStringArray(a: any): a is string[] {
    if (!Array.isArray(a)) {
        return false;
    }

    return a.reduce<number>((l, c) => {
        if (typeof c === 'string') return l + 1
        return l;
    }, 0) == a.length;

}