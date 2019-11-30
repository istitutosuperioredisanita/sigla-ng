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

package it.cnr.rsi.session.hazelcast;

import com.hazelcast.query.extractor.ValueCollector;
import com.hazelcast.query.extractor.ValueExtractor;

import org.springframework.expression.Expression;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.MapSession;
import org.springframework.session.Session;

/**
 * Hazelcast {@link ValueExtractor} responsible for extracting principal name from the
 * {@link MapSession}.
 *
 * @author Vedran Pavic
 * @since 1.3.0
 */
public class PrincipalNameExtractor extends ValueExtractor<MapSession, String> {

	private static final PrincipalNameResolver PRINCIPAL_NAME_RESOLVER =
			new PrincipalNameResolver();

	@Override
	@SuppressWarnings("unchecked")
	public void extract(MapSession target, String argument,
			ValueCollector collector) {
		String principalName = PRINCIPAL_NAME_RESOLVER.resolvePrincipal(target);
		if (principalName != null) {
			collector.addObject(principalName);
		}
	}

	/**
	 * Resolves the Spring Security principal name.
	 */
	static class PrincipalNameResolver {

		private static final String SPRING_SECURITY_CONTEXT = "SPRING_SECURITY_CONTEXT";

		private SpelExpressionParser parser = new SpelExpressionParser();

		public String resolvePrincipal(Session session) {
			String principalName = session.getAttribute(
					FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME);
			if (principalName != null) {
				return principalName;
			}
			Object authentication = session.getAttribute(SPRING_SECURITY_CONTEXT);
			if (authentication != null) {
				Expression expression = this.parser
						.parseExpression("authentication?.name");
				return expression.getValue(authentication, String.class);
			}
			return null;
		}

	}

}
