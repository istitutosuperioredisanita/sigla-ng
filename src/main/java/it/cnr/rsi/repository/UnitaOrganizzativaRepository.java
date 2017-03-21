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
	@Query("select distinct a from UnitaOrganizzativa a join a.utenteUnitaRuolos ruolos join a.utenteUnitaAccessos accessos " +
			"where ruolos.id.cdUtente = :userId " +
			"and accessos.id.cdUtente = :userId")
	Stream<UnitaOrganizzativa> findUnitaOrganizzativeAbilitate(@Param("userId")String userId);
}
