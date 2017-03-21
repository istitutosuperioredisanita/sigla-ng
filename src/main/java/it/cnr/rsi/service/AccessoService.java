package it.cnr.rsi.service;

import it.cnr.rsi.repository.RuoloAccessoRepository;
import it.cnr.rsi.repository.UtenteUnitaAccessoRepository;
import it.cnr.rsi.repository.UtenteUnitaRuoloRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * 
 * @author mspasiano 
 *
 */
@Service
public class AccessoService {
    private static final Logger LOGGER = LoggerFactory.getLogger(AccessoService.class);
	
    private UtenteUnitaAccessoRepository utenteUnitaAccessoRepository;
    private UtenteUnitaRuoloRepository utenteUnitaRuoloRepository;
    private RuoloAccessoRepository ruoloAccessoRepository;

    public AccessoService(UtenteUnitaAccessoRepository utenteUnitaAccessoRepository, 
    		UtenteUnitaRuoloRepository utenteUnitaRuoloRepository, RuoloAccessoRepository ruoloAccessoRepository) {
        this.utenteUnitaAccessoRepository = utenteUnitaAccessoRepository;
        this.utenteUnitaRuoloRepository = utenteUnitaRuoloRepository;
        this.ruoloAccessoRepository = ruoloAccessoRepository;
    }

    @Cacheable(value="accessi", key="{#userId, #esercizio, #unitaOrganizzativa}")
    @Transactional
    public List<String> accessi(String userId, Integer esercizio, String unitaOrganizzativa) {
    	LOGGER.info("Accessi for User: {} esercizio {} and Unita Organizzativa: {}", userId, esercizio, unitaOrganizzativa);    	
    	List<String> findRuoliByCdUtente = utenteUnitaRuoloRepository.findRuoliByCdUtente(userId, unitaOrganizzativa).collect(Collectors.toList());    	
    	return Stream.concat(
    			utenteUnitaAccessoRepository.findAccessiByCdUtente(userId, esercizio, unitaOrganizzativa),     			
    	    	Optional.ofNullable(findRuoliByCdUtente).filter(x -> !x.isEmpty()).map(x -> ruoloAccessoRepository.findAccessiByRuoli(esercizio, x)).orElse(Stream.empty())
    			).distinct().collect(Collectors.toList());
    }
}
