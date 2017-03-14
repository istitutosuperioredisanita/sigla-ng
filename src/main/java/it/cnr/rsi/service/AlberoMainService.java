package it.cnr.rsi.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import it.cnr.rsi.domain.AlberoMain;
import it.cnr.rsi.repository.AlberoMainRepository;
import it.cnr.rsi.repository.RuoloAccessoRepository;
import it.cnr.rsi.repository.UtenteUnitaAccessoRepository;
import it.cnr.rsi.repository.UtenteUnitaRuoloRepository;
import org.apache.commons.collections4.MultiValuedMap;
import org.apache.commons.collections4.multimap.HashSetValuedHashMap;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Created by francesco on 07/03/17.
 */

@Service
public class AlberoMainService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AlberoMainService.class);

    private AlberoMainRepository alberoMainRepository;    
    private UtenteUnitaAccessoRepository utenteUnitaAccessoRepository;
    private UtenteUnitaRuoloRepository utenteUnitaRuoloRepository;
    private RuoloAccessoRepository ruoloAccessoRepository;

    public AlberoMainService(AlberoMainRepository alberoMainRepository, UtenteUnitaAccessoRepository utenteUnitaAccessoRepository, 
    		UtenteUnitaRuoloRepository utenteUnitaRuoloRepository, RuoloAccessoRepository ruoloAccessoRepository) {
        this.alberoMainRepository = alberoMainRepository;
        this.utenteUnitaAccessoRepository = utenteUnitaAccessoRepository;
        this.utenteUnitaRuoloRepository = utenteUnitaRuoloRepository;
        this.ruoloAccessoRepository = ruoloAccessoRepository;
    }


    //@Cacheable(value="tree", key="#userId, #unitaOrganizzativa")
    @Transactional
    public List<AlberoMain> tree(String userId, String unitaOrganizzativa) {
    	LOGGER.info("GET Tree for User: {} and Unita Organizzativa: {}", userId, unitaOrganizzativa);
    	Stream<String> accessiPerUtente = utenteUnitaAccessoRepository.findAccessiByCdUtente(userId, unitaOrganizzativa);    	
    	//accessiPerUtente.forEach(accesso -> LOGGER.info("Accesso: {}", accesso));
    	Stream<String> ruoliPerUtente = utenteUnitaRuoloRepository.findRuoliByCdUtente(userId, unitaOrganizzativa);
    	Stream<String> accessiPerRuoli = ruoloAccessoRepository.findAccessiByRuoli(ruoliPerUtente.collect(Collectors.toList()));
    	//accessiPerRuoli.forEach(accesso -> LOGGER.info("Accessi per Ruolo: {}", accesso));    	
    	Stream<String> accessi = Stream.concat(accessiPerUtente, accessiPerRuoli).distinct();
    	Stream<AlberoMain> leafs = alberoMainRepository.findAlberoMainByAccessi(accessi.collect(Collectors.toList()));


        MultiValuedMap<String, AlberoMain> m = new HashSetValuedHashMap<>();
    	leafs.forEach(leaf -> visit(leaf, m));
    	LOGGER.info("mappa {}", m.toString());

        Map<String, List<List<String>>> fullMap = m
                .keySet()
                .stream()
                .map(id -> Pair.of(id, orderedValues(m.get(id))))
                .collect(Collectors.toMap(Pair::getKey, Pair::getValue));

        LOGGER.info("full map {}", fullMap);

        try {
            String json = new ObjectMapper().writeValueAsString(fullMap);
            LOGGER.info("json {}", json);
        } catch (JsonProcessingException e) {
            LOGGER.error("error creating tree {} {}", userId, unitaOrganizzativa, e);
        }

    	return null;
    }

    private List<List<String>> orderedValues(Collection<AlberoMain> values) {

        return  values
                .stream()
                .sorted(Comparator.comparingInt(x -> x.getPgOrdinamento().intValue()))
                .map(node -> Arrays.asList(node.getCdNodo(), node.getDsNodo(), node.getBusinessProcess()))
                .collect(Collectors.toList());
    }



    private void visit(AlberoMain node, MultiValuedMap<String, AlberoMain> m) {

        String cdNodo = node.getCdNodo();

        node.getPgOrdinamento();

        AlberoMain parent = node.getAlberoMain();

        if (parent == null) {
            m.put("ROOT", node);
        } else {
            String parentCdNodo = parent.getCdNodo();

            if (m.containsKey(parentCdNodo)) {
                LOGGER.info("{} gia' visitato", parentCdNodo);
            } else {
                visit(parent, m);
            }

            m.put(parentCdNodo, node);


        }
    }

}
