import { ValidationErrors } from '@angular/forms';
import { jsPDF } from 'jspdf';

/**
 * Código común a las dos páginas (reactiva y template-driven).
 * Aquí va TODO lo que no depende del modelo de formulario, para que la
 * comparación entre ambas páginas se centre solo en cómo se define el formulario.
 */

/** Datos que se envían y se guardan: la contraseña va cifrada (hash), nunca en claro. */
export interface DatosRegistro {
  nombre: string;
  email: string;
  passwordHash: string;
  fechaNacimiento: string;
}

/** Contraseña: mínimo 8 caracteres, al menos una letra y un número (sin anclas ^ $). */
export const PASSWORD_PATTERN = '(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}';

/** Devuelve la fecha local de hoy en formato yyyy-mm-dd (comparable como texto). */
export function hoyISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** true si la fecha (yyyy-mm-dd) es posterior a hoy. */
export function esFechaFutura(valor: string | null | undefined): boolean {
  return !!valor && valor > hoyISO();
}

/** Mensaje de error para un campo, a partir del objeto de errores de Angular. */
export function mensajeError(campo: string, errores: ValidationErrors | null): string {
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

/**
 * Cifra la contraseña con SHA-256 (Web Crypto) usando una sal aleatoria.
 * Devuelve "sal$hash" en hexadecimal. Es un hash unidireccional: no se puede
 * revertir a la contraseña original.
 * Nota: crypto.subtle solo existe en contextos seguros (https o localhost).
 */
export async function cifrarPassword(password: string): Promise<string> {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const datos = new TextEncoder().encode(password);
  const entrada = new Uint8Array(sal.length + datos.length);
  entrada.set(sal, 0);
  entrada.set(datos, sal.length);
  const digest = await crypto.subtle.digest('SHA-256', entrada);
  return `${aHex(sal)}$${aHex(new Uint8Array(digest))}`;
}

function aHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Genera y descarga un PDF con los datos enviados (la contraseña nunca se imprime). */
export function descargarPdfRegistro(datos: DatosRegistro, titulo: string): void {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(titulo, 20, 25);
  doc.setFontSize(11);
  doc.text(`Generado el ${new Date().toLocaleString('es-ES')}`, 20, 33);
  doc.line(20, 37, 190, 37);

  doc.setFontSize(13);
  const filas: [string, string][] = [
    ['Nombre completo', datos.nombre],
    ['Correo electrónico', datos.email],
    ['Fecha de nacimiento', formatearFecha(datos.fechaNacimiento)],
    ['Contraseña', '******** (cifrada)'],
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
