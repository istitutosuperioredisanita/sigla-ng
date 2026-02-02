// menu-configs.ts
export const MENU_CONFIGS = {
  dashboard: [
    { label: 'global.menu.home', route: '/workspace', icon: 'fa-home' },
    { label: 'global.menu.dashboard', route: '/dashboard', icon: 'fa-bar-chart' },
    { 
        label: 'global.menu.statistics', 
        icon: 'fa-pie-chart',
        child: [
            { label: 'global.menu.indice-tempestivita-pagamenti', route: '/indice-tempestivita-pagamenti', icon: 'fa-dashboard' },
            { label: 'global.menu.acquisti-struttura', route: '/acquisti-struttura', icon: 'fa-area-chart' },
            { label: 'global.menu.acquisti-stato', route: '/acquisti-stato', icon: 'fa-bar-chart' },
        ]        
    }
  ]
};