import { Component, HostListener, inject } from '@angular/core';
import { EqCalc } from '../../../core/services/eq-calc';
import { Export } from '../../../core/services/export';
import { ExportBtn } from '../../../shared/components/export-btn/export-btn';

@Component({
  selector: 'app-app-interface',
  standalone: true,
  imports: [ExportBtn],
  templateUrl: './app-interface.html',
  styleUrl: './app-interface.scss',
})
export class AppInterface {
  eqService = inject(EqCalc);
  exportService = inject(Export);

  private readonly svgWidth = 700;
  private readonly svgHeight = 400;
  private readonly paddingX = 50;
  private readonly paddingY = 40;

  draggingIndex: number | null = null;

  getXPosition(index: number): number {
    const usableWidth = this.svgWidth - this.paddingX * 2;
    const step = usableWidth / (this.eqService.frequencies.length - 1);
    return this.paddingX + index * step;
  }

  getYPosition(dbValue: number): number {
    const usableHeight = this.svgHeight - this.paddingY * 2;
    const percentage = dbValue / 120;
    return this.paddingY + percentage * usableHeight;
  }

  getPolylinePoints(dbArray: number[]): string {
    return dbArray
      .map((db, index) => {
        const x = this.getXPosition(index);
        const y = this.getYPosition(db);
        return `${x},${y}`;
      })
      .join(' ');
  }

  onInputChange(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = parseInt(inputElement.value, 10);

    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > 120) value = 120;

    this.eqService.updateValue(index, value);
  }

  startDrag(event: MouseEvent, index: number) {
    event.preventDefault();
    this.draggingIndex = index;
  }

  @HostListener('window:mousemove', ['$event'])
  onDrag(event: MouseEvent) {
    if (this.draggingIndex === null) return;

    const svgElement = document.querySelector('.audiogram-svg') as SVGSVGElement;
    if (!svgElement) return;

    const rect = svgElement.getBoundingClientRect();
    const screenPercentageY = (event.clientY - rect.top) / rect.height;
    const viewBoxY = screenPercentageY * this.svgHeight;

    const usableHeight = this.svgHeight - this.paddingY * 2;
    const dbPercentage = (viewBoxY - this.paddingY) / usableHeight;

    let dbValue = Math.round(dbPercentage * 120);
    dbValue = Math.max(0, Math.min(120, dbValue));

    this.eqService.updateValue(this.draggingIndex, dbValue);
  }

  @HostListener('window:mouseup')
  stopDrag() {
    this.draggingIndex = null;
  }

  configDownload() {
    const configText = 'Preamp: -6 dB\nFilter: ON PK Fc 1000 Hz Gain 6 dB Q 1.41';
    const filename = 'config.txt';
    this.exportService.download(configText, filename);
  }
}
