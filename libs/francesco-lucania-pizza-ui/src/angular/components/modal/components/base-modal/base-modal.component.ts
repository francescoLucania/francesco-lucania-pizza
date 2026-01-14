import { Component, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'neo-base-modal',
  templateUrl: './base-modal.component.html',
  styleUrls: ['./base-modal.component.scss'],
  imports: [NgTemplateOutlet],
  standalone: true,
})
export class BaseModalStandaloneComponent {
  public title: string;
  public content: TemplateRef<any>;
}
