export class Messaggio {
    constructor(
        public pgMessaggio: number,
        public cdUtente: string,
        public corpo: string,
        public dsMessaggio: string
    ) { }
}
