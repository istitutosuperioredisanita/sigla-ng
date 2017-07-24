package it.cnr.rsi.service;

import it.cnr.rsi.repository.EsercizioBaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EsercizioBaseService {
	private static final Logger LOGGER = LoggerFactory.getLogger(EsercizioBaseService.class);

	private EsercizioBaseRepository esercizioBaseRepository;

	public EsercizioBaseService(EsercizioBaseRepository esercizioBaseRepository) {
		this.esercizioBaseRepository = esercizioBaseRepository;
	}

	@Transactional
	public List<Integer> findEsercizi() {
		LOGGER.info("Find esercizi");
		return esercizioBaseRepository
				.findAll()
				.stream()
				.map(x -> x.getEsercizio())
				.sorted(Comparator.reverseOrder())
				.collect(Collectors.toList());
	}
}
