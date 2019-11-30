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

package it.cnr.rsi.domain.converter;

import javax.persistence.AttributeConverter;
import java.util.Optional;

public class BooleanToYNStringConverter
    implements AttributeConverter<Boolean, String> {

    /**
     * This implementation will return "Y" if the parameter is Boolean.TRUE,
     * otherwise it will return "N" when the parameter is Boolean.FALSE.
     * A null input value will yield a null return value.
     *
     * @param b Boolean
     */
    @Override
    public String convertToDatabaseColumn(Boolean b) {
        return Optional.ofNullable(b)
            .map(aBoolean -> aBoolean ? "Y" : "N")
            .orElse(null);
    }

    /**
     * This implementation will return Boolean.TRUE if the string
     * is "Y" or "y", otherwise it will ignore the value and return
     * Boolean.FALSE (it does not actually look for "N") for any
     * other non-null string. A null input value will yield a null
     * return value.
     *
     * @param s String
     */
    @Override
    public Boolean convertToEntityAttribute(String s) {
        return Optional.ofNullable(s)
            .map(string -> string.equalsIgnoreCase("Y") ? Boolean.TRUE : Boolean.FALSE)
            .orElse(null);
    }

}
