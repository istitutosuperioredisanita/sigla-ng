/*
 * Copyright (C) 2019  Consiglio Nazionale delle Ricerche
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
