import {Component, EventEmitter} from 'angular2/core';
import {NavbarTab} from './navbartab';

@Component({
  selector: 'navbar',
  template: `<nav class="navbar">
    <div class="nav">
      <a *ngFor="#tab of tabs"
        [class.active]="tab === selectedTab"
        (click)="onSelect(tab)"
        href="#">
        {{tab.name}}
      </a>
    </div>
  </nav>`,
  inputs: ['selectedTab'],
  events: ['selectedTabChanged']
})
export class NavbarComponent {
  public selectedTab: NavbarTab;
  public selectedTabChanged = new EventEmitter<NavbarTab>();
  private tabs: NavbarTab[] = [
    {name: "Reminders", filter: (s: number) => { return s == 1 || s == 2 }},
    {name: "Timers", filter: (s: number) => { return s == 0 }},
    {name: "Logged", filter: (s: number) => { return s > 2 }}
  ];

  constructor() {}

  ngOnInit() { this.onSelect(this.tabs[0]); }

  onSelect(tab: NavbarTab) {
    this.selectedTab = tab;
    this.selectedTabChanged.emit(tab);
  }
}
