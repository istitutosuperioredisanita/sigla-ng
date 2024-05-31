export class Messaggio {
    constructor(
        public pg_messaggio: number,
        public checked: boolean,
        public cd_utente: string,
        public soggetto: string,
        public corpo: string,
        public ds_messaggio: string,
        public data_creazione: Date,
        public pgVerRec: number
    ) { }
}
