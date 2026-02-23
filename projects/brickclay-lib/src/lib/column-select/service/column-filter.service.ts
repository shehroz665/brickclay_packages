import { Injectable } from '@angular/core';
import { ColumnFilterOption } from '../models/column-filter-option';



@Injectable({
  providedIn: 'root'
})
export class BkColumnFilterService {

  constructor() { }

  intializeColumnsFilter(key:string,fields:string[]):void {
    var columnsList: ColumnFilterOption[]= fields.map((f)=> new ColumnFilterOption(f,true));
    localStorage.setItem(key,JSON.stringify(columnsList));
  }

  getColumnsFilterList(key:string,fields:string[]):ColumnFilterOption[]|[] {
    let stored = localStorage.getItem(key);
    if(!fields || fields.length===0){
      return [];
    }
    if(!stored){
        this.intializeColumnsFilter(key,fields);
        stored = localStorage.getItem(key);
    }

    let storedColumns = stored ? (JSON.parse(stored) as ColumnFilterOption[]) : [];

    // Sync stored columns with current fields
    storedColumns = this.syncColumnsWithFields(storedColumns, fields);

    // Update localStorage with synced data
    localStorage.setItem(key, JSON.stringify(storedColumns));

    return storedColumns;
    // return stored ? (JSON.parse(stored) as ColumnFilterOption[]) : [];
  }

  private syncColumnsWithFields(storedColumns: ColumnFilterOption[], currentFields: string[]): ColumnFilterOption[] {
    // Map of existing columns for quick lookup
    const existingColumnsMap = new Map<string, ColumnFilterOption>();
    storedColumns.forEach(col => existingColumnsMap.set(col.columnName, col));

    // New list based on current fields
    const syncedColumns: ColumnFilterOption[] = [];

    currentFields.forEach(field => {
      if (existingColumnsMap.has(field)) {
        // Keep existing column with its selection state
        syncedColumns.push(existingColumnsMap.get(field)!);
      } else {
        // Add new column as selected by default
        syncedColumns.push(new ColumnFilterOption(field, true));
      }
    });

    return syncedColumns;
  }
  updateColumnFilterList(key:string,list:ColumnFilterOption[]): void {
    localStorage.removeItem(key);
     localStorage.setItem(key,JSON.stringify(list));
  }
  showColumn(field:string,columnsFilterList:ColumnFilterOption[]):boolean{
       return columnsFilterList.find((i)=> i.columnName===field)?.selected || false;
  }
}
