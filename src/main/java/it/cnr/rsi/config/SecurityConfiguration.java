package it.cnr.rsi.config;

import it.cnr.rsi.security.*;
import it.cnr.rsi.service.UtenteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ldap.core.DirContextAdapter;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.userdetails.LdapAuthoritiesPopulator;
import org.springframework.security.ldap.userdetails.UserDetailsContextMapper;

import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Created by francesco on 07/03/17.
 */

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
@EnableConfigurationProperties(LdapConfigurationProperties.class)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfiguration.class);

    @Autowired
    private LdapConfigurationProperties ldapConfigurationProperties;
    @Autowired
    private UtenteService utenteService;

    @Override
    public void configure(WebSecurity web) throws Exception {
        web
                .ignoring()
                .antMatchers("/app/**/*.{js,html}");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .httpBasic()
                .and()
                .authorizeRequests()
                .antMatchers("/api/profile-info").permitAll()
                .antMatchers("/api/account").permitAll()
                .antMatchers("/api/validate-authentication").permitAll()
                .antMatchers("/api/**").fullyAuthenticated()
                .and()
                .formLogin()
                .loginPage("/api/validate-authentication")
                .loginProcessingUrl("/api/authentication")
                .successHandler(ajaxAuthenticationSuccessHandler())
                .failureHandler(ajaxAuthenticationFailureHandler())
                .usernameParameter("j_username")
                .passwordParameter("j_password")
                .permitAll()
                .and()
                .logout()
                .logoutUrl("/api/logout")
                .logoutSuccessHandler(ajaxLogoutSuccessHandler())
                .permitAll()
                .and()
                .csrf()
                .disable();
    }

    @Bean
    public AuthenticationProvider customAuthenticationProvider(){
    	DaoAuthenticationProvider customAuthenticationProvider = new DaoAuthenticationProvider();
    	customAuthenticationProvider.setUserDetailsService(utenteService);
    	return customAuthenticationProvider;
    }

    @Override
    public void configure(AuthenticationManagerBuilder auth) throws Exception {
        LOGGER.info("ldap config: {}", ldapConfigurationProperties);
        if (ldapConfigurationProperties.isEnabled()) {
            LdapAuthoritiesPopulator ldapAuthoritiesPopulator = (userData, username) -> {
                LOGGER.info("user: {}", username);
                LOGGER.info("user data {}", userData.toString());
                return Stream
                    .of("employee", "ACTUATOR", "ROLE_ADMIN")
                    .map(name -> new SimpleGrantedAuthority(name))
                    .collect(Collectors.toList());
            };
            auth
                .ldapAuthentication()
                .ldapAuthoritiesPopulator(ldapAuthoritiesPopulator)
                .userSearchBase(ldapConfigurationProperties.getUserSearchBase())
                .userDetailsContextMapper(new UserDetailsContextMapper() {
                    @Override
                    public void mapUserToContext(UserDetails user, DirContextAdapter ctx) {
                        throw new UnsupportedOperationException(
                            "LdapUserDetailsMapper only supports reading from a context. Please"
                                + "use a subclass if mapUserToContext() is required.");
                    }
                    @Override
                    public UserDetails mapUserFromContext(DirContextOperations ctx,
                                                          String username, Collection<? extends GrantedAuthority> authorities) {
                        return Optional.ofNullable(utenteService.loadUserByUid(username))
                            .map(userContext -> {
                                userContext.addAttribute("firstName", ctx.getStringAttribute("cnrnome"));
                                userContext.addAttribute("lastName", ctx.getStringAttribute("cnrcognome"));
                                userContext.addAttribute("email", ctx.getStringAttribute("mail"));
                                userContext.addAttribute("login", username);
                                userContext.addAttribute("ldap", Boolean.TRUE);
                                return userContext;
                            }).orElseThrow(() -> new BadCredentialsException(""));
                    }
                })
                .userSearchFilter(ldapConfigurationProperties.getUserSearchFilter())
                .groupSearchBase(null)
                .contextSource()
                .url(ldapConfigurationProperties.getUrl())
                .managerDn(ldapConfigurationProperties.getManagerDn())
                .managerPassword(ldapConfigurationProperties.getManagerPassword());
        }
        auth
        	.authenticationProvider(customAuthenticationProvider());
    }


    @Bean
    public AjaxAuthenticationSuccessHandler ajaxAuthenticationSuccessHandler() {
        return new AjaxAuthenticationSuccessHandler();
    }

    @Bean
    public AjaxAuthenticationFailureHandler ajaxAuthenticationFailureHandler() {
        return new AjaxAuthenticationFailureHandler();
    }

    @Bean
    public AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler() {
        return new AjaxLogoutSuccessHandler();
    }

    @Bean
    public Http401UnauthorizedEntryPoint http401UnauthorizedEntryPoint() {
        return new Http401UnauthorizedEntryPoint();
    }
}
