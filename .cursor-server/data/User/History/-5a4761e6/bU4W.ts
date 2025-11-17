/**
 * Reusable scroll utility for smooth scrolling operations
 *
 * Provides consistent, reusable scroll logic across components.
 */
export interface ScrollOptions {
  distance?: number;
  behavior?: ScrollBehavior;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export class ScrollUtility {
  /**
   * Default scroll configuration
   */
  private static readonly DEFAULT_OPTIONS: Required<ScrollOptions> = {
    distance: 200,
    behavior: 'smooth',
    direction: 'left',
  };

  /**
   * Scrolls an element by the specified amount in the given direction
   *
   * @param element - The HTML element to scroll
   * @param options - Scroll configuration options
   */
  static scrollElement(
    element: HTMLElement,
    options: ScrollOptions = {}
  ): void {
    const config = { ...this.DEFAULT_OPTIONS, ...options };

    const scrollOptions: ScrollToOptions = {
      behavior: config.behavior,
      left: 0,
      top: 0,
    };

    switch (config.direction) {
      case 'left':
        scrollOptions.left = -config.distance;
        break;
      case 'right':
        scrollOptions.left = config.distance;
        break;
      case 'up':
        scrollOptions.top = -config.distance;
        break;
      case 'down':
        scrollOptions.top = config.distance;
        break;
    }

    element.scrollBy(scrollOptions);
  }

  /** Scroll left */
  static scrollLeft(
    element: HTMLElement,
    distance = 200,
    behavior: ScrollBehavior = 'smooth'
  ): void {
    this.scrollElement(element, { direction: 'left', distance, behavior });
  }

  /** Scroll right */
  static scrollRight(
    element: HTMLElement,
    distance = 200,
    behavior: ScrollBehavior = 'smooth'
  ): void {
    this.scrollElement(element, { direction: 'right', distance, behavior });
  }

  /** Scroll up */
  static scrollUp(
    element: HTMLElement,
    distance = 200,
    behavior: ScrollBehavior = 'smooth'
  ): void {
    this.scrollElement(element, { direction: 'up', distance, behavior });
  }

  /** Scroll down */
  static scrollDown(
    element: HTMLElement,
    distance = 200,
    behavior: ScrollBehavior = 'smooth'
  ): void {
    this.scrollElement(element, { direction: 'down', distance, behavior });
  }

  /**
   * Checks if an element can scroll further in the specified direction
   */
  static canScroll(
    element: HTMLElement,
    direction: 'left' | 'right' | 'up' | 'down'
  ): boolean {
    switch (direction) {
      case 'left':
        return element.scrollLeft > 0;
      case 'right':
        return element.scrollLeft < element.scrollWidth - element.clientWidth;
      case 'up':
        return element.scrollTop > 0;
      case 'down':
        return element.scrollTop < element.scrollHeight - element.clientHeight;
      default:
        return false;
    }
  }

  /**
   * Checks if an element is at the scroll end in the specified direction
   */
  static isAtScrollEnd(
    element: HTMLElement,
    direction: 'left' | 'right' | 'up' | 'down'
  ): boolean {
    const threshold = 5; // for floating precision
    switch (direction) {
      case 'left':
        return element.scrollLeft <= threshold;
      case 'right':
        return (
          element.scrollLeft >=
          element.scrollWidth - element.clientWidth - threshold
        );
      case 'up':
        return element.scrollTop <= threshold;
      case 'down':
        return (
          element.scrollTop >=
          element.scrollHeight - element.clientHeight - threshold
        );
      default:
        return true;
    }
  }
}
