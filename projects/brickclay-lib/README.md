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

_More components coming soon..._

## Installation

```bash
npm i @brickclay-org/ui@0.0.6
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
import { CustomCalendarComponent, CalendarSelection } from '@brickclay/ui';

@Component({
  standalone: true,
  selector: 'app-my-component',
  imports: [CustomCalendarComponent],
  template: `
    <brickclay-custom-calendar (selected)="onDateSelected($event)"> </brickclay-custom-calendar>
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

1. **CustomCalendarComponent** (`brickclay-custom-calendar`) - Main calendar component with support for single date, date range, and multiple date selection
2. **ScheduledDatePickerComponent** (`brickclay-scheduled-date-picker`) - Advanced scheduling component with time configuration for events
3. **TimePickerComponent** (`brickclay-time-picker`) - Standalone time selection component with scrollable pickers

### CustomCalendarComponent

A versatile calendar component that supports single date, date range, and multiple date selection modes.

#### Basic Example

```typescript
import { CustomCalendarComponent, CalendarSelection } from '@brickclay/ui';

@Component({
  template: `
    <brickclay-custom-calendar
      [singleDatePicker]="false"
      [dualCalendar]="true"
      [enableTimepicker]="true"
      [showRanges]="true"
      [placeholder]="'Select date range'"
      (selected)="onDateSelected($event)"
    >
    </brickclay-custom-calendar>
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

`<brickclay-custom-calendar>`

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
<brickclay-custom-calendar
  [singleDatePicker]="true"
  [placeholder]="'Select a date'"
  (selected)="onDateSelected($event)">
</brickclay-custom-calendar>
```

**Date Range with Time Picker:**

```typescript
<brickclay-custom-calendar
  [dualCalendar]="true"
  [enableTimepicker]="true"
  [enableSeconds]="true"
  (selected)="onRangeSelected($event)">
</brickclay-custom-calendar>
```

**Multiple Date Selection:**

```typescript
<brickclay-custom-calendar
  [multiDateSelection]="true"
  [inline]="true"
  (selected)="onMultipleDatesSelected($event)">
</brickclay-custom-calendar>
```

**Inline Calendar:**

```typescript
<brickclay-custom-calendar
  [inline]="true"
  [dualCalendar]="false"
  [showRanges]="false"
  (selected)="onDateSelected($event)">
</brickclay-custom-calendar>
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

<brickclay-custom-calendar
  [customRanges]="customRanges"
  [showRanges]="true"
  (selected)="onDateSelected($event)">
</brickclay-custom-calendar>
```

**Date Constraints:**

```typescript
<brickclay-custom-calendar
  [minDate]="new Date(2024, 0, 1)"
  [maxDate]="new Date(2024, 11, 31)"
  (selected)="onDateSelected($event)">
</brickclay-custom-calendar>
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

<brickclay-custom-calendar
  [selectedValue]="selectedValue"
  (selected)="onDateSelected($event)">
</brickclay-custom-calendar>
```

### ScheduledDatePickerComponent

A comprehensive date and time scheduling component with three modes: single date, multiple dates, and date range, each with time configuration.

#### Basic Example

```typescript
import { ScheduledDatePickerComponent, ScheduledDateSelection } from '@brickclay/ui';

