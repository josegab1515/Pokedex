import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-btn-more',
  imports: [],
  templateUrl: './btn-more.component.html',
  styleUrls: ['./btn-more.component.css'],
  standalone: true
})

export class BtnMoreComponent {
  @Input() mostrar: boolean = true;
  @Input() texto: string = 'Carregar mais'; 
  @Output() clique = new EventEmitter<void>();

  carregar() {
    this.clique.emit();
  }
}
