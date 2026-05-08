import { provideZoneChangeDetection } from "@angular/core";
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ProdConfig } from './blocks/config/prod.config';
import { SiglaAppModule } from './app.module';

ProdConfig();

if (module['hot']) {
    module['hot'].accept();
}

platformBrowserDynamic().bootstrapModule(SiglaAppModule, { applicationProviders: [provideZoneChangeDetection()], })
.then((success) => console.log(`Application started`))
.catch((err) => console.error(err));
