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

  onButtonClick(): void {
    console.log('test: onButtonClick');
    this.btnClick.emit();
  }
}
