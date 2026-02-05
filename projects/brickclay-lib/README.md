# @brickclay-org/ui

A comprehensive Angular UI component library featuring a rich collection of customizable, accessible components. Built with modern Angular standards, this library provides everything you need to build beautiful and functional user interfaces.

## 🌟 Features

- 📦 **Comprehensive Component Library** - Rich set of UI components for common use cases
- ♿ **Accessible by Default** - WCAG compliant components with keyboard navigation and screen reader support
- 🚀 **Angular 20+ Ready** - Built with latest Angular features and standalone components
- 📱 **Responsive Design** - Mobile-first components that work on all screen sizes
- 🎯 **Type-Safe** - Full TypeScript support with comprehensive type definitions
- ⚡ **Lightweight** - Tree-shakeable and optimized for performance
- 🎛️ **Highly Customizable** - Extensive configuration options for every component

## 📚 Available Components

### Calendar Components

A powerful calendar suite with advanced date and time selection capabilities. The calendar components support single date selection, date ranges, multiple date selection, and integrated time pickers.

### Toggle Component

A customizable toggle/switch component with support for Angular forms integration via `ngModel` and reactive forms. Features three size variants (small, medium, large), disabled state, and full accessibility support.

### Checkbox Component

A fully accessible checkbox component with Angular forms integration. Features customizable styling via CSS classes, disabled state, keyboard navigation, and seamless integration with both template-driven and reactive forms.

### Radio Component

A fully accessible radio button component with Angular forms integration. Features two visual variants (dot and tick), customizable styling, disabled state, keyboard navigation, and seamless integration with both template-driven and reactive forms.

### Pill Component

A versatile pill component for displaying labels, tags, or status indicators. Features multiple variants (Light, Solid, Outline, Transparent), color options, size variants, optional dot indicators, and removable functionality with click events.

### Badge Component

A flexible badge component for displaying labels, tags, or status indicators. Features multiple variants (Light, Solid, Outline, Transparent), color options, size variants, optional dot indicators, and removable functionality with click events.

### Button Component

A versatile button component with support for text labels, icons, loading states, and multiple variants. Features seven size options, two variants (primary/secondary), optional left/right icons, loading spinner, and full customization support.

### Icon Button Component

A compact icon-only button component perfect for toolbars and action buttons. Features seven size options, two variants (primary/secondary), and customizable styling.

### Button Group Component

A button group component for creating toggleable button sets. Supports single and multiple selection modes, with automatic state management and value change events.

### Spinner Component

A loading spinner component for indicating asynchronous operations. Features five size variants, customizable colors, and show/hide control.

_More components coming soon..._

## Installation

```bash
npm i @brickclay-org/ui@0.0.26
```

### Peer Dependencies

This library requires Angular 20.3.0 or higher:

```bash
npm install @angular/common@^20.3.0 @angular/core@^20.3.0 moment
```

### Asset Configuration (Required)

After installing the library, you need to configure your `angular.json` to include the library's assets (icons, etc.). Add the following to your project's `assets` array in the `build` options:

```json
{
  "projects": {
    "your-app-name": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              "src/favicon.ico",
              "src/assets",
              {
                "glob": "**/*",
                "input": "node_modules/@brickclay-org/ui/assets",
                "output": "/assets/brickclay-lib/"
              }
            ]
          }
        }
      }
    }
  }
}
```

This configuration copies the library's assets (SVG icons, etc.) to your application's output folder during build. Without this, the component icons will not display correctly.

## Quick Start

### Standalone Component Usage (Recommended)

```typescript
import { Component } from '@angular/core';
import { BkCustomCalendar, CalendarSelection } from '@brickclay/ui';

@Component({
  standalone: true,
  selector: 'app-my-component',
  imports: [BkCustomCalendar],
  template: `
    <bk-custom-calendar (selected)="onDateSelected($event)"> </bk-custom-calendar>
  `,
})
export class MyComponent {
  onDateSelected(selection: CalendarSelection) {
    console.log('Selected:', selection);
  }
}
```

### Module-based Usage

```typescript
import { NgModule } from '@angular/core';
import { CalendarModule } from '@brickclay/ui';

@NgModule({
  imports: [CalendarModule],
  // ...
})
export class AppModule {}
```

## 📅 Calendar

The calendar components provide a complete solution for date and time selection in your Angular applications. All components are standalone and can be imported individually or as part of the `CalendarModule`.

### Components Overview

1. **BkCustomCalendar** (`brickclay-custom-calendar`) - Main calendar component with support for single date, date range, and multiple date selection
2. **BkScheduledDatePicker** (`brickclay-scheduled-date-picker`) - Advanced scheduling component with time configuration for events
3. **BkTimePicker** (`brickclay-time-picker`) - Standalone time selection component with scrollable pickers

### BkCustomCalendar

A versatile calendar component that supports single date, date range, and multiple date selection modes.

#### Basic Example

```typescript
import { BkCustomCalendar, CalendarSelection } from '@brickclay/ui';

@Component({
  template: `
    <bk-custom-calendar
      [singleDatePicker]="false"
      [dualCalendar]="true"
      [enableTimepicker]="true"
      [showRanges]="true"
      [placeholder]="'Select date range'"
      (selected)="onDateSelected($event)"
    >
    </bk-custom-calendar>
  `,
})
export class MyComponent {
  onDateSelected(selection: CalendarSelection) {
    console.log('Start:', selection.startDate);
    console.log('End:', selection.endDate);
  }
}
```

#### Component Selector

`<bk-custom-calendar>`

#### Inputs

| Input                | Type                            | Default               | Description                                       |
| -------------------- | ------------------------------- | --------------------- | ------------------------------------------------- |
| `enableTimepicker`   | `boolean`                       | `false`               | Enable time selection                             |
| `autoApply`          | `boolean`                       | `false`               | Automatically apply selection when date is chosen |
| `closeOnAutoApply`   | `boolean`                       | `false`               | Close calendar after auto-apply                   |
| `showCancel`         | `boolean`                       | `true`                | Show cancel button in footer                      |
| `singleDatePicker`   | `boolean`                       | `false`               | Enable single date selection mode                 |
| `dualCalendar`       | `boolean`                       | `false`               | Show two calendars side-by-side                   |
| `showRanges`         | `boolean`                       | `true`                | Show predefined date range buttons                |
| `multiDateSelection` | `boolean`                       | `false`               | Enable multiple date selection                    |
| `inline`             | `boolean`                       | `false`               | Always show calendar (no dropdown)                |
| `minDate`            | `Date`                          | `undefined`           | Minimum selectable date                           |
| `maxDate`            | `Date`                          | `undefined`           | Maximum selectable date                           |
| `placeholder`        | `string`                        | `'Select date range'` | Input placeholder text                            |
| `opens`              | `'left' \| 'right' \| 'center'` | `'left'`              | Dropdown alignment                                |
| `drop`               | `'up' \| 'down'`                | `'down'`              | Dropdown direction                                |
| `displayFormat`      | `string`                        | `'MM/DD/YYYY'`        | Date display format (moment format)               |
| `customRanges`       | `Record<string, CalendarRange>` | `undefined`           | Custom predefined ranges                          |
| `selectedValue`      | `CalendarSelection \| null`     | `null`                | Pre-selected date(s)                              |
| `isDisplayCrossIcon` | `boolean`                       | `true`                | Show/hide clear button                            |

