import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { downloadOutline, moon, sunny, swapHorizontalOutline } from 'ionicons/icons';
import {
  DatosRegistro,
  PASSWORD_PATTERN,
  cifrarPassword,
  descargarPdfRegistro,
  esFechaFutura,
  hoyISO,
  mensajeError,
} from '../shared/registro.utils';
import { ThemeService } from '../shared/theme.service';

/** Validador personalizado (reactivo): la fecha de nacimiento no puede ser posterior a hoy. */
export function fechaNoFutura(control: AbstractControl): ValidationErrors | null {
  return esFechaFutura(control.value as string) ? { fechaFutura: true } : null;
}

interface FormularioRegistro {
  nombre: string;
  email: string;
  password: string;
  fechaNacimiento: string;
}

/**
 * MODELO REACTIVO (Reactive Forms): el formulario se define en TypeScript
 * (FormGroup/FormControl + validadores) y la plantilla solo se "enlaza" a él.
 */
@Component({
  selector: 'app-registro',
  templateUrl: 'registro.page.html',
  styleUrls: ['registro.page.scss'],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonSpinner,
  ],
})
export class RegistroPage {
  public registroForm: FormGroup;

  /** Estado de envío (Signal) */
  public isSubmitting = signal<boolean>(false);
  /** Últimos datos enviados correctamente (para descargar el PDF) */
  public datosEnviados = signal<DatosRegistro | null>(null);

  /** Máximo permitido en el selector de fecha: hoy */
  public readonly maxFecha = hoyISO();

  constructor(
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    public theme: ThemeService,
  ) {
    addIcons({ moon, sunny, downloadOutline, swapHorizontalOutline });

    // Toda la definición del formulario y sus validaciones vive aquí, en TypeScript
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(new RegExp(`^${PASSWORD_PATTERN}$`))]],
      fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
    });
  }

  /** Mensajes de error por campo (se pasan a [errorText] de ion-input). */
  public getError(campo: string): string {
    return mensajeError(campo, this.registroForm.get(campo)?.errors ?? null);
  }

  public async onSubmit(): Promise<void> {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched(); // fuerza la visualización de errores
      return;
    }

    this.isSubmitting.set(true);
    try {
      const { password, ...resto } = this.registroForm.value as FormularioRegistro;

      // La contraseña se cifra ANTES de montar el payload: nunca aparece en claro en consola
      const payload: DatosRegistro = { ...resto, passwordHash: await cifrarPassword(password) };
      console.log('[Reactivo] Payload a enviar a la API REST:', payload);

      // Simulación de llamada asíncrona a un backend HTTP
      await new Promise((resolve) => setTimeout(resolve, 1500));

      this.datosEnviados.set(payload);
      this.registroForm.reset();

      const alert = await this.alertCtrl.create({
        header: 'Formulario enviado',
        message: 'El formulario se ha enviado correctamente.',
        buttons: ['Aceptar'],
      });
      await alert.present();
    } catch (error) {
      console.error('Error al persistir los datos', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /** Genera y descarga un PDF con los datos del último formulario enviado. */
  public descargarPdf(): void {
    const datos = this.datosEnviados();
    if (datos) {
      descargarPdfRegistro(datos, 'Registro de Usuario (Reactive Forms)');
    }
  }
}
