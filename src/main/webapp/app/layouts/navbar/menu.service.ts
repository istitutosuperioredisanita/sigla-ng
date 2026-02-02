import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MENU_CONFIGS } from './menu-configs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItemsSubject = new BehaviorSubject<any[]>([]);
  menuItems$ = this.menuItemsSubject.asObservable();

  setMenu(menuKey: any) {
    this.menuItemsSubject.next(MENU_CONFIGS[menuKey]);
  }

  setCustomMenu(items: any[]) {
    this.menuItemsSubject.next(items);
  }
}