#### Outputs

| Output     | Type                              | Description                         |
| ---------- | --------------------------------- | ----------------------------------- |
| `selected` | `EventEmitter<CalendarSelection>` | Emitted when date selection changes |
| `opened`   | `EventEmitter<void>`              | Emitted when calendar opens         |
| `closed`   | `EventEmitter<void>`              | Emitted when calendar closes        |

#### Usage Examples

**Single Date Selection:**

```typescript
<bk-custom-calendar
  [singleDatePicker]="true"
  [placeholder]="'Select a date'"
  (selected)="onDateSelected($event)">
</bk-custom-calendar>
```

**Date Range with Time Picker:**

```typescript
<bk-custom-calendar
  [dualCalendar]="true"
  [enableTimepicker]="true"
  [enableSeconds]="true"
  (selected)="onRangeSelected($event)">
</bk-custom-calendar>
```

**Multiple Date Selection:**

```typescript
<bk-custom-calendar
  [multiDateSelection]="true"
  [inline]="true"
  (selected)="onMultipleDatesSelected($event)">
</bk-custom-calendar>
```

**Inline Calendar:**

```typescript
<bk-custom-calendar
  [inline]="true"
  [dualCalendar]="false"
  [showRanges]="false"
  (selected)="onDateSelected($event)">
</bk-custom-calendar>
```

**Custom Date Ranges:**

```typescript
import { CalendarRange } from '@brickclay/ui';

const customRanges: Record<string, CalendarRange> = {
  'Last Week': {
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 7)
  },
  'This Quarter': {
    start: new Date(2024, 0, 1),
    end: new Date(2024, 2, 31)
  }
};

<bk-custom-calendar
  [customRanges]="customRanges"
  [showRanges]="true"
  (selected)="onDateSelected($event)">
</bk-custom-calendar>
```

**Date Constraints:**

```typescript
<bk-custom-calendar
  [minDate]="new Date(2024, 0, 1)"
  [maxDate]="new Date(2024, 11, 31)"
  (selected)="onDateSelected($event)">
</bk-custom-calendar>
```

**Pre-selected Values:**

```typescript
export class MyComponent {
  selectedValue: CalendarSelection = {
    startDate: new Date(2024, 5, 15),
    endDate: new Date(2024, 5, 20)
  };

  onDateChange() {
    this.selectedValue = {
      startDate: new Date(),
      endDate: new Date()
    };
  }
}

<bk-custom-calendar
  [selectedValue]="selectedValue"
  (selected)="onDateSelected($event)">
</bk-custom-calendar>
```

### BkScheduledDatePicker

A comprehensive date and time scheduling component with three modes: single date, multiple dates, and date range, each with time configuration.

#### Basic Example

```typescript
import { BkScheduledDatePicker, ScheduledDateSelection } from '@brickclay/ui';

@Component({
  template: `
    <bk-scheduled-date-picker [timeFormat]="12" (scheduled)="onScheduled($event)">
    </bk-scheduled-date-picker>
  `,
})
export class MyComponent {
  onScheduled(selection: ScheduledDateSelection) {
    console.log('Mode:', selection.mode);
    if (selection.mode === 'single' && selection.singleDate) {
      console.log('Start:', selection.singleDate.startDate);
      console.log('End:', selection.singleDate.endDate);
      console.log('All Day:', selection.singleDate.allDay);
    }
  }
}
```

#### Component Selector

`<bk-scheduled-date-picker>`

#### Inputs

| Input           | Type       | Default | Description                      |
| --------------- | ---------- | ------- | -------------------------------- |
| `timeFormat`    | `12 \| 24` | `12`    | Time format (12-hour or 24-hour) |
| `enableSeconds` | `boolean`  | `false` | Enable seconds in time picker    |

#### Outputs

| Output      | Type                                   | Description                          |
| ----------- | -------------------------------------- | ------------------------------------ |
| `scheduled` | `EventEmitter<ScheduledDateSelection>` | Emitted when selection changes       |
| `cleared`   | `EventEmitter<void>`                   | Emitted when clear button is clicked |

#### Features

- **Single Date Mode**: Select one date with optional start and end times
- **Multiple Dates Mode**: Select multiple dates, each with individual time configuration
- **Date Range Mode**: Select a date range with start and end times
- **All Day Toggle**: Mark dates as all-day events
- **Time Configuration**: Individual time pickers for each date/range

### BkTimePicker

A standalone time picker component with scrollable hour, minute, and AM/PM selectors.

#### Basic Example

```typescript
import { BkTimePicker } from '@brickclay/ui';

@Component({
  template: `
    <bk-time-picker
      [value]="selectedTime"
      [label]="'Start Time'"
      [timeFormat]="12"
      (timeChange)="onTimeChange($event)"
    >
    </bk-time-picker>
  `,
})
export class MyComponent {
  selectedTime = '1:00 AM';

  onTimeChange(time: string) {
    this.selectedTime = time;
    console.log('New time:', time);
  }
}
```

#### Component Selector

`<bk-time-picker>`

#### Inputs

| Input         | Type                | Default         | Description                                          |
| ------------- | ------------------- | --------------- | ---------------------------------------------------- |
| `value`       | `string`            | `'1:00 AM'`     | Current time value (format: "H:MM AM/PM" or "HH:MM") |
| `label`       | `string`            | `'Time'`        | Label text                                           |
| `placeholder` | `string`            | `'Select time'` | Placeholder text                                     |
| `position`    | `'left' \| 'right'` | `'left'`        | Dropdown position                                    |
| `pickerId`    | `string`            | `''`            | Unique identifier for the picker                     |
| `closePicker` | `number`            | `0`             | Counter to trigger picker close                      |
| `timeFormat`  | `12 \| 24`          | `12`            | Time format (12-hour or 24-hour)                     |
| `showSeconds` | `boolean`           | `false`         | Show seconds selector                                |

