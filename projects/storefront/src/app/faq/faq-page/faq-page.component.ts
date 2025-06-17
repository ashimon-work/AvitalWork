import { Component } from '@angular/core';
import { T, TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './faq-page.component.html',
  styleUrl: './faq-page.component.scss'
})
export class FaqPageComponent {
  public tKeys = T;
}
