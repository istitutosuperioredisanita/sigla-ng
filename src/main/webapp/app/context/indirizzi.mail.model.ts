export class IndirizziMail {
    constructor(
        public cd_utente: string,
        public indirizzo_mail: string,
        public checked: boolean,
        public fl_err_appr_var_bil_cnr_res: boolean,
        public fl_com_app_var_stanz_res: boolean,
        public fl_err_appr_var_bil_cnr_comp: boolean,
        public fl_com_app_var_stanz_comp: boolean,
        public flEsitoPosFattElettr: boolean,
        public flEsitoNegFattElettr: boolean,
        public flFepNotificaRicezione: boolean,
        public crudStatus: number,
        public pgVerRec: number
    ) { }
}
