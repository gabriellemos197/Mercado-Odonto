import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import { enableProdMode } from '@angular/core';

import 'web-animations-js/web-animations.min';

enableProdMode();
platformBrowserDynamic().bootstrapModule(AppModule);
