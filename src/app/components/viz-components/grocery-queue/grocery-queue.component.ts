import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import * as d3 from 'd3';
import {BaseType, Selection} from 'd3-selection';
import {Transition} from 'd3-transition';
import {Subscription} from 'rxjs';
import {getRandomInRange} from '../shared/random-in-range';
import {getRandomIntInRange} from '../shared/random-int-in-range';
import {Shopper} from './models/shopper';
import {ESimState} from './models/enums/sim-states.enum';
import {Simulator} from './models/simulator';

@Component({
  selector: 'app-grocery-queue',
  templateUrl: './grocery-queue.component.html',
  styleUrls: ['./grocery-queue.component.scss']
})
export class GroceryQueueComponent implements AfterViewInit {
  private _sim: Simulator;
  private _simSubscription: Subscription;

  // viz variables
  private _hostElement: HTMLElement;
  private _margin = {x: 10, y: 0};
  private _radius = 10;
  private _plotArea: Selection<BaseType, any, null, undefined>;
  private _svg: Selection<BaseType, any, null, undefined>;
  private _svgWidth: number;
  private _svgHeight: number;
  private _transition: Transition<BaseType, any, any, any>;
  private _checkoutXScale: any;
  private _queueXScale: any;

  private _staticPadding = 30;
  private _enterExitHeight = 30;
  private _checkoutQueueHeight = 30;
  private _checkoutHeight = 30;

  // static viz
  private _queueRect;
  private _enterRect;
  private _exitRect;

  // config vars
  public initialShopperCountControl: FormControl;
  public checkoutCountControl: FormControl;
  public shopperEntranceFrequencyControl: FormControl;
  public shopperItemsRVMeanControl: FormControl;
  public shopperItemsRVStdDevControl: FormControl;
  public getItemRVMeanControl: FormControl;
  public getItemRVStdDevControl: FormControl;
  public scanItemRVMeanControl: FormControl;
  public scanItemRVStdDevControl: FormControl;
  public configForm: FormGroup;

  // logs
  public averageQueueTime: number;
  public queueTimes = [];
  public shopperItemsDist = [];
  public getItemsDist = [];
  public scanItemsDist = [];

  public showConfigOptions = false;
  public running = false;

  @ViewChild('groceryQueue') groceryQueueElemRef: ElementRef;

  constructor(fb: FormBuilder) {
    this.initialShopperCountControl = new FormControl(10, [Validators.min(1), Validators.max(30)]);
    this.checkoutCountControl = new FormControl(3, [Validators.min(1), Validators.max(10)]);
    this.shopperEntranceFrequencyControl = new FormControl(120, [Validators.min(30), Validators.max(1800)]);
    this.shopperItemsRVMeanControl = new FormControl(15, [Validators.min(5), Validators.max(50)]);
    this.shopperItemsRVStdDevControl = new FormControl(20, [Validators.min(5), Validators.max(50)]);
    this.getItemRVMeanControl = new FormControl(30, [Validators.min(5), Validators.max(50)]);
    this.getItemRVStdDevControl = new FormControl(20, [Validators.min(5), Validators.max(50)]);
    this.scanItemRVMeanControl = new FormControl(15, [Validators.min(2), Validators.max(30)]);
    this.scanItemRVStdDevControl = new FormControl(10, [Validators.min(2), Validators.max(30)]);

    this.configForm = fb.group({
      initialShopperCount: this.initialShopperCountControl,
      checkoutCount: this.checkoutCountControl,
      shopperEntranceFrequency: this.shopperEntranceFrequencyControl,
      shopperItemsRVMean: this.shopperItemsRVMeanControl,
      shopperItemsRVStdDev: this.shopperItemsRVStdDevControl,
      getItemRVMean: this.getItemRVMeanControl,
      getItemRVStdDev: this.getItemRVStdDevControl,
      scanItemRVMean: this.scanItemRVMeanControl,
      scanItemRVStdDev: this.scanItemRVStdDevControl,
    });
  }

  ngAfterViewInit(): void {
    this._hostElement = this.groceryQueueElemRef.nativeElement;

    this.initSim();
    this.createStore();
  }

  public run(): void {
    this.running = true;
    this._sim.run();
  }

  public stop(): void {
    this.running = false;
    this._sim.stop();
  }

  public reInitStore(): void {
    this.clearLog();
    this.initSim();
    this.createStore();
  }

  private get initialShopperCount(): AbstractControl {
    return this.configForm.get('initialShopperCount');
  }

