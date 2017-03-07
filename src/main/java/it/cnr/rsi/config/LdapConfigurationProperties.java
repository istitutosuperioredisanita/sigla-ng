package it.cnr.rsi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Created by francesco on 07/03/17.
 */

@ConfigurationProperties("cnr.ldap")
public class LdapConfigurationProperties {

    private String userSearchBase;
    private String userSearchFilter;
    private String url;
    private String managerDn;
    private String managerPassword;

    public String getUserSearchBase() {
        return userSearchBase;
    }

    public void setUserSearchBase(String userSearchBase) {
        this.userSearchBase = userSearchBase;
    }

    public String getUserSearchFilter() {
        return userSearchFilter;
    }

    public void setUserSearchFilter(String userSearchFilter) {
        this.userSearchFilter = userSearchFilter;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getManagerDn() {
        return managerDn;
    }

    public void setManagerDn(String managerDn) {
        this.managerDn = managerDn;
    }

    public String getManagerPassword() {
        return managerPassword;
    }

    public void setManagerPassword(String managerPassword) {
        this.managerPassword = managerPassword;
    }


}
