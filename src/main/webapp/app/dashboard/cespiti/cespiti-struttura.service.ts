import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Riga restituita dall'elenco struttura:
 * - senza CDS: una riga per CDS
 * - con CDS fissato: una riga per ogni UO del CDS
 * NB: nomi dei campi confermati solo dal mapping del component, non dal backend.
 */
export interface InventarioPerStruttura {
  codice: string;
  /** può essere null a livello CDS (il component la recupera dall'elenco dei CDS) */
  descrizione?: string | null;
  numeroTotaleBeni: number;
  valoreTotaleBeni: number;
}

@Injectable()
export class CespitiStrutturaService {

  constructor(private http: HttpClient) {}

  /**
   * Livello 1 (nessun CDS): elenco aggregato per CDS.
   *   GET /inventario/struttura/{anno}
   *
   * Livello 2 (CDS presente): UO del CDS selezionato.
   *   GET /inventario/struttura/{anno}?cds={cds}
   *
   * NB: URL e nome del query param `cds` ipotizzati, da allineare al backend.
   */
  getStruttura(anno: number, cds?: string): Observable<InventarioPerStruttura[]> {
    let params = new HttpParams();
    if (cds) {
      params = params.set('cds', cds);
    }
    return this.http.get<InventarioPerStruttura[]>(
      environment.apiUrl + `/inventario/struttura/${anno}`,
      { params, withCredentials: true }
    );
  }

  /**
   * Livello 3 (UO presente): beni della UO selezionata aggregati per categoria gruppo.
   *   GET /inventario/categoria/{anno}?cdUnitaOrganizzativa={uo}
   * Stessa forma di risposta dell'elenco struttura (codice, descrizione, numeroTotaleBeni, valoreTotaleBeni).
   */
  getCategoria(anno: number, cdUnitaOrganizzativa: string): Observable<InventarioPerStruttura[]> {
    const params = new HttpParams().set('cdUnitaOrganizzativa', cdUnitaOrganizzativa);
    return this.http.get<InventarioPerStruttura[]>(
      environment.apiUrl + `/inventario/categoria/${anno}`,
      { params, withCredentials: true }
    );
  }

}