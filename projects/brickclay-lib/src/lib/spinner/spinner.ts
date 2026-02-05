import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Mapped names to your 5 sizes
export type SpinnerSize = 'xsm' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'bk-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class BkSpinner {
  @Input() size: SpinnerSize = 'md';
  @Input() show = true;
  @Input() color = 'text-blue-600'; // default

  get classes(): string {
    return `spinner ${this.size} ${this.color}`;
  }
}