#### Outputs

| Output         | Type                   | Description                |
| -------------- | ---------------------- | -------------------------- |
| `timeChange`   | `EventEmitter<string>` | Emitted when time changes  |
| `pickerOpened` | `EventEmitter<string>` | Emitted when picker opens  |
| `pickerClosed` | `EventEmitter<string>` | Emitted when picker closes |

#### Features

- Scrollable time selectors
- Keyboard navigation support
- 12-hour and 24-hour formats
- Optional seconds support
- Multiple picker coordination (only one open at a time)
- Click outside to close

#### Time Format Examples

**12-hour format:**

```typescript
value = '1:00 AM';
value = '12:30 PM';
value = '11:45 PM';
```

**24-hour format:**

```typescript
value = '01:00';
value = '13:30';
value = '23:45';
```

## 🔘 Toggle

A versatile toggle/switch component that integrates seamlessly with Angular forms. Supports both template-driven forms (`ngModel`) and reactive forms, with full accessibility features and keyboard navigation.

### BkToggle

A standalone toggle component that implements `ControlValueAccessor` for seamless Angular forms integration.

#### Basic Example

```typescript
import { BkToggle } from '@brickclay/ui';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <bk-toggle
      [(ngModel)]="isEnabled"
      [label]="'Enable notifications'"
      (change)="onToggleChange($event)"
    >
    </bk-toggle>
  `,
  imports: [BkToggle, FormsModule],
})
export class MyComponent {
  isEnabled = false;

  onToggleChange(value: boolean) {
    console.log('Toggle state:', value);
  }
}
```

#### Component Selector

`<bk-toggle>`

#### Inputs

| Input         | Type      | Default       | Description                                                                      |
| ------------- | --------- | ------------- | -------------------------------------------------------------------------------- |
| `label`       | `string`  | `''`          | Optional label text displayed next to the toggle                                 |
| `disabled`    | `boolean` | `false`       | Disables the toggle interaction                                                  |
| `toggleClass` | `string`  | `'toggle-md'` | CSS class for size styling. Options: `'toggle-sm'`, `'toggle-md'`, `'toggle-lg'` |

#### Outputs

| Output   | Type                    | Description                                                   |
| -------- | ----------------------- | ------------------------------------------------------------- |
| `change` | `EventEmitter<boolean>` | Emitted when toggle state changes (returns new boolean value) |

#### Features

- ✅ **Angular Forms Integration** - Full support for `ngModel` and reactive forms
- ✅ **Three Size Variants** - Small (`toggle-sm`), Medium (`toggle-md`), Large (`toggle-lg`)
- ✅ **Accessibility** - ARIA attributes, keyboard navigation, and screen reader support
- ✅ **Disabled State** - Visual and functional disabled state
- ✅ **Customizable Styling** - Custom CSS classes for size and appearance
- ✅ **Event Handling** - `change` event for state change notifications

#### Usage Examples

**Basic Toggle with ngModel:**

```typescript
import { BkToggle } from '@brickclay/ui';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <bk-toggle [(ngModel)]="isActive" [label]="'Active Status'"> </bk-toggle>
  `,
  imports: [BkToggle, FormsModule],
})
export class MyComponent {
  isActive = true;
}
```

**Different Sizes:**

```typescript
<bk-toggle
  [(ngModel)]="value1"
  [toggleClass]="'toggle-sm'"
  [label]="'Small Toggle'">
</bk-toggle>

<bk-toggle
  [(ngModel)]="value2"
  [toggleClass]="'toggle-md'"
  [label]="'Medium Toggle'">
</bk-toggle>

<bk-toggle
  [(ngModel)]="value3"
  [toggleClass]="'toggle-lg'"
  [label]="'Large Toggle'">
</bk-toggle>
```

**Disabled State:**

```typescript
<bk-toggle
  [ngModel]="true"
  [disabled]="true"
  [label]="'Disabled Toggle'">
</bk-toggle>
```

**With Event Handler:**

```typescript
@Component({
  template: `
    <bk-toggle
      [(ngModel)]="notificationsEnabled"
      [label]="'Email Notifications'"
      (change)="onNotificationToggle($event)"
    >
    </bk-toggle>
  `,
})
export class MyComponent {
  notificationsEnabled = false;

  onNotificationToggle(enabled: boolean) {
    if (enabled) {
      this.enableNotifications();
    } else {
      this.disableNotifications();
    }
  }
}
```

**Reactive Forms Integration:**

```typescript
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BkToggle } from '@brickclay/ui';

@Component({
  template: `
    <form [formGroup]="settingsForm">
      <bk-toggle formControlName="darkMode" [label]="'Dark Mode'"> </bk-toggle>

      <bk-toggle formControlName="notifications" [label]="'Push Notifications'">
      </bk-toggle>
    </form>
  `,
  imports: [BkToggle, ReactiveFormsModule],
})
export class SettingsComponent {
  settingsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      darkMode: [false],
      notifications: [true],
    });
  }
}
```

**Without Label:**

```typescript
<bk-toggle
  [(ngModel)]="isEnabled"
  [toggleClass]="'toggle-md'">
</bk-toggle>
```

#### Styling

The toggle component uses CSS classes for size variants:

- **Small**: `toggle-sm` - Width: 28px (w-7)
- **Medium**: `toggle-md` - Width: 36px (w-9) - Default
- **Large**: `toggle-lg` - Width: 44px (w-11)

The component includes built-in styles for:

- On state (green background: `#22973F`)
- Off state (gray background: `#BBBDC5`)
- Disabled state (light gray: `#D6D7DC`)
- Hover states
- Focus ring for accessibility
- Smooth transitions

#### Accessibility

The toggle component includes:

- `role="switch"` for screen readers
- `aria-checked` attribute that reflects the current state
- Keyboard navigation support
- Focus visible ring for keyboard users
- Disabled state properly communicated to assistive technologies

## ☑️ Checkbox

A fully accessible checkbox component that integrates seamlessly with Angular forms. Supports both template-driven forms (`ngModel`) and reactive forms, with customizable styling and comprehensive accessibility features.

### BkCheckbox

A standalone checkbox component that implements `ControlValueAccessor` for seamless Angular forms integration.

#### Basic Example

```typescript
import { BkCheckbox } from '@brickclay/ui';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <bk-checkbox
      [(ngModel)]="isAccepted"
      [label]="'I agree to the terms and conditions'"
      (change)="onCheckboxChange($event)"
    >
    </bk-checkbox>
  `,
  imports: [BkCheckbox, FormsModule],
})
export class MyComponent {
  isAccepted = false;

