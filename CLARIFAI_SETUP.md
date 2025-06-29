# Configuración de Clarifai AI

## ¿Qué es Clarifai?

Clarifai es una plataforma de IA que ofrece análisis de imágenes avanzado. Para este proyecto de emergencias, usamos Clarifai para:

- **Detección de objetos** en imágenes de accidentes
- **Análisis de colores** para detectar sangre o fuego
- **Detección de caras** para contar heridos
- **Análisis de contenido** para detectar falsas alarmas
- **Evaluación de calidad** de las imágenes

## Plan Gratuito

Clarifai ofrece un plan gratuito que incluye:
- **5,000 llamadas por mes** sin costo
- Acceso a todos los modelos básicos
- Sin tarjeta de crédito requerida
- Perfecto para desarrollo y pruebas

## Cómo obtener tu API Key gratuita

### Paso 1: Crear cuenta
1. Ve a [clarifai.com](https://clarifai.com/)
2. Haz clic en "Sign Up" o "Get Started"
3. Completa el registro con tu email

### Paso 2: Obtener API Key
1. Inicia sesión en tu cuenta
2. Ve a tu perfil (icono de usuario en la esquina superior derecha)
3. Selecciona "Security" o "API Keys"
4. Copia tu API Key principal

### Paso 3: Configurar en el proyecto
1. Abre el archivo `src/config/clarifai.ts`
2. Reemplaza `'YOUR_CLARIFAI_API_KEY'` con tu API key real
3. Guarda el archivo

```typescript
export const CLARIFAI_CONFIG = {
  API_KEY: 'tu-api-key-aqui', // Reemplaza con tu API key real
  // ... resto de la configuración
};
```

## Modelos utilizados

El proyecto usa estos modelos de Clarifai:

| Modelo | Propósito |
|--------|-----------|
| `general-image-recognition` | Detección general de objetos |
| `face-detection` | Detección y conteo de personas |
| `nsfw-recognition` | Detección de contenido inapropiado |
| `color-recognition` | Análisis de colores predominantes |
| `focus` | Evaluación del enfoque de la imagen |
| `quality` | Evaluación de la calidad de la imagen |

## Funcionalidades implementadas

### 1. Análisis Automático de Imágenes
- **Detección de tipo de accidente**: Choque, caída, quemadura, atropello
- **Conteo de heridos**: Basado en detección de caras
- **Evaluación de gravedad**: Triaje automático (Rojo/Amarillo/Verde)
- **Detección de falsas alarmas**: Identifica bromas o contenido no médico

### 2. Generación de Datos de Triaje
- **Estado de consciencia**: Basado en análisis de la imagen
- **Respiración**: Evaluación automática
- **Movimiento**: Capacidad de movimiento
- **Sangrado**: Detección de presencia de sangre

### 3. Descripción Automática
- Lista de objetos detectados
- Colores predominantes
- Número de personas identificadas
- Calidad y enfoque de la imagen

## Ventajas sobre otros servicios

### vs TensorFlow.js (Local)
- ✅ **Más preciso**: Modelos entrenados con millones de imágenes
- ✅ **Más rápido**: Análisis en la nube, no consume recursos del dispositivo
- ✅ **Más modelos**: Acceso a modelos especializados
- ✅ **Mejor detección**: Mayor precisión en análisis médico

### vs Google Cloud Vision
- ✅ **Gratuito**: 5,000 llamadas vs 1,000 llamadas
- ✅ **Más simple**: Configuración más fácil
- ✅ **Mejor documentación**: Tutorials más claros
- ✅ **Sin tarjeta**: No requiere tarjeta de crédito

### vs Azure Computer Vision
- ✅ **Plan gratuito**: Más generoso que Azure
- ✅ **Mejor rendimiento**: Análisis más rápido
- ✅ **Más modelos**: Mayor variedad de modelos disponibles

## Solución de problemas

### Error: "Clarifai API key no está configurada"
1. Verifica que hayas reemplazado la API key en `src/config/clarifai.ts`
2. Asegúrate de que la API key sea válida
3. Reinicia la aplicación

### Error: "Rate limit exceeded"
- Has alcanzado el límite de 5,000 llamadas por mes
- Espera hasta el próximo mes o considera un plan de pago

### Error: "Invalid API key"
- Verifica que la API key sea correcta
- Asegúrate de que tu cuenta esté activa
- Intenta generar una nueva API key

### Análisis no funciona
- Verifica tu conexión a internet
- Asegúrate de que la imagen sea válida (JPG, PNG, GIF)
- Revisa la consola del navegador para errores específicos

## Monitoreo de uso

Para monitorear tu uso de Clarifai:
1. Ve a tu dashboard en clarifai.com
2. Revisa la sección "Usage" o "Analytics"
3. Verifica cuántas llamadas has usado este mes

## Seguridad

- **Nunca compartas** tu API key públicamente
- **No subas** la API key a repositorios públicos
- **Usa variables de entorno** en producción
- **Rota la API key** regularmente

## Soporte

Si tienes problemas:
1. Revisa la [documentación de Clarifai](https://docs.clarifai.com/)
2. Consulta el [foro de la comunidad](https://community.clarifai.com/)
3. Contacta al soporte de Clarifai

## Próximos pasos

Una vez configurado Clarifai, podrás:
1. Usar el análisis automático de imágenes
2. Detectar falsas alarmas automáticamente
3. Obtener evaluaciones de triaje precisas
4. Mejorar la eficiencia del sistema de emergencias 