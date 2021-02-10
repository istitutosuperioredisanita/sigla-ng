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

package it.cnr.rsi.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Date;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;

/**
 * Created by francesco on 13/03/17.
 */
public class AjaxAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        final Boolean isExpired = Optional.ofNullable(authentication)
            .map(Authentication::getPrincipal)
            .filter(UserContext.class::isInstance)
            .map(UserContext.class::cast)
            .map(UserContext::getCurrentUser)
            .flatMap(utente -> Optional.ofNullable(utente.getDtUltimoAccesso()))
            .filter(Date.class::isInstance)
            .map(Date.class::cast)
            .map(Date::toLocalDate)
            .map(localDate -> localDate.plusMonths(UserContext.MONTH_EXPIRED))
            .map(localDate -> localDate.isBefore(LocalDate.now(ZoneId.systemDefault())))
            .orElse(Boolean.FALSE);
        if (isExpired) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        } else {
            response.setStatus(HttpServletResponse.SC_OK);
        }
    }
}
