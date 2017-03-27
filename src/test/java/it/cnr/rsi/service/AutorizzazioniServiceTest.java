package it.cnr.rsi.service;

import static org.junit.Assert.assertTrue;
import it.cnr.rsi.domain.UnitaOrganizzativa;

import java.util.List;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

/**
 * Created by francesco on 14/03/17.
 */

@RunWith(SpringRunner.class)
@SpringBootTest
public class AutorizzazioniServiceTest {

    private static final Logger LOGGER = LoggerFactory.getLogger(AutorizzazioniServiceTest.class);
    private static final String USER_ID = "MSPASIANO";
    private static final Integer ESERCIZIO = 2017;
    @Autowired
    private UnitaOrganizzativaService unitaOrganizzativaService;
    @Autowired
    private EsercizioBaseService esercizioBaseService;

    @Test
    public void listaUnitaOrganizzativeAbilitate() throws Exception {
        List<UnitaOrganizzativa> listaUnitaOrganizzativeAbilitate = unitaOrganizzativaService.listaUnitaOrganizzativeAbilitate(USER_ID, ESERCIZIO);
        listaUnitaOrganizzativeAbilitate
        	.stream()
        	.map(x -> x.getCdUnitaOrganizzativa())
        	.forEach(x -> LOGGER.info(x));
        assertTrue(!listaUnitaOrganizzativeAbilitate.isEmpty());
    }

    @Test
    @Ignore
    public void listaEsercizi() throws Exception {
        List<Integer> listaEsercizi = esercizioBaseService.findEsercizi();
        listaEsercizi
        	.stream()
        	.map(String::valueOf)
        	.forEach(x -> LOGGER.info(x));
        assertTrue(!listaEsercizi.isEmpty());
    }

}