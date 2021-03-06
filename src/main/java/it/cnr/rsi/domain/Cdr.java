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

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;


/**
 * The persistent class for the CDR database table.
 *
 */
@Entity
@NamedQuery(name="Cdr.findAll", query="SELECT c FROM Cdr c")
public class Cdr implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name="CD_CENTRO_RESPONSABILITA")
	private String cdCentroResponsabilita;

	@Column(name="CD_PROPRIO_CDR")
	private String cdProprioCdr;

	@Column(name="CD_RESPONSABILE")
	private BigDecimal cdResponsabile;

	@Temporal(TemporalType.DATE)
	private Date dacr;

	@Column(name="DS_CDR")
	private String dsCdr;

	@Temporal(TemporalType.DATE)
	private Date duva;

	@Column(name="ESERCIZIO_FINE")
	private Integer esercizioFine;

	@Column(name="ESERCIZIO_INIZIO")
	private Integer esercizioInizio;

	private String indirizzo;

	private BigDecimal livello;

	@Column(name="PG_VER_REC")
	private BigDecimal pgVerRec;

	private String utcr;

	private String utuv;

	//bi-directional many-to-one association to Cdr
	@ManyToOne
	@JoinColumn(name="CD_CDR_AFFERENZA")
	private Cdr cdr;

	//bi-directional many-to-one association to Cdr
	@OneToMany(mappedBy="cdr")
	private List<Cdr> cdrs;

	//bi-directional many-to-one association to UnitaOrganizzativa
	@ManyToOne
	@JoinColumn(name="CD_UNITA_ORGANIZZATIVA")
	private UnitaOrganizzativa unitaOrganizzativa;

	public Cdr() {
	}

	public String getCdCentroResponsabilita() {
		return this.cdCentroResponsabilita;
	}

	public void setCdCentroResponsabilita(String cdCentroResponsabilita) {
		this.cdCentroResponsabilita = cdCentroResponsabilita;
	}

	public String getCdProprioCdr() {
		return this.cdProprioCdr;
	}

	public void setCdProprioCdr(String cdProprioCdr) {
		this.cdProprioCdr = cdProprioCdr;
	}

	public BigDecimal getCdResponsabile() {
		return this.cdResponsabile;
	}

	public void setCdResponsabile(BigDecimal cdResponsabile) {
		this.cdResponsabile = cdResponsabile;
	}

	public Date getDacr() {
		return this.dacr;
	}

	public void setDacr(Date dacr) {
		this.dacr = dacr;
	}

	public String getDsCdr() {
		return this.dsCdr;
	}

	public void setDsCdr(String dsCdr) {
		this.dsCdr = dsCdr;
	}

	public Date getDuva() {
		return this.duva;
	}

	public void setDuva(Date duva) {
		this.duva = duva;
	}

	public Integer getEsercizioFine() {
		return this.esercizioFine;
	}

	public void setEsercizioFine(Integer esercizioFine) {
		this.esercizioFine = esercizioFine;
	}

	public Integer getEsercizioInizio() {
		return this.esercizioInizio;
	}

	public void setEsercizioInizio(Integer esercizioInizio) {
		this.esercizioInizio = esercizioInizio;
	}

	public String getIndirizzo() {
		return this.indirizzo;
	}

	public void setIndirizzo(String indirizzo) {
		this.indirizzo = indirizzo;
	}

	public BigDecimal getLivello() {
		return this.livello;
	}

	public void setLivello(BigDecimal livello) {
		this.livello = livello;
	}

	public BigDecimal getPgVerRec() {
		return this.pgVerRec;
	}

	public void setPgVerRec(BigDecimal pgVerRec) {
		this.pgVerRec = pgVerRec;
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

	public Cdr getCdr() {
		return this.cdr;
	}

	public void setCdr(Cdr cdr) {
		this.cdr = cdr;
	}

	public List<Cdr> getCdrs() {
		return this.cdrs;
	}

	public void setCdrs(List<Cdr> cdrs) {
		this.cdrs = cdrs;
	}

	public Cdr addCdr(Cdr cdr) {
		getCdrs().add(cdr);
		cdr.setCdr(this);

		return cdr;
	}

	public Cdr removeCdr(Cdr cdr) {
		getCdrs().remove(cdr);
		cdr.setCdr(null);

		return cdr;
	}

	public UnitaOrganizzativa getUnitaOrganizzativa() {
		return this.unitaOrganizzativa;
	}

	public void setUnitaOrganizzativa(UnitaOrganizzativa unitaOrganizzativa) {
		this.unitaOrganizzativa = unitaOrganizzativa;
	}

}
