package it.cnr.rsi.repository;

import it.cnr.rsi.domain.UtenteUnitaAccesso;
import it.cnr.rsi.domain.UtenteUnitaAccessoPK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.stream.Stream;

/**
 * Created by francesco on 07/03/17.
 */

@Repository
public interface UtenteUnitaAccessoRepository extends JpaRepository<UtenteUnitaAccesso, UtenteUnitaAccessoPK> {
	@Query("select a.id.cdAccesso from UtenteUnitaAccesso a join a.accesso.assBpAccessos ass " +
			"where a.id.cdUtente = :cdUtente AND (a.id.cdUnitaOrganizzativa = :cdUnitaOrganizzativa  OR a.id.cdUnitaOrganizzativa = '*') " +
			"AND (ass.esercizioInizioValidita <= :esercizio OR ass.esercizioInizioValidita is null) "+
			"AND (ass.esercizioFineValidita >= :esercizio OR ass.esercizioFineValidita is null)")
	Stream<String> findAccessiByCdUtente(@Param("cdUtente")String cdUtente, @Param("esercizio")Integer esercizio, @Param("cdUnitaOrganizzativa")String cdUnitaOrganizzativa);
}
