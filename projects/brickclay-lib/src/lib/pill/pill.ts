import { Component, EventEmitter, Input, Output } from '@angular/core';
export type PillVariant = 'Light' | 'Solid' | 'Outline' | 'Transparent';
export type PillColor = 'Gray' | 'Primary' | 'Error' | 'Warning' | 'Success' | 'Purple' | 'Cyan';
export type PillSize = 'xsm' |'sm' | 'md' | 'lg';
@Component({
  selector: 'bk-pill',
  standalone: true,
  templateUrl: './pill.html',
  styleUrl: './pill.css',
})
export class PillComponent {
  @Input() label: string = '';
  @Input() variant: PillVariant = 'Light';
  @Input() color: PillColor = 'Gray';
  @Input() size: PillSize = 'md';
  @Input() dot: 'left' | 'right' | 'none' = 'none';
  @Input() removable: boolean = false;
  @Input() customClass: string = '';

  @Output() clicked = new EventEmitter<string>();

  get containerClasses(): string {
    // 1. Size Class
    const sizeClass = `pill-${this.size}`;

    // 2. Color/Variant Class (Dynamic Generation)
    const styleClass = `${this.color}-${this.variant}`;

    // 3. customClasses
    const customClass = `${this.customClass}`;

    return `pill ${sizeClass} ${styleClass} ${customClass}`;
  }

  onRemove(e: Event) {
    e.stopPropagation();
    this.clicked.emit(this.label);
  }
}
