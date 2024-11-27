import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent { 
  @Input() placeholder: string = 'Search...'; // Default placeholder
  @Input() class: string = 'Search...'; // Default placeholder
  @Output() searchQueryChange = new EventEmitter<string>(); // Output event to send the search query

  searchQuery: string = ''; // Local variable for the search query

  onSearchInput(): void {
    this.searchQueryChange.emit(this.searchQuery); // Emit the search query to the parent component
  }
}
