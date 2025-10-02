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
  devices: MediaDeviceInfo[] = [];
  selectedDeviceId: string | null = null;
  private rafId: number | null = null;
  private lastDetect = 0;

  async ngOnInit() {
    // Feature detection
    const supportsBarcode = 'BarcodeDetector' in window;
    if (!supportsBarcode) {
      this.notSupported.set(true);
      // Still try to open camera to show preview, but no decoding fallback included
    } else {
      // @ts-ignore
      this.detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
    }
    await this.initDevices();
    await this.start();
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
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();
      this.running.set(true);
      if (this.detector) this.scanLoop();
    } catch (e) {
      console.error('No se pudo iniciar la cámara', e);
      this.running.set(false);
    }
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
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
        if (this.detector && video.readyState >= 2) {
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
}
