package it.cnr.rsi.service;

import it.cnr.rsi.domain.UnitaOrganizzativa;
import it.cnr.rsi.repository.UnitaOrganizzativaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UnitaOrganizzativaService {
	private static final Logger LOGGER = LoggerFactory.getLogger(UnitaOrganizzativaService.class);

	private UnitaOrganizzativaRepository unitaOrganizzativaRepository;

	public UnitaOrganizzativaService(UnitaOrganizzativaRepository unitaOrganizzativaRepository) {
		this.unitaOrganizzativaRepository = unitaOrganizzativaRepository;
	}

	@Transactional
	public List<UnitaOrganizzativa> listaUnitaOrganizzativeAbilitate(String userId) {
		LOGGER.info("UnitaOrganizzativa for User: {} ", userId);
		return unitaOrganizzativaRepository.findUnitaOrganizzativeAbilitate(userId).collect(Collectors.toList());
	}
}
