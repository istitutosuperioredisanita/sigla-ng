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
