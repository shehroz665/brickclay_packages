import { BadgeColor, BadgeSize, BadgeVariant } from "../../badge/badge";

export interface TableColumn<T = any> {
  header: string;
  field?: keyof T;
  width?: string;
  sticky?: boolean;
  sortable?: boolean;
  headerClass?: string;
  cellClass?: string;
  formatter?: (row: T) => string;
  badges?: TableBadge[];
  icons?: TableIcon[];
  /** show / hide both th + td */
  visible?: boolean; // default: true
}

export interface TableAction{
  name: string;       // e.g. edit, delete
  icon: string;
  tooltip: string;
  hasPermission: boolean;
}
 export interface TableBadge {
  label:string;
  variant: BadgeVariant;
  color: BadgeColor ;
  size: BadgeSize;
  dot: 'left' | 'right' | 'none';
  customClass: string;
 }

 export interface TableIcon {
  toolTipLabel?: string | string[];
  tooltipPosition?:'left' | 'right' | 'top' | 'bottom';
  url: string
 }
