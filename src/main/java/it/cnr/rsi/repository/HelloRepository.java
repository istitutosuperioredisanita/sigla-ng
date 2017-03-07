package it.cnr.rsi.repository;

import it.cnr.rsi.domain.Hello;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Created by francesco on 07/03/17.
 */

@Repository
public interface HelloRepository extends JpaRepository<Hello, Long> {
}
