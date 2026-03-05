
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
export type BkLoaderVariant = 'dots' | 'spinners';

@Component({
  selector: 'bk-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
})
export class BkLoader {
  @Input() loading = false;
  @Input() variant: BkLoaderVariant = 'dots';
  frontAfter = false;
  constructor() {
    const duration = 2000;
    const pause = 500;

    setInterval(() => {
      setTimeout(() => (this.frontAfter = !this.frontAfter), pause);
    }, duration + pause);
  }
}