  onCheckboxChange(value: boolean) {
    console.log('Checkbox state:', value);
  }
}
```

#### Component Selector

`<bk-checkbox>`

#### Inputs

| Input           | Type      | Default | Description                                                          |
| --------------- | --------- | ------- | -------------------------------------------------------------------- |
| `label`         | `string`  | `''`    | Optional label text displayed next to the checkbox                   |
| `disabled`      | `boolean` | `false` | Disables the checkbox interaction                                    |
| `checkboxClass` | `string`  | `''`    | CSS class for size styling. Options: `'xsm'`, `'sm'`, `'md'`, `'lg'` |
| `labelClass`    | `string`  | `''`    | Custom CSS classes for the label text                                |

#### Outputs

| Output   | Type                    | Description                                                     |
| -------- | ----------------------- | --------------------------------------------------------------- |
| `change` | `EventEmitter<boolean>` | Emitted when checkbox state changes (returns new boolean value) |

#### Features

- ✅ **Angular Forms Integration** - Full support for `ngModel` and reactive forms
- ✅ **Four Size Variants** - Extra Small (`xsm`), Small (`sm`), Medium (`md`), Large (`lg`)
- ✅ **Accessibility** - ARIA attributes, keyboard navigation (Enter/Space), and screen reader support
- ✅ **Disabled State** - Visual and functional disabled state
- ✅ **Keyboard Support** - Full keyboard navigation with Enter and Space keys
- ✅ **Focus Management** - Focus visible ring for keyboard users
- ✅ **Event Handling** - `change` event for state change notifications

#### Usage Examples

**Basic Checkbox with ngModel:**

```typescript
import { BkCheckbox } from '@brickclay/ui';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <bk-checkbox [(ngModel)]="isChecked" [label]="'Accept terms'"> </bk-checkbox>
  `,
  imports: [BkCheckbox, FormsModule],
})
export class MyComponent {
  isChecked = false;
}
```

**Different Sizes:**

```typescript
<!-- Extra Small checkbox -->
<bk-checkbox
  [(ngModel)]="value1"
  [checkboxClass]="'xsm'"
  [label]="'Extra Small Checkbox'">
</bk-checkbox>

<!-- Small checkbox -->
<bk-checkbox
  [(ngModel)]="value2"
  [checkboxClass]="'sm'"
  [label]="'Small Checkbox'">
</bk-checkbox>

<!-- Medium checkbox -->
<bk-checkbox
  [(ngModel)]="value3"
  [checkboxClass]="'md'"
  [label]="'Medium Checkbox'">
</bk-checkbox>

<!-- Large checkbox with custom label styling -->
<bk-checkbox
  [(ngModel)]="value4"
  [checkboxClass]="'lg'"
  [labelClass]="'text-lg font-bold'"
  [label]="'Large Checkbox'">
</bk-checkbox>
```

**Disabled State:**

```typescript
<bk-checkbox
  [ngModel]="true"
  [disabled]="true"
  [label]="'Disabled Checkbox'">
</bk-checkbox>
```

**With Event Handler:**

```typescript
@Component({
  template: `
    <bk-checkbox
      [(ngModel)]="newsletterSubscribed"
      [label]="'Subscribe to newsletter'"
      (change)="onNewsletterToggle($event)"
    >
    </bk-checkbox>
  `,
})
export class MyComponent {
  newsletterSubscribed = false;

  onNewsletterToggle(subscribed: boolean) {
    if (subscribed) {
      this.subscribeToNewsletter();
    } else {
      this.unsubscribeFromNewsletter();
    }
  }
}
```

**Reactive Forms Integration:**

```typescript
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BkCheckbox } from '@brickclay/ui';

@Component({
  template: `
    <form [formGroup]="registrationForm">
      <bk-checkbox
        formControlName="acceptTerms"
        [label]="'I accept the terms and conditions'"
      >
      </bk-checkbox>

      <bk-checkbox formControlName="receiveUpdates" [label]="'Receive product updates'">
      </bk-checkbox>
    </form>
  `,
  imports: [BkCheckbox, ReactiveFormsModule],
})
export class RegistrationComponent {
  registrationForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      acceptTerms: [false, Validators.requiredTrue],
      receiveUpdates: [false],
    });
  }
}
```

**Without Label:**

```typescript
<bk-checkbox
  [(ngModel)]="isSelected"
  [checkboxClass]="'md'">
</bk-checkbox>
```

**Multiple Checkboxes:**

```typescript
@Component({
  template: `
    <div>
      <bk-checkbox
        *ngFor="let option of options"
        [(ngModel)]="option.selected"
        [label]="option.label"
        (change)="onOptionChange(option)"
      >
      </bk-checkbox>
    </div>
  `,
})
export class MyComponent {
  options = [
    { label: 'Option 1', selected: false },
    { label: 'Option 2', selected: false },
    { label: 'Option 3', selected: false },
  ];

  onOptionChange(option: any) {
    console.log(`${option.label} is now ${option.selected ? 'selected' : 'deselected'}`);
  }
}
```

#### Styling

The checkbox component supports predefined size classes:

- **Extra Small**: `xsm` - 14px × 14px
- **Small**: `sm` - 16px × 16px
- **Medium**: `md` - 18px × 18px
- **Large**: `lg` - 20px × 20px

Use `labelClass` to style the label text (font size, weight, color, etc.)

The component includes built-in styles for:

- Checked state (black background with white checkmark/tick icon)
- Unchecked state (white background with gray border)
- Hover states (darker border on hover)
- Disabled states (gray background and border)
- Focus ring for accessibility (blue ring with offset)
- Smooth transitions for state changes

#### Accessibility

The checkbox component includes:

- Keyboard navigation support (Enter and Space keys)
- Focus visible ring for keyboard users
- Proper ARIA attributes
- Disabled state properly communicated to assistive technologies
- Tab navigation support

## 🔘 Radio Button

A fully accessible radio button component that integrates seamlessly with Angular forms. Supports both template-driven forms (`ngModel`) and reactive forms, with two visual variants (dot and tick) and comprehensive accessibility features.

### BkRadioButton

A standalone radio button component that implements `ControlValueAccessor` for seamless Angular forms integration. Radio buttons are used when only one option can be selected from a group.

#### Basic Example

```typescript
import { BkRadioButton } from '@brickclay/ui';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <bk-radio-button
      [(ngModel)]="selectedOption"
      [value]="'option1'"
      [label]="'Option 1'"
      (change)="onRadioChange($event)"
    >
    </bk-radio-button>

    <bk-radio-button [(ngModel)]="selectedOption" [value]="'option2'" [label]="'Option 2'">
    </bk-radio-button>
  `,
  imports: [BkRadioButton, FormsModule],
})
export class MyComponent {
  selectedOption = 'option1';

