package it.cnr.rsi.domain;

import java.io.Serializable;
import javax.persistence.*;

/**
 * The primary key class for the ASS_BP_ACCESSO database table.
 * 
 */
@Embeddable
public class AssBpAccessoPK implements Serializable {
	//default serial version id, required for serializable classes.
	private static final long serialVersionUID = 1L;

	@Column(name="CD_ACCESSO", insertable=false, updatable=false)
	private String cdAccesso;

	@Column(name="BUSINESS_PROCESS")
	private String businessProcess;

	public AssBpAccessoPK() {
	}
	public String getCdAccesso() {
		return this.cdAccesso;
	}
	public void setCdAccesso(String cdAccesso) {
		this.cdAccesso = cdAccesso;
	}
	public String getBusinessProcess() {
		return this.businessProcess;
	}
	public void setBusinessProcess(String businessProcess) {
		this.businessProcess = businessProcess;
	}

	public boolean equals(Object other) {
		if (this == other) {
			return true;
		}
		if (!(other instanceof AssBpAccessoPK)) {
			return false;
		}
		AssBpAccessoPK castOther = (AssBpAccessoPK)other;
		return 
			this.cdAccesso.equals(castOther.cdAccesso)
			&& this.businessProcess.equals(castOther.businessProcess);
	}

	public int hashCode() {
		final int prime = 31;
		int hash = 17;
		hash = hash * prime + this.cdAccesso.hashCode();
		hash = hash * prime + this.businessProcess.hashCode();
		
		return hash;
	}
}