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

package it.cnr.rsi.session.hazelcast.config.annotation.web.http;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import com.hazelcast.core.HazelcastInstance;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Profile;
import org.springframework.session.MapSession;
import org.springframework.session.Session;
import org.springframework.session.SessionRepository;
import org.springframework.session.config.annotation.web.http.EnableSpringHttpSession;
import it.cnr.rsi.session.hazelcast.HazelcastFlushMode;
import it.cnr.rsi.session.hazelcast.HazelcastSessionRepository;
import org.springframework.session.hazelcast.config.annotation.web.http.HazelcastHttpSessionConfiguration;
import org.springframework.session.web.http.SessionRepositoryFilter;

/**
 * Add this annotation to an {@code @Configuration} class to expose the
 * {@link SessionRepositoryFilter} as a bean named {@code springSessionRepositoryFilter}
 * and backed by Hazelcast. In order to leverage the annotation, a single
 * {@link HazelcastInstance} must be provided. For example:
 *
 * <pre class="code">
 * &#064;Configuration
 * &#064;EnableHazelcastHttpSession
 * public class HazelcastHttpSessionConfig {
 *
 *     &#064;Bean
 *     public HazelcastInstance embeddedHazelcast() {
 *         Config hazelcastConfig = new Config();
 *         return Hazelcast.newHazelcastInstance(hazelcastConfig);
 *     }
 *
 * }
 * </pre>
 *
 * More advanced configurations can extend {@link it.cnr.rsi.session.hazelcast.config.annotation.web.http.HazelcastHttpSessionConfiguration}
 * instead.
 *
 * @author Tommy Ludwig
 * @author Aleksandar Stojsavljevic
 * @author Vedran Pavic
 * @since 1.1
 * @see EnableSpringHttpSession
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(HazelcastHttpSessionConfiguration.class)
@Configuration
@Profile("!keycloak")
public @interface EnableHazelcastHttpSession {

	/**
	 * The session timeout in seconds. By default, it is set to 1800 seconds (30 minutes).
	 * This should be a non-negative integer.
	 * @return the seconds a session can be inactive before expiring
	 */
	int maxInactiveIntervalInSeconds() default MapSession.DEFAULT_MAX_INACTIVE_INTERVAL_SECONDS;

	/**
	 * This is the name of the Map that will be used in Hazelcast to store the session
	 * data. Default is
	 * {@link HazelcastSessionRepository#DEFAULT_SESSION_MAP_NAME}.
	 * @return the name of the Map to store the sessions in Hazelcast
	 */
	String sessionMapName() default HazelcastSessionRepository.DEFAULT_SESSION_MAP_NAME;

	/**
	 * Flush mode for the Hazelcast sessions. The default is {@code ON_SAVE} which only
	 * updates the backing Hazelcast when {@link SessionRepository#save(Session)} is
	 * invoked. In a web environment this happens just before the HTTP response is
	 * committed.
	 * <p>
	 * Setting the value to {@code IMMEDIATE} will ensure that the any updates to the
	 * Session are immediately written to the Hazelcast instance.
	 * @return the {@link HazelcastFlushMode} to use
	 * @since 1.3.0
	 */
	HazelcastFlushMode hazelcastFlushMode() default HazelcastFlushMode.ON_SAVE;

}
