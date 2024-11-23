import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css'
})
export class SearchbarComponent {

  @Output() searchQueryChange = new EventEmitter<string>(); // Output event to send the search query

  searchQuery: string = ''; // Local variable for the search query

  onSearchInput(): void {
    this.searchQueryChange.emit(this.searchQuery); // Emit the search query to the parent component
  }
}
