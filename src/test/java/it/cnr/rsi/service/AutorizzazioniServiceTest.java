package it.cnr.rsi.service;

import static org.junit.Assert.assertTrue;
import it.cnr.rsi.domain.UnitaOrganizzativa;

import java.util.List;

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
    private static final Integer ESERCIZIO = 2016;
    private static final String UNITA_ORGANIZZATIVA = "999.000";

    @Autowired
    private UnitaOrganizzativaService unitaOrganizzativaService;

    @Test
    public void listaUnitaOrganizzativeAbilitate() throws Exception {
        List<UnitaOrganizzativa> listaUnitaOrganizzativeAbilitate = unitaOrganizzativaService.listaUnitaOrganizzativeAbilitate(USER_ID);
        listaUnitaOrganizzativeAbilitate
        	.stream()
        	.map(x -> x.getCdUnitaOrganizzativa())
        	.forEach(x -> LOGGER.info(x));
        assertTrue(!listaUnitaOrganizzativeAbilitate.isEmpty());
    }

}