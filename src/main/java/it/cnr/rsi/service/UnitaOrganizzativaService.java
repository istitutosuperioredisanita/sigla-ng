package it.cnr.rsi.service;

import it.cnr.rsi.domain.UnitaOrganizzativa;
import it.cnr.rsi.domain.Utente;
import it.cnr.rsi.repository.UnitaOrganizzativaRepository;
import it.cnr.rsi.repository.UtenteRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class UnitaOrganizzativaService {
	private static final Logger LOGGER = LoggerFactory.getLogger(UnitaOrganizzativaService.class);

	private UnitaOrganizzativaRepository unitaOrganizzativaRepository;
	private UtenteRepository utenteRepository;
	
	public UnitaOrganizzativaService(UnitaOrganizzativaRepository unitaOrganizzativaRepository, UtenteRepository utenteRepository) {
		this.unitaOrganizzativaRepository = unitaOrganizzativaRepository;
		this.utenteRepository = utenteRepository;
	}

	@Transactional
	public List<UnitaOrganizzativa> listaUnitaOrganizzativeAbilitate(String userId, Integer esercizio) {
		LOGGER.info("UnitaOrganizzativa for User: {} ", userId);
		Utente utente = utenteRepository.findOne(userId);
		Stream<UnitaOrganizzativa> uosByAccessi = Stream.concat(
				unitaOrganizzativaRepository.findUnitaOrganizzativeAbilitateByAccesso(userId, esercizio), 
				unitaOrganizzativaRepository.findUnitaOrganizzativeAbilitateByRuolo(userId, esercizio));
		if (utente.isUtenteSupervisore()) {
			uosByAccessi = Stream.concat(uosByAccessi, unitaOrganizzativaRepository.findUnitaOrganizzativeValida(esercizio));
		}		
		return uosByAccessi
				.distinct()
				.sorted((x, y) -> x.getCdUnitaOrganizzativa().compareTo(y.getCdUnitaOrganizzativa()))
				.collect(Collectors.toList());
	}
}
