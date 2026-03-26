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
  badges?: TableBadge[] | ((row: T) => TableBadge[]);
  icons?: TableIcon[] | ((row: T) => TableIcon[]);
  /** show / hide both th + td */
  visible?: boolean; // default: true
  actions?: TableAction[] | ((row: T) => TableAction[]);
  checkbox?:boolean;
}

export interface TableAction<T = any> {
  name: string;       // e.g. edit, delete
  icon: string;
  tooltip: string;
  tooltipPosition: 'left' | 'right' | 'top' | 'bottom';
  hasPermission: boolean;
  /** Dynamic visibility */
  visible?: boolean | ((row: T) => boolean);

  /** Disabled state */
  disabled?: boolean | ((row: T) => boolean);

  /** Click handler */
  onClick?: (row: T) => void;
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
