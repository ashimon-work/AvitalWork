import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AddressInput {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

@Component({
  selector: 'app-map-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-card.component.html',
  styleUrls: ['./map-card.component.scss']
})
export class MapCardComponent implements OnInit {
  @Input() address: AddressInput | null = null;
  @Input() mapPlaceholderText: string = 'Map will be displayed here.';

  constructor() { }

  ngOnInit(): void {
    if (this.address) {
      // In a real scenario, initialize map SDK here with the address
      console.log('MapCardComponent initialized with address:', this.address);
    } else {
      console.warn('MapCardComponent: Address input is missing.');
    }
  }

  get formattedAddress(): string {
    if (!this.address) {
      return 'Address not available.';
    }
    return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
  }
}