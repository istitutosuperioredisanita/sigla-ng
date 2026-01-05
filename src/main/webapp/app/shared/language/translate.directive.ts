import { Directive, Input, ElementRef, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[jhiTranslate]'
})
export class TranslateDirective implements OnInit, OnChanges, OnDestroy {
  @Input() jhiTranslate!: string;
  @Input() translateValues?: any;

  private readonly destroy$ = new Subject<void>();

  constructor(private el: ElementRef, private translateService: TranslateService) {}

  ngOnInit(): void {
    // Aggiorna la traduzione quando cambia la lingua globale
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.getTranslation());
  }

  ngOnChanges(): void {
    this.getTranslation();
  }

  private getTranslation(): void {
    this.translateService
      .get(this.jhiTranslate, this.translateValues)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        res => {
          this.el.nativeElement.innerHTML = res;
        },
        () => {
          this.el.nativeElement.innerHTML = this.jhiTranslate;
        }
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}