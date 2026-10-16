import { Injectable, signal } from '@angular/core';

/** Gestiona el modo oscuro de toda la app (compartido por las dos páginas). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Modo oscuro activado */
  public darkMode = signal<boolean>(false);

  constructor() {
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
    this.aplicar(prefiereOscuro);
  }

  public toggle(): void {
    this.aplicar(!this.darkMode());
  }

  private aplicar(oscuro: boolean): void {
    this.darkMode.set(oscuro);
    document.documentElement.classList.toggle('ion-palette-dark', oscuro);
    try {
      localStorage.setItem('tema-oscuro', String(oscuro));
    } catch {
      /* almacenamiento no disponible */
    }
  }
}
