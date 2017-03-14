package it.cnr.rsi.domain;

import java.io.Serializable;
import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;


/**
 * The persistent class for the ASS_BP_ACCESSO database table.
 * 
 */
@Entity
@Table(name="ASS_BP_ACCESSO")
@NamedQuery(name="AssBpAccesso.findAll", query="SELECT a FROM AssBpAccesso a")
public class AssBpAccesso implements Serializable {
	private static final long serialVersionUID = 1L;

	@EmbeddedId
	private AssBpAccessoPK id;

	@Temporal(TemporalType.DATE)
	private Date dacr;

	@Temporal(TemporalType.DATE)
	private Date duva;

	@Column(name="ESERCIZIO_FINE_VALIDITA")
	private BigDecimal esercizioFineValidita;

	@Column(name="ESERCIZIO_INIZIO_VALIDITA")
	private BigDecimal esercizioInizioValidita;

	@Column(name="PG_VER_REC")
	private BigDecimal pgVerRec;

	@Column(name="TI_FUNZIONE")
	private String tiFunzione;

	private String utcr;

	private String utuv;

	//bi-directional many-to-one association to Accesso
	@ManyToOne
	@JoinColumn(name="CD_ACCESSO", insertable=false, updatable=false)
	private Accesso accesso;

	public AssBpAccesso() {
	}

	public AssBpAccessoPK getId() {
		return this.id;
	}

	public void setId(AssBpAccessoPK id) {
		this.id = id;
	}

	public Date getDacr() {
		return this.dacr;
	}

	public void setDacr(Date dacr) {
		this.dacr = dacr;
	}

	public Date getDuva() {
		return this.duva;
	}

	public void setDuva(Date duva) {
		this.duva = duva;
	}

	public BigDecimal getEsercizioFineValidita() {
		return this.esercizioFineValidita;
	}

	public void setEsercizioFineValidita(BigDecimal esercizioFineValidita) {
		this.esercizioFineValidita = esercizioFineValidita;
	}

	public BigDecimal getEsercizioInizioValidita() {
		return this.esercizioInizioValidita;
	}

	public void setEsercizioInizioValidita(BigDecimal esercizioInizioValidita) {
		this.esercizioInizioValidita = esercizioInizioValidita;
	}

	public BigDecimal getPgVerRec() {
		return this.pgVerRec;
	}

	public void setPgVerRec(BigDecimal pgVerRec) {
		this.pgVerRec = pgVerRec;
	}

	public String getTiFunzione() {
		return this.tiFunzione;
	}

	public void setTiFunzione(String tiFunzione) {
		this.tiFunzione = tiFunzione;
	}

	public String getUtcr() {
		return this.utcr;
	}

	public void setUtcr(String utcr) {
		this.utcr = utcr;
	}

	public String getUtuv() {
		return this.utuv;
	}

	public void setUtuv(String utuv) {
		this.utuv = utuv;
	}

	public Accesso getAccesso() {
		return this.accesso;
	}

	public void setAccesso(Accesso accesso) {
		this.accesso = accesso;
	}

}