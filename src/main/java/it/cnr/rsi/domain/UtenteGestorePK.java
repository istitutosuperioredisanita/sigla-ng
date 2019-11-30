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
 * The primary key class for the UTENTE_GESTORE database table.
 *
 */
@Embeddable
public class UtenteGestorePK implements Serializable {
	//default serial version id, required for serializable classes.
	private static final long serialVersionUID = 1L;

	@Column(name="CD_UTENTE", insertable=false, updatable=false)
	private String cdUtente;

	@Column(name="CD_GESTORE", insertable=false, updatable=false)
	private String cdGestore;

	public UtenteGestorePK() {
	}
	public String getCdUtente() {
		return this.cdUtente;
	}
	public void setCdUtente(String cdUtente) {
		this.cdUtente = cdUtente;
	}
	public String getCdGestore() {
		return this.cdGestore;
	}
	public void setCdGestore(String cdGestore) {
		this.cdGestore = cdGestore;
	}

	public boolean equals(Object other) {
		if (this == other) {
			return true;
		}
		if (!(other instanceof UtenteGestorePK)) {
			return false;
		}
		UtenteGestorePK castOther = (UtenteGestorePK)other;
		return
			this.cdUtente.equals(castOther.cdUtente)
			&& this.cdGestore.equals(castOther.cdGestore);
	}

	public int hashCode() {
		final int prime = 31;
		int hash = 17;
		hash = hash * prime + this.cdUtente.hashCode();
		hash = hash * prime + this.cdGestore.hashCode();

		return hash;
	}
}
