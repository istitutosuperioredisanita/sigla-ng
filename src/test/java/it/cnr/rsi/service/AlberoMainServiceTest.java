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

    @Autowired
    private AlberoMainService alberoMainService;

    @Test
    public void tree() throws Exception {

        String userId = "MSPASIANO";
        String unitaOrganizzativa = "999.000";


        Map<String, List<TreeNode>> fullMap = alberoMainService.tree(userId, unitaOrganizzativa);

        try {
            String json = new ObjectMapper().writeValueAsString(fullMap);
            LOGGER.info("json {}", json);
        } catch (JsonProcessingException e) {
            LOGGER.error("error creating tree {} {}", userId, unitaOrganizzativa, e);
        }

        assertEquals(9, fullMap.get("0").size());

    }

}