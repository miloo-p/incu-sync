import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EqCalc } from '../../../core/services/eq-calc';

@Component({
  selector: 'app-app-interface',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-interface.html',
  styleUrl: './app-interface.scss',
})
export class AppInterface {
  eqService = inject(EqCalc);

  private readonly svgWidth = 700;
  private readonly svgHeight = 400;
  private readonly paddingX = 50;
  private readonly paddingY = 40;

  draggingIndex: number | null = null;

  // View-Logik: Berechnet die X-Koordinate anhand des Frequenz-Index
  getXPosition(index: number): number {
    const usableWidth = this.svgWidth - this.paddingX * 2;
    const step = usableWidth / (this.eqService.frequencies.length - 1);
    return this.paddingX + index * step;
  }

  // View-Logik: Berechnet die Y-Koordinate anhand des Dezibel-Wertes
  getYPosition(dbValue: number): number {
    const usableHeight = this.svgHeight - this.paddingY * 2;
    const percentage = dbValue / 120;
    return this.paddingY + percentage * usableHeight;
  }

  // Erzeugt den String für die gezeichneten Linien im SVG
  getPolylinePoints(dbArray: number[]): string {
    return dbArray
      .map((db, index) => {
        const x = this.getXPosition(index);
        const y = this.getYPosition(db);
        return `${x},${y}`;
      })
      .join(' ');
  }

  // Aktualisiert die Werte, wenn der Nutzer unten in die Textfelder tippt
  onInputChange(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = parseInt(inputElement.value, 10);

    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > 120) value = 120;

    this.eqService.updateValue(index, value);
  }

  // Startet den Drag-Vorgang für einen bestimmten Punkt
  startDrag(event: MouseEvent, index: number) {
    event.preventDefault(); // Verhindert, dass der Browser Text markiert
    this.draggingIndex = index;
  }

  // Berechnet die neue Position während die Maus gezogen wird
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

  // Beendet den Drag-Vorgang, wenn die Maustaste losgelassen wird
  @HostListener('window:mouseup')
  stopDrag() {
    this.draggingIndex = null;
  }
}
