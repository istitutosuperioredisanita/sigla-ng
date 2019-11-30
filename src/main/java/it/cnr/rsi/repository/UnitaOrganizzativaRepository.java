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

import it.cnr.rsi.domain.UnitaOrganizzativa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.stream.Stream;

/**
 * Created by marco.spasiano on 28/03/17.
 */

@Repository
public interface UnitaOrganizzativaRepository extends JpaRepository<UnitaOrganizzativa, String> {
    @Query("select a from UnitaOrganizzativa a, UnitaOrganizzativa b " +
        " join b.utenteUnitaRuolos ruolos " +
        " join b.cdrs cdr1 " +
        " join Cdr cdr2 on cdr2.cdr = cdr1 or cdr2.cdCentroResponsabilita = cdr1.cdCentroResponsabilita " +
        "where ruolos.id.cdUtente = :userId" +
        " and a = cdr2.unitaOrganizzativa" +
        " and (a.unitaOrganizzativaPadre.cdUnitaOrganizzativa = :cds OR :cds is null)" +
        " and a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio")
    Stream<UnitaOrganizzativa> findUnitaOrganizzativeAbilitateByRuolo(@Param("userId") String userId, @Param("esercizio") Integer esercizio, @Param("cds") String cds);

    @Query("select a from UnitaOrganizzativa a, UnitaOrganizzativa b  " +
        " join b.utenteUnitaAccessos accessos " +
        " join b.cdrs cdr1 " +
        " join Cdr cdr2 on cdr2.cdr = cdr1 or cdr2.cdCentroResponsabilita = cdr1.cdCentroResponsabilita " +
        "where accessos.id.cdUtente = :userId" +
        " and a = cdr2.unitaOrganizzativa" +
        " and (a.unitaOrganizzativaPadre.cdUnitaOrganizzativa = :cds OR :cds is null)" +
        " and a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio")
    Stream<UnitaOrganizzativa> findUnitaOrganizzativeAbilitateByAccesso(@Param("userId") String userId, @Param("esercizio") Integer esercizio, @Param("cds") String cds);

    @Query("select a from UnitaOrganizzativa a " +
        "where (a.unitaOrganizzativaPadre.cdUnitaOrganizzativa = :cds OR :cds is null)" +
        " and a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio and a.flCds = 'N'")
    Stream<UnitaOrganizzativa> findUnitaOrganizzativeValida(@Param("esercizio") Integer esercizio, @Param("cds") String cds);


    @Query("select a.unitaOrganizzativaPadre from UnitaOrganizzativa a " +
        "where (a.cdUnitaOrganizzativa = :cdUnitaOrganizzativa OR :cdUnitaOrganizzativa is null)" +
        " and a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio and a.flCds = 'N'")
    Stream<UnitaOrganizzativa> findCdsValido(@Param("esercizio") Integer esercizio, @Param("cdUnitaOrganizzativa") String cdUnitaOrganizzativa);

    @Query("select a.unitaOrganizzativaPadre from UnitaOrganizzativa a, UnitaOrganizzativa b " +
        " join b.utenteUnitaRuolos ruolos " +
        " join b.cdrs cdr1 " +
        " join Cdr cdr2 on cdr2.cdr = cdr1 or cdr2.cdCentroResponsabilita = cdr1.cdCentroResponsabilita " +
        "where ruolos.id.cdUtente = :userId" +
        " and a = cdr2.unitaOrganizzativa" +
        " and (a.cdUnitaOrganizzativa = :cdUnitaOrganizzativa OR :cdUnitaOrganizzativa is null)" +
        " and a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio")
    Stream<UnitaOrganizzativa> findCdsAbilitatiByRuolo(@Param("userId") String userId, @Param("esercizio") Integer esercizio, @Param("cdUnitaOrganizzativa") String cdUnitaOrganizzativa);

    @Query("select a.unitaOrganizzativaPadre from UnitaOrganizzativa a, UnitaOrganizzativa b " +
        " join b.utenteUnitaAccessos accessos " +
        " join b.cdrs cdr1 " +
        " join Cdr cdr2 on cdr2.cdr = cdr1 or cdr2.cdCentroResponsabilita = cdr1.cdCentroResponsabilita " +
        "where accessos.id.cdUtente = :userId" +
        " and a = cdr2.unitaOrganizzativa" +
        " and (a.cdUnitaOrganizzativa = :cdUnitaOrganizzativa OR :cdUnitaOrganizzativa is null)" +
        " and a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio")
    Stream<UnitaOrganizzativa> findCdsAbilitatiByAccesso(@Param("userId") String userId, @Param("esercizio") Integer esercizio, @Param("cdUnitaOrganizzativa") String cdUnitaOrganizzativa);

    @Query("select distinct a.cdUnitaOrganizzativa from UnitaOrganizzativa a, Cdr cdr1 " +
        " join Cdr cdr2 on cdr1.cdr = cdr2 " +
        "where cdr1.unitaOrganizzativa.cdUnitaOrganizzativa = :cdUnitaOrganizzativa" +
        " and a = cdr2.unitaOrganizzativa" +
        " and a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio")
    Stream<String> findCodiceUoParents(@Param("esercizio") Integer esercizio, @Param("cdUnitaOrganizzativa") String cdUnitaOrganizzativa);

}
