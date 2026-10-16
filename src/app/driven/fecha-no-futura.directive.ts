import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { esFechaFutura } from '../shared/registro.utils';

/**
 * Validador personalizado para Template-Driven Forms.
 * A diferencia del modelo reactivo (una simple función), en template-driven un
 * validador propio necesita una DIRECTIVA que se aplica como atributo en el HTML:
 *   <ion-input fechaNoFutura [(ngModel)]="..."></ion-input>
 */
@Directive({
  selector: '[fechaNoFutura][ngModel]',
  providers: [{ provide: NG_VALIDATORS, useExisting: FechaNoFuturaDirective, multi: true }],
})
export class FechaNoFuturaDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return esFechaFutura(control.value as string) ? { fechaFutura: true } : null;
  }
}
