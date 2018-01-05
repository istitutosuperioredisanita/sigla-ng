package it.cnr.rsi.repository;

import it.cnr.rsi.domain.UtenteIndirizziMail;
import it.cnr.rsi.domain.UtenteIndirizziMailPK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.stream.Stream;

/**
 * Created by francesco on 07/03/17.
 */

@Repository
public interface UtenteIndirizziMailRepository extends JpaRepository<UtenteIndirizziMail, UtenteIndirizziMailPK> {
    @Query("select u from UtenteIndirizziMail u " +
        "where u.id.cdUtente = :cdUtente")
    Stream<UtenteIndirizziMail> findUtenteIndirizziMailByCdUtente(@Param("cdUtente") String cdUtente);
}
