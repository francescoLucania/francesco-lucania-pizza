import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'neo-ui-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [DatePipe],
})
export class FooterStandaloneComponent {
  public date = Date.now();
}
