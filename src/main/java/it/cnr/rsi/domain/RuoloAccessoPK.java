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

package it.cnr.rsi.domain;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;

/**
 * The primary key class for the RUOLO_ACCESSO database table.
 *
 */
@Embeddable
public class RuoloAccessoPK implements Serializable {
	//default serial version id, required for serializable classes.
	private static final long serialVersionUID = 1L;

	@Column(name="CD_RUOLO", insertable=false, updatable=false)
	private String cdRuolo;

	@Column(name="CD_ACCESSO", insertable=false, updatable=false)
	private String cdAccesso;

	public RuoloAccessoPK() {
	}
	public String getCdRuolo() {
		return this.cdRuolo;
	}
	public void setCdRuolo(String cdRuolo) {
		this.cdRuolo = cdRuolo;
	}
	public String getCdAccesso() {
		return this.cdAccesso;
	}
	public void setCdAccesso(String cdAccesso) {
		this.cdAccesso = cdAccesso;
	}

	public boolean equals(Object other) {
		if (this == other) {
			return true;
		}
		if (!(other instanceof RuoloAccessoPK)) {
			return false;
		}
		RuoloAccessoPK castOther = (RuoloAccessoPK)other;
		return
			this.cdRuolo.equals(castOther.cdRuolo)
			&& this.cdAccesso.equals(castOther.cdAccesso);
	}

	public int hashCode() {
		final int prime = 31;
		int hash = 17;
		hash = hash * prime + this.cdRuolo.hashCode();
		hash = hash * prime + this.cdAccesso.hashCode();

		return hash;
	}
}
