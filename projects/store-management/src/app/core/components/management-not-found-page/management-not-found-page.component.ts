import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-management-not-found-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './management-not-found-page.component.html',
  styleUrl: './management-not-found-page.component.scss'
})
export class ManagementNotFoundPageComponent {
  storeSlug: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.storeSlug = this.route.snapshot.paramMap.get('storeSlug');
  }
}