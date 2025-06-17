import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-account-stats-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-stats-bar.component.html',
  styleUrl: './account-stats-bar.component.scss'
})
export class AccountStatsBarComponent {
  @Input() totalOrders: number = 0;
  @Input() rewardPoints: number = 0;

  get stats(): Stat[] {
    return [
      {
        id: 'orders',
        label: 'Total Orders',
        value: this.formatNumber(this.totalOrders),
        icon: 'assets/icons/package.svg',
        description: 'Orders placed'
      },
      {
        id: 'points',
        label: 'Reward Points', 
        value: this.formatNumber(this.rewardPoints),
        icon: 'assets/icons/award.svg',
        description: 'Coming soon'
      }
    ];
  }

  private formatNumber(num: number): string {
    return num.toLocaleString();
  }
} 