package it.cnr.rsi.service;

import it.cnr.rsi.domain.AlberoMain;
import it.cnr.rsi.domain.TreeNode;
import it.cnr.rsi.repository.AlberoMainRepository;
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
    private AccessoService accessoService;

    public AlberoMainService(AlberoMainRepository alberoMainRepository, AccessoService accessoService) {
        this.alberoMainRepository = alberoMainRepository;
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
    	List<String> accessi = accessoService.accessi(userId, esercizio, unitaOrganizzativa);
    	Stream<AlberoMain> leafs = Optional.ofNullable(accessi).filter(x -> !x.isEmpty())
    			.map(x -> alberoMainRepository.findAlberoMainByAccessi(x)).orElse(Stream.empty());

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
                .map(node -> new TreeNode(node.getCdNodo(), node.getDsNodo(), node.getBusinessProcess(), node.getBreadcrumb()))
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
