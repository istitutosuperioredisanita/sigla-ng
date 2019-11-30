/*
 * Copyright (C) 2019  Consiglio Nazionale delle Ricerche
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package it.cnr.rsi.service;

import it.cnr.rsi.domain.Accesso;
import it.cnr.rsi.domain.AlberoMain;
import it.cnr.rsi.domain.TreeNode;
import it.cnr.rsi.domain.Utente;
import it.cnr.rsi.repository.AlberoMainRepository;
import it.cnr.rsi.repository.UtenteRepository;
import org.apache.commons.collections4.MultiValuedMap;
import org.apache.commons.collections4.multimap.HashSetValuedHashMap;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Created by francesco on 07/03/17.
 */

@Service
public class AlberoMainService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AlberoMainService.class);
    public static final String ROOT = "ROOT";

    private AlberoMainRepository alberoMainRepository;
    private UtenteRepository utenteRepository;
    private AccessoService accessoService;

    public AlberoMainService(AlberoMainRepository alberoMainRepository, UtenteRepository utenteRepository, AccessoService accessoService) {
        this.alberoMainRepository = alberoMainRepository;
        this.utenteRepository = utenteRepository;
        this.accessoService = accessoService;
    }

    @CacheEvict(value="tree", key="{#userId, #esercizio, #unitaOrganizzativa}")
    public boolean evictCacheTree(String userId, Integer esercizio, String unitaOrganizzativa){
        LOGGER.info("Evict cache Tree for User: {}", userId);
        return true;
    }

    @Cacheable(value="tree", key="{#userId, #esercizio, #unitaOrganizzativa}")
    @Transactional
    public Map<String, List<TreeNode>> tree(String userId, Integer esercizio, String unitaOrganizzativa) {
    	LOGGER.info("GET Tree for User: {} and Unita Organizzativa: {}", userId, unitaOrganizzativa);
        Utente utente = utenteRepository.findById(userId).get();
    	List<String> accessi = accessoService.accessi(userId, esercizio, unitaOrganizzativa);
        if (Optional.ofNullable(utente.getCdUtenteTempl()).isPresent()) {
            accessi.addAll(accessoService.accessi(utente.getCdUtenteTempl(), esercizio, unitaOrganizzativa));
        }

        List<AlberoMain> listLeafs = new ArrayList<>();
        final AtomicInteger counter = new AtomicInteger(0);
        final Collection<List<String>> values = accessi
            .stream()
            .collect(Collectors.groupingBy(s -> counter.getAndIncrement() / 1000))
            .values();
        for (List<String> result : values) {
            listLeafs.addAll(Optional.ofNullable(result).filter(x -> !x.isEmpty())
                .map(x -> alberoMainRepository.findAlberoMainByAccessi(x)).orElse(Stream.empty()).collect(Collectors.toList()));
        }
        Stream<AlberoMain> leafs = listLeafs.stream();

        MultiValuedMap<String, AlberoMain> rawMap = new HashSetValuedHashMap<>();
    	leafs.forEach(leaf -> visit(leaf, rawMap));
    	LOGGER.debug("mappa {}", rawMap.toString());

        Map<String, List<TreeNode>> tree = rawMap
                .keySet()
                .stream()
                .map(id -> Pair.of(id, orderedValues(rawMap.get(id))))
                .collect(Collectors.toMap(Pair::getKey, Pair::getValue));
        LOGGER.debug("tree: {}", tree);
    	return tree;
    }

    private List<TreeNode> orderedValues(Collection<AlberoMain> values) {
        return values
                .stream()
                .sorted(Comparator.comparingInt(node -> node.getPgOrdinamento().intValue()))
                .map(node -> new TreeNode(
                    node.getCdNodo(),
                    node.getDsNodo(),
                    node.getBusinessProcess(),
                    Optional.ofNullable(node.getAccesso())
                        .map(Accesso::getCdAccesso)
                        .orElse(null),
                    Optional.ofNullable(node.getAccesso())
                        .map(Accesso::getDsAccesso)
                        .orElse(null),
                    node.getBreadcrumb())
                )
                .map(TreeNode.class::cast)
                .collect(Collectors.toList());
    }

    private void visit(AlberoMain node, MultiValuedMap<String, AlberoMain> m) {
        AlberoMain parent = node.getAlberoMain();
        if (parent == null) {
            m.put(ROOT, node);
        } else {
            String parentCdNodo = parent.getCdNodo();
            if (m.containsKey(parentCdNodo)) {
                LOGGER.debug("{} gia' visitato", parentCdNodo);
            } else {
                visit(parent, m);
            }
            m.put(parentCdNodo, node);
        }
    }

}
