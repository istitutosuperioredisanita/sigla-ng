package it.cnr.rsi.service;

import it.cnr.rsi.domain.AlberoMain;
import it.cnr.rsi.repository.AlberoMainRepository;
import it.cnr.rsi.repository.RuoloAccessoRepository;
import it.cnr.rsi.repository.UtenteUnitaAccessoRepository;
import it.cnr.rsi.repository.UtenteUnitaRuoloRepository;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

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
    	leafs.forEach(leaf -> {
    		AlberoMain parent = leaf.getAlberoMain();
    		LOGGER.info("Nodo padre: {} --> {}", parent.getCdNodo(), leaf.getCdNodo());
    	});
    	return null;
    }

}
