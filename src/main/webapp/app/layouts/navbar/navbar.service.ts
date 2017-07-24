import { Injectable } from '@angular/core';

@Injectable()
export class NavbarService {
  burgherMenuVisible: boolean;

  constructor() { this.burgherMenuVisible = false; }

  hideBurgherMenu() { this.burgherMenuVisible = false; }

  showBurgherMenu() { this.burgherMenuVisible = true; }

  toggleBurgherMenu() { this.burgherMenuVisible = !this.burgherMenuVisible; }

}
