import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { fromEvent, Observable, of, Subject, timer } from 'rxjs';
import {
  catchError,
  debounce,
  map,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import { Token } from '@services/tokenizer/token';
import { TokenizerService } from '@services/tokenizer/tokenizer.service';
import { LexerService } from '@services/lexer/lexer.service';
import { SolverService } from '@services/solver/solver.service';
import { KatexOptions } from 'ng-katex';

interface Report {
  type: 'solution' | 'error';
  value?: string;
}

@Component({
  selector: 'app-computor',
  templateUrl: './computor.component.html',
  styleUrls: ['./computor.component.scss'],
})
export class ComputorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('input') input!: ElementRef;
  welcome = true;
  source = '';
  input$?: Observable<Report>;
  options: KatexOptions = {
    displayMode: true,
  };
  test = 'x=(-b +- sqrt(b^2 – 4ac))/(2a)';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly tokenizerService: TokenizerService,
    private readonly lexerService: LexerService,
    private readonly solverService: SolverService
  ) {}

  type(): 'linear' | 'empty' | 'quadratic' {
    return this.solverService.type();
  }
  degree(): number {
    if (this.type() === 'empty') {
      return 0;
    }
    if (this.type() === 'linear') {
      return 1;
    }
    return 2;
  }
  linear(): string {
    return this.solverService.linear();
  }

  discriminant(): string {
    return this.solverService.discriminant();
  }

  simplified(): string {
    return this.solverService.simplified();
  }

  empty(): string {
    return this.solverService.empty();
  }

  solution(): string[] {
    return this.solverService.solution();
  }

  ngAfterViewInit(): void {
    this.input$ = fromEvent<KeyboardEvent>(
      this.input.nativeElement,
      'keyup'
    ).pipe(
      takeUntil(this.destroy$),
      debounce(
        (event: KeyboardEvent) => timer(event.key === 'Enter' ? 0 : 1500)
        // timer(0)
      ),
      map(({ target }: KeyboardEvent) => {
        const value = (target as HTMLInputElement).value ?? '';
        this.welcome = !value;
        return value;
      }),
      switchMap((input) =>
        of(input).pipe(
          map((data): Token[] => {
            this.source = data.repeat(1).replace('*', '\\cdot');
            return this.tokenizerService.tokenize(data);
          }),
          map((tokens) => this.lexerService.validate(tokens)),
          map((validTokens) => {
            this.solverService.setPolynomial(validTokens);
            this.solverService.simplifier();
            return { type: 'solution' } as Report;
          }),
          catchError((err) =>
            of({ type: 'error', value: err.message } as Report)
          )
        )
      )
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
