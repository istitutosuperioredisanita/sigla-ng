import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ng2-webstorage';
import { UserContext } from '../../shared';

@Injectable()
export class LocalStateStorageService {
    private USERCONTEXT = 'usercontext-';
    constructor(
        private $localStorage: LocalStorageService
    ) {}

    getUserContext(username: string): UserContext {
        return this.$localStorage.retrieve(this.USERCONTEXT + username) ||
            new UserContext(new Date().getFullYear(), '', '', '');
    }

    resetUserContext(username: string) {
        this.$localStorage.clear(this.USERCONTEXT + username);
    }

    storeEsercizio(username: string, esercizio: number) {
        const userContext = this.getUserContext(username);
        userContext.esercizio = esercizio;
        this.$localStorage.store(this.USERCONTEXT + username, userContext);
    }

    storeUserContext(username: string, usercontext: UserContext) {
        this.$localStorage.store(this.USERCONTEXT + username, usercontext);
    }

}
