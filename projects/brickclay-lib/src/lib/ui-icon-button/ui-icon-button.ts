import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconButtonSize = 'xxsm' | 'xsm' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type IconButtonVariant = 'primary' | 'secondary';

@Component({
  selector: 'bk-icon-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-icon-button.html',
  styleUrl: './ui-icon-button.css',
})
export class UiIconButton {
  // --- Inputs ---
  @Input() icon!: string; // Required icon path
  @Input() alt: string = 'icon';
  @Input() variant: IconButtonVariant = 'primary';
  @Input() size: IconButtonSize = 'md';

  @Input() disabled: boolean = false;

  // Custom classes
  @Input() buttonClass: string = '';

  @Output() clicked = new EventEmitter<boolean>();

  onClick(event: Event) {
    if (!this.disabled) {
      this.clicked.emit(true);
    }
  }

  get buttonClasses(): string {
    // Maps inputs to CSS classes: .btn-icon .primary .md
    return `btn-icon ${this.variant} ${this.size} ${this.buttonClass}`;
  }
}
