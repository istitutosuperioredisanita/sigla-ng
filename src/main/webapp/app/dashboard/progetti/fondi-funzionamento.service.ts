import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Assi di raggruppamento disponibili a livello 1 (elenco) */
export type DimensioneFondo = 'uo' | 'tipo-finanziamento' | 'ente-finanziatore';

/** Segmento URL kebab-case per ciascuna dimensione */
const SEGMENTO_DIMENSIONE: Record<DimensioneFondo, string> = {
  uo: 'uo',
  'tipo-finanziamento': 'tipo-finanziamento',
  'ente-finanziatore': 'ente-finanziatore'
};

/** Riga restituita dall'elenco di livello 1 (per UO / Tipo Finanziamento / Ente Finanziatore) */
export interface FondiPerGruppo {
  descrizione: string;
  importoFinanziato: number;
  importoUtilizzato: number;
  codice: string;
}

/** Riga restituita dal drill-down sui progetti di un gruppo */
export interface FondiPerProgetto {
  descrizioneProgetto: string;
  importoFinanziato: number;
  importoUtilizzato: number;
  codiceProgetto: string;
}

/** Riga restituita da /progetto/fondiFunzionamento/{anno}/codice/{codiceProgetto} (dettaglio per voce di spesa) */
export interface DettaglioVoceSpesa {
  codice: string;
  descrizione: string;
  imAssestatoSpesaFinanziato: number;
  imUtilizzatoSpesaFinanziato: number;
  imPagatoSpesaFinanziato: number;
  imAssestatoSpesaCofinanziato: number;
  imUtilizzatoSpesaCofinanziato: number;
  imPagatoSpesaCofinanziato: number;
}

@Injectable()
export class FondiFunzionamentoService {

  constructor(private http: HttpClient) {}

  /**
   * Livello 1 (nessun valore): elenco aggregato per la dimensione data.
   *   GET /progetto/fondi-funzionamento/uo/{anno}
   *   GET /progetto/fondi-funzionamento/tipo-finanziamento/{anno}
   *   GET /progetto/fondi-funzionamento/ente-finanziatore/{anno}
   *
   * Livello 2 (valore presente): progetti del gruppo selezionato.
   *   NB: schema non ancora confermato per tipoFinanziamento/enteFinanziatore;
   *   qui ipotizzato come /{anno}/{valore} sullo stesso schema già in uso per 'uo'.
   */
  getFondi(
    anno: number,
    dimensione: DimensioneFondo,
    valore?: string
  ): Observable<(FondiPerGruppo | FondiPerProgetto)[]> {
    let url = `/progetto/fondi-funzionamento/${dimensione}/${anno}`;
    if (valore) {
      url += `/${valore}`;
    }
    return this.http.get<(FondiPerGruppo | FondiPerProgetto)[]>(
      environment.apiUrl + url,
      { withCredentials: true }
    );
  }

  getDettaglioProgetto(anno: number, codiceProgetto: string): Observable<DettaglioVoceSpesa[]> {
    return this.http.get<DettaglioVoceSpesa[]>(
      environment.apiUrl + `/progetto/fondi-funzionamento/${anno}/codice/${codiceProgetto}`,
      { withCredentials: true }
    );
  }
}