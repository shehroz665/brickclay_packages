import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDragMove, CdkDragStart, CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BKTooltipDirective } from '../../../tooltip/tooltip.directive';
import { BkBadge } from '../../../badge/badge';
import { TableAction, TableBadge, TableColumn, TableIcon } from '../../models/grid.model';
import { BkCheckbox } from '../../../checkbox/checkbox';
export type SortDirection = 'asc' | 'desc';
@Component({
  selector: 'bk-grid',
  standalone: true,
  imports: [CommonModule,DragDropModule,ScrollingModule,BkBadge,BKTooltipDirective,BkCheckbox,FormsModule],
  templateUrl: './grid.html',
  styleUrl: './grid.css',
})
export class BkGrid<T = any> {
  /* ================= Inputs ================= */

  @Input() draggable: boolean = false;
  @Input() columns: TableColumn<T>[] = [];
  @Input() result!: T[];
  @Input() actions: TableAction<T>[] | ((row: T) => TableAction<T>[]) = [];
  @Input() customClass: string = 'h-[calc(100vh-260px)]';
  @Input() showNoRecords: boolean = false;
  @Input() noRecordFoundHeight: string = '';

  @Output() change = new EventEmitter<{
    row: T;
    column: TableColumn<T>
  }>();
  /* ================= Outputs ================= */

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

  /* ================= Sorting ================= */

  sortColumn?: keyof T;
  sortDirection: SortDirection = 'asc';

  /* ================= ViewChild ================= */

  @ViewChild('tableScrollContainer', { static: false })
  tableScrollContainer!: ElementRef<HTMLDivElement>;

  /* ================= Helpers ================= */

  get firstVisibleColumnIndex(): number {
    const index = this.columns.findIndex((col) => col.visible !== false);
    return index >= 0 ? index : 0;
  }

  /* ================= Sorting ================= */

  sort(column: TableColumn<T>, index: number) {
    if (!column.sortable || !column.field) return;

    this.sortDirection =
      this.sortColumn === column.field ? (this.sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';

    this.sortColumn = column.field;

    this.sortChange.emit({
      columnIndex: index,
      column,
      direction: this.sortDirection,
    });
  }

  /* ================= Visibility ================= */

  isColumnVisible(column: TableColumn<T>): boolean {
    return column.visible !== false;
  }

  /* ================= Cell Value ================= */

  getCellValue(row: T, column: TableColumn<T>): string {
    if (column.formatter) {
      return column.formatter(row);
    }

    if (column.field) {
      return String(row[column.field] ?? '');
    }

    return '';
  }

  /* ================= Checkbox ================= */

  getCheckboxValue(row: T, column: TableColumn<T>): boolean {
    if (!column.field) return false;
    return !!(row as any)[column.field];
  }

  setCheckboxValue(row: T, column: TableColumn<T>, value: boolean): void {
    if (column.field){
      (row as any)[column.field] = value;
      this.change.emit({row: row,column:column});
    }
  }

  /* ================= Badges ================= */

  getBadge(row: T, column: TableColumn<T>): TableBadge | undefined {
    if (!column.badges) return undefined;
    const list = typeof column.badges === 'function' ? column.badges(row) : column.badges;
    return list.find((b) => b.label === this.getCellValue(row, column));
  }

  /* ================= Icons ================= */

  getIcons(row: T, column: TableColumn<T>): TableIcon[] {
    if (!column.icons) return [];

    return typeof column.icons === 'function' ? column.icons(row) : column.icons;
  }

  /* ================= Tooltip ================= */

  getTooltipValue(row: T, column: TableColumn<T>): string {
    if (column.toolTipField) {
      return String(row[column.toolTipField] ?? '');
    }
    return '';
  }
  /* ================= Actions ================= */

  getRowActions(row: T, column?: TableColumn<T>): TableAction<T>[] {
    const source = column?.actions ?? this.actions;

    if (!source) return [];

    return typeof source === 'function' ? source(row) : source;
  }

  isActionVisible(action: TableAction<T>, row: T): boolean {
    if (!action.hasPermission) return false;

    if (typeof action.visible === 'function') {
      return action.visible(row);
    }

    if (typeof action.visible === 'boolean') {
      return action.visible;
    }

    return true;
  }

  isActionDisabled(action: TableAction<T>, row: T): boolean {
    if (typeof action.disabled === 'function') {
      return action.disabled(row);
    }

    return !!action.disabled;
  }

  emitAction(action: TableAction<T>, row: T) {
    if (action.onClick) {
      action.onClick(row);
    }

    this.actionClick.emit({
      action: action.name,
      row,
    });
  }

  /* ================= Drag Drop ================= */

  dropList(event: CdkDragDrop<T[]>) {
    if (!this.draggable || !this.result) return;

    moveItemInArray(this.result, event.previousIndex, event.currentIndex);

    this.result.forEach((item: any, index) => {
      item.sortOrder = index + 1;
    });

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
