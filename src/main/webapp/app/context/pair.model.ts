export class Pair {
    static getFirst(pair: Pair) {
        if (pair) {
            return pair.first;
        }
        return null;
    }
    constructor(
        public first: string,
        public second: string
    ) { }
}
