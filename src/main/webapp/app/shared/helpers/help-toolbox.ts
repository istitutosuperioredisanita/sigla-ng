import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

/** Icona Font Awesome 4.7 "info-circle" (f05a) come tracciato SVG, per la toolbox dei grafici */
export const ICONA_HELP = 'path://M1152 1376v-160q0-14-9-23t-23-9h-96v-512q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v160q0 14 9 23t23 9h96v320h-96q-14 0-23 9t-9 23v160q0 14 9 23t23 9h448q14 0 23-9t9-23zm-128-896v-160q0-14-9-23t-23-9h-192q-14 0-23 9t-9 23v160q0 14 9 23t23 9h192q14 0 23-9t9-23zm640 416q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z';

/** URL dell'help della pagina corrente: environment.helpBaseURL + percorso della route (senza query string e fragment) */
export function helpUrl(router: Router): string {
  const path = router.url.split(/[?#]/)[0].replace(/\/+$/, '');
  return environment.helpBaseURL.replace(/\/+$/, '') + (path.startsWith('/') ? path : '/' + path);
}

/**
 * Feature custom per la toolbox ECharts: apre l'help della pagina in una nuova scheda.
 * Va inserita come PRIMA feature, così l'icona compare a sinistra di salva-immagine e CSV.
 */
export function helpToolboxFeature(router: Router) {
  return {
    show: true,
    title: 'Help',
    icon: ICONA_HELP,
    iconStyle: { color: '#2c6fbb', borderWidth: 0 },
    emphasis: { iconStyle: { color: '#1f5291', borderWidth: 0 } },
    onclick: () => window.open(helpUrl(router), '_help', 'noopener')
  };
}