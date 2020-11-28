import {AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import * as d3 from 'd3';
import {BaseType, Selection} from 'd3-selection';
import {Transition} from 'd3-transition';
import {ICoordinates} from '../shared/coordinate.interface';
import {getRandomIntInRange} from '../shared/random-int-in-range';
import {Creature} from './models/creature';

@Component({
  selector: 'app-competition-sim',
  templateUrl: './competition-sim.component.html',
  styleUrls: ['./competition-sim.component.scss']
})
export class CompetitionSimComponent implements AfterViewInit, OnChanges {
  private _creatures: Creature[];

  // viz variables
  private _colorScale: any;
  private _hostElement: HTMLElement;
  private _margin = 10;
  private _plotArea: Selection<BaseType, any, null, undefined>;
  private _radius = 10;
  private _svg: Selection<BaseType, any, null, undefined>;
  private _svgWidth: number;
  private _svgHeight: number;
  private _transition: Transition<BaseType, any, any, any>;

  public livingCount: number;

  // config form variables
  public showConfigOptions = false;
  public configForm: FormGroup;
  public baseReproductionRateControl: FormControl;
  public baseDeathRateControl: FormControl;
  public crowdingCoefficientControl: FormControl;
  public startingPopulationSizeControl: FormControl;
  public maxOffspringDeviationControl: FormControl;
  public gameSpeedControl: FormControl;
  public leastFitColor = '#00BCD4';
  public mostFitColor = '#FFEE58';
  public strokeColor = '#000000';

  // metrics logs
  public populationSizeLog: number[] = [];
  public populationChangeSizeLog: ICoordinates[] = [];
  public avgFitnessLog: number[] = [];
  public avgFitnessColor: string;
  public deltaMin: number;
  public deltaMax: number;
  public expectedN: number;

  public gameRunningInterval: any;

  @ViewChild('compSim') compElemRef: ElementRef;

  constructor(fb: FormBuilder) {
    const defaultCreature = new Creature();

    this.baseReproductionRateControl = new FormControl(defaultCreature.replicationChance, [Validators.min(0.01), Validators.max(0.99)]);
    this.baseDeathRateControl = new FormControl(defaultCreature.deathChance, [Validators.min(0.01), Validators.max(0.99)]);
    this.crowdingCoefficientControl = new FormControl(defaultCreature.crowdingCoefficient, [Validators.min(0.001), Validators.max(0.5)]);
    this.startingPopulationSizeControl = new FormControl(10, [Validators.min(1), Validators.max(100)]);
    this.maxOffspringDeviationControl = new FormControl(0, [Validators.max(0.1)]);
    this.gameSpeedControl = new FormControl(180, [Validators.min(60), Validators.max(5000)]);

    this.configForm = fb.group({
      baseReproductionRate: this.baseReproductionRateControl,
      baseDeathRate: this.baseDeathRateControl,
      crowdingCoefficient: this.crowdingCoefficientControl,
      startingPopulationSize: this.startingPopulationSizeControl,
      maxOffspringDeviation: this.maxOffspringDeviationControl,
      speed: this.gameSpeedControl,
    });
  }

  ngAfterViewInit(): void {
    this._hostElement = this.compElemRef.nativeElement;
    this.initWorld();
    this.createWorld();
  }

  ngOnChanges(): void {
    if (this._hostElement) this.createWorld(true);
  }

  private get baseReproductionRate(): AbstractControl {
    return this.configForm.get('baseReproductionRate');
  }

  private get baseDeathRate(): AbstractControl {
    return this.configForm.get('baseDeathRate');
  }

  private get crowdingCoefficient(): AbstractControl {
    return this.configForm.get('crowdingCoefficient');
  }

  private get startingPopulationSize(): AbstractControl {
    return this.configForm.get('startingPopulationSize');
  }

  private get maxOffspringDeviation(): AbstractControl {
    return this.configForm.get('maxOffspringDeviation');
  }

  private get speed(): AbstractControl {
    return this.configForm.get('speed');
  }

  createWorld(forceRandomCoords = false): void {
    this.prepSvg();
    this.assignRandomCoordinates(forceRandomCoords);
    this.createScales();
    this.createPlotArea();
    this.createCreatures();
  }

  public initWorld(): void {
    if (this.configForm.valid && this.leastFitColor && this.mostFitColor) {
      this._creatures = [];

      for (let i = 0; i < this.startingPopulationSize.value; i++) {
        this._creatures.push(
          new Creature(
            void(0),
            this.baseReproductionRate.value,
            this.baseDeathRate.value,
            this.crowdingCoefficient.value,
            this.maxOffspringDeviation.value
          )
        );
      }

      this.livingCount = this.startingPopulationSize.value;
    }
  }

  public redrawWorld(): void {
    this.clearLogs();
    this.initWorld();
    this.createWorld();
  }

  private clearLogs(): void {
    this.populationSizeLog = [];
    this.populationChangeSizeLog = [];
    this.avgFitnessLog = [];
  }

  private assignRandomCoordinates(forceRandomCoords = false): void {
    this._creatures.forEach((c: Creature) => {
      if (forceRandomCoords || !c.coordinates) {
        c.coordinates = {
          x: getRandomIntInRange(0, this._svgWidth),
          y: getRandomIntInRange(0, this._svgHeight)
        };
      }
    });
  }

  private prepSvg(): void {
    this._svg = d3.select(this._hostElement).select('svg');

    this._svg.attr('style', 'border: 1px solid black;');

    this._transition = this._svg.transition().ease(d3.easeSinInOut).delay(0).duration(300);

    this._svg.attr('viewBox', `0, 0, ${this._hostElement.offsetWidth}, ${this._hostElement.offsetHeight}`);

    this._svgWidth = this._hostElement.offsetWidth - (this._margin * 2);
    this._svgHeight = this._hostElement.offsetHeight - (this._margin * 2);
  }

  private createScales(): void {
    this._colorScale = d3.scaleLinear<string>()
      .domain([-.1, 0.1])
      .range([this.leastFitColor, this.mostFitColor])
      ;
  }

  private createPlotArea(): void {
    if (!this._plotArea) {
      this._plotArea = this._svg
        .append('g')
          .classed('plot-area', true)
          .attr('transform', `translate(${this._margin}, ${this._margin})`)
          ;
    }
  }

  private createCreatures(): void {
    const creatureSelector = 'creature';
    const creatureCircles = this._plotArea
      .selectAll(`.${creatureSelector}`)
      .data(this._creatures)
      ;

    creatureCircles.join(
      enter => enter
        .append('circle')
          .attr('class', creatureSelector)
          .attr('r', this._radius)
          .attr('cx', (d: Creature) => d.coordinates.x)
          .attr('cy', (d: Creature) => d.coordinates.y)
          .attr('stroke', this.strokeColor)
          .attr('stroke-width', 1)
          .attr('opacity', (d: Creature) => d.alive ? 1 : 0)
          .attr('fill', (d: Creature) => this._colorScale(d.replicationChance - d.deathChance)),
      update => update
        .attr('opacity', (d: Creature) => d.alive ? 1 : 0)
        .call(u => u.transition(this._transition)
          .attr('r', this._radius)
          .attr('cx', (d: Creature) => d.coordinates.x)
          .attr('cy', (d: Creature) => d.coordinates.y)
          .attr('stroke', this.strokeColor)
          .attr('fill', (d: Creature) => this._colorScale(d.replicationChance - d.deathChance)),
        ),
      exit => exit.remove()
    );
  }

  public step(): void {
    const living: Creature[] = this._creatures.filter(c => c.alive);
    const offspring: Creature[] = living
        .map(c => c.attemptReproduction())
        .filter(c => !!c) as Creature[]
        ;
    this.livingCount = living.length;
    this._creatures.forEach(c => c.attempSurvival(this.livingCount));
    this._creatures = this._creatures.concat(offspring);
    this._creatures.forEach(c => c.move(this._svgWidth, this._svgHeight));
    this.logStep();
    this.createWorld();
  }

  public logStep(): void {
    const living: Creature[] = this._creatures.filter(c => c.alive);

    this.populationSizeLog.push(living.length);
    this.populationSizeLog = [...this.populationSizeLog];

    const replicationRateSum = living.reduce((sum, c) => sum + c.replicationChance, 0);
    const replicationRateAvg = replicationRateSum / living.length;

    const deathRateSum = living.reduce((sum, c) => sum + c.deathChance, 0);
    const deathRateAvg = deathRateSum / living.length;

    this.avgFitnessLog.push(replicationRateAvg - deathRateAvg);
    this.avgFitnessLog = [...this.avgFitnessLog];
    this.avgFitnessColor = this._colorScale(this.avgFitnessLog[this.avgFitnessLog.length - 1]);

    let delta;

    if (this.populationSizeLog.length === 1) {
      delta = this.populationSizeLog[0] - this.startingPopulationSize.value;
    } else {
      delta = this.populationSizeLog[this.populationSizeLog.length - 1] - this.populationSizeLog[this.populationSizeLog.length - 2]
    }

    this.populationChangeSizeLog.push({x: living.length, y: delta});
    this.populationChangeSizeLog = [...this.populationChangeSizeLog];
    const deltas = this.populationChangeSizeLog.map((c: ICoordinates) => c.y);
    this.deltaMin = d3.min(deltas);
    this.deltaMax = d3.max(deltas);

    this.expectedN = (replicationRateAvg - deathRateAvg) / this.crowdingCoefficient.value;
  }

  public run(): void {
    this.gameRunningInterval = setInterval(() => this.step(), this.speed.value);
  }

  public stop(): void {
    clearInterval(this.gameRunningInterval);
    this.gameRunningInterval = void(0);
  }
}
