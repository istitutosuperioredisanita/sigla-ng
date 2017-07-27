package it.cnr.rsi.service;

import it.cnr.rsi.domain.Preferiti;
import it.cnr.rsi.domain.Utente;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;
import java.util.stream.Stream;

import static org.junit.Assert.assertEquals;

/**
 * Created by francesco on 14/03/17.
 */

@RunWith(SpringRunner.class)
@SpringBootTest
public class UtentiMultipliServiceTest {

    private static final Logger LOGGER = LoggerFactory.getLogger(UtentiMultipliServiceTest.class);
    private static final String USER_ID = "marco.spasiano";

    @Autowired
    private UtenteService utenteService;

    @Test
    public void users() throws Exception {
        assertEquals(true, utenteService.findUsersForUid(USER_ID).stream()
            .peek(utente -> LOGGER.info("USER: {}", utente))
            .findAny()
            .isPresent());
    }
}
