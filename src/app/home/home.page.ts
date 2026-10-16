import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
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
import { downloadOutline, moon, sunny } from 'ionicons/icons';
import { jsPDF } from 'jspdf';

/** Devuelve la fecha local de hoy en formato yyyy-mm-dd (comparable como texto). */
function hoyISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Validador personalizado: la fecha de nacimiento no puede ser posterior a hoy. */
export function fechaNoFutura(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string;
  if (!valor) {
    return null; // "required" ya se encarga de los vacíos
  }
  return valor > hoyISO() ? { fechaFutura: true } : null;
}

interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
  fechaNacimiento: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    ReactiveFormsModule,
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
export class HomePage {
  public registroForm: FormGroup;

  /** Estado de envío (Signal) */
  public isSubmitting = signal<boolean>(false);
  /** Últimos datos enviados correctamente (para descargar el PDF) */
  public datosEnviados = signal<DatosRegistro | null>(null);
  /** Modo oscuro activado */
  public darkMode = signal<boolean>(false);

  /** Máximo permitido en el selector de fecha: hoy */
  public readonly maxFecha = hoyISO();

  constructor(
    private fb: FormBuilder,
    private alertCtrl: AlertController,
  ) {
    addIcons({ moon, sunny, downloadOutline });

    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)],
      ],
      fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
    });

    this.iniciarTema();
  }

  /** Mensajes de error por campo (se pasan a [errorText] de ion-input). */
  public getError(campo: string): string {
    const errores = this.registroForm.get(campo)?.errors;
    if (!errores) {
      return '';
    }
    if (errores['required']) {
      return 'Este campo es obligatorio.';
    }
    switch (campo) {
      case 'nombre':
        return 'El nombre debe tener al menos 3 caracteres.';
      case 'email':
        return 'Introduzca un email válido.';
      case 'password':
        return 'Mínimo 8 caracteres, con letras y números.';
      case 'fechaNacimiento':
        return errores['fechaFutura']
          ? 'La fecha de nacimiento no puede ser posterior a hoy.'
          : 'Fecha no válida.';
      default:
        return 'Valor no válido.';
    }
  }

  public async onSubmit(): Promise<void> {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched(); // fuerza la visualización de errores
      return;
    }

    this.isSubmitting.set(true);
    try {
      const formData = this.registroForm.value as DatosRegistro;
      console.log('Payload a enviar a la API REST:', formData);

      // Simulación de llamada asíncrona a un backend HTTP
      await new Promise((resolve) => setTimeout(resolve, 1500));

      this.datosEnviados.set({ ...formData });
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
    if (!datos) {
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Registro de Usuario', 20, 25);
    doc.setFontSize(11);
    doc.text(`Generado el ${new Date().toLocaleString('es-ES')}`, 20, 33);
    doc.line(20, 37, 190, 37);

    doc.setFontSize(13);
    const filas: [string, string][] = [
      ['Nombre completo', datos.nombre],
      ['Correo electrónico', datos.email],
      ['Fecha de nacimiento', this.formatearFecha(datos.fechaNacimiento)],
      ['Contraseña', '********'], // nunca se imprime la contraseña real
    ];
    let y = 50;
    for (const [etiqueta, valor] of filas) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${etiqueta}:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(valor, 75, y);
      y += 12;
    }

    doc.save('registro-usuario.pdf');
  }

  /** Alterna el modo oscuro. */
  public toggleDark(): void {
    this.aplicarTema(!this.darkMode());
  }

  private iniciarTema(): void {
    let guardado: string | null = null;
    try {
      guardado = localStorage.getItem('tema-oscuro');
    } catch {
      /* almacenamiento no disponible */
    }
    const prefiereOscuro =
      guardado !== null
        ? guardado === 'true'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.aplicarTema(prefiereOscuro);
  }

  private aplicarTema(oscuro: boolean): void {
    this.darkMode.set(oscuro);
    document.documentElement.classList.toggle('ion-palette-dark', oscuro);
    try {
      localStorage.setItem('tema-oscuro', String(oscuro));
    } catch {
      /* almacenamiento no disponible */
    }
  }

  private formatearFecha(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
}
