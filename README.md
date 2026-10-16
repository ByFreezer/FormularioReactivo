# FormularioReactivo

Proyecto Ionic + Angular (standalone) con un formulario reactivo de registro en dos versiones para comparar los modelos de formularios de Angular:

| Página | Ruta | Modelo |
|---|---|---|
| `RegistroPage` | `/registro` | Reactive Forms |
| `DrivenPage` | `/driven` | Template-driven Forms |

Las dos tienen los mismos campos, validaciones y funciones (los botones de la cabecera permiten saltar de una a otra). El código común (cifrado, PDF, mensajes, tema) está en `src/app/shared/`.

### Comparativa

| | Reactive | Template-driven |
|---|---|---|
| Dónde se define el formulario | TypeScript (`FormBuilder`, `FormGroup`) | HTML (`ngModel` + atributos) |
| Validadores propios | Una función (`fechaNoFutura`) | Una directiva (`FechaNoFuturaDirective`) |
| Mostrar todos los errores al enviar | `markAllAsTouched()` | Recorrer `form.controls` a mano |
| Módulo | `ReactiveFormsModule` | `FormsModule` |
| Reset | `form.reset()` | `form.resetForm({...})` |


- Validaciones: nombre (mín. 3), email, contraseña (mín. 8, letras y números) y fecha de nacimiento (obligatoria, no posterior a hoy).
- Al enviar: alert de confirmación.
- Botón de modo oscuro (se recuerda en localStorage).
- La contraseña se cifra (SHA-256 + sal) antes de construir el payload; no se muestra en claro en consola.
- Diseño responsive (mobile-first).
- Botón para descargar en PDF los datos del último formulario enviado (jsPDF).

## Ejecutar

```bash
npm install
ionic serve         # abre http://localhost:8100
# (si no tienes el CLI global: npx ionic serve)
```

## Build de producción (Vercel)

```bash
npm run build       # genera la carpeta www/
```
