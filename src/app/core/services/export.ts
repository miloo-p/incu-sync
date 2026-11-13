import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Export {
  /**
   * Starts a browser download of the given text, saved under the given file name.
   *
   * @param content - The text to save, e.g. a generated `config.txt`.
   * @param fileName - Name of the downloaded file, including its extension.
   */
  download(content: string, fileName: string): void {
    const blobParts = [content];
    const blob = new Blob(blobParts, { type: 'text/plain' });
    const blobURL = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');

    downloadLink.href = blobURL;
    downloadLink.download = fileName;
    downloadLink.click();

    URL.revokeObjectURL(blobURL);
  }
}
