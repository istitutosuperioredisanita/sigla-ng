package it.cnr.rsi.repository;

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
public interface PreferitiRepository extends JpaRepository<Preferiti, PreferitiPK> {
	@Query("select a from Preferiti a where a.id.cdUtente = :username")
	Stream<Preferiti> findPreferitiByUser(@Param("username")String username);
}
