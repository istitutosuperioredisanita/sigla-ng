package it.cnr.rsi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@ConfigurationProperties(prefix = "sso.cnr")
@Profile("keycloak")
public class SSOConfigurationProperties {
    private String user;
    private String matricola;
    private String livello;
    private String contesto;
    private String username_cnr;
    private String logout_success_url;

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getMatricola() {
        return matricola;
    }

    public void setMatricola(String matricola) {
        this.matricola = matricola;
    }

    public String getLivello() {
        return livello;
    }

    public void setLivello(String livello) {
        this.livello = livello;
    }

    public String getContesto() {
        return contesto;
    }

    public void setContesto(String contesto) {
        this.contesto = contesto;
    }

    public String getUsername_cnr() {
        return username_cnr;
    }

    public void setUsername_cnr(String username_cnr) {
        this.username_cnr = username_cnr;
    }

    public String getLogout_success_url() {
        return logout_success_url;
    }

    public void setLogout_success_url(String logout_success_url) {
        this.logout_success_url = logout_success_url;
    }
}
