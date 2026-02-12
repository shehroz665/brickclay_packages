/**
 * Dialog Animations
 *
 * Architecture Decision:
 * ─────────────────────
 * Animations are implemented via the Web Animations API (WAAPI) instead of
 * Angular's @angular/animations so that:
 *  1. The dialog container stays truly standalone — no BrowserAnimationsModule
 *     dependency is required.
 *  2. We have full programmatic control over timing, easing, and cleanup.
 *  3. Future presets can be added without touching the component template.
 *
 * Each preset exports an `enter` and `leave` keyframe array plus a
 * recommended timing object. The DialogContainerComponent plays these
 * via `element.animate()`.
 */

import { DialogAnimation } from './dialog-config';

export interface AnimationKeyframes {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

/**
 * Build enter/leave WAAPI keyframes for the dialog **panel** element.
 */
export function getDialogPanelAnimation(
  preset: DialogAnimation,
  enterDuration: number,
  leaveDuration: number
): { enter: AnimationKeyframes; leave: AnimationKeyframes } {
  const easeEnter = 'cubic-bezier(0.0, 0.0, 0.2, 1)'; // decelerate
  const easeLeave = 'cubic-bezier(0.4, 0.0, 1, 1)';    // accelerate

  switch (preset) {
    // ─── Fade ────────────────────────────────────────────────────
    case 'fade':
      return {
        enter: {
          keyframes: [
            { opacity: 0, transform: 'scale(0.95)' },
            { opacity: 1, transform: 'scale(1)' },
          ],
          options: { duration: enterDuration, easing: easeEnter, fill: 'forwards' },
        },
        leave: {
          keyframes: [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.95)' },
          ],
          options: { duration: leaveDuration, easing: easeLeave, fill: 'forwards' },
        },
      };

    // ─── Zoom ────────────────────────────────────────────────────
    case 'zoom':
      return {
        enter: {
          keyframes: [
            { opacity: 0, transform: 'scale(0.5)' },
            { opacity: 1, transform: 'scale(1)' },
          ],
          options: { duration: enterDuration, easing: easeEnter, fill: 'forwards' },
        },
        leave: {
          keyframes: [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.5)' },
          ],
          options: { duration: leaveDuration, easing: easeLeave, fill: 'forwards' },
        },
      };

    // ─── Slide Top ───────────────────────────────────────────────
    case 'slide-top':
      return {
        enter: {
          keyframes: [
            { opacity: 0, transform: 'translateY(-40px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          options: { duration: enterDuration, easing: easeEnter, fill: 'forwards' },
        },
        leave: {
          keyframes: [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-40px)' },
          ],
          options: { duration: leaveDuration, easing: easeLeave, fill: 'forwards' },
        },
      };

    // ─── Slide Bottom ────────────────────────────────────────────
    case 'slide-bottom':
      return {
        enter: {
          keyframes: [
            { opacity: 0, transform: 'translateY(40px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          options: { duration: enterDuration, easing: easeEnter, fill: 'forwards' },
        },
        leave: {
          keyframes: [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(40px)' },
          ],
          options: { duration: leaveDuration, easing: easeLeave, fill: 'forwards' },
        },
      };

    // ─── Slide Left ──────────────────────────────────────────────
    case 'slide-left':
      return {
        enter: {
          keyframes: [
            { opacity: 0, transform: 'translateX(-40px)' },
            { opacity: 1, transform: 'translateX(0)' },
          ],
          options: { duration: enterDuration, easing: easeEnter, fill: 'forwards' },
        },
        leave: {
          keyframes: [
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0, transform: 'translateX(-40px)' },
          ],
          options: { duration: leaveDuration, easing: easeLeave, fill: 'forwards' },
        },
      };

    // ─── Slide Right ─────────────────────────────────────────────
    case 'slide-right':
      return {
        enter: {
          keyframes: [
            { opacity: 0, transform: 'translateX(40px)' },
            { opacity: 1, transform: 'translateX(0)' },
          ],
          options: { duration: enterDuration, easing: easeEnter, fill: 'forwards' },
        },
        leave: {
          keyframes: [
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0, transform: 'translateX(40px)' },
          ],
          options: { duration: leaveDuration, easing: easeLeave, fill: 'forwards' },
        },
      };

    // ─── None ────────────────────────────────────────────────────
    case 'none':
    default:
      return {
        enter: {
          keyframes: [{ opacity: 1 }],
          options: { duration: 0, fill: 'forwards' },
        },
        leave: {
          keyframes: [{ opacity: 0 }],
          options: { duration: 0, fill: 'forwards' },
        },
      };
  }
}

/**
 * Build enter/leave WAAPI keyframes for the **backdrop** element.
 * The backdrop always uses a simple opacity fade regardless of the
 * panel animation preset.
 */
export function getDialogBackdropAnimation(
  enterDuration: number,
  leaveDuration: number
): { enter: AnimationKeyframes; leave: AnimationKeyframes } {
  return {
    enter: {
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
      options: { duration: enterDuration, easing: 'ease-out', fill: 'forwards' },
    },
    leave: {
      keyframes: [{ opacity: 1 }, { opacity: 0 }],
      options: { duration: leaveDuration, easing: 'ease-in', fill: 'forwards' },
    },
  };
}
