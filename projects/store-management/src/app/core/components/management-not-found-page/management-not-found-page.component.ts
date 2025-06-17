import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { T, TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-management-not-found-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './management-not-found-page.component.html',
  styleUrl: './management-not-found-page.component.scss'
})
export class ManagementNotFoundPageComponent {
  public tKeys = T;
  storeSlug: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.storeSlug = this.route.snapshot.paramMap.get('storeSlug');
  }
}