export class Messaggio {
    constructor(
        public pgMessaggio: number,
        public checked: boolean,
        public cdUtente: string,
        public corpo: string,
        public dsMessaggio: string,
        public dacr: Date
    ) { }
}
