import { Component, signal } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
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
  hoyISO,
  mensajeError,
} from '../shared/registro.utils';
import { ThemeService } from '../shared/theme.service';
import { FechaNoFuturaDirective } from './fecha-no-futura.directive';

/**
 * MODELO TEMPLATE-DRIVEN: el formulario y sus validaciones se declaran en el HTML
 * (ngModel + atributos required, minlength, email, pattern...). El TypeScript solo
 * guarda un objeto "modelo" con los datos; Angular crea los controles por debajo.
 */
@Component({
  selector: 'app-driven',
  templateUrl: 'driven.page.html',
  styleUrls: ['driven.page.scss'],
  imports: [
    FormsModule,
    RouterLink,
    FechaNoFuturaDirective,
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
export class DrivenPage {
  /** Objeto modelo enlazado con [(ngModel)] en la plantilla */
  public modelo = { nombre: '', email: '', password: '', fechaNacimiento: '' };

  /** Estado de envío (Signal) */
  public isSubmitting = signal<boolean>(false);
  /** Últimos datos enviados correctamente (para descargar el PDF) */
  public datosEnviados = signal<DatosRegistro | null>(null);

  /** Máximo permitido en el selector de fecha: hoy */
  public readonly maxFecha = hoyISO();
  /** Patrón de contraseña que se pasa al atributo [pattern] de la plantilla */
  public readonly passwordPattern = PASSWORD_PATTERN;

  constructor(
    private alertCtrl: AlertController,
    public theme: ThemeService,
  ) {
    addIcons({ moon, sunny, downloadOutline, swapHorizontalOutline });
  }

  /** Mensaje de error de un campo; recibe la referencia #campo="ngModel" de la plantilla. */
  public getError(campo: string, control: NgModel): string {
    return mensajeError(campo, control.errors);
  }

  public async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid) {
      // En template-driven hay que recorrer los controles a mano para mostrar los errores
      Object.values(form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    this.isSubmitting.set(true);
    try {
      const { password, ...resto } = this.modelo;

      // La contraseña se cifra ANTES de montar el payload: nunca aparece en claro en consola
      const payload: DatosRegistro = { ...resto, passwordHash: await cifrarPassword(password) };
      console.log('[Template-driven] Payload a enviar a la API REST:', payload);

      // Simulación de llamada asíncrona a un backend HTTP
      await new Promise((resolve) => setTimeout(resolve, 1500));

      this.datosEnviados.set(payload);
      form.resetForm({ nombre: '', email: '', password: '', fechaNacimiento: '' });

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
      descargarPdfRegistro(datos, 'Registro de Usuario (Template-driven)');
    }
  }
}
