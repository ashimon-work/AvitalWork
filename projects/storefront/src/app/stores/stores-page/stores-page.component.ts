import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Store } from '@shared-types';

@Component({
  selector: 'app-stores-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stores-page.component.html',
  styleUrls: ['./stores-page.component.scss']
})
export class StoresPageComponent implements OnInit {
  stores$: Observable<Store[]>;
  loading = true;
  error: string | null = null;

  constructor(private apiService: ApiService) {
    this.stores$ = new Observable<Store[]>();
  }

  ngOnInit(): void {
    this.loadStores();
  }

  loadStores(): void {
    this.loading = true;
    this.error = null;
    
    this.stores$ = this.apiService.getAllStores();
    this.stores$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load stores. Please try again later.';
        console.error('Error loading stores:', err);
      }
    });
  }

  onImageError(event: any): void {
    // Set a fallback image if the store logo fails to load
    event.target.src = '/assets/images/default-store-logo.png';
  }
}