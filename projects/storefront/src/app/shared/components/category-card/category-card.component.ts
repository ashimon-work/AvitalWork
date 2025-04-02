import { Component, Input } from '@angular/core';
import { Category } from '@shared-types';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add CommonModule and RouterModule
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss'
})
export class CategoryCardComponent {

  @Input() category!: Category;
}
