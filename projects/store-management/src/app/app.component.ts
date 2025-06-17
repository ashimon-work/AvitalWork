import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { T, TranslatePipe } from '@shared/i18n';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public tKeys = T;
  title = 'store-management';
}
