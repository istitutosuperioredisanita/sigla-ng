package it.cnr.rsi.web;

import it.cnr.rsi.domain.AlberoMain;
import it.cnr.rsi.domain.TreeNode;
import it.cnr.rsi.repository.AlberoMainRepository;
import it.cnr.rsi.service.AlberoMainService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Created by francesco on 07/03/17.
 */

@RestController
public class AlberoMainResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(AlberoMainResource.class);

    public static final String API_ALBERO_MAIN = "/api/tree";

    private AlberoMainRepository alberoMainRepository;

    private AlberoMainService alberoMainService;

    public AlberoMainResource(AlberoMainRepository helloRepository, AlberoMainService helloService) {
        this.alberoMainRepository = helloRepository;
        this.alberoMainService = helloService;
    }


    @GetMapping(API_ALBERO_MAIN)
    public Map<String, List<TreeNode>> tree(String userId, Integer esercizio, String unitaOrganizzativa){
        LOGGER.info("GET Tree for User: {} esercizio {} and Unita Organizzativa: {}", userId, esercizio, unitaOrganizzativa);
        return alberoMainService.tree(userId, esercizio, unitaOrganizzativa);
    }

    @PostMapping(value = API_ALBERO_MAIN, consumes = MediaType.APPLICATION_JSON_VALUE)
    public AlberoMain helloPost(@RequestBody AlberoMain alberoMain) {
        return alberoMainRepository.saveAndFlush(alberoMain);
    }

}
