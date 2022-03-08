export class ProfileInfo {
    activeProfiles: string[];
    ribbonEnv: string;
    instituteAcronym: string;
    urlChangePassword: string;
    siglaWildflyURL: string;
    keycloakEnabled: boolean;

    get inProduction() {
        return this.activeProfiles.indexOf('prod') !== -1;
    }

    get swaggerEnabled() {
        return this.activeProfiles.indexOf('swagger') !== -1;
    }

}
