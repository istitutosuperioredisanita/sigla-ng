package it.cnr.rsi.domain;

import java.io.Serializable;
import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;


/**
 * The persistent class for the UNITA_ORGANIZZATIVA database table.
 * 
 */
@Entity
@Table(name="UNITA_ORGANIZZATIVA")
@NamedQuery(name="UnitaOrganizzativa.findAll", query="SELECT u FROM UnitaOrganizzativa u")
public class UnitaOrganizzativa implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name="CD_UNITA_ORGANIZZATIVA")
	private String cdUnitaOrganizzativa;

	@Column(name="CD_AREA_SCIENTIFICA")
	private String cdAreaScientifica;

	@Column(name="CD_PROPRIO_UNITA")
	private String cdProprioUnita;

	@Column(name="CD_RESPONSABILE")
	private BigDecimal cdResponsabile;

	@Column(name="CD_RESPONSABILE_AMM")
	private BigDecimal cdResponsabileAmm;

	@Column(name="CD_TIPO_UNITA")
	private String cdTipoUnita;

	@Temporal(TemporalType.DATE)
	private Date dacr;

	@Column(name="DS_UNITA_ORGANIZZATIVA")
	private String dsUnitaOrganizzativa;

	@Temporal(TemporalType.DATE)
	private Date duva;

	@Column(name="ESERCIZIO_FINE")
	private Integer esercizioFine;

	@Column(name="ESERCIZIO_INIZIO")
	private Integer esercizioInizio;

	@Column(name="FL_CDS")
	private String flCds;

	@Column(name="FL_PRESIDENTE_AREA")
	private String flPresidenteArea;

	@Column(name="FL_RUBRICA")
	private String flRubrica;

	@Column(name="FL_UO_CDS")
	private String flUoCds;

	@Column(name="ID_FUNZIONE_PUBBLICA")
	private String idFunzionePubblica;

	private BigDecimal livello;

	@Column(name="PG_VER_REC")
	private BigDecimal pgVerRec;

	@Column(name="PRC_COPERTURA_OBBLIG_2")
	private BigDecimal prcCoperturaObblig2;

	@Column(name="PRC_COPERTURA_OBBLIG_3")
	private BigDecimal prcCoperturaObblig3;

	private String utcr;

	private String utuv;

	//bi-directional many-to-one association to Cdr
	@OneToMany(mappedBy="unitaOrganizzativa")
	private List<Cdr> cdrs;

	//bi-directional many-to-one association to Ruolo
	@OneToMany(mappedBy="unitaOrganizzativa")
	private List<Ruolo> ruolos;

	//bi-directional many-to-one association to UnitaOrganizzativa
	@ManyToOne
	@JoinColumn(name="CD_AREA_RICERCA")
	private UnitaOrganizzativa unitaOrganizzativa1;

	//bi-directional many-to-one association to UnitaOrganizzativa
	@OneToMany(mappedBy="unitaOrganizzativa1")
	private List<UnitaOrganizzativa> unitaOrganizzativas1;

	//bi-directional many-to-one association to UnitaOrganizzativa
	@ManyToOne
	@JoinColumn(name="CD_UNITA_PADRE")
	private UnitaOrganizzativa unitaOrganizzativa2;

	//bi-directional many-to-one association to UnitaOrganizzativa
	@OneToMany(mappedBy="unitaOrganizzativa2")
	private List<UnitaOrganizzativa> unitaOrganizzativas2;

	//bi-directional many-to-one association to UnitaOrganizzativa
	@OneToMany(mappedBy="unitaOrganizzativa")
	private List<UtenteUnitaRuolo> utenteUnitaRuolos;

	//bi-directional many-to-one association to UnitaOrganizzativa
	@OneToMany(mappedBy="unitaOrganizzativa")
	private List<UtenteUnitaAccesso> utenteUnitaAccessos;
	
	public UnitaOrganizzativa() {
	}

	public String getCdUnitaOrganizzativa() {
		return this.cdUnitaOrganizzativa;
	}

	public void setCdUnitaOrganizzativa(String cdUnitaOrganizzativa) {
		this.cdUnitaOrganizzativa = cdUnitaOrganizzativa;
	}

	public String getCdAreaScientifica() {
		return this.cdAreaScientifica;
	}

	public void setCdAreaScientifica(String cdAreaScientifica) {
		this.cdAreaScientifica = cdAreaScientifica;
	}

	public String getCdProprioUnita() {
		return this.cdProprioUnita;
	}

	public void setCdProprioUnita(String cdProprioUnita) {
		this.cdProprioUnita = cdProprioUnita;
	}

	public BigDecimal getCdResponsabile() {
		return this.cdResponsabile;
	}

	public void setCdResponsabile(BigDecimal cdResponsabile) {
		this.cdResponsabile = cdResponsabile;
	}

	public BigDecimal getCdResponsabileAmm() {
		return this.cdResponsabileAmm;
	}

	public void setCdResponsabileAmm(BigDecimal cdResponsabileAmm) {
		this.cdResponsabileAmm = cdResponsabileAmm;
	}

	public String getCdTipoUnita() {
		return this.cdTipoUnita;
	}

	public void setCdTipoUnita(String cdTipoUnita) {
		this.cdTipoUnita = cdTipoUnita;
	}

	public Date getDacr() {
		return this.dacr;
	}

	public void setDacr(Date dacr) {
		this.dacr = dacr;
	}

	public String getDsUnitaOrganizzativa() {
		return this.dsUnitaOrganizzativa;
	}

	public void setDsUnitaOrganizzativa(String dsUnitaOrganizzativa) {
		this.dsUnitaOrganizzativa = dsUnitaOrganizzativa;
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

	public String getFlCds() {
		return this.flCds;
	}

	public void setFlCds(String flCds) {
		this.flCds = flCds;
	}

	public String getFlPresidenteArea() {
		return this.flPresidenteArea;
	}

	public void setFlPresidenteArea(String flPresidenteArea) {
		this.flPresidenteArea = flPresidenteArea;
	}

	public String getFlRubrica() {
		return this.flRubrica;
	}

	public void setFlRubrica(String flRubrica) {
		this.flRubrica = flRubrica;
	}

	public String getFlUoCds() {
		return this.flUoCds;
	}

	public void setFlUoCds(String flUoCds) {
		this.flUoCds = flUoCds;
	}

	public String getIdFunzionePubblica() {
		return this.idFunzionePubblica;
	}

	public void setIdFunzionePubblica(String idFunzionePubblica) {
		this.idFunzionePubblica = idFunzionePubblica;
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

	public BigDecimal getPrcCoperturaObblig2() {
		return this.prcCoperturaObblig2;
	}

	public void setPrcCoperturaObblig2(BigDecimal prcCoperturaObblig2) {
		this.prcCoperturaObblig2 = prcCoperturaObblig2;
	}

	public BigDecimal getPrcCoperturaObblig3() {
		return this.prcCoperturaObblig3;
	}

	public void setPrcCoperturaObblig3(BigDecimal prcCoperturaObblig3) {
		this.prcCoperturaObblig3 = prcCoperturaObblig3;
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

	public List<Cdr> getCdrs() {
		return this.cdrs;
	}

	public void setCdrs(List<Cdr> cdrs) {
		this.cdrs = cdrs;
	}

	public Cdr addCdr(Cdr cdr) {
		getCdrs().add(cdr);
		cdr.setUnitaOrganizzativa(this);

		return cdr;
	}

	public Cdr removeCdr(Cdr cdr) {
		getCdrs().remove(cdr);
		cdr.setUnitaOrganizzativa(null);

		return cdr;
	}

	public List<Ruolo> getRuolos() {
		return this.ruolos;
	}

	public void setRuolos(List<Ruolo> ruolos) {
		this.ruolos = ruolos;
	}

	public Ruolo addRuolo(Ruolo ruolo) {
		getRuolos().add(ruolo);
		ruolo.setUnitaOrganizzativa(this);

		return ruolo;
	}

	public Ruolo removeRuolo(Ruolo ruolo) {
		getRuolos().remove(ruolo);
		ruolo.setUnitaOrganizzativa(null);

		return ruolo;
	}

	public UnitaOrganizzativa getUnitaOrganizzativa1() {
		return this.unitaOrganizzativa1;
	}

	public void setUnitaOrganizzativa1(UnitaOrganizzativa unitaOrganizzativa1) {
		this.unitaOrganizzativa1 = unitaOrganizzativa1;
	}

	public List<UnitaOrganizzativa> getUnitaOrganizzativas1() {
		return this.unitaOrganizzativas1;
	}

	public void setUnitaOrganizzativas1(List<UnitaOrganizzativa> unitaOrganizzativas1) {
		this.unitaOrganizzativas1 = unitaOrganizzativas1;
	}

	public UnitaOrganizzativa addUnitaOrganizzativas1(UnitaOrganizzativa unitaOrganizzativas1) {
		getUnitaOrganizzativas1().add(unitaOrganizzativas1);
		unitaOrganizzativas1.setUnitaOrganizzativa1(this);

		return unitaOrganizzativas1;
	}

	public UnitaOrganizzativa removeUnitaOrganizzativas1(UnitaOrganizzativa unitaOrganizzativas1) {
		getUnitaOrganizzativas1().remove(unitaOrganizzativas1);
		unitaOrganizzativas1.setUnitaOrganizzativa1(null);

		return unitaOrganizzativas1;
	}

	public UnitaOrganizzativa getUnitaOrganizzativa2() {
		return this.unitaOrganizzativa2;
	}

	public void setUnitaOrganizzativa2(UnitaOrganizzativa unitaOrganizzativa2) {
		this.unitaOrganizzativa2 = unitaOrganizzativa2;
	}

	public List<UnitaOrganizzativa> getUnitaOrganizzativas2() {
		return this.unitaOrganizzativas2;
	}

	public void setUnitaOrganizzativas2(List<UnitaOrganizzativa> unitaOrganizzativas2) {
		this.unitaOrganizzativas2 = unitaOrganizzativas2;
	}

	public UnitaOrganizzativa addUnitaOrganizzativas2(UnitaOrganizzativa unitaOrganizzativas2) {
		getUnitaOrganizzativas2().add(unitaOrganizzativas2);
		unitaOrganizzativas2.setUnitaOrganizzativa2(this);

		return unitaOrganizzativas2;
	}

	public UnitaOrganizzativa removeUnitaOrganizzativas2(UnitaOrganizzativa unitaOrganizzativas2) {
		getUnitaOrganizzativas2().remove(unitaOrganizzativas2);
		unitaOrganizzativas2.setUnitaOrganizzativa2(null);

		return unitaOrganizzativas2;
	}

	public List<UtenteUnitaRuolo> getUtenteUnitaRuolos() {
		return utenteUnitaRuolos;
	}

	public void setUtenteUnitaRuolos(List<UtenteUnitaRuolo> utenteUnitaRuolos) {
		this.utenteUnitaRuolos = utenteUnitaRuolos;
	}

	public List<UtenteUnitaAccesso> getUtenteUnitaAccessos() {
		return utenteUnitaAccessos;
	}

	public void setUtenteUnitaAccessos(List<UtenteUnitaAccesso> utenteUnitaAccessos) {
		this.utenteUnitaAccessos = utenteUnitaAccessos;
	}

}