import { app } from '../app-bridge';
export function desktopBridge(){return {revealPath:app.revealPath,agents:{copyReport:app.copyDiagnostics},pathForFile:app.pathForFile};}
