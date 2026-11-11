# NOVA 3D Engine V0.1

A Windows desktop 3D engine prototype built with Electron and a renderer written directly against WebGL 2. It does **not** use Three.js, Babylon.js, Unity, or Unreal.

## Requirements

- Windows 10/11
- Node.js 20+ (LTS recommended)
- npm
- A graphics driver / GPU supporting WebGL 2

## Run from source

1. Extract this project folder.
2. Open PowerShell in the project folder.
3. Run:

   ```powershell
   npm install
   npm start
   ```

## Build a Windows installer

Run:

```powershell
npm install
npm run dist
```

The installer will be created in `dist/` as a Windows NSIS installer.

## Controls

- Right mouse button + drag: look around
- W / A / S / D: move camera
- Q / E: move down / up
- Shift: move faster
- Reset Camera: restore the starting view
- Wireframe: toggle mesh wireframe mode
- Inspector: edit the main cube's position, rotation and scale

## What is implemented

- Electron desktop shell with context isolation and Node integration disabled
- WebGL 2 context and shader compilation
- Custom vector and 4x4 matrix math
- Perspective projection and look-at camera
- Indexed cube geometry with face normals
- Directional diffuse + ambient + specular lighting
- Procedural editor grid
- Three scene objects
- Camera navigation and transform inspector
- FPS and frame-time display
- Solid / wireframe toggle

## V0.1 limitations

This is an engine foundation, not yet a full production editor. The Play button is currently a UI state toggle. Physics, shadows, asset importing, scene serialization, scripting, picking, and a real game runtime are planned for later versions.

## Architecture

- `src/math.js` — vector and matrix math
- `src/geometry.js` — cube and grid mesh generation
- `src/shaders.js` — GLSL 300 ES shaders
- `src/camera.js` — editor camera
- `src/renderer.js` — WebGL 2 rendering pipeline
- `src/app.js` — editor UI and main loop
- `main.js` — Electron desktop window


## Build without installing Node.js on your own PC

This project includes `.github/workflows/build-windows.yml`. If you upload the project to a GitHub repository:
1. Open the repository's **Actions** tab.
2. Select **Build NOVA for Windows**.
3. Choose **Run workflow**.
4. When it finishes, download the `NOVA-3D-Engine-Windows` artifact.

GitHub's hosted Windows build machine installs Node.js and builds both a portable EXE and an installer. You do not install Node.js locally. A GitHub account and repository are required for this route.

The renderer is bundled with esbuild before launch/package, so the packaged Electron app loads a single local JavaScript file rather than relying on browser module imports from `file://` URLs.
