import { Component, output } from '@angular/core';

@Component({
  selector: 'app-export-btn',
  imports: [],
  templateUrl: './export-btn.html',
  styleUrl: './export-btn.scss',
})
export class ExportBtn {
  btnClick = output<void>();

  /**
   * Fires when the user clicks the button.
   */
  onButtonClick(): void {
    console.log('test: onButtonClick');
    this.btnClick.emit();
  }
}
