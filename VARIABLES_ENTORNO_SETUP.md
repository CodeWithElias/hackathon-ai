# Configuración de Variables de Entorno

## Resumen

Se ha implementado un sistema seguro de configuración usando variables de entorno para todas las APIs del proyecto. Esto mejora significativamente la seguridad y flexibilidad del sistema.

## Archivos Creados/Modificados

### Nuevos Archivos
- `env.example` - Archivo de ejemplo con todas las variables
- `VARIABLES_ENTORNO_SETUP.md` - Esta documentación

### Archivos Modificados
- `src/config/googleCloud.ts` - Migrado a variables de entorno
- `src/config/clarifai.ts` - Migrado a variables de entorno
- `src/components/user/GoogleCloudConfig.tsx` - Actualizado para mostrar estado
- `GOOGLE_CLOUD_SETUP.md` - Documentación actualizada

## Variables de Entorno Disponibles

### Google Cloud Gemini API
```bash
VITE_GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
VITE_GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
VITE_GOOGLE_CLOUD_LOCATION=us-central1
VITE_GOOGLE_CLOUD_MODEL=gemini-1.5-flash
```

### Clarifai API (Opcional)
```bash
VITE_CLARIFAI_API_KEY=your_clarifai_api_key_here
```

### Configuración de la Aplicación
```bash
VITE_APP_NAME=Alerta Médica Bolivia
VITE_APP_VERSION=2.0.0
VITE_APP_ENVIRONMENT=development
```

### Configuración de Mapas (Opcional)
```bash
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

## Cómo Configurar

### Paso 1: Crear archivo .env
```bash
# En la raíz del proyecto
cp env.example .env
```

### Paso 2: Editar variables
```bash
# Abre .env y reemplaza los valores
VITE_GOOGLE_CLOUD_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
VITE_GOOGLE_CLOUD_PROJECT_ID=my-emergency-project-123456
```

### Paso 3: Reiniciar aplicación
```bash
npm run dev
```

## Ventajas Implementadas

### 🔒 Seguridad Mejorada
- **Sin claves en código**: Las API keys no están hardcodeadas
- **Prevención de commits**: `.env` está en `.gitignore`
- **Configuración por ambiente**: Diferentes configuraciones según el entorno
- **Estándares de seguridad**: Cumple mejores prácticas

### 🔧 Flexibilidad
- **Cambio fácil**: Modificar APIs sin tocar código
- **Colaboración segura**: Equipos pueden usar sus propias claves
- **Despliegue simplificado**: Configuración automática por ambiente
- **Debugging mejorado**: Variables centralizadas

### 📊 Monitoreo
- **Estado visual**: El componente muestra el estado de configuración
- **Validación automática**: Verifica que las variables estén configuradas
- **Información detallada**: Muestra qué está configurado y qué no
- **Errores claros**: Mensajes específicos cuando falta configuración

## Funciones de Validación

### Google Cloud
```typescript
// Verificar si está configurado
isGoogleCloudConfigured(): boolean

// Obtener API key
getGoogleCloudApiKey(): string

// Obtener Project ID
getGoogleCloudProjectId(): string

// Información completa
getGoogleCloudConfigInfo(): object
```

### Clarifai
```typescript
// Verificar si está configurado
isClarifaiConfigured(): boolean

// Obtener API key
getClarifaiApiKey(): string

// Información completa
getClarifaiConfigInfo(): object
```

## Componente de Configuración

El componente `GoogleCloudConfig.tsx` ahora:

### ✅ Muestra Estado
- Configuración completa/incompleta
- Estado de cada variable
- Información del modelo y región
- Ambiente actual

### 📋 Instrucciones Claras
- Pasos paso a paso
- Enlaces directos a Google Cloud
- Explicación de variables de entorno
- Copia automática del ejemplo

### 🔍 Validación Visual
- Indicadores de estado (✓/✗)
- Colores según configuración
- Información detallada
- Mensajes de error claros

## Configuración por Ambiente

### Desarrollo
```bash
# .env.development
VITE_APP_ENVIRONMENT=development
VITE_GOOGLE_CLOUD_MODEL=gemini-1.5-flash
VITE_APP_DEBUG=true
```

### Producción
```bash
# .env.production
VITE_APP_ENVIRONMENT=production
VITE_GOOGLE_CLOUD_MODEL=gemini-1.5-pro
VITE_APP_DEBUG=false
```

### Testing
```bash
# .env.test
VITE_APP_ENVIRONMENT=test
VITE_GOOGLE_CLOUD_MODEL=gemini-1.5-flash
VITE_APP_DEBUG=true
```

## Solución de Problemas

### Variables no se cargan
```bash
# Verificar que el archivo existe
ls -la .env

# Verificar formato
cat .env

# Reiniciar servidor
npm run dev
```

### Error de API key
```bash
# Verificar variable
echo $VITE_GOOGLE_CLOUD_API_KEY

# Verificar en .env
grep VITE_GOOGLE_CLOUD_API_KEY .env
```

### Configuración incorrecta
```bash
# Verificar todas las variables
grep VITE_ .env

# Verificar formato
cat .env | grep -v "^#" | grep -v "^$"
```

## Mejores Prácticas

### ✅ Hacer
- Usar `VITE_` como prefijo para variables del cliente
- Documentar todas las variables en `env.example`
- Validar variables al inicio de la aplicación
- Usar tipos TypeScript para las variables
- Proporcionar valores por defecto seguros

### ❌ No Hacer
- Subir `.env` a repositorios públicos
- Usar claves hardcodeadas en el código
- Exponer variables sensibles en logs
- Usar variables sin validar
- Olvidar documentar variables nuevas

## Migración de Código

### Antes (Hardcodeado)
```typescript
export const GOOGLE_CLOUD_CONFIG = {
  API_KEY: 'YOUR_GOOGLE_CLOUD_API_KEY',
  PROJECT_ID: 'YOUR_PROJECT_ID'
};
```

### Después (Variables de Entorno)
```typescript
export const GOOGLE_CLOUD_CONFIG = {
  API_KEY: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY || 'YOUR_GOOGLE_CLOUD_API_KEY',
  PROJECT_ID: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID || 'YOUR_PROJECT_ID'
};
```

## Próximos Pasos

### Inmediatos
1. **Configurar Google Cloud** siguiendo `GOOGLE_CLOUD_SETUP.md`
2. **Crear archivo `.env`** usando `env.example`
3. **Probar configuración** con imágenes reales
4. **Validar seguridad** verificando que `.env` no se suba

### A Mediano Plazo
1. **Implementar validación** más robusta de variables
2. **Agregar más servicios** (Azure, AWS, etc.)
3. **Configurar CI/CD** con variables seguras
4. **Implementar rotación** automática de claves

### A Largo Plazo
1. **Sistema de gestión** de secretos
2. **Integración con Vault** o similar
3. **Monitoreo automático** de uso de APIs
4. **Alertas de seguridad** para claves expiradas

## Conclusión

La implementación de variables de entorno representa una mejora significativa en la seguridad y mantenibilidad del proyecto. Ahora:

- ✅ **Las API keys están seguras** y no se exponen en el código
- ✅ **La configuración es flexible** y fácil de cambiar
- ✅ **El desarrollo es más seguro** para equipos
- ✅ **El despliegue es más profesional** y escalable
- ✅ **La documentación es clara** y completa

Esta implementación sigue las mejores prácticas de la industria y prepara el proyecto para un entorno de producción profesional. 