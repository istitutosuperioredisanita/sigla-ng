package it.cnr.rsi.domain;

import java.io.Serializable;
import javax.persistence.*;

/**
 * The primary key class for the UTENTE_UNITA_RUOLO database table.
 * 
 */
@Embeddable
public class UtenteUnitaRuoloPK implements Serializable {
	//default serial version id, required for serializable classes.
	private static final long serialVersionUID = 1L;

	@Column(name="CD_UNITA_ORGANIZZATIVA")
	private String cdUnitaOrganizzativa;

	@Column(name="CD_UTENTE", insertable=false, updatable=false)
	private String cdUtente;

	@Column(name="CD_RUOLO", insertable=false, updatable=false)
	private String cdRuolo;

	public UtenteUnitaRuoloPK() {
	}
	public String getCdUnitaOrganizzativa() {
		return this.cdUnitaOrganizzativa;
	}
	public void setCdUnitaOrganizzativa(String cdUnitaOrganizzativa) {
		this.cdUnitaOrganizzativa = cdUnitaOrganizzativa;
	}
	public String getCdUtente() {
		return this.cdUtente;
	}
	public void setCdUtente(String cdUtente) {
		this.cdUtente = cdUtente;
	}
	public String getCdRuolo() {
		return this.cdRuolo;
	}
	public void setCdRuolo(String cdRuolo) {
		this.cdRuolo = cdRuolo;
	}

	public boolean equals(Object other) {
		if (this == other) {
			return true;
		}
		if (!(other instanceof UtenteUnitaRuoloPK)) {
			return false;
		}
		UtenteUnitaRuoloPK castOther = (UtenteUnitaRuoloPK)other;
		return 
			this.cdUnitaOrganizzativa.equals(castOther.cdUnitaOrganizzativa)
			&& this.cdUtente.equals(castOther.cdUtente)
			&& this.cdRuolo.equals(castOther.cdRuolo);
	}

	public int hashCode() {
		final int prime = 31;
		int hash = 17;
		hash = hash * prime + this.cdUnitaOrganizzativa.hashCode();
		hash = hash * prime + this.cdUtente.hashCode();
		hash = hash * prime + this.cdRuolo.hashCode();
		
		return hash;
	}
}