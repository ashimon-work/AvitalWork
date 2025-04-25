import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileMenuService {
  // Using BehaviorSubject to hold the state and allow components to subscribe
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  constructor() { }

  toggleMenu(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  closeMenu(): void {
    if (this.isOpenSubject.value) {
      this.isOpenSubject.next(false);
    }
  }

  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }
}