@Component({
  template: `
    <brickclay-scheduled-date-picker [timeFormat]="12" (scheduled)="onScheduled($event)">
    </brickclay-scheduled-date-picker>
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

`<brickclay-scheduled-date-picker>`

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

### TimePickerComponent

A standalone time picker component with scrollable hour, minute, and AM/PM selectors.

#### Basic Example

```typescript
import { TimePickerComponent } from '@brickclay/ui';

@Component({
  template: `
    <brickclay-time-picker
      [value]="selectedTime"
      [label]="'Start Time'"
      [timeFormat]="12"
      (timeChange)="onTimeChange($event)"
    >
    </brickclay-time-picker>
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

`<brickclay-time-picker>`

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

### ToggleComponent

A standalone toggle component that implements `ControlValueAccessor` for seamless Angular forms integration.

#### Basic Example

```typescript
import { ToggleComponent } from '@brickclay/ui';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <brickclay-toggle
      [(ngModel)]="isEnabled"
      [label]="'Enable notifications'"
      (change)="onToggleChange($event)"
    >
    </brickclay-toggle>
  `,
  imports: [ToggleComponent, FormsModule],
})
export class MyComponent {
  isEnabled = false;

  onToggleChange(value: boolean) {
    console.log('Toggle state:', value);
  }
}
```

#### Component Selector

`<brickclay-toggle>`

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
import { ToggleComponent } from '@brickclay/ui';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <brickclay-toggle [(ngModel)]="isActive" [label]="'Active Status'"> </brickclay-toggle>
  `,
  imports: [ToggleComponent, FormsModule],
})
export class MyComponent {
  isActive = true;
}
```

**Different Sizes:**

```typescript
<brickclay-toggle
  [(ngModel)]="value1"
  [toggleClass]="'toggle-sm'"
  [label]="'Small Toggle'">
</brickclay-toggle>

<brickclay-toggle
  [(ngModel)]="value2"
  [toggleClass]="'toggle-md'"
  [label]="'Medium Toggle'">
</brickclay-toggle>

<brickclay-toggle
  [(ngModel)]="value3"
  [toggleClass]="'toggle-lg'"
  [label]="'Large Toggle'">
</brickclay-toggle>
```

**Disabled State:**

```typescript
<brickclay-toggle
  [ngModel]="true"
  [disabled]="true"
  [label]="'Disabled Toggle'">
</brickclay-toggle>
```

**With Event Handler:**

```typescript
@Component({
  template: `
    <brickclay-toggle
      [(ngModel)]="notificationsEnabled"
      [label]="'Email Notifications'"
      (change)="onNotificationToggle($event)"
    >
    </brickclay-toggle>
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
import { ToggleComponent } from '@brickclay/ui';

@Component({
  template: `
    <form [formGroup]="settingsForm">
      <brickclay-toggle formControlName="darkMode" [label]="'Dark Mode'"> </brickclay-toggle>

      <brickclay-toggle formControlName="notifications" [label]="'Push Notifications'">
      </brickclay-toggle>
    </form>
  `,
  imports: [ToggleComponent, ReactiveFormsModule],
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
<brickclay-toggle
  [(ngModel)]="isEnabled"
  [toggleClass]="'toggle-md'">
</brickclay-toggle>
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

### CheckboxComponent

A standalone checkbox component that implements `ControlValueAccessor` for seamless Angular forms integration.

#### Basic Example

```typescript
import { CheckboxComponent } from '@brickclay/ui';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <brickclay-checkbox
      [(ngModel)]="isAccepted"
      [label]="'I agree to the terms and conditions'"
      (change)="onCheckboxChange($event)"
    >
    </brickclay-checkbox>
  `,
  imports: [CheckboxComponent, FormsModule],
})
export class MyComponent {
  isAccepted = false;

  onCheckboxChange(value: boolean) {
    console.log('Checkbox state:', value);
  }
}
```

#### Component Selector

`<brickclay-checkbox>`

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
import { CheckboxComponent } from '@brickclay/ui';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <brickclay-checkbox [(ngModel)]="isChecked" [label]="'Accept terms'"> </brickclay-checkbox>
  `,
  imports: [CheckboxComponent, FormsModule],
})
export class MyComponent {
  isChecked = false;
}
```

**Different Sizes:**

```typescript
<!-- Extra Small checkbox -->
<brickclay-checkbox
  [(ngModel)]="value1"
  [checkboxClass]="'xsm'"
  [label]="'Extra Small Checkbox'">
</brickclay-checkbox>

<!-- Small checkbox -->
<brickclay-checkbox
  [(ngModel)]="value2"
  [checkboxClass]="'sm'"
  [label]="'Small Checkbox'">
</brickclay-checkbox>

<!-- Medium checkbox -->
<brickclay-checkbox
  [(ngModel)]="value3"
  [checkboxClass]="'md'"
  [label]="'Medium Checkbox'">
</brickclay-checkbox>

<!-- Large checkbox with custom label styling -->
<brickclay-checkbox
  [(ngModel)]="value4"
  [checkboxClass]="'lg'"
  [labelClass]="'text-lg font-bold'"
  [label]="'Large Checkbox'">
</brickclay-checkbox>
```

**Disabled State:**

```typescript
<brickclay-checkbox
  [ngModel]="true"
  [disabled]="true"
  [label]="'Disabled Checkbox'">
</brickclay-checkbox>
```

**With Event Handler:**

```typescript
@Component({
  template: `
    <brickclay-checkbox
      [(ngModel)]="newsletterSubscribed"
      [label]="'Subscribe to newsletter'"
      (change)="onNewsletterToggle($event)"
    >
    </brickclay-checkbox>
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
import { CheckboxComponent } from '@brickclay/ui';

@Component({
  template: `
    <form [formGroup]="registrationForm">
      <brickclay-checkbox
        formControlName="acceptTerms"
        [label]="'I accept the terms and conditions'"
      >
      </brickclay-checkbox>

      <brickclay-checkbox formControlName="receiveUpdates" [label]="'Receive product updates'">
      </brickclay-checkbox>
    </form>
  `,
  imports: [CheckboxComponent, ReactiveFormsModule],
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
<brickclay-checkbox
  [(ngModel)]="isSelected"
  [checkboxClass]="'md'">
</brickclay-checkbox>
```

**Multiple Checkboxes:**

```typescript
@Component({
  template: `
    <div>
      <brickclay-checkbox
        *ngFor="let option of options"
        [(ngModel)]="option.selected"
        [label]="option.label"
        (change)="onOptionChange(option)"
      >
      </brickclay-checkbox>
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

### RadioComponent

A standalone radio button component that implements `ControlValueAccessor` for seamless Angular forms integration. Radio buttons are used when only one option can be selected from a group.

#### Basic Example

```typescript
import { RadioComponent } from '@brickclay/ui';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <brickclay-radio-button
      [(ngModel)]="selectedOption"
      [value]="'option1'"
      [label]="'Option 1'"
      (change)="onRadioChange($event)"
    >
    </brickclay-radio-button>

    <brickclay-radio-button [(ngModel)]="selectedOption" [value]="'option2'" [label]="'Option 2'">
    </brickclay-radio-button>
  `,
  imports: [RadioComponent, FormsModule],
})
export class MyComponent {
  selectedOption = 'option1';

  onRadioChange(value: any) {
    console.log('Selected option:', value);
  }
}
```

#### Component Selector

`<brickclay-radio-button>`

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
import { RadioComponent } from '@brickclay/ui';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <brickclay-radio-button
      [(ngModel)]="selectedPayment"
      [value]="'credit'"
      [label]="'Credit Card'"
    >
    </brickclay-radio-button>

    <brickclay-radio-button [(ngModel)]="selectedPayment" [value]="'debit'" [label]="'Debit Card'">
    </brickclay-radio-button>

    <brickclay-radio-button [(ngModel)]="selectedPayment" [value]="'paypal'" [label]="'PayPal'">
    </brickclay-radio-button>
  `,
  imports: [RadioComponent, FormsModule],
})
export class MyComponent {
  selectedPayment = 'credit';
}
```

**Dot Variant (Default):**

```typescript
<brickclay-radio-button
  [(ngModel)]="selectedOption"
  [value]="'option1'"
  [variant]="'dot'"
  [label]="'Option with Dot'">
