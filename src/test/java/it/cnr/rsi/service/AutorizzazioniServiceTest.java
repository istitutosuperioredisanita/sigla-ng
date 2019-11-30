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

import it.cnr.rsi.domain.UnitaOrganizzativa;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;

import static org.junit.Assert.assertTrue;

/**
 * Created by francesco on 14/03/17.
 */

@RunWith(SpringRunner.class)
@SpringBootTest
public class AutorizzazioniServiceTest {

    private static final Logger LOGGER = LoggerFactory.getLogger(AutorizzazioniServiceTest.class);
    private static final String USER_ID = "MSPASIANO";
    private static final Integer ESERCIZIO = 2017;
    private static final String CDS = "084";
    private static final String UO = "084.000";

    @Autowired
    private UnitaOrganizzativaService unitaOrganizzativaService;
    @Autowired
    private EsercizioBaseService esercizioBaseService;

    @Test
    public void listaUnitaOrganizzativeAbilitate() throws Exception {
        List<UnitaOrganizzativa> listaUnitaOrganizzativeAbilitate = unitaOrganizzativaService.listaUnitaOrganizzativeAbilitate(USER_ID, ESERCIZIO, CDS);
        listaUnitaOrganizzativeAbilitate
        	.stream()
        	.map(x -> x.getCdUnitaOrganizzativa() + " - " + x.getDsUnitaOrganizzativa())
        	.forEach(x -> LOGGER.info("UO:" + x));
        assertTrue(!listaUnitaOrganizzativeAbilitate.isEmpty());
    }

    @Test
    public void listaCDSAbilitati() throws Exception {
        List<UnitaOrganizzativa> listaCDSAbilitati = unitaOrganizzativaService.listaCDSAbilitati(USER_ID, ESERCIZIO, UO);
        listaCDSAbilitati
        	.stream()
        	.map(x -> x.getCdUnitaOrganizzativa() + " - " + x.getDsUnitaOrganizzativa())
        	.forEach(x -> LOGGER.info("CDS:" + x));
        assertTrue(!listaCDSAbilitati.isEmpty());
    }

    @Test
    public void listaEsercizi() throws Exception {
        List<Integer> listaEsercizi = esercizioBaseService.findEsercizi();
        listaEsercizi
        	.stream()
        	.map(String::valueOf)
        	.forEach(x -> LOGGER.info(x));
        assertTrue(!listaEsercizi.isEmpty());
    }

}
