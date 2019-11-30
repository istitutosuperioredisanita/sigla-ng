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

package it.cnr.rsi.repository;

import it.cnr.rsi.domain.Cdr;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.stream.Stream;

@Repository
public interface CdrRepository extends JpaRepository<Cdr, String> {
	@Query("select a from Cdr a left outer join a.unitaOrganizzativa uo " +
			"where (uo.cdUnitaOrganizzativa = :uo or :uo is null)" +
			" and a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio")
	Stream<Cdr> findCdrByUnitaOrganizzativa(@Param("esercizio")Integer esercizio, @Param("uo")String uo);
}
