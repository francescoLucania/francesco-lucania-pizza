import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'pizza-lib-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [DatePipe],
})
export class FooterComponent {
  public date = Date.now();
}
