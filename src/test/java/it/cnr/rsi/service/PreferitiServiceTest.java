package it.cnr.rsi.service;

import it.cnr.rsi.domain.Preferiti;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;

import static org.junit.Assert.assertEquals;

/**
 * Created by francesco on 14/03/17.
 */

@RunWith(SpringRunner.class)
@SpringBootTest
public class PreferitiServiceTest {

    private static final Logger LOGGER = LoggerFactory.getLogger(PreferitiServiceTest.class);
    private static final String USER_ID = "MSPASIANO";

    @Autowired
    private UtenteService utenteService;

    @Test
    public void preferiti() throws Exception {

        final List<Preferiti> preferiti = utenteService.findPreferiti(USER_ID);
        preferiti.stream().forEach(preferiti1 -> LOGGER.info("record: {}",preferiti1));

        assertEquals(false, preferiti.isEmpty());

    }

}
