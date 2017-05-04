package it.cnr.rsi.repository;

import it.cnr.rsi.domain.EsercizioBase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EsercizioBaseRepository extends JpaRepository<EsercizioBase, Integer> {

}
