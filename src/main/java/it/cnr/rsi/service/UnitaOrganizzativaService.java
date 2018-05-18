package it.cnr.rsi.service;

import it.cnr.rsi.domain.Cdr;
import it.cnr.rsi.domain.UnitaOrganizzativa;
import it.cnr.rsi.domain.Utente;
import it.cnr.rsi.repository.CdrRepository;
import it.cnr.rsi.repository.UnitaOrganizzativaRepository;
import it.cnr.rsi.repository.UtenteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class UnitaOrganizzativaService {
	private static final Logger LOGGER = LoggerFactory.getLogger(UnitaOrganizzativaService.class);

	private UnitaOrganizzativaRepository unitaOrganizzativaRepository;
	private CdrRepository cdrRepository;

	private UtenteRepository utenteRepository;

	public UnitaOrganizzativaService(UnitaOrganizzativaRepository unitaOrganizzativaRepository, UtenteRepository utenteRepository, CdrRepository cdrRepository) {
		this.unitaOrganizzativaRepository = unitaOrganizzativaRepository;
		this.utenteRepository = utenteRepository;
		this.cdrRepository = cdrRepository;
	}

	@Transactional
	public List<UnitaOrganizzativa> listaUnitaOrganizzativeAbilitate(String userId, Integer esercizio, String cds) {
		LOGGER.info("UnitaOrganizzativa for User: {} ", userId);
		Utente utente = utenteRepository.findById(userId).get();
		Stream<UnitaOrganizzativa> uos;
		if (utente.isUtenteSupervisore()) {
			uos = unitaOrganizzativaRepository.findUnitaOrganizzativeValida(esercizio, cds);
		} else {
			uos = Stream.concat(
					unitaOrganizzativaRepository.findUnitaOrganizzativeAbilitateByAccesso(userId, esercizio, cds),
					unitaOrganizzativaRepository.findUnitaOrganizzativeAbilitateByRuolo(userId, esercizio, cds));
			if (Optional.ofNullable(utente.getCdUtenteTempl()).isPresent()) {
                uos = Stream.concat(uos, Stream.concat(
                    unitaOrganizzativaRepository.findUnitaOrganizzativeAbilitateByAccesso(utente.getCdUtenteTempl(), esercizio, cds),
                    unitaOrganizzativaRepository.findUnitaOrganizzativeAbilitateByRuolo(utente.getCdUtenteTempl(), esercizio, cds)));

            }
		}
		return uos
				.distinct()
				.sorted((x, y) -> x.getCdUnitaOrganizzativa().compareTo(y.getCdUnitaOrganizzativa()))
				.collect(Collectors.toList());
	}

	@Transactional
	public List<UnitaOrganizzativa> listaCDSAbilitati(String userId, Integer esercizio, String cdUnitaOrganizzativa) {
		LOGGER.info("CDS for User: {} ", userId);
		Utente utente = utenteRepository.findById(userId).get();
		Stream<UnitaOrganizzativa> cds;
		if (utente.isUtenteSupervisore()) {
			cds = unitaOrganizzativaRepository.findCdsValido(esercizio, cdUnitaOrganizzativa);
		} else {
			cds = Stream.concat(
					unitaOrganizzativaRepository.findCdsAbilitatiByAccesso(userId, esercizio, cdUnitaOrganizzativa),
					unitaOrganizzativaRepository.findCdsAbilitatiByRuolo(userId, esercizio, cdUnitaOrganizzativa));
            if (Optional.ofNullable(utente.getCdUtenteTempl()).isPresent()) {
                cds = Stream.concat(cds, Stream.concat(
                    unitaOrganizzativaRepository.findCdsAbilitatiByAccesso(utente.getCdUtenteTempl(), esercizio, cdUnitaOrganizzativa),
                    unitaOrganizzativaRepository.findCdsAbilitatiByRuolo(utente.getCdUtenteTempl(), esercizio, cdUnitaOrganizzativa)));

            }
		}
		return cds
				.distinct()
				.sorted((x, y) -> x.getCdUnitaOrganizzativa().compareTo(y.getCdUnitaOrganizzativa()))
				.collect(Collectors.toList());
	}

	@Transactional
    @Cacheable(value="cdr", key="{#esercizio, #cdUnitaOrganizzativa}")
	public List<Cdr> listaCdr(Integer esercizio, String cdUnitaOrganizzativa) {
		LOGGER.info("CDR for UO: {} ", cdUnitaOrganizzativa);
		return cdrRepository.findCdrByUnitaOrganizzativa(esercizio, cdUnitaOrganizzativa)
				.distinct()
				.sorted((x, y) -> x.getCdCentroResponsabilita().compareTo(y.getCdCentroResponsabilita()))
				.collect(Collectors.toList());
	}

}
