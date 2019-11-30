/*
 * Copyright (C) 2019  Consiglio Nazionale delle Ricerche
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
