package it.cnr.rsi.repository;

import it.cnr.rsi.domain.AlberoMain;

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
public interface AlberoMainRepository extends JpaRepository<AlberoMain, String> {
	@Query("select a from AlberoMain a where a.accesso.cdAccesso IN :accessi")
	Stream<AlberoMain> findAlberoMainByAccessi(@Param("accessi")List<String> accessi);
}
