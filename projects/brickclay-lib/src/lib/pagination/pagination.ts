import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BkSelect } from '../select/select';
export interface BkPageSize {
  key:number;
  value:number;
}
@Component({
  selector: 'bk-pagination',
  imports: [CommonModule,FormsModule,BkSelect],
  standalone:true,
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class BkPagination implements OnChanges {

  @Input() public pageSize?: number = 10;
  @Input() public total?: number = 0;

  @Output() public changePageSize = new EventEmitter<number>();
  @Output() pageChanged: EventEmitter<number> = new EventEmitter();

  public pages: number[] = [];
  @Input() public activePage: number = 1;
  @Output() public activePageChange = new EventEmitter<number>();

  pager: number = 1;
  isMenuHovered = false;

  // ✅ Added
  startingPage:number = 0;
  endingPage: number = 0;
  pageSizesList:BkPageSize[] = [
    { key:25,value:25},
    { key:50,value:50},
    { key:75,value:75},
    { key:100,value:100},
  ];

  constructor() {
    const pageCount = this.getPageCount();
    this.pages = this.getArrayOfPage(pageCount);

    // ✅ Added
    this.updateStartEndPages();
  }

  ngOnChanges(): any {
    const pageCount = this.getPageCount();
    this.pages = this.getArrayOfPage(pageCount);

    if (this.activePage > pageCount) {
      this.activePage = pageCount || 1;
      this.activePageChange.emit(this.activePage);
    }

    if (this.activePage < 1) {
      this.activePage = 1;
      this.activePageChange.emit(this.activePage);
    }

    // ✅ Added
    this.updateStartEndPages();
  }

  getTotalPagesValue(){
      const totalPages = Math.ceil(this.total! / this.pageSize!);
      return  totalPages;
  }

  // Visible window: startingPage/endingPage reflect the two page numbers shown in the control
  private updateStartEndPages(): void {
    const totalPages = this.getTotalPages();
    if (totalPages <= 0) {
      this.startingPage = 0;
      this.endingPage = 0;
      return;
    }
    if (totalPages === 1) {
      this.startingPage = 1;
      this.endingPage = 1;
      return;
    }
    this.startingPage = this.activePage;
    this.endingPage = Math.min(this.activePage + 1, totalPages);
  }

  private getPageCount(): number {
    let totalPage = 0;

    if (!!this.total && !!this.pageSize)
      if (this.total > 0 && this.pageSize > 0) {
        const pageCount = this.total / this.pageSize;
        const roundedPageCount = Math.floor(pageCount);
        totalPage = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;
      }

    return totalPage;
  }

  private getArrayOfPage(pageCount: number): number[] {
    const pageArray = [];
    if (pageCount > 0) {
      for (let i = 1; i <= pageCount; i++) pageArray.push(i);
    }
    return pageArray;
  }

  /** Returns exactly 2 visible page numbers: current and next (e.g. 1-2, then 2-3 on click of 2). */
  paginate(): number[] {
    const totalPages = this.getTotalPages();
    if (totalPages <= 0) return [];
    if (totalPages === 1) return [1];
    const start = this.activePage;
    const end = Math.min(this.activePage + 1, totalPages);
    return this.pages.slice(start - 1, end);
  }

  onClickPage(pageNumber: number): void {
    if (this.activePage !== pageNumber) {
      if (pageNumber >= 1 && pageNumber <= this.pages.length) {
        this.activePage = pageNumber;
        this.updateStartEndPages();
        this.pageChanged.emit(this.activePage);
      }
    }
  }

  changeSize(event: any) {
    this.changePageSize.emit(this.pageSize);

    // ✅ Recalculate pages on size change
    const pageCount = this.getPageCount();
    this.pages = this.getArrayOfPage(pageCount);
    this.updateStartEndPages();
  }

  get startIndex(): number {
    if (!this.total || this.total === 0) return 0;
    return (this.activePage - 1) * this.pageSize! + 1;
  }

  get endIndex(): number {
    if (!this.total || this.total === 0) return 0;
    const end = this.activePage * this.pageSize!;
    return end > this.total ? this.total : end;
  }

  get totalItems(): number {
    return this.total || 0;
  }

  // ✅ Added getTotalPages()
  getTotalPages(): number {
    return this.getPageCount();
  }

}
