import { Injectable } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StoreContextService {

  currentStoreSlug$: Observable<string | null>;

  constructor(private route: ActivatedRoute) {
    // Extract storeSlug from the route parameters
    this.currentStoreSlug$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('storeSlug'))
    );
  }
}