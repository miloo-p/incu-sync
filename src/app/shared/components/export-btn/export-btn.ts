import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-export-btn',
  imports: [],
  templateUrl: './export-btn.html',
  styleUrl: './export-btn.scss',
})
export class ExportBtn {
  /** Set by the parent; while true, the button can't be clicked. */
  disabled = input(false);

  /**
   * Fires when the user clicks the button.
   */
  btnClick = output<void>();

  /** Passes the click on to the parent via `btnClick`. */
  onButtonClick(): void {
    this.btnClick.emit();
  }
}