  onRadioChange(value: any) {
    console.log('Selected option:', value);
  }
}
```

#### Component Selector

`<bk-radio-button>`

#### Inputs

| Input        | Type              | Default     | Description                                                               |
| ------------ | ----------------- | ----------- | ------------------------------------------------------------------------- |
| `label`      | `string`          | `''`        | Optional label text displayed next to the radio button                    |
| `value`      | `any`             | `undefined` | The value associated with this radio button (required for radio groups)   |
| `disabled`   | `boolean`         | `false`     | Disables the radio button interaction                                     |
| `variant`    | `'dot' \| 'tick'` | `'dot'`     | Visual variant. `'dot'` shows a filled circle, `'tick'` shows a checkmark |
| `radioClass` | `string`          | `''`        | CSS class for size styling. Options: `'xsm'`, `'sm'`, `'md'`, `'lg'`      |
| `labelClass` | `string`          | `''`        | Custom CSS classes for the label text                                     |

#### Outputs

| Output   | Type                | Description                                               |
| -------- | ------------------- | --------------------------------------------------------- |
| `change` | `EventEmitter<any>` | Emitted when radio button is selected (returns the value) |

#### Features

- ✅ **Angular Forms Integration** - Full support for `ngModel` and reactive forms
- ✅ **Two Visual Variants** - Dot (filled circle) and Tick (checkmark) styles
- ✅ **Four Size Variants** - Extra Small (`xsm`), Small (`sm`), Medium (`md`), Large (`lg`)
- ✅ **Radio Groups** - Automatically groups radio buttons with the same `ngModel` binding
- ✅ **Accessibility** - ARIA attributes, keyboard navigation (Enter/Space), and screen reader support
- ✅ **Disabled State** - Visual and functional disabled state
- ✅ **Keyboard Support** - Full keyboard navigation with Enter and Space keys
- ✅ **Focus Management** - Focus visible ring for keyboard users
- ✅ **Event Handling** - `change` event for selection notifications

#### Usage Examples

**Basic Radio Group with ngModel:**

```typescript
import { BkRadioButton } from '@brickclay/ui';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <bk-radio-button
      [(ngModel)]="selectedPayment"
      [value]="'credit'"
      [label]="'Credit Card'"
    >
    </bk-radio-button>

    <bk-radio-button [(ngModel)]="selectedPayment" [value]="'debit'" [label]="'Debit Card'">
    </bk-radio-button>

    <bk-radio-button [(ngModel)]="selectedPayment" [value]="'paypal'" [label]="'PayPal'">
    </bk-radio-button>
  `,
  imports: [BkRadioButton, FormsModule],
})
export class MyComponent {
  selectedPayment = 'credit';
}
```

**Dot Variant (Default):**

```typescript
<bk-radio-button
  [(ngModel)]="selectedOption"
  [value]="'option1'"
  [variant]="'dot'"
  [label]="'Option with Dot'">
</bk-radio-button>
```

**Tick Variant:**

```typescript
<bk-radio-button
  [(ngModel)]="selectedOption"
  [value]="'option2'"
  [variant]="'tick'"
  [label]="'Option with Tick'">
</bk-radio-button>
```

**Different Sizes:**

```typescript
<!-- Extra Small radio -->
<bk-radio-button
  [(ngModel)]="selectedOption"
  [value]="'xsm'"
  [radioClass]="'xsm'"
  [label]="'Extra Small Radio'">
</bk-radio-button>

<!-- Small radio -->
<bk-radio-button
  [(ngModel)]="selectedOption"
  [value]="'sm'"
  [radioClass]="'sm'"
  [label]="'Small Radio'">
</bk-radio-button>

<!-- Medium radio -->
<bk-radio-button
  [(ngModel)]="selectedOption"
  [value]="'md'"
  [radioClass]="'md'"
  [label]="'Medium Radio'">
</bk-radio-button>

<!-- Large radio with custom label styling -->
<bk-radio-button
  [(ngModel)]="selectedOption"
  [value]="'lg'"
  [radioClass]="'lg'"
  [labelClass]="'text-lg font-bold'"
  [label]="'Large Radio'">
</bk-radio-button>
```

**Disabled State:**

```typescript
<bk-radio-button
  [(ngModel)]="selectedOption"
  [value]="'disabled-option'"
  [disabled]="true"
  [label]="'Disabled Option'">
</bk-radio-button>
```

**With Event Handler:**

```typescript
@Component({
  template: `
    <bk-radio-button
      *ngFor="let option of options"
      [(ngModel)]="selectedOption"
      [value]="option.value"
      [label]="option.label"
      (change)="onOptionChange($event)"
    >
    </bk-radio-button>
  `,
})
export class MyComponent {
  options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];
  selectedOption = 'option1';

  onOptionChange(value: any) {
    console.log('Selected:', value);
  }
}
```

**Reactive Forms Integration:**

```typescript
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BkRadioButton } from '@brickclay/ui';

@Component({
  template: `
    <form [formGroup]="surveyForm">
      <bk-radio-button formControlName="rating" [value]="'excellent'" [label]="'Excellent'">
      </bk-radio-button>

      <bk-radio-button formControlName="rating" [value]="'good'" [label]="'Good'">
      </bk-radio-button>

      <bk-radio-button formControlName="rating" [value]="'fair'" [label]="'Fair'">
      </bk-radio-button>
    </form>
  `,
  imports: [BkRadioButton, ReactiveFormsModule],
})
export class SurveyComponent {
  surveyForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.surveyForm = this.fb.group({
      rating: ['good', Validators.required],
    });
  }
}
```

**Without Label:**

```typescript
<bk-radio-button
  [(ngModel)]="selectedOption"
  [value]="'option1'"
  [radioClass]="'md'">
</bk-radio-button>
```

**Dynamic Radio Group:**

```typescript
@Component({
  template: `
    <div>
      <bk-radio-button
        *ngFor="let item of items"
        [(ngModel)]="selectedItem"
        [value]="item.id"
        [label]="item.name"
        [variant]="item.variant || 'dot'"
      >
      </bk-radio-button>
    </div>
  `,
})
export class MyComponent {
  items = [
    { id: 1, name: 'Item 1', variant: 'dot' },
    { id: 2, name: 'Item 2', variant: 'tick' },
    { id: 3, name: 'Item 3', variant: 'dot' },
  ];
  selectedItem = 1;
}
```

#### Styling

