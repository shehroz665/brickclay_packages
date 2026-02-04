import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TableColumn, TableAction } from '../../models/grid.model';
import { CdkDragDrop, moveItemInArray, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
export type SortDirection = 'asc' | 'desc';
@Component({
  selector: 'bk-grid',
  standalone: true,
  imports: [CommonModule,DragDropModule,ScrollingModule],
  templateUrl: './grid.html',
  styleUrl: './grid.css',
})
export class GridComponent<T = any> {
  @Input() draggable: boolean = false;
  @Input() columns: TableColumn<T>[] = [];
  @Input() result!: T[];
  @Input() actions: TableAction[] = [];

  @Output() actionClick = new EventEmitter<{
    action: string;
    row: T;
  }>();

  @Output() sortChange = new EventEmitter<{
    columnIndex: number;
    column: TableColumn<T>;
    direction: SortDirection;
  }>();
  @Output() dragDropChange = new EventEmitter<T[]>();
  sortColumn?: keyof T;
  sortDirection:SortDirection = 'asc';

  @ViewChild('tableScrollContainer', { static: false })
  tableScrollContainer!: ElementRef<HTMLDivElement>;

  get firstVisibleColumnIndex(): number {
    const index = this.columns.findIndex(col => col.visible !== false);
    return index >= 0 ? index : 0;
  }
  /* ---------- Sorting ---------- */
  sort(column: TableColumn<T>, index: number) {
    if (!column.sortable || !column.field) return;

    // Toggle sort direction
    this.sortDirection =
      this.sortColumn === column.field ? (this.sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';

    this.sortColumn = column.field;

    // Emit sort change separately
    this.sortChange.emit({
      columnIndex: index,
      column,
      direction: this.sortDirection,
    });
  }

  /* ---------- Visibility ---------- */
  isColumnVisible(column: TableColumn<T>): boolean {
    return column.visible !== false;
  }

  /* ---------- Cell Value ---------- */
  getCellValue(row: T, column: TableColumn<T>): string {
    if (column.formatter) {
      return column.formatter(row);
    }
    if (column.field) {
      return String(row[column.field] ?? '');
    }
    return '';
  }

  /* ---------- Actions ---------- */
  emitAction(action: TableAction, row: T) {
    this.actionClick.emit({
      action: action.name,
      row,
    });
  }

  dropList(event: CdkDragDrop<T[]>) {
    if (!this.draggable || !this.result) return;

    moveItemInArray(this.result, event.previousIndex, event.currentIndex);

    // Update existing sortOrder on T
    this.result.forEach((item: any, index) => {
      item.sortOrder = index + 1;
    });

    // Emit reordered list
    this.dragDropChange.emit(this.result);
  }

  onDragMoved(event: CdkDragMove<any>) {
    if (!this.tableScrollContainer) return;

    const container = this.tableScrollContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    const pointerY = event.pointerPosition.y - rect.top;

    const threshold = 80;
    const maxSpeed = 25;

    if (pointerY < threshold) {
      const intensity = 1 - pointerY / threshold;
      container.scrollTop -= Math.min(maxSpeed, intensity * maxSpeed);
    } else if (pointerY > rect.height - threshold) {
      const intensity = 1 - (rect.height - pointerY) / threshold;
      container.scrollTop += Math.min(maxSpeed, intensity * maxSpeed);
    }
  }

  onDragStart(event: CdkDragStart<any>) {
    const row = event.source.element.nativeElement as HTMLElement;
    const cells = Array.from(row.querySelectorAll('td'));

    setTimeout(() => {
      const preview = document.querySelector('.cdk-drag-preview') as HTMLElement;

      if (!preview) return;

      const previewCells = preview.querySelectorAll('td');

      cells.forEach((cell, index) => {
        const width = cell.getBoundingClientRect().width + 'px';
        const previewCell = previewCells[index] as HTMLElement;

        if (previewCell) {
          previewCell.style.width = width;
          previewCell.style.minWidth = width;
          previewCell.style.maxWidth = width;
        }
      });
    });
  }
}
