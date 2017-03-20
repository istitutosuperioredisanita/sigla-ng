package it.cnr.rsi.repository;

import java.util.stream.Stream;

import it.cnr.rsi.domain.UtenteUnitaAccesso;
import it.cnr.rsi.domain.UtenteUnitaAccessoPK;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Created by francesco on 07/03/17.
 */

@Repository
public interface UtenteUnitaAccessoRepository extends JpaRepository<UtenteUnitaAccesso, UtenteUnitaAccessoPK> {
	@Query("select a.id.cdAccesso from UtenteUnitaAccesso a join a.accesso.assBpAccessos ass " +
			"where a.id.cdUtente = :cdUtente AND (a.id.cdUnitaOrganizzativa = :cdUnitaOrganizzativa  OR a.id.cdUnitaOrganizzativa = '*') " +
			"AND ass.esercizioInizioValidita >= :esercizio AND ass.esercizioFineValidita <= :esercizio")
	Stream<String> findAccessiByCdUtente(@Param("cdUtente")String cdUtente, @Param("esercizio")Integer esercizio, @Param("cdUnitaOrganizzativa")String cdUnitaOrganizzativa);	
}