The radio button component supports predefined size classes:

- **Extra Small**: `xsm` - 14px × 14px
- **Small**: `sm` - 16px × 16px
- **Medium**: `md` - 18px × 18px
- **Large**: `lg` - 19px × 19px

Use `labelClass` to style the label text (font size, weight, color, etc.)

The component includes built-in styles for:

- **Dot Variant**: Filled circle indicator when selected (size varies by radioClass)
- **Tick Variant**: Checkmark indicator when selected (size varies by radioClass)
- Unselected state (white background with gray border)
- Hover states (darker border on hover)
- Disabled states (gray background and border)
- Focus ring for accessibility (blue ring with offset)
- Smooth transitions for state changes

#### Accessibility

The radio button component includes:

- Keyboard navigation support (Enter and Space keys)
- Focus visible ring for keyboard users
- Proper ARIA attributes
- Disabled state properly communicated to assistive technologies
- Tab navigation support
- Radio group semantics for screen readers

#### Radio Groups

Radio buttons are automatically grouped when they share the same `ngModel` binding. Only one radio button in a group can be selected at a time. When a radio button is selected, the previously selected one in the same group is automatically deselected.

## 💊 Pill

A versatile pill component for displaying labels, tags, or status indicators. Perfect for categorizing content, showing status, or creating removable tag lists. Supports multiple visual variants, color schemes, sizes, and optional dot indicators.

### BkPill

A standalone pill component that displays text labels with customizable styling and optional removal functionality.

#### Basic Example

```typescript
import { BkPill } from '@brickclay/ui';

@Component({
  template: `
    <bk-pill
      [label]="'New Feature'"
      [variant]="'Solid'"
      [color]="'Primary'"
      [size]="'md'"
      (clicked)="onPillRemoved($event)"
    >
    </bk-pill>
  `,
  imports: [BkPill],
})
export class MyComponent {
  onPillRemoved(label: string) {
    console.log('Pill removed:', label);
  }
}
```

#### Component Selector

`<bk-pill>`

#### Inputs

| Input        | Type                                    | Default   | Description                                                          |
| ------------ | --------------------------------------- | --------- | -------------------------------------------------------------------- |
| `label`      | `string`                                | `''`      | The text content displayed in the pill                               |
| `variant`    | `'Light' \| 'Solid' \| 'Outline' \| 'Transparent'` | `'Light'` | Visual style variant                                                 |
| `color`      | `'Gray' \| 'Primary' \| 'Error' \| 'Warning' \| 'Success' \| 'Purple' \| 'Cyan'` | `'Gray'` | Color scheme for the pill                                            |
| `size`       | `'xsm' \| 'sm' \| 'md' \| 'lg'`         | `'md'`    | Size variant of the pill                                             |
| `dot`        | `'left' \| 'right' \| 'none'`          | `'none'`  | Position of optional dot indicator (left, right, or none)            |
| `removable`  | `boolean`                               | `false`   | Whether to show a remove button                                      |
| `customClass`| `string`                                | `''`      | Additional CSS classes for custom styling                            |

#### Outputs

| Output   | Type                     | Description                                           |
| -------- | ------------------------ | ----------------------------------------------------- |
| `clicked`| `EventEmitter<string>`   | Emitted when the remove button is clicked (returns label) |

#### Features

- ✅ **Multiple Variants** - Light, Solid, Outline, and Transparent styles
- ✅ **Color Options** - Gray, Primary, Error, Warning, Success, Purple, and Cyan
- ✅ **Size Variants** - Extra Small (`xsm`), Small (`sm`), Medium (`md`), Large (`lg`)
- ✅ **Dot Indicators** - Optional dot indicator on left or right side
- ✅ **Removable** - Optional remove button with click event
- ✅ **Custom Styling** - Additional CSS classes for custom appearance
- ✅ **Event Handling** - `clicked` event for remove button interactions

#### Usage Examples

**Basic Pill:**

```typescript
import { BkPill } from '@brickclay/ui';

@Component({
  template: `
    <bk-pill [label]="'Status'" [color]="'Success'"> </bk-pill>
  `,
  imports: [BkPill],
})
export class MyComponent {}
```

**Different Variants:**

```typescript
<!-- Light variant -->
<bk-pill
  [label]="'Light Pill'"
  [variant]="'Light'"
  [color]="'Primary'">
</bk-pill>

<!-- Solid variant -->
<bk-pill
  [label]="'Solid Pill'"
  [variant]="'Solid'"
  [color]="'Primary'">
</bk-pill>

<!-- Outline variant -->
<bk-pill
  [label]="'Outline Pill'"
  [variant]="'Outline'"
  [color]="'Primary'">
</bk-pill>

<!-- Transparent variant -->
<bk-pill
  [label]="'Transparent Pill'"
  [variant]="'Transparent'"
  [color]="'Primary'">
</bk-pill>
```

**Different Colors:**

```typescript
<bk-pill [label]="'Gray'" [color]="'Gray'"> </bk-pill>
<bk-pill [label]="'Primary'" [color]="'Primary'"> </bk-pill>
<bk-pill [label]="'Error'" [color]="'Error'"> </bk-pill>
<bk-pill [label]="'Warning'" [color]="'Warning'"> </bk-pill>
<bk-pill [label]="'Success'" [color]="'Success'"> </bk-pill>
<bk-pill [label]="'Purple'" [color]="'Purple'"> </bk-pill>
<bk-pill [label]="'Cyan'" [color]="'Cyan'"> </bk-pill>
```

**Different Sizes:**

```typescript
<!-- Extra Small -->
<bk-pill [label]="'XSM'" [size]="'xsm'"> </bk-pill>

<!-- Small -->
<bk-pill [label]="'SM'" [size]="'sm'"> </bk-pill>

<!-- Medium -->
<bk-pill [label]="'MD'" [size]="'md'"> </bk-pill>

<!-- Large -->
<bk-pill [label]="'LG'" [size]="'lg'"> </bk-pill>
```

**With Dot Indicators:**

```typescript
<!-- Dot on left -->
<bk-pill
  [label]="'Active'"
  [dot]="'left'"
  [color]="'Success'">
</bk-pill>

<!-- Dot on right -->
<bk-pill
  [label]="'Pending'"
  [dot]="'right'"
  [color]="'Warning'">
</bk-pill>
```

**Removable Pill:**

```typescript
@Component({
  template: `
    <bk-pill
      [label]="'Removable Tag'"
      [removable]="true"
      (clicked)="onRemoveTag($event)">
    </bk-pill>
  `,
})
export class MyComponent {
  onRemoveTag(label: string) {
    console.log('Removed:', label);
    // Remove from list, update state, etc.
  }
}
```

