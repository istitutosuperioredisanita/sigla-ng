package it.cnr.rsi.repository;

import it.cnr.rsi.domain.UtenteUnitaRuolo;
import it.cnr.rsi.domain.UtenteUnitaRuoloPK;

import java.util.stream.Stream;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Created by francesco on 07/03/17.
 */

@Repository
public interface UtenteUnitaRuoloRepository extends JpaRepository<UtenteUnitaRuolo, UtenteUnitaRuoloPK> {
	@Query("select id.cdRuolo from UtenteUnitaRuolo a where id.cdUtente = :cdUtente AND id.cdUnitaOrganizzativa = :cdUnitaOrganizzativa")
	Stream<String> findRuoliByCdUtente(@Param("cdUtente")String cdUtente, @Param("cdUnitaOrganizzativa")String cdUnitaOrganizzativa);	
}