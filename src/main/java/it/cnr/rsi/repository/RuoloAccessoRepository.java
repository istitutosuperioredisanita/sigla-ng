package it.cnr.rsi.repository;

import it.cnr.rsi.domain.RuoloAccesso;
import it.cnr.rsi.domain.RuoloAccessoPK;

import java.util.List;
import java.util.stream.Stream;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Created by francesco on 07/03/17.
 */

@Repository
public interface RuoloAccessoRepository extends JpaRepository<RuoloAccesso, RuoloAccessoPK> {
	@Query("select a.id.cdAccesso from RuoloAccesso a join a.accesso.assBpAccessos ass " +
			"where a.id.cdRuolo IN :ruoli " +
			"AND (ass.esercizioInizioValidita <= :esercizio OR ass.esercizioInizioValidita is null) "+
			"AND (ass.esercizioFineValidita >= :esercizio OR ass.esercizioFineValidita is null)")
	Stream<String> findAccessiByRuoli(@Param("esercizio")Integer esercizio, @Param("ruoli")List<String> ruoli);	
}