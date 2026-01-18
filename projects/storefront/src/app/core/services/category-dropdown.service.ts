import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CategoryDropdownService {
    private dropdownState$ = new Subject<boolean>();
    private _isOpen = false;
    dropdownState = this.dropdownState$.asObservable();
    open(): void {
        this._isOpen = true;
        this.dropdownState$.next(true);
    }
    close(): void {
        this._isOpen = false;
        this.dropdownState$.next(false);
    }
    toggle(): void {
        if (this._isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    get isOpen(): boolean {
        return this._isOpen;
    }
}