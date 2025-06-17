import { Component } from '@angular/core';
import { T, TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-return-policy-page',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './return-policy-page.component.html',
  styleUrl: './return-policy-page.component.scss'
})
export class ReturnPolicyPageComponent {
  public tKeys = T;
}
