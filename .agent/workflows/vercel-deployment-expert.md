---
description: Vercel Deployment Expert - Audit, troubleshoot, and force robust deployments on Vercel
---

# Vercel Deployment & Debugging Workflow

Esta es la skill especializada de Antigravity para auditar aplicaciones Next.js/React, solucionar errores de compilación, resolver problemas de enrutamiento (como el infame error 404) y lograr despliegues exitosos y resilientes en Vercel.

Siempre sigue estos pasos de manera rigurosa cuando el usuario reporte fallos en Vercel:

## Paso 1: Auditoría de Configuración y Deprecaciones
- Revisa `next.config.ts` (o `.js`) y `package.json`.
- **Acción:** Elimina configuraciones obsoletas que puedan fallar en el entorno CI de Vercel. Por ejemplo, elimina bloques `eslint` de `next.config.ts` si Next.js avisa que no están soportados o si la sintaxis ha cambiado.
- **Acción:** Verifica la versión de Next.js. Si es Next.js 15+, asegúrate de que el archivo `middleware.ts` esté renombrado a `proxy.ts` (y su función exportada sea `export function proxy(...)`), ya que la convención `middleware` está deprecada.

## Paso 2: Prevención de Caídas en Pre-renderizado (Build-Time)
El error más común de despliegue (que resulta en rutas 404) es que Next.js intenta pre-renderizar estáticamente páginas que requieren dependencias de variables de entorno (como un cliente de Supabase) que aún no están disponibles durante la fase de Build en Vercel.
- **Acción:** Inyecta valores de prueba (fallbacks) directamente en el bloque `env` de `next.config.ts` para que nunca devuelvan `undefined` en el prerender:
  ```typescript
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key',
  }
  ```
- **Acción:** En rutas críticas como `/login` o paneles privados, fuerza el renderizado dinámico añadiendo en la primera línea del archivo:
  `export const dynamic = 'force-dynamic';`

## Paso 3: Integridad de Rutas y Case Sensitivity
Vercel utiliza sistemas de archivos sensibles a mayúsculas y minúsculas (Linux), a diferencia de macOS o Windows.
- **Acción:** Verifica usando la terminal que todos los nombres de las carpetas en `src/app` estén estrictamente en minúsculas (ej. `src/app/login`, no `src/app/Login`).

## Paso 4: Tácticas de Bypass Agresivo para Diagnóstico (Si el 404 persiste)
Si el despliegue es "exitoso" pero la web no carga, aísla el problema anulando la complejidad paso a paso:
1. **Desactiva el Middleware/Proxy:** Renómbralo a `proxy.ts.old` o comenta todo su contenido para asegurar que ninguna regla interna esté creando un bucle infinito o bloqueando rutas.
2. **Hardcodea la Landing Page:** Reemplaza `src/app/page.tsx` por HTML plano sin componentes de servidor ni consultas a bases de datos.
3. **Crea un Ping-Test:** Crea una ruta `src/app/test-view/page.tsx` con un simple texto verde "CONEXIÓN EXITOSA". Si Vercel renderiza esto, el enrutador funciona y el error está en la aplicación, no en Vercel.

## Paso 5: Simulación Local Restrictiva
Nunca asumas que un commit corregirá el problema en Vercel sin probarlo antes.
- **Acción:** Ejecuta obligatoriamente `npm run build` en el entorno local.
- **Comprobación:** El proceso de compilación debe finalizar con `Exit code: 0` impecable. Si hay algún warning o aborto de pre-renderizado, corrígelo antes de subirlo.

// turbo-all
## Paso 6: Commit y Push Forzado
- Una vez que la compilación local es exitosa (Exit Code 0), consolida los cambios y envíalos a GitHub automáticamente para disparar el Webhook de Vercel y reconstruir el proyecto.
```bash
git add .
git commit -m "Vercel Expert: Audit, fix configuration and force build resilience"
git push
```

## Paso 7: Confirmación y Análisis de Logs
- Instruye al usuario para que verifique la pestaña "Deployments" en Vercel y monitoree el log en tiempo real de ser necesario.
- Pide confirmación específica sobre la carga de las rutas de "Ping-Test" ("/test-view").