  private get checkoutCount(): AbstractControl {
    return this.configForm.get('checkoutCount');
  }

  private get shopperEntranceFrequency(): AbstractControl {
    return this.configForm.get('shopperEntranceFrequency');
  }

  public get shopperItemsRVMean(): AbstractControl {
    return this.configForm.get('shopperItemsRVMean');
  }

  public get shopperItemsRVStdDev(): AbstractControl {
    return this.configForm.get('shopperItemsRVStdDev');
  }

  public get getItemRVMean(): AbstractControl {
    return this.configForm.get('getItemRVMean');
  }

  public get getItemRVStdDev(): AbstractControl {
    return this.configForm.get('getItemRVStdDev');
  }

  public get scanItemRVMean(): AbstractControl {
    return this.configForm.get('scanItemRVMean');
  }

  public get scanItemRVStdDev(): AbstractControl {
    return this.configForm.get('scanItemRVStdDev');
  }

  private initSim(): void {
    if (this._simSubscription) {
      this._simSubscription.unsubscribe();
    }

    const shopperItemsRVParams = { mean: this.shopperItemsRVMean.value, stddev: this.shopperItemsRVStdDev.value };
    const getItemRVParams = { mean: this.getItemRVMean.value, stddev: this.getItemRVStdDev.value };
    const scanItemRVParams = { mean: this.scanItemRVMean.value, stddev: this.scanItemRVStdDev.value };

    this._sim = new Simulator(
      this.checkoutCount.value, this.shopperEntranceFrequency.value, this.initialShopperCount.value,
      shopperItemsRVParams, getItemRVParams, scanItemRVParams
    );

    this._sim.listen().subscribe(() => {
      this.createStore();
    });
  }

  private createStore(): void {
    this.prepSvg();
    this.createScales();
    this.createPlotArea();
    this.drawCheckouts();
    this.drawSections();
    this.drawShoppers();
    this.log();
  }

  private prepSvg(): void {
    this._svg = d3.select(this._hostElement).select('svg');

    this._svg.attr('style', `border: 1px solid black`);

    this._transition = this._svg.transition().ease(d3.easeSinInOut).delay(0).duration(300);

    this._svg.attr('viewBox', `0, 0, ${this._hostElement.offsetWidth}, ${this._hostElement.offsetHeight}`);

    this._svgWidth = this._hostElement.offsetWidth - (this._margin.x * 2);
    this._svgHeight = this._hostElement.offsetHeight - (this._margin.y * 2);
  }

  private createScales(): void {
    this._checkoutXScale = d3
      .scaleLinear()
      .domain([0, this.checkoutCount.value])
      .range([0, this._svgWidth])
      .nice()
      ;

    this._queueXScale = d3
      .scaleLinear()
      .domain([0, this._svgWidth / (this._radius * 2)])
      .range([0, this._svgWidth])
      .nice()
      ;
  }

  private createPlotArea(): void {
    if (!this._plotArea) {
      this._plotArea = this._svg
        .append('g')
          .classed('plot-area', true)
          .attr('transform', `translate(${this._margin.x}, ${this._margin.y})`)
          ;
    }
  }

  private randomColor(): string {
    const r = getRandomIntInRange(0, 255);
    const g = getRandomIntInRange(0, 255);
    const b = getRandomIntInRange(0, 255);

    return `rgb(${r}, ${g}, ${b})`;
  }

  private drawCheckouts(): void {
    const checkoutSelector = 'checkout-counter';
    const checkoutRects = this._plotArea
      .selectAll(`.${checkoutSelector}`)
      .data(Array(this.checkoutCount.value))
      ;

    checkoutRects.join(
      enter => enter
        .append('rect')
          .attr('class', checkoutSelector)
          .style('cursor', 'pointer')
          .attr('width', this._checkoutHeight)
          .attr('height', this._checkoutHeight)
          .attr('x', (d: any, i: number) => this._checkoutXScale(i))
          .attr('y', this.getCheckoutY())
          .attr('stroke', '#66BB6A')
          .attr('stroke-width', 3)
          .attr('fill', '#FFFFFF'),
      update => update
        .call(u => u.transition(this._transition)
          .attr('x', (d: any, i: number) => this._checkoutXScale(i))
        ),
      exit => exit.remove()
    );
  }

  private getQueueY(): number {
    return this._svgHeight - this._enterExitHeight - this._staticPadding - this._checkoutHeight
      - this._staticPadding - this._checkoutQueueHeight;
  }

  private getCheckoutY(): number {
    return this._svgHeight - this._enterExitHeight - this._staticPadding - this._checkoutHeight;
  }

