import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent implements OnInit, OnDestroy {
  @Output() scanned = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('videoEl', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;

  stream: MediaStream | null = null;
  detector: any = null;
  running = signal(false);
  notSupported = signal(false);
  permissionError = signal<string | null>(null);
  devices: MediaDeviceInfo[] = [];
  selectedDeviceId: string | null = null;
  private rafId: number | null = null;
  private lastDetect = 0;
  // ZXing fallback
  private zxingReader: any = null;
  private zxingControls: any = null;
  private usingZXing = false;
  insecureContext = false;
  // Require explicit user gesture on platforms that block autoplay
  startRequired = signal(true);

  async ngOnInit() {
    // Feature detection
    const supportsBarcode = 'BarcodeDetector' in window;
    // Secure context check (required for camera on most platforms; iOS blocks http over LAN)
    this.insecureContext = !window.isSecureContext && location.hostname !== 'localhost' && !this.isElectronEnv();
    if (!supportsBarcode) {
      this.notSupported.set(true);
      // Still try to open camera to show preview, but no decoding fallback included
    } else {
      // @ts-ignore
      this.detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
    }
    await this.initDevices();
    // Do not auto-start: some platforms require a user gesture; show Start button
    this.startRequired.set(true);
  }

  ngOnDestroy(): void {
    this.stop();
  }

  async initDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter(d => d.kind === 'videoinput');
      if (this.devices.length) {
        // Try to pick back camera if label mentions back/environment
        const back = this.devices.find(d => /back|rear|environment/i.test(d.label));
        this.selectedDeviceId = (back || this.devices[0]).deviceId;
      }
    } catch {
      // ignore
    }
  }

  async start() {
    try {
      this.stop();
      const constraints: MediaStreamConstraints = {
        video: this.selectedDeviceId ? { deviceId: { exact: this.selectedDeviceId } } : { facingMode: { ideal: 'environment' } },
        audio: false
      };
      if (this.insecureContext) {
        console.warn('Contexto no seguro: algunas plataformas bloquearán la cámara. Usa HTTPS o localhost.');
      }
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();
      this.running.set(true);
      this.permissionError.set(null);
      this.startRequired.set(false);
      if (this.detector) {
        // Native BarcodeDetector
        this.usingZXing = false;
        this.scanLoop();
      } else {
        // ZXing fallback (dynamic import)
        try {
          const mod = await import('@zxing/browser');
          const BrowserQRCodeReader = (mod as any).BrowserQRCodeReader;
          this.zxingReader = new BrowserQRCodeReader();
          this.usingZXing = true;
          this.notSupported.set(false);
          const deviceId = this.selectedDeviceId || undefined;
          this.zxingControls = await this.zxingReader.decodeFromVideoDevice(
            deviceId,
            video,
            (result: any, err: any, controls: any) => {
              if (result) {
                try {
                  const value = (typeof result.getText === 'function' ? result.getText() : result.text) ?? '';
                  const trimmed = String(value).trim();
                  if (trimmed) {
                    this.scanned.emit(trimmed);
                    this.stop();
                    this.closed.emit();
                  }
                } catch {
                  // ignore decode errors
                }
              }
            }
          );
        } catch (e) {
          console.warn('ZXing no disponible, sin decodificación de QR', e);
          this.notSupported.set(true);
        }
      }
    } catch (e: any) {
      console.error('No se pudo iniciar la cámara', e);
      this.running.set(false);
      // Mensajes comprensibles para el usuario
      const name = e?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        this.permissionError.set('Permiso de cámara denegado. Ve a la configuración del navegador/SO y permite el acceso a la cámara para este sitio.');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        this.permissionError.set('No se encontró una cámara disponible o no coincide con el dispositivo seleccionado. Conecta una cámara y vuelve a intentar.');
      } else if (name === 'NotReadableError') {
        this.permissionError.set('La cámara está siendo usada por otra aplicación. Ciérrala e inténtalo de nuevo.');
      } else if (this.insecureContext) {
        this.permissionError.set('Este sitio no está en un contexto seguro. Usa HTTPS o localhost para permitir la cámara.');
      } else {
        this.permissionError.set('No se pudo acceder a la cámara. Revisa permisos, dispositivos y prueba otro navegador.');
      }
    }
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.zxingControls && typeof this.zxingControls.stop === 'function') {
      try { this.zxingControls.stop(); } catch {}
      this.zxingControls = null;
    }
    if (this.zxingReader && typeof this.zxingReader.reset === 'function') {
      try { this.zxingReader.reset(); } catch {}
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.running.set(false);
  }

  async changeDevice(id: string) {
    this.selectedDeviceId = id;
    await this.start();
  }

  private scanLoop = async () => {
    const now = performance.now();
    // Throttle detection to every ~250ms
    if (now - this.lastDetect > 250) {
      this.lastDetect = now;
      try {
        const video = this.videoRef.nativeElement;
        if (!this.usingZXing && this.detector && video.readyState >= 2) {
          const codes = await this.detector.detect(video as any);
          if (Array.isArray(codes) && codes.length) {
            const value = String(codes[0].rawValue || '').trim();
            if (value) {
              this.scanned.emit(value);
              // Stop after first successful scan
              this.stop();
              this.closed.emit();
              return;
            }
          }
        }
      } catch (e) {
        // keep trying silently
      }
    }
    this.rafId = requestAnimationFrame(this.scanLoop);
  };

  private isElectronEnv(): boolean {
    // UA check is safer with contextIsolation enabled (window.process may be undefined)
    return typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent);
  }
}
