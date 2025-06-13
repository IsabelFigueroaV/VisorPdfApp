# 📘 GUÍA VISOR PDF – Paso a Paso

Esta guía explica cómo ejecutar, modificar y empaquetar la aplicación de escritorio **Visor PDF** desde el proyecto recuperado.

---

## 📁 Ubicación

El proyecto está ubicado en:  
`C:\Users\isabe\Desktop\PROYECTOS IFV 2025\VisorPdf`

---

## ✅ Pasos para ejecutar en desarrollo

### 1. Abrir en Visual Studio Code

```bash
cd "C:\Users\isabe\Desktop\PROYECTOS IFV 2025\VisorPdf"
code .
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

---

## 📦 Empaquetar como .exe

Si el proyecto incluye configuración con `electron-builder`:

```bash
npm run build
npm run dist
```

> El ejecutable aparecerá en `/dist/` o según la configuración definida.

---

## 🛠️ Estructura esperada

- `main.js` – Lógica principal de Electron
- `preload.js` – Comunicación segura entre frontend y backend
- `build/` – App React compilada
- `package.json` – Scripts y configuración
- `node_modules/` – Dependencias instaladas (no subir a GitHub)

---

## ☁️ Subir a GitHub

1. Inicializa el repositorio si es nuevo:
```bash
git init
git remote add origin https://github.com/tuusuario/Aplicacion-VisorPdf.git
```

2. Luego:

```bash
git add .
git commit -m "Subir base recuperada del Visor PDF"
git push -u origin main
```

---

✅ Proyecto recuperado y funcional para futuras mejoras y documentación profesional.
