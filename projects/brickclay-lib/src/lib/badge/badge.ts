import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'Light' | 'Solid' | 'Outline' | 'Transparent';
export type BadgeColor = 'Gray' | 'Primary' | 'Error' | 'Warning' | 'Success' | 'Purple' | 'Cyan';
export type BadgeSize = 'xsm' |'sm' | 'md' | 'lg';

@Component({
  selector: 'brickclay-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.html',
  styleUrls: ['./badge.css'],
})
export class BadgeComponent {
  @Input() label: string = '';
  @Input() variant: BadgeVariant = 'Light';
  @Input() color: BadgeColor = 'Gray';
  @Input() size: BadgeSize = 'md';
  @Input() dot: 'left' | 'right' | 'none' = 'none';
  @Input() removable: boolean = false;
  @Input() customClass: string = '';

  @Output() clicked = new EventEmitter<string>();

  get containerClasses(): string {
    // 1. Size Class
    const sizeClass = `badge-${this.size}`;

    // 2. Color/Variant Class (Dynamic Generation)
    const styleClass = `${this.color}-${this.variant}`;

    // 3. customClasses
    const customClass = `${this.customClass}`;
    return `badge ${sizeClass} ${styleClass} ${customClass}`;
  }

  onRemove(e: Event) {
    e.stopPropagation();
    this.clicked.emit(this.label);
  }
}
