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
    @Query("select a from UnitaOrganizzativa a join a.utenteUnitaRuolos ruolos " +
        "where ruolos.id.cdUtente = :userId" +
        " and (a.unitaOrganizzativaPadre.cdUnitaOrganizzativa = :cds OR :cds is null)" +
        " and a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio")
    Stream<UnitaOrganizzativa> findUnitaOrganizzativeAbilitateByRuolo(@Param("userId") String userId, @Param("esercizio") Integer esercizio, @Param("cds") String cds);

    @Query("select a from UnitaOrganizzativa a join a.utenteUnitaAccessos accessos " +
        "where accessos.id.cdUtente = :userId" +
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

    @Query("select a.unitaOrganizzativaPadre from UnitaOrganizzativa a join a.utenteUnitaRuolos ruolos " +
        "where ruolos.id.cdUtente = :userId" +
        " and (a.cdUnitaOrganizzativa = :cdUnitaOrganizzativa OR :cdUnitaOrganizzativa is null)" +
        " and a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio")
    Stream<UnitaOrganizzativa> findCdsAbilitatiByRuolo(@Param("userId") String userId, @Param("esercizio") Integer esercizio, @Param("cdUnitaOrganizzativa") String cdUnitaOrganizzativa);

    @Query("select a.unitaOrganizzativaPadre from UnitaOrganizzativa a join a.utenteUnitaAccessos accessos " +
        "where accessos.id.cdUtente = :userId" +
        " and (a.cdUnitaOrganizzativa = :cdUnitaOrganizzativa OR :cdUnitaOrganizzativa is null)" +
        " and a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio")
    Stream<UnitaOrganizzativa> findCdsAbilitatiByAccesso(@Param("userId") String userId, @Param("esercizio") Integer esercizio, @Param("cdUnitaOrganizzativa") String cdUnitaOrganizzativa);

}
