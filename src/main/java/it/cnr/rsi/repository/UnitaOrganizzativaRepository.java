package it.cnr.rsi.repository;

import it.cnr.rsi.domain.UnitaOrganizzativa;

import java.util.stream.Stream;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Created by francesco on 07/03/17.
 */

@Repository
public interface UnitaOrganizzativaRepository extends JpaRepository<UnitaOrganizzativa, String> {
	@Query("select a from UnitaOrganizzativa a join a.utenteUnitaRuolos ruolos " +
			"where ruolos.id.cdUtente = :userId" +
			" and a.esercizioInizio <= :esercizio and a.esercizioFine <= :esercizio")
	Stream<UnitaOrganizzativa> findUnitaOrganizzativeAbilitateByRuolo(@Param("userId")String userId, @Param("esercizio")Integer esercizio);
	@Query("select a from UnitaOrganizzativa a join a.utenteUnitaAccessos accessos " +
			"where accessos.id.cdUtente = :userId" +
			" and a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio")
	Stream<UnitaOrganizzativa> findUnitaOrganizzativeAbilitateByAccesso(@Param("userId")String userId, @Param("esercizio")Integer esercizio);
	@Query("select a from UnitaOrganizzativa a " +
			"where a.esercizioInizio <= :esercizio and a.esercizioFine >= :esercizio and a.flCds = 'N'")
	Stream<UnitaOrganizzativa> findUnitaOrganizzativeValida(@Param("esercizio")Integer esercizio);

	
}
