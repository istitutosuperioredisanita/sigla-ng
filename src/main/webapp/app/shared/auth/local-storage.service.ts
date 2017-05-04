import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ng2-webstorage';
import { UserContext } from '../../shared';

@Injectable()
export class LocalStateStorageService {
    private initUserContext = new UserContext(
        new Date().getFullYear(), '', '', ''
    );
    constructor(
        private $localStorage: LocalStorageService
    ) {}

    getUserContext() {
        return this.$localStorage.retrieve('usercontext') || this.initUserContext;
    }

    resetUserContext() {
        this.$localStorage.clear('usercontext');
    }

    storeEsercizio(esercizio: number) {
        let userContext = this.getUserContext();
        userContext.esercizio = esercizio;
        this.$localStorage.store('usercontext', userContext);
    }

    storeUserContext(usercontext: UserContext) {
        this.$localStorage.store('usercontext', usercontext);
    }

}
