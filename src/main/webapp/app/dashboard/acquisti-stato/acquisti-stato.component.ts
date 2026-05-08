import { Component, OnInit, OnDestroy, Input, signal } from "@angular/core";
import { ContextService } from "app/context";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { NgbDropdown, NgbTypeaheadConfig, NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";
import { AcquistiStatoService } from "./acquisti-stato.service";
import { Observable, Subject } from 'rxjs';
import { map, debounceTime, takeUntil } from 'rxjs/operators';
import { Pair } from "../../context/pair.model";
import { EChartsOption } from "echarts";

@Component({
  selector: 'acquisti-stato',
  templateUrl: './acquisti-stato.component.html',
  providers: [NgbDropdown, NgbTypeaheadConfig],
  standalone: false
})
export class AcquistiStatoComponent implements OnInit, OnDestroy {
  @Input() dashboard: boolean = false;
  @Input() codiceUo: string;

  protected filterForm: FormGroup;

  protected chartOptions: EChartsOption = {};

  esercizi: number[];
  loadingChart = signal(false);
  private lastValue: any = null;
  private destroy$ = new Subject<void>();
  protected uoPairs: Pair[];

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected formBuilder: FormBuilder,
    protected contextService: ContextService,
    protected acquistiStatoService: AcquistiStatoService,
    protected translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['dashboard'] !== undefined) {
        this.dashboard = params['dashboard'] === 'true';
      }
      this.initializeComponent();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.filterForm = this.formBuilder.group({
      codice: new FormControl(this.codiceUo)
    });

    this.filterForm.controls['codice']?.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (!value && this.lastValue) {
        this.callStato();
      }
      this.lastValue = value;
    });

    this.contextService.getUo().subscribe((result: Pair[]) => {
      this.uoPairs = result;
    });

    this.callStato(this.codiceUo || this.filterForm.controls['codice'].value);
  }

  onUoSelected(event: NgbTypeaheadSelectItemEvent) {
    this.callStato(event?.item?.first);
  }

  searchuo = (text$: Observable<string>) =>
    text$.pipe(debounceTime(200)).pipe(
      map((term: string) => this.filterPair(term, this.uoPairs, 'uo').slice(0, 200))
    );

  filterPair(term: string, pairs: Pair[], type: string): Pair[] {
    if (term === '') return pairs;
    return pairs.filter(v => new RegExp(term, 'gi').test(v.first + ' - ' + v.second));
  }

  formatter = (pair: Pair) => pair.first + ' - ' + pair.second;
  formatterFirst = (pair: Pair) => pair.first;

  openTypeaheadUo() {
    const input = document.getElementById('codice') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.dispatchEvent(this.createNewEvent('input'));
    }
  }

  createNewEvent(eventName: string): Event {
    if (typeof Event === 'function') return new Event(eventName);
    const event = document.createEvent('Event');
    event.initEvent(eventName, true, true);
    return event;
  }

  callStato(codice?: string): void {
    this.loadingChart.set(true);
    this.acquistiStatoService.getIndice(codice).subscribe((result: any[]) => {
      const data = result?.slice(-4).map(item => ({
        ...item,
        riepilogo_stato_esercizio: String(item.riepilogo_stato_esercizio)
      }));
      this.loadChart(data);
      this.loadingChart.set(false);
    });
  }

  private loadChart(data: any[]): void {
    const categories = data.map(d => d.riepilogo_stato_esercizio);

    const formatEur = (v: number) =>
      v != null ? v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€' : '-';

    const series: any[] = [
      {
        label: 'RICEVUTE',
        valueField: 'riepilogo_stato_importo_ricevute',
        countField: 'riepilogo_stato_num_ricevute'
      },
      {
        label: 'REGISTRATE',
        valueField: 'riepilogo_stato_importo_registrate',
        countField: 'riepilogo_stato_num_registrate'
      },
      {
        label: 'PAGATE',
        valueField: 'riepilogo_stato_importo_pagate',
        countField: 'riepilogo_stato_num_pagate'
      }
    ].map(s => ({
      name: s.label,
      type: 'bar',
      barMaxWidth: '30%',
      label: {
        show: true,
        position: 'insideBottom',
        rotate: 90,
        align: 'left',
        verticalAlign: 'middle',
        formatter: (params: any) => formatEur(params.value),
        fontSize: 11,
        color: '#fff'
      },
      tooltip: {
        valueFormatter: (value: number, dataIndex: number) => {
          const row = data[dataIndex];
          const count = row?.[s.countField];
          return `N. ${count} ${s.label} — Totale: ${formatEur(value)}`;
        }
      },
      data: data.map(d => d[s.valueField] ?? 0),
      animationDuration: 1000
    }));

    this.chartOptions = {
        toolbox: {
            feature: {
                saveAsImage: {
                title: 'Salva immagine',
                name: `acquisti_per_stato`
                }
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            textStyle: { align: 'left' },
            formatter: (params: any) => {
            const year = params[0]?.axisValue;
            const row = data.find(d => d.riepilogo_stato_esercizio === year);
            if (!row) return '';
            return [
                `<b>${year}</b>`,
                ...params.map(p => {
                const s = [
                    { label: 'RICEVUTE',   countField: 'riepilogo_stato_num_ricevute'    },
                    { label: 'REGISTRATE', countField: 'riepilogo_stato_num_registrate'  },
                    { label: 'PAGATE',     countField: 'riepilogo_stato_num_pagate'      }
                ].find(x => x.label === p.seriesName);
                const count = s ? row[s.countField] : '-';
                return `${p.marker} ${p.seriesName}: N. ${count} — ${formatEur(p.value)}`;
                })
            ].join('<br/>');
        }
      },
      legend: {
        bottom: 0,
        data: ['RICEVUTE', 'REGISTRATE', 'PAGATE']
      },
      title: {
        subtext: this.translateService.instant('dashboard.acquisti-stato.descrizione'),
        left: 'center',
        subtextStyle: {
          fontSize: 12,
          color: '#555',
          fontStyle: 'italic',
          align: 'center'
        }
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '10%',
        top: '22%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          fontSize: 13,
          fontWeight: 'bold'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v: number) => v.toLocaleString('it-IT') + '€'
        }
      },
      series
    };

  }
}