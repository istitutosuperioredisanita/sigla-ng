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

package it.cnr.rsi.config;

import com.hazelcast.config.Config;
import com.hazelcast.config.EvictionPolicy;
import com.hazelcast.config.MapConfig;
import com.hazelcast.config.MaxSizeConfig;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;

import javax.annotation.PreDestroy;
import java.util.Arrays;
import java.util.Optional;

/**
 * Created by francesco on 07/03/17.
 */
@Configuration
@EnableConfigurationProperties(HazelcastConfigurationProperties.class)
@EnableCaching
public class CacheConfiguration {

    private static final Logger log = LoggerFactory.getLogger(CacheConfiguration.class);

    @Autowired
    private HazelcastConfigurationProperties hazelcastConfigurationProperties;

    @PreDestroy
    public void destroy() {
        log.info("Closing Cache Manager");
        Hazelcast.shutdownAll();
    }

    @Bean
    public CacheManager cacheManager(HazelcastInstance hazelcastInstance) {
        log.debug("Starting HazelcastCacheManager");
        CacheManager cacheManager = new com.hazelcast.spring.cache.HazelcastCacheManager(hazelcastInstance);
        return cacheManager;
    }

    @Bean
    public HazelcastInstance hazelcastInstance() {
        log.debug("Configuring Hazelcast");
        Config config = new Config();

        config.setProperty("hazelcast.jmx", Boolean.TRUE.toString());

        config.setInstanceName(hazelcastConfigurationProperties.getInstanceName());
        config.getNetworkConfig().setPort(hazelcastConfigurationProperties.getPort());
        config.getNetworkConfig().setPortAutoIncrement(true);

        Optional.ofNullable(hazelcastConfigurationProperties.getPublicadress())
            .ifPresent(s ->  config.getNetworkConfig().setPublicAddress(s));

        log.info("HAZELCAST CONFIG {}", hazelcastConfigurationProperties);

        // In development, remove multicast auto-configuration
        // System.setProperty("hazelcast.local.localAddress", "127.0.0.1");

        config.getNetworkConfig().getJoin().getAwsConfig().setEnabled(false);
        config.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(false);
        config.getNetworkConfig().getJoin().getTcpIpConfig().setEnabled(true);
        config.getNetworkConfig().getJoin().getTcpIpConfig().setRequiredMember(null);

        Optional.ofNullable(hazelcastConfigurationProperties.getMembers())
                .map(s -> s.split(","))
                .map(strings -> Arrays.asList(strings))
                .ifPresent(strings -> {
                    config.getNetworkConfig().getJoin().getTcpIpConfig().setEnabled(true);
                    config.getNetworkConfig().getJoin().getTcpIpConfig().setMembers(strings);
                });


        Optional.ofNullable(hazelcastConfigurationProperties.getMulticastport())
            .ifPresent(port -> {
                config.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(true);
                config.getNetworkConfig().getJoin().getMulticastConfig().setMulticastPort(port);
                config.getNetworkConfig().getJoin().getTcpIpConfig().setEnabled(false);
            });


        config.getMapConfigs().put("default", initializeDefaultMapConfig());
        config.getMapConfigs().put("it.cnr.rsi.domain.*", initializeDomainMapConfig());
        config.getMapConfigs().put("clustered-http-sessions", initializeClusteredSession());

        log.info("HAZELCAST JOIN CONFIG {}", config.getNetworkConfig().getJoin());

        return Hazelcast.newHazelcastInstance(config);
    }

    private MapConfig initializeDefaultMapConfig() {
        MapConfig mapConfig = new MapConfig();

    /*
        Number of backups. If 1 is set as the backup-count for example,
        then all entries of the map will be copied to another JVM for
        fail-safety. Valid numbers are 0 (no backup), 1, 2, 3.
     */
        mapConfig.setBackupCount(0);

    /*
        Valid values are:
        NONE (no eviction),
        LRU (Least Recently Used),
        LFU (Least Frequently Used).
        NONE is the default.
     */
        mapConfig.setEvictionPolicy(EvictionPolicy.LRU);

    /*
        Maximum size of the map. When max size is reached,
        map is evicted based on the policy defined.
        Any integer between 0 and Integer.MAX_VALUE. 0 means
        Integer.MAX_VALUE. Default is 0.
     */
        mapConfig.setMaxSizeConfig(new MaxSizeConfig(0, MaxSizeConfig.MaxSizePolicy.USED_HEAP_SIZE));

        return mapConfig;
    }

    private MapConfig initializeDomainMapConfig() {
        MapConfig mapConfig = new MapConfig();
        mapConfig.setBackupCount(hazelcastConfigurationProperties.getBackupCount());
        mapConfig.setTimeToLiveSeconds(hazelcastConfigurationProperties.getTimeToLiveSeconds());
        return mapConfig;
    }


    private MapConfig initializeClusteredSession() {
        MapConfig mapConfig = new MapConfig();
        mapConfig.setBackupCount(hazelcastConfigurationProperties.getBackupCount());
        mapConfig.setTimeToLiveSeconds(hazelcastConfigurationProperties.getTimeToLiveSeconds());
        return mapConfig;
    }


    /**
     * Use by Spring Security, to get events from Hazelcast.
     *
     * @return the session registry
     */
    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }


    // A cron expression to define every day at midnight
    @Scheduled(cron ="0 0 * * *")
    public void cacheEvictionScheduler(){
        clearCache();
    }

    @CacheEvict(value = { "cdr" })
    public void clearCache(){
    }

}
