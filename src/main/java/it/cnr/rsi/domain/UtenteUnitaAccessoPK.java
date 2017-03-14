package it.cnr.rsi.domain;

import java.io.Serializable;
import javax.persistence.*;

/**
 * The primary key class for the UTENTE_UNITA_ACCESSO database table.
 * 
 */
@Embeddable
public class UtenteUnitaAccessoPK implements Serializable {
	//default serial version id, required for serializable classes.
	private static final long serialVersionUID = 1L;

	@Column(name="CD_UTENTE", insertable=false, updatable=false)
	private String cdUtente;

	@Column(name="CD_UNITA_ORGANIZZATIVA")
	private String cdUnitaOrganizzativa;

	@Column(name="CD_ACCESSO", insertable=false, updatable=false)
	private String cdAccesso;

	public UtenteUnitaAccessoPK() {
	}
	public String getCdUtente() {
		return this.cdUtente;
	}
	public void setCdUtente(String cdUtente) {
		this.cdUtente = cdUtente;
	}
	public String getCdUnitaOrganizzativa() {
		return this.cdUnitaOrganizzativa;
	}
	public void setCdUnitaOrganizzativa(String cdUnitaOrganizzativa) {
		this.cdUnitaOrganizzativa = cdUnitaOrganizzativa;
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
		if (!(other instanceof UtenteUnitaAccessoPK)) {
			return false;
		}
		UtenteUnitaAccessoPK castOther = (UtenteUnitaAccessoPK)other;
		return 
			this.cdUtente.equals(castOther.cdUtente)
			&& this.cdUnitaOrganizzativa.equals(castOther.cdUnitaOrganizzativa)
			&& this.cdAccesso.equals(castOther.cdAccesso);
	}

	public int hashCode() {
		final int prime = 31;
		int hash = 17;
		hash = hash * prime + this.cdUtente.hashCode();
		hash = hash * prime + this.cdUnitaOrganizzativa.hashCode();
		hash = hash * prime + this.cdAccesso.hashCode();
		
		return hash;
	}
}