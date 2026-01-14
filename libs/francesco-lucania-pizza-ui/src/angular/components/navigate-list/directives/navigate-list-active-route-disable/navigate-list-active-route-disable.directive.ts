import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Directive({
  selector: '[neoUiNavigateListActiveRouteDisable]',
  standalone: true,
})
export class NavigateListActiveRouteDisableDirective implements OnInit {
  @HostBinding('tabindex') public tabindex: string;
  @Input() public set neoUiNavigateListActiveRouteDisable(className: string) {
    this.className = className;
    if (this.elementRef.nativeElement.classList.contains(this.className)) {
      this.tabindex = '-1';
    } else {
      this.tabindex = '';
    }
  }

  private className: string;

  constructor(
    private elementRef: ElementRef,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        setTimeout(() => {
          if (
            this.elementRef.nativeElement.classList.contains(this.className)
          ) {
            this.tabindex = '-1';
          } else {
            this.tabindex = '';
          }
          this.cdr.detectChanges();
        });
      });
  }
}
