package it.cnr.rsi.repository;

import it.cnr.rsi.domain.Messaggio;
import it.cnr.rsi.domain.Preferiti;
import it.cnr.rsi.domain.PreferitiPK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.stream.Stream;

/**
 * Created by francesco on 07/03/17.
 */

@Repository
public interface MessaggioRepository extends JpaRepository<Messaggio, Long> {
	@Query(
	    "select a from Messaggio a " +
            "where (a.cdUtente = :username or a.cdUtente is null) " +
            "and (a.dtInizioValidita <= CURRENT_TIMESTAMP OR a.dtInizioValidita is null) " +
            "and (a.dtFineValidita >= CURRENT_TIMESTAMP OR a.dtFineValidita is null)"
    )
	Stream<Messaggio> findMessaggiByUser(@Param("username") String username);
}
