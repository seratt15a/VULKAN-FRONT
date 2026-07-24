# VULKAN Front

Panel web para miembros, administradores y entrenadores del gimnasio VULKAN. React + Vite + TypeScript, sin backend todavía — todos los datos viven en memoria (`src/data`) y se mutan a través de `DataContext`.

## Requisitos

- Node.js 18+

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Cuentas de prueba

No hay backend real todavía: el login valida contra `src/lib/demoAccounts.ts`. Contraseña para todas las cuentas: `vulkan2026`.

| Rol | Correo |
| --- | --- |
| Administrador | `admin@vulkangym.com` |
| Recepción | `recepcion@vulkangym.com` |
| Miembro | `andres.reyes@gmail.com` (y el resto de correos en `demoAccounts.ts`) |
| Entrenador | `marco.diaz@vulkangym.com` (y el resto) |

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — type-check + build de producción a `dist/`
- `npm run preview` — sirve el build de producción localmente
- `npm run lint` — oxlint
- `npm test` — pruebas (Vitest)

## Funcionalidad

- **Miembro**: reservar clases (con lista de espera cuando están llenas), ver su rutina asignada (con foto real del ejercicio), gestionar membresía (cambiar plan, solicitar pausa, ver paquetes de sesiones), perfil con progreso físico (peso, medidas, fotos, logros).
- **Entrenador**: horario, marcar asistencia real de sus alumnos, asignarles rutinas eligiendo el ejercicio de una librería (foto garantizada, no adivinada), registrar mediciones corporales.
- **Administrador**: dashboard con gráficas, check-in general de gimnasio, CRUD de miembros/clases/entrenadores (con aviso si un entrenador queda en dos clases al mismo horario), vista calendario de clases, pagos, venta y seguimiento de paquetes de sesiones, aprobar/rechazar solicitudes de pausa, exportar miembros/pagos a CSV.
- **Recepción**: rol limitado solo a check-in y pagos, sin acceso a CRUD completo ni reportes financieros.

## Estructura

```
src/
  components/     UI compartida (Modal, ConfirmDialog, Badge, StatCard, ExerciseAnimation, charts...)
  context/        AuthContext, DataContext, ToastContext — estado global
  data/           Tipos y datos mock (members, trainers, classes, payments, workoutPlans, sessionPackages)
  lib/            Utilidades: formato, logros, notificaciones, cuentas demo, librería de ejercicios, csv
  pages/
    admin/        Dashboard, Check-in, Miembros, Clases, Entrenadores, Pagos, Paquetes
    member/       Dashboard, Clases, Mi Rutina, Membresía, Perfil
    trainer/      Horario, Alumnos, Perfil
    CheckIn.tsx   Compartida entre Admin y Recepción
```

## Conectar un backend real

Todo el estado mutable pasa por dos únicos puntos, pensados para reemplazarse por llamadas HTTP sin tocar las páginas:

- `AuthContext.login(email, password)` — hoy revisa `demoAccounts.ts`; cámbialo por tu endpoint de auth.
- `DataContext` — cada acción (`addMember`, `updateClass`, `markPaymentStatus`, etc.) hoy actualiza estado local; cámbialas por `fetch`/mutaciones a tu API.

Actualmente el estado de `DataContext` se persiste en `localStorage` para que los cambios sobrevivan a un refresh mientras no hay backend — quítalo cuando la fuente de verdad sea la API.
