import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

/**
 * Riga restituita dall'elenco di livello 1 (per UO / Tipo Finanziamento / Ente Finanziatore).
 * I nomi dei campi codice/descrizione variano a seconda della dimensione:
 * - UO: codiceUnita / descrizioneUnita
 * - Tipo Finanziamento / Ente Finanziatore: da confermare, ipotizzati codice / descrizione
 * Il componente normalizza tutte le varianti in fase di mapping.
 */
export interface FondiPerGruppo {
  descrizione?: string;
  descrizioneUnita?: string;
  codice?: string;
  codiceUnita?: string;
  importoFinanziato: number;
  importoUtilizzato: number;
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
   *
   * uoFiltro: filtro aggiuntivo per UO, applicabile solo quando la
   * dimensione è tipoFinanziamento/enteFinanziatore (per 'uo' è ridondante).
   *   NB: nome del query param non confermato, ipotizzato `uo`.
   */
  getFondi(
    anno: number,
    dimensione: DimensioneFondo,
    valore?: string,
    uoFiltro?: string
  ): Observable<(FondiPerGruppo | FondiPerProgetto)[]> {
    const segmento = SEGMENTO_DIMENSIONE[dimensione];
    let url = `/progetto/fondi-funzionamento/${segmento}/${anno}`;
    if (valore) {
      url += `/${valore}`;
    }

    let httpParams = new HttpParams();
    if (uoFiltro && dimensione !== 'uo') {
      httpParams = httpParams.set('uo', uoFiltro);
    }

    return this.http.get<(FondiPerGruppo | FondiPerProgetto)[]>(
      environment.apiUrl + url,
      { params: httpParams, withCredentials: true }
    );
  }

  getDettaglioProgetto(anno: number, codiceProgetto: string): Observable<DettaglioVoceSpesa[]> {
    return this.http.get<DettaglioVoceSpesa[]>(
      environment.apiUrl + `/progetto/fondi-funzionamento/${anno}/codice/${codiceProgetto}`,
      { withCredentials: true }
    );
  }
}