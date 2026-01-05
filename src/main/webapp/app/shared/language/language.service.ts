import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SessionStorageService } from 'ngx-webstorage';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  constructor(
    private translateService: TranslateService,
    private sessionStorageService: SessionStorageService
  ) {}

  // Restituisce la lingua attualmente in uso
  getCurrentLanguage(): string {
    return this.translateService.currentLang;
  }

  // Cambia la lingua e la salva nella sessione
  changeLanguage(languageKey: string): void {
    this.sessionStorageService.store('locale', languageKey);
    this.translateService.use(languageKey);
    this.updateHtmlLangAttribute(languageKey);
  }

  // Aggiorna l'attributo 'lang' nel tag <html> (utile per SEO e accessibilità)
  private updateHtmlLangAttribute(lang: string): void {
    document.querySelector('html')?.setAttribute('lang', lang);
  }

  // Inizializza la lingua al boot dell'app
  init(): void {
    const langKey = this.sessionStorageService.retrieve('locale') || 'it'; // 'it' o la tua lingua di default
    this.translateService.setDefaultLang(langKey);
    this.changeLanguage(langKey);
  }
}