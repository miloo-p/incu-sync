import { Component, output } from '@angular/core';

@Component({
  selector: 'app-export-btn',
  imports: [],
  templateUrl: './export-btn.html',
  styleUrl: './export-btn.scss',
})
export class ExportBtn {
  /**
   * Fires when the user clicks the button.
   */
  btnClick = output<void>();

  /** Passes the click on to the parent via `btnClick`. */
  onButtonClick(): void {
    this.btnClick.emit();
  }
}
