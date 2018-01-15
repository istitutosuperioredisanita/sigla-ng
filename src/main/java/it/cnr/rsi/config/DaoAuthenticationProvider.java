package it.cnr.rsi.config;

import it.cnr.rsi.security.UserContext;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsChecker;
import org.springframework.util.Base64Utils;

import java.util.Date;
import java.util.Optional;

public class DaoAuthenticationProvider extends org.springframework.security.authentication.dao.DaoAuthenticationProvider {
    UserDetails userDetails;

    public DaoAuthenticationProvider() {
        setPasswordEncoder(new org.springframework.security.crypto.password.PasswordEncoder() {

            @Override
            public String encode(CharSequence rawPassword) {
                return rawPassword.toString();
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                final Optional<Date> dataUltimaVariazionePassword = Optional.ofNullable(getUserDetails())
                    .filter(UserContext.class::isInstance)
                    .map(UserContext.class::cast)
                    .map(UserContext::getCurrentUser)
                    .flatMap(utente -> Optional.ofNullable(utente.getDtUltimaVarPassword()));
                if (dataUltimaVariazionePassword.isPresent()) {
                    byte[] buser = getUserDetails().getUsername().getBytes();
                    byte[] bpassword = rawPassword.toString().toUpperCase().getBytes();
                    byte h = 0;
                    for (int i = 0; i < bpassword.length; i++) {
                        h = (byte) (bpassword[i] ^ h);
                        for (int j = 0; j < buser.length; j++)
                            bpassword[i] ^= buser[j] ^ h;
                    }
                    return Base64Utils.encodeToString(bpassword).equals(encodedPassword);
                } else
                    return Boolean.TRUE;
            }
        });

        setPreAuthenticationChecks(new UserDetailsChecker() {
            @Override
            public void check(UserDetails toCheck) {
                setUserDetails(toCheck);
            }
        });
    }

    public UserDetails getUserDetails() {
        return userDetails;
    }

    public void setUserDetails(UserDetails userDetails) {
        this.userDetails = userDetails;
    }
}
