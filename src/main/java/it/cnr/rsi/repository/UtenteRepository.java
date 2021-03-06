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

import it.cnr.rsi.domain.Utente;
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
public interface UtenteRepository extends JpaRepository<Utente, String> {
	@Query("select a from Utente a where cdUtente = :cdUtente AND flAutenticazioneLdap = :flAutenticazioneLdap")
	Utente findUserWithAuthenticationLDAP(@Param("cdUtente")String cdUtente, @Param("flAutenticazioneLdap")Boolean flAutenticazioneLdap);

	@Query("select a from Utente a where (cdUtenteUid = :cdUtenteUid OR cdUtente = :cdUtenteUid) AND (dtFineValidita >= CURRENT_TIMESTAMP OR dtFineValidita is null) AND flAutenticazioneLdap = true ")
    List<Utente> findUsersForUid(@Param("cdUtenteUid")String cdUtenteUid);

}
