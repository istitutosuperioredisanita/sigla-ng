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

package it.cnr.rsi.service;

import it.cnr.rsi.domain.Utente;
import it.cnr.rsi.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * @author mspasiano
 */
@Service
public class AccessoService {
    private static final Logger LOGGER = LoggerFactory.getLogger(AccessoService.class);

    private UtenteUnitaAccessoRepository utenteUnitaAccessoRepository;
    private UtenteUnitaRuoloRepository utenteUnitaRuoloRepository;
    private RuoloAccessoRepository ruoloAccessoRepository;
    private UtenteRepository utenteRepository;
    private UnitaOrganizzativaRepository unitaOrganizzativaRepository;

    public AccessoService(UtenteUnitaAccessoRepository utenteUnitaAccessoRepository,
                          UtenteUnitaRuoloRepository utenteUnitaRuoloRepository,
                          RuoloAccessoRepository ruoloAccessoRepository,
                          UtenteRepository utenteRepository,
                          UnitaOrganizzativaRepository unitaOrganizzativaRepository) {
        this.utenteUnitaAccessoRepository = utenteUnitaAccessoRepository;
        this.utenteUnitaRuoloRepository = utenteUnitaRuoloRepository;
        this.ruoloAccessoRepository = ruoloAccessoRepository;
        this.utenteRepository = utenteRepository;
        this.unitaOrganizzativaRepository = unitaOrganizzativaRepository;
    }

    @CacheEvict(value = "accessi", key = "{#userId, #esercizio, #unitaOrganizzativa}")
    public boolean evictCacheAccessi(String userId, Integer esercizio, String unitaOrganizzativa) {
        LOGGER.info("Evict cache Accessi for User: {}", userId);
        return true;
    }

    @Cacheable(value = "accessi", key = "{#userId, #esercizio, #unitaOrganizzativa}")
    @Transactional
    public List<String> accessi(String userId, Integer esercizio, String unitaOrganizzativa) {
        LOGGER.info("Accessi for User: {} esercizio {} and Unita Organizzativa: {}", userId, esercizio, unitaOrganizzativa);
        Utente utente = utenteRepository.findById(userId).get();
        List<String> findRuoliByCdUtente = utenteUnitaRuoloRepository
            .findRuoliByCdUtente(userId, unitaOrganizzativa).collect(Collectors.toList());
        List<String> findAccessiByCdUtente = utenteUnitaAccessoRepository
            .findAccessiByCdUtente(userId, esercizio, unitaOrganizzativa).collect(Collectors.toList());

        unitaOrganizzativaRepository.findCodiceUoParents(esercizio, unitaOrganizzativa)
            .forEach(codiceUo -> {
                findRuoliByCdUtente.addAll(
                    utenteUnitaRuoloRepository.findRuoliByCdUtente(userId, codiceUo).collect(Collectors.toList())
                );
                findAccessiByCdUtente.addAll(
                    utenteUnitaAccessoRepository.findAccessiByCdUtente(userId, esercizio, codiceUo).collect(Collectors.toList())
                );
            });


        Optional.of(utente.isUtenteSupervisore())
            .filter(isUtenteSupervisore -> isUtenteSupervisore)
            .filter(aBoolean -> Optional.ofNullable(utente.getCdRuoloSupervisore()).isPresent())
            .ifPresent(aBoolean -> findRuoliByCdUtente.add(utente.getCdRuoloSupervisore()));
        return Stream.concat(
            findAccessiByCdUtente.stream(),
            Optional.ofNullable(findRuoliByCdUtente).filter(x -> !x.isEmpty())
                .map(x -> ruoloAccessoRepository.findAccessiByRuoli(esercizio, x))
                .orElse(Stream.empty())
        ).distinct().collect(Collectors.toList());
    }
}
