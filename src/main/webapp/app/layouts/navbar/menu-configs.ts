// menu-configs.ts
export const MENU_CONFIGS = {
  dashboard: [
    { label: 'global.menu.home', route: '/workspace', icon: 'fa-home' },
    { label: 'global.menu.dashboard', route: '/dashboard', icon: 'fa-bar-chart' },
    { 
        label: 'global.menu.statistics', 
        icon: 'fa-pie-chart',
        child: [
            { 
              label: 'global.menu.progetti.title',  
              icon: 'fa-cubes',
              child: [
                { label: 'global.menu.progetti.fondi-funzionamento.uo', route: '/dashboard/fondi-funzionamento/uo', icon: 'fa-bar-chart' },
                { label: 'global.menu.progetti.fondi-funzionamento.elemento-voce', route: '/dashboard/fondi-funzionamento/elemento-voce', icon: 'fa-area-chart' },
                { label: 'global.menu.progetti.fondi-funzionamento.tipo-progetto', route: '/dashboard/fondi-funzionamento/tipo-progetto', icon: 'fa-bar-chart' },
                { label: 'global.menu.progetti.fondi-funzionamento.tipo-finanziamento', route: '/dashboard/fondi-funzionamento/tipo-finanziamento', icon: 'fa-pie-chart' },
                { label: 'global.menu.progetti.fondi-funzionamento.ente-finanziatore', route: '/dashboard/fondi-funzionamento/ente-finanziatore', icon: 'fa-line-chart' }
              ]
            },
            { label: 'global.menu.indice-tempestivita-pagamenti', route: '/dashboard/indice-tempestivita-pagamenti', icon: 'fa-dashboard' },
            { label: 'global.menu.acquisti-struttura', route: '/dashboard/acquisti-struttura', icon: 'fa-area-chart' },
            { label: 'global.menu.acquisti-stato', route: '/dashboard/acquisti-stato', icon: 'fa-bar-chart' },
            { label: 'global.menu.cespiti-struttura', route: '/dashboard/cespiti-struttura', icon: 'fa-area-chart' }
        ]        
    }
  ]
};