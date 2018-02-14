export class IndirizziMail {
    constructor(
        public id: {
            cdUtente: string,
            indirizzoMail: string
        },
        public checked: boolean,
        public erroreMancataApprovazioneVarBilancioRes: boolean,
        public approvazioneVarStanziamentoResiduo: boolean,
        public erroreMancataApprovazioneVarBilancioComp: boolean,
        public approvazioneVarStanziamentoCompetenza: boolean,
        public esitoPositivoFattElettronicaAttiva: boolean,
        public esitoNegativoFattElettronicaAttiva: boolean,
        public notificaRicezioneFatturaPassiva: boolean,
        public dacr: Date
    ) { }
}
