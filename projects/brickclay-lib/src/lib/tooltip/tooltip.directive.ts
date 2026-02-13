import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[bkTooltip]',
  standalone: true,
})
export class BKTooltipDirective implements OnInit,OnChanges, OnDestroy {
  @Input('bkTooltip') tooltipContent: string | string[] = '';
  @Input('bkTooltipPosition') tooltipPosition: 'left' | 'right' | 'top' | 'bottom' = 'right';

  private tooltipElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.createTooltip();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tooltipContent'] && !changes['tooltipContent'].firstChange) {
      this.updateTooltipContent();
    }
  }

  ngOnDestroy(): void {
    this.removeTooltip();
  }


  updateTooltipContent() {
    // If tooltip doesn't exist yet and content is now available, create it
    if (!this.tooltipElement && !this.isTooltipContentEmpty()) {
      this.createTooltip();
      return;
    }

    if (!this.tooltipElement) return;
    if (this.isTooltipContentEmpty()) return;

    // remove old .text nodes
    Array.from(this.tooltipElement.querySelectorAll('.text')).forEach((el) =>
      this.renderer.removeChild(this.tooltipElement, el)
    );

    this.appendContent();
  }

  appendContent() {
    if (!this.tooltipElement) return;

    const contentLines = Array.isArray(this.tooltipContent)
      ? this.tooltipContent
      : [this.tooltipContent];

    contentLines.forEach((line: string) => {
      const div = this.renderer.createElement('div');
      this.renderer.addClass(div, 'text');
      if (line?.trim().startsWith('<')) {
        div.innerHTML = line;
      } else {
        const text = this.renderer.createText(line ?? '');
        this.renderer.appendChild(div, text);
      }
      this.renderer.appendChild(this.tooltipElement!, div);
    });
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (this.tooltipElement) {
      this.setTooltipPosition();
      this.setStyle(this.tooltipElement, {
        visibility: 'visible',
        opacity: '1',
      });
      this.renderer.setStyle(document.body, 'overflow-x', 'hidden');// ✅ temporarily lock horizontal scroll
    }
  }


  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.tooltipElement) {
      this.setStyle(this.tooltipElement, {
        visibility: 'hidden',
        opacity: '0',
      });
      this.renderer.removeStyle(document.body, 'overflow-x'); // ✅ restore scroll when tooltip hides
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowChange() {
    if (this.tooltipElement?.style.visibility === 'visible') {
      this.setTooltipPosition();
    }
  }
    private isTooltipContentEmpty(): boolean {
      if (typeof this.tooltipContent === 'string') {
        return !this.tooltipContent.trim();
      } else if (Array.isArray(this.tooltipContent)) {
        return this.tooltipContent.length === 0 || this.tooltipContent.every(line => !line.trim());
      }
      return true;
    }
  private createTooltip() {
    if(this.isTooltipContentEmpty()) return
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'bk-tooltip-content');

    // Add content
    const contentLines = Array.isArray(this.tooltipContent) ? this.tooltipContent : [this.tooltipContent];
    contentLines.forEach((line: string) => {
      const div = this.renderer.createElement('div');
      this.renderer.addClass(div, 'text');
      // this.renderer.appendChild(div, this.renderer.createText(line));
      // Check if the line contains HTML
      if (line.trim().startsWith('<')) {
        div.innerHTML = line;
      } else {
        const text = this.renderer.createText(line);
        this.renderer.appendChild(div, text);
      }
      this.renderer.appendChild(this.tooltipElement!, div);
    });

    // Add triangle
    const triangle = this.renderer.createElement('div');
    this.renderer.addClass(triangle, 'bk-tooltip-triangle');
    this.renderer.appendChild(this.tooltipElement, triangle);

    // Set base styles
    this.setStyle(this.tooltipElement!, {
      position: 'fixed',
      visibility: 'hidden',
      opacity: '0',
      zIndex: '9999',
      transition: 'opacity 0.3s ease, visibility 0.3s ease',
    });

    this.renderer.appendChild(document.body, this.tooltipElement);
  }

  private setTooltipPosition() {
    if (!this.tooltipElement) return;

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    const triangle = this.tooltipElement.querySelector('.bk-tooltip-triangle') as HTMLElement;
    const padding = 10;

    let top = 0, left = 0;

    // Position logic
    switch (this.tooltipPosition) {
      case 'right':
      case 'left':
        top = hostRect.top + scrollTop + hostRect.height / 2;
        left = this.tooltipPosition === 'right'
          ? hostRect.right + scrollLeft + padding
          : hostRect.left + scrollLeft - tooltipRect.width - padding;

        // Auto flip if out of viewport
        if (this.tooltipPosition === 'right' && left + tooltipRect.width > window.innerWidth) {
          left = hostRect.left + scrollLeft - tooltipRect.width - padding;
        } else if (this.tooltipPosition === 'left' && left < 0) {
          left = hostRect.right + scrollLeft + padding;
        }

        this.setStyle(this.tooltipElement, {
          transform: 'translateY(-50%)',
        });

        this.setTriangleStyles(triangle, this.tooltipPosition, left < hostRect.left + scrollLeft);
        break;

      case 'top':
      case 'bottom':
        left = hostRect.left + scrollLeft + hostRect.width / 2 - tooltipRect.width / 2;
        top = this.tooltipPosition === 'top'
          ? hostRect.top + scrollTop - tooltipRect.height - padding
          : hostRect.bottom + scrollTop + padding;

        // Prevent overflow
        left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));

        this.setStyle(this.tooltipElement, {
          transform: 'translateX(0)',
        });

        this.setTriangleStyles(triangle, this.tooltipPosition);
        break;
    }

    this.setStyle(this.tooltipElement, {
      top: `${top}px`,
      left: `${left}px`,
    });
  }

  private setTriangleStyles(
    triangle: HTMLElement,
    position: 'left' | 'right' | 'top' | 'bottom',
    flipped: boolean = false
  ) {
    if (!triangle) return;

    const base = {
      top: '',
      left: '',
      right: '',
      bottom: '',
      transform: '',
      borderColor: '',
    };

    let styles: any = { ...base };

    switch (position) {
      case 'right':
        styles = flipped
          ? { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(0)', borderColor: 'transparent transparent transparent #1a1a1a' }
          : { left: '-15px', top: '50%', transform: 'translateY(-50%)', borderColor: 'transparent #1a1a1a transparent transparent' };
        break;

      case 'left':
        styles = flipped
          ? { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(0)', borderColor: 'transparent transparent transparent #1a1a1a' }
          : { left: '-15px', top: '50%', transform: 'translateY(-50%)', borderColor: 'transparent #1a1a1a transparent transparent' };
        break;

      case 'top':
        styles = {
          bottom: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderColor: '#1a1a1a transparent transparent transparent',
        };
        break;

      case 'bottom':
        styles = {
          top: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderColor: 'transparent transparent #1a1a1a transparent',
        };
        break;
    }

    this.setStyle(triangle, styles);
  }

  private removeTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }

  // Utility function to apply multiple styles
  private setStyle(el: HTMLElement, styles: { [key: string]: string }) {
    Object.entries(styles).forEach(([prop, value]) => {
      this.renderer.setStyle(el, prop, value);
    });
  }
}