  private getEnterExitX(): number {
    return (this._svgWidth / 2) - (this._enterExitHeight / 2);
  }

  private drawSections(): void {
    if (!this._queueRect) {
      this._queueRect = this._plotArea
        .append('rect')
        .attr('width', this._svgWidth)
        .attr('height', this._checkoutQueueHeight)
        .attr('x', 0)
        .attr('y', this.getQueueY())
        .attr('stroke', '#000000')
        .attr('stroke-width', 1)
        .attr('fill', '#FFFFFF')
        ;
    }

    if (!this._enterRect) {
      this._enterRect = this._plotArea
        .append('rect')
        .attr('width', this._enterExitHeight)
        .attr('height', this._enterExitHeight)
        .attr('x', this.getEnterExitX())
        .attr('y', 0)
        .attr('stroke', '#66BB6A')
        .attr('stroke-width', 1)
        .attr('fill', '#66BB6A')
        ;
    }

    if (!this._exitRect) {
      this._exitRect = this._plotArea
        .append('rect')
        .attr('width', this._enterExitHeight)
        .attr('height', this._enterExitHeight)
        .attr('x', this.getEnterExitX())
        .attr('y', this._svgHeight - this._enterExitHeight)
        .attr('stroke', '#F44336')
        .attr('stroke-width', 1)
        .attr('fill', '#F44336')
        ;
    }
  }

  private drawShoppers(): void {
    const shopperSelector = 'shopper';
    const shopperCircles = this._plotArea
      .selectAll(`.${shopperSelector}`)
      .data(this._sim.shoppers)
      ;

    shopperCircles.join(
      enter => enter
        .append('circle')
          .attr('class', shopperSelector)
          .attr('r', this._radius)
          .attr('cx', this._svgWidth / 2)
          .attr('cy', 0)
          .attr('opacity', 0.8)
          .attr('fill', () => this.randomColor()),
      update => update
        .call(u => u.transition(this._transition)
          .attr('cx', (d: Shopper, i: number, nodes: HTMLElement[]) => {
            if (d.state === ESimState.INIT) {
              return this._svgWidth / 2;
            } else if (d.state === ESimState.SHOPPING) {
              try {
                const offset = 150;
                const cx = +nodes[i].getAttribute('cx');

                if (cx === this._svgWidth / 2) {
                  return getRandomInRange(0, this._svgWidth);
                }

                const low = cx - offset > 0 ? cx - offset : 0;
                const high = cx + offset < this._svgWidth ? cx + offset : this._svgWidth;

                return getRandomInRange(low, high);
              } catch {
                return getRandomInRange(0, this._svgWidth);
              }
            } else if (d.state === ESimState.IN_QUEUE) {
              return this._queueXScale(d.queuePosition) + this._radius;
            } else if (d.state === ESimState.CHECKING_OUT) {
              return this._checkoutXScale(d.checkoutIndex) + (this._checkoutHeight / 2);
            } else {
              return this._svgWidth / 2;
            }
          })
          .attr('cy', (d: Shopper, i: number, nodes: HTMLElement[]) => {
            if (d.state === ESimState.INIT) {
              return 0;
            } else if (d.state === ESimState.SHOPPING) {
              const highBound = this.getQueueY() - this._staticPadding;

              try {
                const offset = 150;
                const cy = +nodes[i].getAttribute('cy');

                if (cy === 0) return getRandomInRange(0, highBound);

                const low = cy - offset > 0 ? cy - offset : 0;
                const high = cy + offset < highBound ? cy + offset : highBound;

                return getRandomInRange(low, high);
              } catch {
                return getRandomInRange(0, highBound);
              }
            } else if (d.state === ESimState.IN_QUEUE) {
              return this.getQueueY() + (this._checkoutQueueHeight / 2);
            } else if (d.state === ESimState.CHECKING_OUT) {
              return this.getCheckoutY() + (this._checkoutHeight / 2);
            } else {
              return this._svgHeight + 50;
            }
          }),
        ),
      exit => exit.remove()
    );
  }

  private log(): void {
    this.queueTimes = this._sim.shoppers
      .filter(s => !!s.enterCheckoutTime)
      .map(s => s.getTimeInQueue())
      ;

    if (this.queueTimes.length > 0) {
      this.averageQueueTime = this.queueTimes.reduce((a, b) => a + b) / this.queueTimes.length;
    }
  }

  private clearLog(): void {
    this.queueTimes = [];
    this.averageQueueTime = void(0);
  }
}
