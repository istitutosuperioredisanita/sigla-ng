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

package it.cnr.rsi.web;

import it.cnr.rsi.domain.Messaggio;
import it.cnr.rsi.domain.Preferiti;
import it.cnr.rsi.domain.Utente;
import it.cnr.rsi.domain.UtenteIndirizziMail;
import it.cnr.rsi.security.ContextAuthentication;
import it.cnr.rsi.security.UserContext;
import it.cnr.rsi.service.EsercizioBaseService;
import it.cnr.rsi.service.UnitaOrganizzativaService;
import it.cnr.rsi.service.UtenteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.util.Pair;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.sql.Date;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by marco.spasiano on 23/03/17.
 */

@RestController
@RequestMapping("/api/context")
public class ContextResource {

    public static final String API_ESERCIZIO = "/esercizio",
        API_UO = "/uo",
        API_CDS = "/cds",
        API_CDR = "/cdr",
        API_PREFERITI = "/preferiti",
        API_INDIRIZZI_MAIL = "/indirizzi-mail",
        API_MESSAGGI = "/messaggi",
        API_UTENTI_MULTIPLI = "/users";
    private static final Logger LOGGER = LoggerFactory.getLogger(ContextResource.class);
    private final EsercizioBaseService esercizioBaseService;
    private final UnitaOrganizzativaService unitaOrganizzativaService;
    private final UtenteService utenteService;

    public ContextResource(EsercizioBaseService esercizioBaseService,
                           UnitaOrganizzativaService unitaOrganizzativaService,
                           UtenteService utenteService) {
        this.esercizioBaseService = esercizioBaseService;
        this.unitaOrganizzativaService = unitaOrganizzativaService;
        this.utenteService = utenteService;
    }

    @GetMapping(API_ESERCIZIO)
    public List<Integer> esercizi() {
        UserContext userDetails = utenteService.getUserDetails();
        LOGGER.info("GET esercizi for User: {}", userDetails.getUsername());
        return esercizioBaseService.findEsercizi();
    }

    @GetMapping(API_UO)
    public List<Pair<String, String>> findUnitaOrganizzativeAbilitate(String cds) {
        UserContext userDetails = utenteService.getUserDetails();
        LOGGER.info("GET UO for User: {}", userDetails.getUsername());
        return unitaOrganizzativaService
            .listaUnitaOrganizzativeAbilitate(userDetails.getUsername(), userDetails.getEsercizio(), cds)
            .stream()
            .map(x -> Pair.of(x.getCdUnitaOrganizzativa(), x.getDsUnitaOrganizzativa()))
            .collect(Collectors.toList());
    }

    @GetMapping(API_CDS)
    public List<Pair<String, String>> findCdsAbilitati(String uo) {
        UserContext userDetails = utenteService.getUserDetails();
        LOGGER.info("GET CDS for User: {}", userDetails.getUsername());
        return unitaOrganizzativaService
            .listaCDSAbilitati(userDetails.getUsername(), userDetails.getEsercizio(),
                Optional.ofNullable(uo)
                    .filter(s -> !s.isEmpty())
                    .orElse(null)
            )
            .stream()
            .map(x -> Pair.of(x.getCdUnitaOrganizzativa(), x.getDsUnitaOrganizzativa()))
            .collect(Collectors.toList());
    }

    @GetMapping(API_CDR)
    public List<Pair<String, String>> findCdr(String uo) {
        UserContext userDetails = utenteService.getUserDetails();
        LOGGER.info("GET CDS for User: {}", userDetails.getUsername());
        return unitaOrganizzativaService
            .listaCdr(userDetails.getEsercizio(), uo)
            .stream()
            .map(x -> Pair.of(x.getCdCentroResponsabilita(), x.getDsCdr()))
            .collect(Collectors.toList());
    }

    @GetMapping(API_PREFERITI)
    public List<Preferiti> preferiti() {
        UserContext userDetails = utenteService.getUserDetails();
        LOGGER.info("GET preferiti for User: {}", userDetails.getUsername());
        return utenteService.findPreferiti(userDetails.getUsername());
    }

