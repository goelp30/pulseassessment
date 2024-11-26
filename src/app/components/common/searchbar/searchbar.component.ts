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

  @Input() placeholder: string = 'Search...'; 
  @Input() class: string = 'Search...'; 
  @Output() searchQueryChange = new EventEmitter<string>(); 

  searchQuery: string = ''; 

  onSearchInput(): void {
    this.searchQueryChange.emit(this.searchQuery); 
  }
}
