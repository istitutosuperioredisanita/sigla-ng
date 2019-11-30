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
 * The primary key class for the ASS_BP_ACCESSO database table.
 *
 */
@Embeddable
public class PreferitiPK implements Serializable {
	//default serial version id, required for serializable classes.
	private static final long serialVersionUID = 1L;

	@Column(name="CD_UTENTE")
	private String cdUtente;

	@Column(name="BUSINESS_PROCESS")
	private String businessProcess;

    @Column(name="TI_FUNZIONE")
    private String tiFunzione;

	public PreferitiPK() {
	}

    public String getCdUtente() {
        return cdUtente;
    }

    public void setCdUtente(String cdUtente) {
        this.cdUtente = cdUtente;
    }

    public String getBusinessProcess() {
        return businessProcess;
    }

    public void setBusinessProcess(String businessProcess) {
        this.businessProcess = businessProcess;
    }

    public String getTiFunzione() {
        return tiFunzione;
    }

    public void setTiFunzione(String tiFunzione) {
        this.tiFunzione = tiFunzione;
    }

    public boolean equals(Object object) {
        if (this == object) return true;
        if (object == null || getClass() != object.getClass()) return false;
        if (!super.equals(object)) return false;

        PreferitiPK that = (PreferitiPK) object;

        if (cdUtente != null ? !cdUtente.equals(that.cdUtente) : that.cdUtente != null) return false;
        if (businessProcess != null ? !businessProcess.equals(that.businessProcess) : that.businessProcess != null)
            return false;
        if (tiFunzione != null ? !tiFunzione.equals(that.tiFunzione) : that.tiFunzione != null) return false;

        return true;
    }

    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (cdUtente != null ? cdUtente.hashCode() : 0);
        result = 31 * result + (businessProcess != null ? businessProcess.hashCode() : 0);
        result = 31 * result + (tiFunzione != null ? tiFunzione.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "PreferitiPK{" +
            "cdUtente='" + cdUtente + '\'' +
            ", businessProcess='" + businessProcess + '\'' +
            ", tiFunzione='" + tiFunzione + '\'' +
            '}';
    }
}