    @GetMapping(API_MESSAGGI)
    public List<Messaggio> messaggi() {
        UserContext userDetails = utenteService.getUserDetails();
        LOGGER.info("GET messaggi for User: {}", userDetails.getUsername());
        return utenteService.findMessaggi(userDetails.getUsername());
    }

    @PostMapping(API_MESSAGGI)
    public List<Messaggio> deleteMessaggi(@RequestBody ArrayList<Messaggio> messaggi) {
        UserContext userDetails = utenteService.getUserDetails();
        LOGGER.info("DELETE messaggi for User: {}", userDetails.getUsername());
        return utenteService.deleteMessaggi(userDetails.getUsername(), messaggi);
    }

    @GetMapping(API_UTENTI_MULTIPLI)
    public List<UserContext> users() {
        UserContext userDetails = utenteService.getUserDetails();
        LOGGER.info("GET all users for User: {}", userDetails.getUsername());
        return utenteService.findUsersForUid(userDetails.getLogin()).stream()
            .map(utente -> new UserContext(utente))
            .collect(Collectors.toList());
    }

    @PostMapping
    public UserContext save(@RequestBody Map<String, ?> params) {
        UserContext userDetails = utenteService.getUserDetails();
        LOGGER.info("POST params: {} for User: {}", params, userDetails.getUsername());
        userDetails.setEsercizio(
            Optional.ofNullable(params.get("esercizio"))
                .filter(Integer.class::isInstance)
                .map(Integer.class::cast)
                .orElse(null)
        );
        Optional.ofNullable(params.get("cds"))
            .filter(String.class::isInstance)
            .map(String.class::cast)
            .ifPresent(s -> userDetails.setCds(s));

        Optional.ofNullable(params.get("uo"))
            .filter(String.class::isInstance)
            .map(String.class::cast)
            .ifPresent(s -> userDetails.setUo(s));

        Optional.ofNullable(params.get("cdr"))
            .filter(String.class::isInstance)
            .map(String.class::cast)
            .ifPresent(s -> userDetails.setCdr(s));

        SecurityContextHolder.getContext().setAuthentication(
            new ContextAuthentication(
                userDetails,
                Optional.ofNullable(SecurityContextHolder.getContext())
                    .map(SecurityContext::getAuthentication)
                    .filter(ContextAuthentication.class::isInstance)
                    .map(ContextAuthentication.class::cast)
                    .map(ContextAuthentication::getKeycloakAuthenticationToken)
                    .orElse(null)
            )
        );
        return userDetails;
    }

    @GetMapping(API_INDIRIZZI_MAIL)
    public List<UtenteIndirizziMail> getIndirizziMail() {
        UserContext userDetails = utenteService.getUserDetails();
        LOGGER.info("GET Indirizzi mail for User: {}", userDetails.getUsername());
        return utenteService.findIndirizziMail(userDetails.getUsername());
    }

    @PostMapping(API_INDIRIZZI_MAIL)
    public ResponseEntity<List<UtenteIndirizziMail>> postIndirizzoMail(@RequestBody ArrayList<UtenteIndirizziMail> utenteIndirizziMail) {
        UserContext userDetails = utenteService.getUserDetails();
        LOGGER.info("POST Indirizzo mail for User: {} Indirizzo: {}", userDetails.getUsername(), utenteIndirizziMail);
        try {
            utenteService.insertIndirizzoMail(userDetails.getUsername(), utenteIndirizziMail);
        } catch (DataIntegrityViolationException _ex) {
            LOGGER.error("POST Indirizzo mail for User: {} Indirizzo: {} Failed", userDetails.getUsername(), utenteIndirizziMail, _ex);
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(utenteService.findIndirizziMail(userDetails.getUsername()));
    }

    @DeleteMapping(API_INDIRIZZI_MAIL + "/{indirizzi:.+}")
    public List<UtenteIndirizziMail> deleteIndirizziMail(@PathVariable ArrayList<String> indirizzi) {
        UserContext userDetails = utenteService.getUserDetails();
        LOGGER.info("DELETE Indirizzi mail for User: {} Indirizzi: {}", userDetails.getUsername(), indirizzi);
        utenteService.deleteIndirizziMail(userDetails.getUsername(), indirizzi);
        return utenteService.findIndirizziMail(userDetails.getUsername());
    }
}
