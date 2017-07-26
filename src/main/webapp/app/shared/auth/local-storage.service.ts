import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ng2-webstorage';
import { UserContext } from '../../shared';

@Injectable()
export class LocalStateStorageService {
    constructor(
        private $localStorage: LocalStorageService
    ) {}

    getUserContext(username: string): UserContext {
        return this.$localStorage.retrieve('usercontext-' + username) ||
            new UserContext(new Date().getFullYear(), '', '', '');
    }

    resetUserContext(username: string) {
        this.$localStorage.clear('usercontext-' + username);
    }

    storeEsercizio(username: string, esercizio: number) {
        let userContext = this.getUserContext(username);
        userContext.esercizio = esercizio;
        this.$localStorage.store('usercontext', userContext);
    }

    storeUserContext(username: string, usercontext: UserContext) {
        this.$localStorage.store('usercontext-' + username, usercontext);
    }

}
