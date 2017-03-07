package it.cnr.rsi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * Created by francesco on 07/03/17.
 */

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Override
    public void configure(WebSecurity web) throws Exception {
        web
                .ignoring()
                .antMatchers("/app/**/*.{js,html}");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .authorizeRequests()
                .antMatchers("/api/**").fullyAuthenticated()
                .and()
                .formLogin()
                .and()
                .csrf()
                .disable();
    }


    @Override
    public void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth
                .ldapAuthentication()
                .userSearchBase("o=cnr, c=it")
                .userSearchFilter("uid={0}")
                .groupSearchBase(null)
                .contextSource()
                .url("ldap://virtest1.si.cnr.it:389")
                .managerDn("cn=mastercnrapp2,ou=account,o=cnr,c=it")
                .managerPassword("***REMOVED***");

    }



}
