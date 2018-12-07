export class Leaf {
    constructor(
        public id: string,
        public description: string,
        public process: string,
        public cdaccesso: string,
        public dsaccesso: string,
        public breadcrumb: [string, string][],
        public breadcrumbS: string
    ) { }
}
