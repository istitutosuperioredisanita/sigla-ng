package it.cnr.rsi.service;

import it.cnr.rsi.domain.Utente;
import it.cnr.rsi.repository.RuoloAccessoRepository;
import it.cnr.rsi.repository.UtenteRepository;
import it.cnr.rsi.repository.UtenteUnitaAccessoRepository;
import it.cnr.rsi.repository.UtenteUnitaRuoloRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
	private UtenteRepository utenteRepository;

    public AccessoService(UtenteUnitaAccessoRepository utenteUnitaAccessoRepository,
    		UtenteUnitaRuoloRepository utenteUnitaRuoloRepository, RuoloAccessoRepository ruoloAccessoRepository, UtenteRepository utenteRepository) {
        this.utenteUnitaAccessoRepository = utenteUnitaAccessoRepository;
        this.utenteUnitaRuoloRepository = utenteUnitaRuoloRepository;
        this.ruoloAccessoRepository = ruoloAccessoRepository;
        this.utenteRepository = utenteRepository;
    }
    @CacheEvict(value="accessi", key="{#userId, #esercizio, #unitaOrganizzativa}")
    public boolean evictCacheAccessi(String userId, Integer esercizio, String unitaOrganizzativa){
        LOGGER.info("Evict cache Accessi for User: {}", userId);
        return true;
    }

    @Cacheable(value="accessi", key="{#userId, #esercizio, #unitaOrganizzativa}")
    @Transactional
    public List<String> accessi(String userId, Integer esercizio, String unitaOrganizzativa) {
    	LOGGER.info("Accessi for User: {} esercizio {} and Unita Organizzativa: {}", userId, esercizio, unitaOrganizzativa);
		Utente utente = utenteRepository.findById(userId).get();
    	List<String> findRuoliByCdUtente = utenteUnitaRuoloRepository.findRuoliByCdUtente(userId, unitaOrganizzativa).collect(Collectors.toList());
    	Optional.of(utente.isUtenteSupervisore())
            .filter(isUtenteSupervisore -> isUtenteSupervisore)
            .filter(aBoolean -> Optional.ofNullable(utente.getCdRuoloSupervisore()).isPresent())
            .ifPresent(aBoolean -> findRuoliByCdUtente.add(utente.getCdRuoloSupervisore()));
    	return Stream.concat(
    			utenteUnitaAccessoRepository.findAccessiByCdUtente(userId, esercizio, unitaOrganizzativa),
    	    	Optional.ofNullable(findRuoliByCdUtente).filter(x -> !x.isEmpty())
                    .map(x -> ruoloAccessoRepository.findAccessiByRuoli(esercizio, x))
                    .orElse(Stream.empty())
    			).distinct().collect(Collectors.toList());
    }
}