**Dynamic Pill List:**

```typescript
@Component({
  template: `
    <div>
      <bk-pill
        *ngFor="let tag of tags"
        [label]="tag"
        [removable]="true"
        [color]="getTagColor(tag)"
        (clicked)="removeTag(tag)">
      </bk-pill>
    </div>
  `,
})
export class MyComponent {
  tags = ['Angular', 'TypeScript', 'RxJS', 'NgRx'];

  removeTag(tag: string) {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  getTagColor(tag: string): 'Primary' | 'Success' | 'Warning' {
    // Custom logic to determine color
    return 'Primary';
  }
}
```

**With Custom Classes:**

```typescript
<bk-pill
  [label]="'Custom Styled'"
  [customClass]="'my-custom-class font-bold'">
</bk-pill>
```

#### Styling

The pill component supports predefined size classes:

- **Extra Small**: `xsm`
- **Small**: `sm`
- **Medium**: `md` - Default
- **Large**: `lg`

The component includes built-in styles for:

- All variant styles (Light, Solid, Outline, Transparent)
- All color schemes (Gray, Primary, Error, Warning, Success, Purple, Cyan)
- Dot indicators (left and right positions)
- Remove button styling
- Hover states
- Smooth transitions

## 🏷️ Badge

A flexible badge component for displaying labels, tags, or status indicators. Perfect for categorizing content, showing status, or creating removable tag lists. Supports multiple visual variants, color schemes, sizes, and optional dot indicators.

### BadgeComponent

A standalone badge component that displays text labels with customizable styling and optional removal functionality.

#### Basic Example

```typescript
import { BkBadge } from '@brickclay/ui';

@Component({
  template: `
    <bk-badge
      [label]="'New'"
      [variant]="'Solid'"
      [color]="'Primary'"
      [size]="'md'"
      (clicked)="onBadgeRemoved($event)"
    >
    </bk-badge>
  `,
  imports: [BkBadge],
})
export class MyComponent {
  onBadgeRemoved(label: string) {
    console.log('Badge removed:', label);
  }
}
```

#### Component Selector

`<bk-badge>`

#### Inputs

| Input        | Type                                    | Default   | Description                                                          |
| ------------ | --------------------------------------- | --------- | -------------------------------------------------------------------- |
| `label`      | `string`                                | `''`      | The text content displayed in the badge                              |
| `variant`    | `'Light' \| 'Solid' \| 'Outline' \| 'Transparent'` | `'Light'` | Visual style variant                                                 |
| `color`      | `'Gray' \| 'Primary' \| 'Error' \| 'Warning' \| 'Success' \| 'Purple' \| 'Cyan'` | `'Gray'` | Color scheme for the badge                                           |
| `size`       | `'xsm' \| 'sm' \| 'md' \| 'lg'`         | `'md'`    | Size variant of the badge                                            |
| `dot`        | `'left' \| 'right' \| 'none'`          | `'none'`  | Position of optional dot indicator (left, right, or none)            |
| `removable`  | `boolean`                               | `false`   | Whether to show a remove button                                      |
| `customClass`| `string`                                | `''`      | Additional CSS classes for custom styling                            |

#### Outputs

| Output   | Type                     | Description                                           |
| -------- | ------------------------ | ----------------------------------------------------- |
| `clicked`| `EventEmitter<string>`   | Emitted when the remove button is clicked (returns label) |

#### Features

- ✅ **Multiple Variants** - Light, Solid, Outline, and Transparent styles
- ✅ **Color Options** - Gray, Primary, Error, Warning, Success, Purple, and Cyan
- ✅ **Size Variants** - Extra Small (`xsm`), Small (`sm`), Medium (`md`), Large (`lg`)
- ✅ **Dot Indicators** - Optional dot indicator on left or right side
- ✅ **Removable** - Optional remove button with click event
- ✅ **Custom Styling** - Additional CSS classes for custom appearance
- ✅ **Event Handling** - `clicked` event for remove button interactions

#### Usage Examples

**Basic Badge:**

```typescript
import { BkBadge } from '@brickclay/ui';

@Component({
  template: `
    <bk-badge [label]="'New'" [color]="'Success'"> </bk-badge>
  `,
  imports: [BkBadge],
})
export class MyComponent {}
```

**Different Variants:**

```typescript
<!-- Light variant -->
<bk-badge
  [label]="'Light Badge'"
  [variant]="'Light'"
  [color]="'Primary'">
</bk-badge>

<!-- Solid variant -->
<bk-badge
  [label]="'Solid Badge'"
  [variant]="'Solid'"
  [color]="'Primary'">
</bk-badge>

<!-- Outline variant -->
<bk-badge
  [label]="'Outline Badge'"
  [variant]="'Outline'"
  [color]="'Primary'">
</bk-badge>

<!-- Transparent variant -->
<bk-badge
  [label]="'Transparent Badge'"
  [variant]="'Transparent'"
  [color]="'Primary'">
</bk-badge>
```

**Different Colors:**

```typescript
<bk-badge [label]="'Gray'" [color]="'Gray'"> </bk-badge>
<bk-badge [label]="'Primary'" [color]="'Primary'"> </bk-badge>
<bk-badge [label]="'Error'" [color]="'Error'"> </bk-badge>
<bk-badge [label]="'Warning'" [color]="'Warning'"> </bk-badge>
<bk-badge [label]="'Success'" [color]="'Success'"> </bk-badge>
<bk-badge [label]="'Purple'" [color]="'Purple'"> </bk-badge>
<bk-badge [label]="'Cyan'" [color]="'Cyan'"> </bk-badge>
```

**Different Sizes:**

```typescript
<!-- Extra Small -->
<bk-badge [label]="'XSM'" [size]="'xsm'"> </bk-badge>

<!-- Small -->
<bk-badge [label]="'SM'" [size]="'sm'"> </bk-badge>

<!-- Medium -->
<bk-badge [label]="'MD'" [size]="'md'"> </bk-badge>

<!-- Large -->
<bk-badge [label]="'LG'" [size]="'lg'"> </bk-badge>
```

**With Dot Indicators:**

```typescript
<!-- Dot on left -->
<bk-badge
  [label]="'Active'"
  [dot]="'left'"
  [color]="'Success'">
</bk-badge>

<!-- Dot on right -->
<bk-badge
  [label]="'Pending'"
  [dot]="'right'"
  [color]="'Warning'">
</bk-badge>
```

**Removable Badge:**

