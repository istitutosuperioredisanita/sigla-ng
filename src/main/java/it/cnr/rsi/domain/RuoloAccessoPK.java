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
