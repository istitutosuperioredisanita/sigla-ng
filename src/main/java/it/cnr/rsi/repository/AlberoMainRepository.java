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

import it.cnr.rsi.domain.AlberoMain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Stream;

/**
 * Created by francesco on 07/03/17.
 */

@Repository
public interface AlberoMainRepository extends JpaRepository<AlberoMain, String> {
	@Query("select a from AlberoMain a where a.accesso.cdAccesso IN :accessi")
	Stream<AlberoMain> findAlberoMainByAccessi(@Param("accessi")List<String> accessi);

    @Query("select max(a.cdNodo) from AlberoMain a, AssBpAccesso b " +
        "where b.id.businessProcess = :businessProcess " +
        "AND (b.tiFunzione = :tiFunzione OR b.tiFunzione is null) " +
        "AND a.businessProcess = b.id.businessProcess " +
        "AND a.accesso = b.accesso")
    String findCdNodo(@Param("businessProcess")String businessProcess, @Param("tiFunzione")String tiFunzione);
}
