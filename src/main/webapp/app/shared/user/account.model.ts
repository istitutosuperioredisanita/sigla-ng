export class Account {
    public activated: boolean;
    public accountNonLocked: boolean;
    public accountNonExpired: boolean;
    public enabled: boolean;
    public credentialsNonExpired: boolean;
    public authorities: string[];
    public email: string;
    public firstName: string;
    public langKey: string;
    public lastName: string;
    public login: string;
    public username: string;
    public dsUtente: string;
    public utenteMultiplo: boolean;
    public imageUrl: string;
    public esercizio: number;
    public cds: string;
    public uo: string;
    public cdr: string;
    public users: any[];
    public accountUsers: Account[] = [];

    constructor(users?: any[]) {
        if (users) {
            users.forEach((user) => {
                this.accountUsers.push(Object.assign(new Account(), user));
            });
        }
    }

    public get descrizione(): string {
        return this.dsUtente || (this.firstName + ' ' + this.lastName);
    }

    public setEsercizio(esercizio: number) {
        this.esercizio = esercizio;
    }
}
