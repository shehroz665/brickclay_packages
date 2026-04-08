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
export class BKTooltipDirective implements OnInit, OnChanges, OnDestroy {
  @Input('bkTooltip') tooltipContent: string | string[] = '';
  @Input('bkTooltipPosition') tooltipPosition: 'left' | 'right' | 'top' | 'bottom' = 'right';
  @Input('bkTooltipScrollable') scrollable: boolean = false;
  @Input('bkTooltipMaxHeight') maxHeight: string = '300px';
  @Input('bkTooltipAutoHeight') autoHeight: boolean = true; // Auto-adjust height based on available space

  private tooltipElement: HTMLElement | null = null;
  private contentWrapper: HTMLElement | null = null;
  private isHoveringTooltip: boolean = false;
  private hideTimeout: any = null;
  private tooltipListeners: (() => void)[] = [];

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.createTooltip();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tooltipContent'] && !changes['tooltipContent'].firstChange) {
      this.updateTooltipContent();
    }
  }

  ngOnDestroy(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    this.cleanupTooltipListeners();
    this.removeTooltip();
  }


  updateTooltipContent() {
    // If content is now empty, destroy the tooltip so it no longer shows on hover
    if (this.isTooltipContentEmpty()) {
      this.removeTooltip();
      return;
    }

    // If tooltip doesn't exist yet and content is now available, create it
    if (!this.tooltipElement) {
      this.createTooltip();
      return;
    }

    // Update existing tooltip: remove old text nodes and re-append updated content
    Array.from(this.tooltipElement.querySelectorAll('.text')).forEach((el) =>
      this.renderer.removeChild(this.tooltipElement, el)
    );

    this.appendContent();
  }

  appendContent() {
    if (!this.tooltipElement) return;

    // Append to wrapper if scrollable, otherwise to tooltip directly
    const target = this.contentWrapper || this.tooltipElement;

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
      this.renderer.appendChild(target, div);
    });
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    // Clear any pending hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

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
    // Don't hide immediately - wait a bit to see if mouse moves to tooltip
    // Only hide if not hovering over tooltip
    if (!this.isHoveringTooltip) {
      this.hideTimeout = setTimeout(() => {
        if (!this.isHoveringTooltip && this.tooltipElement) {
          this.hideTooltip();
        }
      }, 100); // Small delay to allow mouse to move to tooltip
    }
  }

  // private hideTooltip() {
  //   if (this.tooltipElement) {
  //     this.setStyle(this.tooltipElement, {
  //       visibility: 'hidden',
  //       opacity: '0',
  //     });
  //     this.renderer.removeStyle(document.body, 'overflow-x');
  //   }
  // }

  // Hide tooltip on mousedown so it doesn't stick during CDK drag-drop
  // (CDK drag steals the element before mouseleave can fire)
  @HostListener('mousedown')
  @HostListener('touchstart')
  onInteract() {
    this.hideTooltip();
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

  private hideTooltip() {
    if (this.tooltipElement) {
      this.setStyle(this.tooltipElement, {
        visibility: 'hidden',
        opacity: '0',
      });
      this.renderer.removeStyle(document.body, 'overflow-x'); // ✅ restore scroll when tooltip hides
    }
    this.isHoveringTooltip = false;
  }

  private setupTooltipHoverListeners() {
    if (!this.tooltipElement) return;

    // Clean up existing listeners
    this.cleanupTooltipListeners();

    // Add mouseenter listener to tooltip
    const mouseEnterListener = this.renderer.listen(this.tooltipElement, 'mouseenter', () => {
      this.isHoveringTooltip = true;
      // Clear any pending hide timeout
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      // Ensure tooltip is visible
      if (this.tooltipElement) {
        this.setStyle(this.tooltipElement, {
          visibility: 'visible',
          opacity: '1',
        });
      }
    });

    // Add mouseleave listener to tooltip
    const mouseLeaveListener = this.renderer.listen(this.tooltipElement, 'mouseleave', () => {
      this.isHoveringTooltip = false;
      // Hide tooltip after a short delay
      this.hideTimeout = setTimeout(() => {
        this.hideTooltip();
      }, 100);
    });

    // Store listeners for cleanup
    this.tooltipListeners = [mouseEnterListener, mouseLeaveListener];
  }

  private cleanupTooltipListeners() {
    this.tooltipListeners.forEach(cleanup => cleanup());
    this.tooltipListeners = [];
  }
  private createTooltip() {
    if (this.isTooltipContentEmpty()) return;
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'bk-tooltip-content');

    // Add scrollable class if needed
    if (this.scrollable) {
      this.renderer.addClass(this.tooltipElement, 'bk-tooltip-scrollable');
    }

    // Create wrapper for content if scrollable
    if (this.scrollable) {
      this.contentWrapper = this.renderer.createElement('div');
      this.renderer.addClass(this.contentWrapper, 'bk-tooltip-content-wrapper');
      this.renderer.setStyle(this.contentWrapper, 'max-height', this.maxHeight);
      this.renderer.appendChild(this.tooltipElement, this.contentWrapper);
    }

    // Add content
    const contentLines = Array.isArray(this.tooltipContent)
      ? this.tooltipContent
      : [this.tooltipContent];

    const target = this.contentWrapper || this.tooltipElement;

    contentLines.forEach((line: string) => {
      const div = this.renderer.createElement('div');
      this.renderer.addClass(div, 'text');
      if (line.trim().startsWith('<')) {
        div.innerHTML = line;
      } else {
        const text = this.renderer.createText(line);
        this.renderer.appendChild(div, text);
      }
      this.renderer.appendChild(target, div);
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
      maxWidth: '300px',
      wordBreak: 'normal',        // ← only break at spaces
      overflowWrap: 'normal',     // ← don't force break
      whiteSpace: 'pre-wrap',     // ← ← ← KEY: respects spaces, wraps at word boundaries
      boxSizing: 'border-box',
    });

    this.renderer.appendChild(document.body, this.tooltipElement);
    
    // Setup hover listeners for the tooltip itself
    this.setupTooltipHoverListeners();
  }

  private setTooltipPosition() {
    if (!this.tooltipElement) return;

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    let tooltipRect = this.tooltipElement.getBoundingClientRect();

    const triangle = this.tooltipElement.querySelector('.bk-tooltip-triangle') as HTMLElement;
    const padding = 10;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Get content wrapper reference
    const contentWrapper = this.tooltipElement.querySelector('.bk-tooltip-content-wrapper') as HTMLElement;
    
    // Get actual content height first (without max-height constraint)
    let contentHeight = 0;
    
    if (contentWrapper && this.scrollable) {
      // Temporarily remove max-height to get actual content height
      const originalMaxHeight = contentWrapper.style.maxHeight;
      this.renderer.setStyle(contentWrapper, 'max-height', 'none');
      // Force reflow to get accurate scrollHeight
      contentWrapper.offsetHeight;
      contentHeight = contentWrapper.scrollHeight;
      // Restore original styles
      this.renderer.setStyle(contentWrapper, 'max-height', originalMaxHeight);
    }

    // Calculate available space and adjust max-height if scrollable and auto-height is enabled
    if (this.scrollable && this.autoHeight && contentWrapper && contentHeight > 0) {
      const spaceInfo = this.calculateAvailableSpace(
        hostRect,
        this.tooltipPosition,
        viewportHeight,
        viewportWidth,
        padding,
        contentHeight
      );

      if (spaceInfo.available > 0) {
        // Set optimal height
        const heightToUse = spaceInfo.optimalHeight;
        this.renderer.setStyle(contentWrapper, 'max-height', `${heightToUse}px`);
        
        // Only enable scroll if content exceeds available space
        if (spaceInfo.needsScroll) {
          this.renderer.setStyle(contentWrapper, 'overflow-y', 'auto');
        } else {
          this.renderer.setStyle(contentWrapper, 'overflow-y', 'hidden');
        }
        
        // Force a reflow to get updated dimensions
        contentWrapper.offsetHeight;
      }
    }
    
    // Recalculate tooltip dimensions after max-height adjustment
    tooltipRect = this.tooltipElement.getBoundingClientRect();

    let top = 0, left = 0;

    // Position logic
    switch (this.tooltipPosition) {
      case 'right':
      case 'left':
        top = hostRect.top + hostRect.height / 2;
        left =
          this.tooltipPosition === 'right'
            ? hostRect.right + padding
            : hostRect.left - tooltipRect.width - padding;

        // Auto flip if out of viewport
        if (this.tooltipPosition === 'right' && left + tooltipRect.width > viewportWidth) {
          left = hostRect.left - tooltipRect.width - padding;
        } else if (this.tooltipPosition === 'left' && left < 0) {
          left = hostRect.right + padding;
        }

        this.setStyle(this.tooltipElement, {
          transform: 'translateY(-50%)',
        });

        this.setTriangleStyles(triangle, this.tooltipPosition, left < hostRect.left);
        break;

      case 'top':
      case 'bottom':
        left = hostRect.left + hostRect.width / 2 - tooltipRect.width / 2;
        top = this.tooltipPosition === 'top'
          ? hostRect.top - tooltipRect.height - padding
          : hostRect.bottom + padding;

        // Prevent overflow
        left = Math.max(10, Math.min(left, viewportWidth - tooltipRect.width - 10));

        // Adjust vertically if tooltip goes out of viewport
        if (this.tooltipPosition === 'bottom' && top + tooltipRect.height > viewportHeight) {
          // Try positioning above instead
          if (hostRect.top - tooltipRect.height - padding >= 0) {
            top = hostRect.top - tooltipRect.height - padding;
            // Recalculate available space for top position
            if (this.scrollable && this.autoHeight && contentWrapper && contentHeight > 0) {
              const spaceInfo = this.calculateAvailableSpace(
                hostRect,
                'top',
                viewportHeight,
                viewportWidth,
                padding,
                contentHeight
              );
              if (spaceInfo.available > 0) {
                this.renderer.setStyle(contentWrapper, 'max-height', `${spaceInfo.optimalHeight}px`);
                this.renderer.setStyle(contentWrapper, 'overflow-y', spaceInfo.needsScroll ? 'auto' : 'hidden');
                contentWrapper.offsetHeight;
                tooltipRect = this.tooltipElement.getBoundingClientRect();
              }
            }
            this.setTriangleStyles(triangle, 'top');
          }
        } else if (this.tooltipPosition === 'top' && top < 0) {
          // Try positioning below instead
          if (hostRect.bottom + tooltipRect.height + padding <= viewportHeight) {
            top = hostRect.bottom + padding;
            // Recalculate available space for bottom position
            if (this.scrollable && this.autoHeight && contentWrapper && contentHeight > 0) {
              const spaceInfo = this.calculateAvailableSpace(
                hostRect,
                'bottom',
                viewportHeight,
                viewportWidth,
                padding,
                contentHeight
              );
              if (spaceInfo.available > 0) {
                this.renderer.setStyle(contentWrapper, 'max-height', `${spaceInfo.optimalHeight}px`);
                this.renderer.setStyle(contentWrapper, 'overflow-y', spaceInfo.needsScroll ? 'auto' : 'hidden');
                contentWrapper.offsetHeight;
                tooltipRect = this.tooltipElement.getBoundingClientRect();
              }
            }
            this.setTriangleStyles(triangle, 'bottom');
          }
        } else {
          this.setTriangleStyles(triangle, this.tooltipPosition);
        }

        this.setStyle(this.tooltipElement, {
          transform: 'translateX(0)',
        });
        break;
    }

    this.setStyle(this.tooltipElement, {
      top: `${top}px`,
      left: `${left}px`,
    });
  }

  /**
   * Calculates available space for tooltip based on position
   * Returns: { available: number, needsScroll: boolean, optimalHeight: number }
   */
  private calculateAvailableSpace(
    hostRect: DOMRect,
    tooltipPosition: 'left' | 'right' | 'top' | 'bottom',
    viewportHeight: number,
    viewportWidth: number,
    padding: number,
    contentHeight: number
  ): { available: number; needsScroll: boolean; optimalHeight: number } {
    if (!this.scrollable || !this.autoHeight) {
      return { available: 0, needsScroll: false, optimalHeight: 0 };
    }

    let availableSpace = 0;
    const minHeight = 100;
    const maxHeightLimit = parseInt(this.maxHeight) || 300;
    const buffer = 35; // Extra buffer to prevent cutting

    switch (tooltipPosition) {
      case 'bottom':
        const spaceBelow = viewportHeight - hostRect.bottom - padding - buffer;
        availableSpace = Math.max(minHeight, Math.min(spaceBelow, maxHeightLimit));
        break;

      case 'top':
        const spaceAbove = hostRect.top - padding - buffer;
        availableSpace = Math.max(minHeight, Math.min(spaceAbove, maxHeightLimit));
        break;

      case 'left':
      case 'right':
        const spaceBelowSide = viewportHeight - hostRect.bottom - padding - buffer;
        const spaceAboveSide = hostRect.top - padding - buffer;
        const maxVerticalSpace = Math.max(spaceBelowSide, spaceAboveSide);
        availableSpace = Math.max(minHeight, Math.min(maxVerticalSpace, maxHeightLimit));
        break;
    }

    // Check if content fits without scroll
    const needsScroll = contentHeight > availableSpace;
    // Optimal height: use content height if it fits, otherwise use available space
    const optimalHeight = needsScroll ? availableSpace : contentHeight;

    return { available: availableSpace, needsScroll, optimalHeight };
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
      this.contentWrapper = null;
    }
  }

  // Utility function to apply multiple styles
  private setStyle(el: HTMLElement, styles: { [key: string]: string }) {
    Object.entries(styles).forEach(([prop, value]) => {
      this.renderer.setStyle(el, prop, value);
    });
  }
}

