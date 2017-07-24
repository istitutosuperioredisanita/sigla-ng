package it.cnr.rsi.repository;

import it.cnr.rsi.domain.Cdr;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.stream.Stream;

@Repository
public interface CdrRepository extends JpaRepository<Cdr, String> {
	@Query("select a from Cdr a left outer join a.unitaOrganizzativa uo " +
			"where (uo.cdUnitaOrganizzativa = :uo or :uo is null)" +
			" and uo.esercizioInizio <= :esercizio and uo.esercizioFine >= :esercizio")
	Stream<Cdr> findCdrByUnitaOrganizzativa(@Param("esercizio")Integer esercizio, @Param("uo")String uo);
}