```typescript
@Component({
  template: `
    <bk-badge
      [label]="'Removable Tag'"
      [removable]="true"
      (clicked)="onRemoveTag($event)">
    </bk-badge>
  `,
})
export class MyComponent {
  onRemoveTag(label: string) {
    console.log('Removed:', label);
    // Remove from list, update state, etc.
  }
}
```

**Dynamic Badge List:**

```typescript
@Component({
  template: `
    <div>
      <bk-badge
        *ngFor="let tag of tags"
        [label]="tag"
        [removable]="true"
        [color]="getTagColor(tag)"
        (clicked)="removeTag(tag)">
      </bk-badge>
    </div>
  `,
})
export class MyComponent {
  tags = ['Angular', 'TypeScript', 'RxJS', 'NgRx'];

  removeTag(tag: string) {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  getTagColor(tag: string): 'Primary' | 'Success' | 'Warning' {
    // Custom logic to determine color
    return 'Primary';
  }
}
```

**With Custom Classes:**

```typescript
<bk-badge
  [label]="'Custom Styled'"
  [customClass]="'my-custom-class font-bold'">
</bk-badge>
```

#### Styling

The badge component supports predefined size classes:

- **Extra Small**: `xsm`
- **Small**: `sm`
- **Medium**: `md` - Default
- **Large**: `lg`

The component includes built-in styles for:

- All variant styles (Light, Solid, Outline, Transparent)
- All color schemes (Gray, Primary, Error, Warning, Success, Purple, Cyan)
- Dot indicators (left and right positions)
- Remove button styling
- Hover states
- Smooth transitions

## 📐 TypeScript Interfaces

### CalendarRange

```typescript
interface CalendarRange {
  start: Date;
  end: Date;
}
```

### CalendarSelection

```typescript
interface CalendarSelection {
  startDate: Date | null;
  endDate: Date | null;
  selectedDates?: Date[]; // For multi-date selection
}
```

### TimeConfiguration

```typescript
interface TimeConfiguration {
  date: Date;
  allDay: boolean;
  startTime: string; // Format: "HH:mm" or "HH:mm:ss"
  endTime: string;
}
```

### ScheduledDateSelection

```typescript
interface ScheduledDateSelection {
  mode: 'single' | 'multiple' | 'range';
  singleDate?: {
    startDate: Date;
    endDate: Date;
    allDay: boolean;
    startTime: string;
    endTime: string;
  };
  multipleDates?: TimeConfiguration[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
    allDay: boolean;
    startTime: string;
    endTime: string;
  };
}
```

## 🎯 Common Use Cases

### Form Integration

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BkCustomCalendar } from '@brickclay/ui';

export class BookingFormComponent {
  bookingForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.bookingForm = this.fb.group({
      checkIn: [null, Validators.required],
      checkOut: [null, Validators.required],
    });
  }

  onDateSelected(selection: CalendarSelection) {
    this.bookingForm.patchValue({
      checkIn: selection.startDate,
      checkOut: selection.endDate,
    });
  }
}
```

### Reactive Forms

```typescript
<bk-custom-calendar
  [selectedValue]="form.get('dateRange')?.value"
  (selected)="form.patchValue({ dateRange: $event })">
</bk-custom-calendar>
```

### Date Filtering

```typescript
export class DataTableComponent {
  filterDates: CalendarSelection = { startDate: null, endDate: null };

  onDateFilter(selection: CalendarSelection) {
    this.filterDates = selection;
    this.loadFilteredData();
  }

  loadFilteredData() {
    const filtered = this.data.filter((item) => {
      if (!this.filterDates.startDate || !this.filterDates.endDate) {
        return true;
      }
      return item.date >= this.filterDates.startDate! && item.date <= this.filterDates.endDate!;
    });
  }
}
```

## 📦 Assets Configuration

The calendar components require SVG icons. Configure your `angular.json` to copy assets:

```json
{
  "glob": "**/*",
  "input": "node_modules/@brickclay/ui/assets",
  "output": "assets"
}
```

Or manually copy assets from:

```
node_modules/@brickclay/ui/assets/calender/* → your-app/public/assets/calender/
```

## 🔧 Service

### CalendarManagerService

A service that manages multiple calendar instances, ensuring only one calendar is open at a time when not in inline mode. Used internally by `BkCustomCalendar`.

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📦 Dependencies

- Angular 20.3.0+
- moment (for date formatting)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## 📄 License

MIT

## 📞 Support

For issues, feature requests, or contributions, please visit our [GitHub repository](https://github.com/brickclay/ui).

## 🗺️ Roadmap

- [ ] Button components
- [ ] Input components
- [ ] Card components
- [ ] Modal/Dialog components
- [ ] Table components
- [ ] Form components
- [ ] Navigation components
- [ ] Loading/Spinner components
- [ ] Toast/Notification components
- [ ] More calendar features

## 📝 Changelog

### Version 0.0.1

**Initial Release:**

- ✅ Calendar component suite
  - Single date selection
  - Date range selection
  - Multiple date selection
  - Time picker integration
  - Inline and dropdown modes
  - Dual calendar view
  - Custom date ranges
  - Date constraints (min/max)
- ✅ Scheduled date picker component
- ✅ Standalone time picker component
- ✅ Toggle/Switch component
  - Angular forms integration (ngModel & reactive forms)
  - Three size variants (small, medium, large)
  - Disabled state support
  - Full accessibility features
  - Customizable styling
- ✅ Checkbox component
  - Angular forms integration (ngModel & reactive forms)
  - Customizable styling via CSS classes
  - Disabled state support
  - Full keyboard navigation support
  - Complete accessibility features
- ✅ Radio button component
  - Angular forms integration (ngModel & reactive forms)
  - Two visual variants (dot and tick)
  - Radio group support
  - Customizable styling via CSS classes
  - Disabled state support
  - Full keyboard navigation support
  - Complete accessibility features
- ✅ Pill component
  - Multiple visual variants (Light, Solid, Outline, Transparent)
  - Seven color options (Gray, Primary, Error, Warning, Success, Purple, Cyan)
  - Four size variants (xsm, sm, md, lg)
  - Optional dot indicators (left, right, none)
  - Removable functionality with click events
  - Custom CSS class support
- ✅ Badge component
  - Multiple visual variants (Light, Solid, Outline, Transparent)
  - Seven color options (Gray, Primary, Error, Warning, Success, Purple, Cyan)
  - Four size variants (xsm, sm, md, lg)
  - Optional dot indicators (left, right, none)
  - Removable functionality with click events
  - Custom CSS class support
- ✅ TypeScript definitions
- ✅ Comprehensive documentation

---

**Built with ❤️ by the Brickclay team**
