export class Account {
    constructor(
        public activated: boolean,
        public authorities: string[],
        public email: string,
        public firstName: string,
        public langKey: string,
        public lastName: string,
        public login: string,
        public dsUtente: string,
        public imageUrl: string,
        public esercizio: number,
        public cds: string,
        public uo: string,
        public cdr: string,
        public users: Account[]
    ) { }
}