</brickclay-radio-button>
```

**Tick Variant:**

```typescript
<brickclay-radio-button
  [(ngModel)]="selectedOption"
  [value]="'option2'"
  [variant]="'tick'"
  [label]="'Option with Tick'">
</brickclay-radio-button>
```

**Different Sizes:**

```typescript
<!-- Extra Small radio -->
<brickclay-radio-button
  [(ngModel)]="selectedOption"
  [value]="'xsm'"
  [radioClass]="'xsm'"
  [label]="'Extra Small Radio'">
</brickclay-radio-button>

<!-- Small radio -->
<brickclay-radio-button
  [(ngModel)]="selectedOption"
  [value]="'sm'"
  [radioClass]="'sm'"
  [label]="'Small Radio'">
</brickclay-radio-button>

<!-- Medium radio -->
<brickclay-radio-button
  [(ngModel)]="selectedOption"
  [value]="'md'"
  [radioClass]="'md'"
  [label]="'Medium Radio'">
</brickclay-radio-button>

<!-- Large radio with custom label styling -->
<brickclay-radio-button
  [(ngModel)]="selectedOption"
  [value]="'lg'"
  [radioClass]="'lg'"
  [labelClass]="'text-lg font-bold'"
  [label]="'Large Radio'">
</brickclay-radio-button>
```

**Disabled State:**

```typescript
<brickclay-radio-button
  [(ngModel)]="selectedOption"
  [value]="'disabled-option'"
  [disabled]="true"
  [label]="'Disabled Option'">
</brickclay-radio-button>
```

**With Event Handler:**

```typescript
@Component({
  template: `
    <brickclay-radio-button
      *ngFor="let option of options"
      [(ngModel)]="selectedOption"
      [value]="option.value"
      [label]="option.label"
      (change)="onOptionChange($event)"
    >
    </brickclay-radio-button>
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
import { RadioComponent } from '@brickclay/ui';

@Component({
  template: `
    <form [formGroup]="surveyForm">
      <brickclay-radio-button formControlName="rating" [value]="'excellent'" [label]="'Excellent'">
      </brickclay-radio-button>

      <brickclay-radio-button formControlName="rating" [value]="'good'" [label]="'Good'">
      </brickclay-radio-button>

      <brickclay-radio-button formControlName="rating" [value]="'fair'" [label]="'Fair'">
      </brickclay-radio-button>
    </form>
  `,
  imports: [RadioComponent, ReactiveFormsModule],
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
<brickclay-radio-button
  [(ngModel)]="selectedOption"
  [value]="'option1'"
  [radioClass]="'md'">
</brickclay-radio-button>
```

**Dynamic Radio Group:**

```typescript
@Component({
  template: `
    <div>
      <brickclay-radio-button
        *ngFor="let item of items"
        [(ngModel)]="selectedItem"
        [value]="item.id"
        [label]="item.name"
        [variant]="item.variant || 'dot'"
      >
      </brickclay-radio-button>
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
import { CustomCalendarComponent } from '@brickclay/ui';

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
<brickclay-custom-calendar
  [selectedValue]="form.get('dateRange')?.value"
  (selected)="form.patchValue({ dateRange: $event })">
</brickclay-custom-calendar>
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

A service that manages multiple calendar instances, ensuring only one calendar is open at a time when not in inline mode. Used internally by `CustomCalendarComponent`.

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
- ✅ TypeScript definitions
- ✅ Comprehensive documentation

---

**Built with ❤️ by the Brickclay team**
