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

  // ✅ Added method
  private updateStartEndPages(): void {
    this.startingPage = this.pages.length > 0 ? this.pages[0] : 0;
    this.endingPage = this.pages.length > 0
      ? Math.min(this.startingPage + 2, this.pages[this.pages.length - 1])
      : 0;
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

  paginate() {
    var from = this.activePage === 1 ? this.activePage - 1 : this.activePage - 2;
    return this.pages.slice(from, this.activePage + 4);
  }

  onClickPage(pageNumber: number): void {
    if(this.activePage!==pageNumber){
      if (pageNumber >= 1 && pageNumber <= this.pages.length) {
        this.activePage = pageNumber;
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
