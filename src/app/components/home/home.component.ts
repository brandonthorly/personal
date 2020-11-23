import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  private componentElement: HTMLElement;
  private selectedExampleClass = 'selected';

  public selectedElemRef: ElementRef;

  @ViewChild('compCard') compElemRef: ElementRef;
  @ViewChild('lofCard') lofElemRef: ElementRef;

  constructor(private hostElement: ElementRef) { }

  ngAfterViewInit(): void {
    this.componentElement = this.hostElement.nativeElement;
  }

  selectExample(cardElemRef: ElementRef): void {
    this.selectedElemRef = cardElemRef;
    const matCard: HTMLElement = cardElemRef.nativeElement;

    if (matCard) {
      const currentSelected = this.componentElement.querySelector(`.${this.selectedExampleClass}`);

      if (currentSelected) {
        currentSelected.classList.remove(this.selectedExampleClass);
      }

      matCard.classList.add(this.selectedExampleClass);
    }
  }
}
