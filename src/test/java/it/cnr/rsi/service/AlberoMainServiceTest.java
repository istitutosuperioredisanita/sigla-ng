package it.cnr.rsi.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import it.cnr.rsi.domain.TreeNode;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;

/**
 * Created by francesco on 14/03/17.
 */

@RunWith(SpringRunner.class)
@SpringBootTest
public class AlberoMainServiceTest {

    private static final Logger LOGGER = LoggerFactory.getLogger(AlberoMainServiceTest.class);
    private static final String USER_ID = "MSPASIANO";
    private static final Integer ESERCIZIO = 2017;
    private static final String UNITA_ORGANIZZATIVA = "002.000";

    @Autowired
    private AlberoMainService alberoMainService;

    @Test
    public void tree() throws Exception {

        Map<String, List<TreeNode>> fullMap = alberoMainService.tree(USER_ID, ESERCIZIO, UNITA_ORGANIZZATIVA);

        try {
            String json = new ObjectMapper().writeValueAsString(fullMap);
            LOGGER.info("json {}", json);
        } catch (JsonProcessingException e) {
            LOGGER.error("error creating tree {} {}", USER_ID, UNITA_ORGANIZZATIVA, e);
        }

        assertEquals(9, fullMap.get("0").size());

    }

}