declare global {
    interface Array<T> {
        group: <K extends string | number | symbol>(
            callbackFn: (element: T, index: number, array: ThisType<Array<T>>) => K
        ) => Record<K, T[]>
    }
}

Array.prototype.group = function <T, K extends string | number | symbol>(
    this: Array<T>,
    callbackFn: (element: T, index: number, array: ThisType<Array<T>>) => K
): Record<K, T[]> {
    const groups = {} as Record<K, T[]>
    for (let i = 0; i < this.length; i++) {
        const element = this[i]
        const key = callbackFn(element, i, this)
        if (groups[key] === undefined) {
            groups[key] = []
        }
        groups[key].push(element)
    }
    return groups
}

export { }
