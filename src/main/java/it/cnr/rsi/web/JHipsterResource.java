package it.cnr.rsi.web;

import it.cnr.rsi.domain.UserDTO;
import it.cnr.rsi.service.UtenteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.userdetails.LdapUserDetailsImpl;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by francesco on 21/03/17.
 */

@RestController
@RequestMapping("/api")
public class JHipsterResource {

    private static final Logger LOGGER  = LoggerFactory.getLogger(JHipsterResource.class);

    @Autowired
    private Environment env;

    @Autowired
    private UtenteService utenteService;


    @GetMapping("/profile-info")
    public ResponseEntity<Map<String, Serializable>> profileInfo() {

        List<String> profiles = Arrays.asList(env.getActiveProfiles());
        Map<String, Serializable> map = new HashMap<>();
        map.put("activeProfiles", new ArrayList(profiles));

        profiles
            .stream()
            .filter(profile -> profile.equalsIgnoreCase("dev"))
            .findAny()
            .ifPresent(profile -> map.put("ribbonEnv", profile));

        return ResponseEntity.ok(map);
    }

    @GetMapping("/account")
    public ResponseEntity<UserDTO> account() {


        UserDetails userDetails = getUserDetails();

        LdapUserDetailsImpl ldapUserDetails = Optional
            .ofNullable(userDetails)
            .filter(x -> x instanceof LdapUserDetailsImpl)
            .map(LdapUserDetailsImpl.class::cast)
            .orElseThrow(() -> new RuntimeException("not an ldap user"));


        List<String> authorities = userDetails
            .getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());

        LOGGER.info("details {} {}", userDetails.getClass().getCanonicalName(), userDetails);


        UserDTO userDTO = new UserDTO();

        userDTO.setAuthorities(authorities);
        userDTO.setId(0l);
        userDTO.setLogin(userDetails.getUsername());
        userDTO.setEmail("???");



        /*

        {
  "id" : 3,
  "firstName" : "Administrator",
  "lastName" : "Administrator",
  "email" : "admin@localhost",
  "imageUrl" : "",
  "activated" : true,
  "langKey" : "it",
  "createdBy" : "system",
  "createdDate" : "2017-03-21T14:53:43.346+01:00",
  "lastModifiedBy" : "system",
  "lastModifiedDate" : null,
  "authorities" : [ "ROLE_USER", "ROLE_ADMIN" ]
}


         */
        return ResponseEntity.ok(userDTO);

    }


    private static UserDetails getUserDetails() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        return Optional
            .ofNullable(authentication)
            .map(Authentication::getPrincipal)
            .filter(principal -> principal instanceof UserDetails)
            .map(UserDetails.class::cast)
            .orElseThrow(() -> new RuntimeException("something went wrong " + authentication.toString()));


    }


}
