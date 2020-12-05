import {AfterViewInit, Component, ElementRef, OnChanges, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import * as d3 from 'd3';
import {BaseType, Selection, svg, Transition} from 'd3';
import {Cell} from './models/cell';

import {Grid} from './models/grid';

@Component({
  selector: 'app-game-of-life',
  templateUrl: './game-of-life.component.html',
  styleUrls: ['./game-of-life.component.scss']
})
export class GameOfLifeComponent implements AfterViewInit, OnChanges {

  private _grid: Grid;

  // viz variables
  private _hostElement: HTMLElement;
  private _margin = 10;
  private _plotArea: Selection<BaseType, any, null, undefined>;
  private _squareLength: number;
  private _svg: Selection<BaseType, any, null, undefined>;
  private _svgWidth: number;
  private _svgHeight: number;
  private _transition: Transition<BaseType, any, any, any>;
  private _xScale: any;
  private _yScale: any;

  // config form variables
  public showConfigOptions = false;
  public configForm: FormGroup;
  public gridWidthControl: FormControl;
  public gridHeightControl: FormControl;
  public gameSpeedControl: FormControl;
  public deadColor = '#FFFFFF';
  public livingColor = '#66BB6A';
  public strokeColor = '#000000';

  public gameRunningInterval: any;
  public showSelectLiveCellsError = false;

  @ViewChild('gameOfLife') gameOfLifeElemRef: ElementRef;

  constructor(fb: FormBuilder) {
    this._grid = new Grid(40, 40, true);

    this.gridWidthControl = new FormControl(this._grid.width, Validators.min(6));
    this.gridHeightControl = new FormControl(this._grid.height, Validators.min(6));
    this.gameSpeedControl = new FormControl(180, [Validators.min(60), Validators.max(5000)]);

    this.configForm = fb.group({
      width: this.gridWidthControl,
      height: this.gridHeightControl,
      speed: this.gameSpeedControl,
    });
  }

  ngAfterViewInit(): void {
    this._hostElement = this.gameOfLifeElemRef.nativeElement;
    this.generateBoard();
  }

  ngOnChanges(): void {
    if (this._hostElement) this.generateBoard();
  }

  public redrawBoard(initialize = false): void {
    if (this.configForm.valid && this.deadColor && this.livingColor && this.strokeColor) {
      this._grid = new Grid(this.width.value, this.height.value, initialize);
      this.generateBoard();
    }
  }

  private generateBoard(): void {
    this.prepSvg();
    this.createScales();
    this.createPlotArea();
    this.createCells();
  }

  private prepSvg(): void {
    this._svg = d3.select(this._hostElement).select('svg');

    this._transition = this._svg.transition().ease(d3.easeSinInOut).delay(0).duration(300);

    this._squareLength = Math.floor(this._hostElement.offsetWidth / this._grid.width);

    this._svg.attr('viewBox', `0, 0, ${this._hostElement.offsetWidth}, ${this._squareLength * this._grid.height  + (this._margin * 2)}`);

    this._svgWidth = this._hostElement.offsetWidth - (this._margin * 2);
    this._svgHeight = this._hostElement.offsetHeight - (this._margin * 2);
  }

  private get width(): AbstractControl {
    return this.configForm.get('width');
  }

  private get height(): AbstractControl {
    return this.configForm.get('height');
  }

  private get speed(): AbstractControl {
    return this.configForm.get('speed');
  }

  private createScales(): void {
    this._xScale = d3
      .scaleLinear()
      .domain([0, this._grid.width])
      .range([0, this._svgWidth])
      .nice()
      ;

    this._yScale = d3
      .scaleLinear()
      .domain([0, this._grid.height])
      .range([0, this._svgHeight])
      .nice()
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

  private createCells(): void {
    const cellSelector = 'cell';
    const cellRects = this._plotArea
      .selectAll(`.${cellSelector}`)
      .data(this._grid.getFlattenedMatrix())
      ;

    cellRects.join(
      enter => enter
        .append('rect')
          .on('click', (e, d: any, x: any) => {
            d.alive = !d.alive;
            this._grid.setCell(d);
            this.generateBoard();
            this.showSelectLiveCellsError = false;
          })
          .attr('class', cellSelector)
          .style('cursor', 'pointer')
          .attr('width', this._squareLength)
          .attr('height', this._squareLength)
          .attr('x', (d: Cell) => this._xScale(d.coordinates.x))
          .attr('y', (d: Cell) => this._yScale(d.coordinates.y))
          .attr('stroke', this.strokeColor)
          .attr('stroke-width', 1)
          .attr('fill', (d: Cell) => d.alive ? this.livingColor : this.deadColor),
      update => update
        .call(u => u.transition(this._transition)
          .attr('x', (d: Cell) => this._xScale(d.coordinates.x))
          .attr('y', (d: Cell) => this._yScale(d.coordinates.y))
          .attr('stroke', this.strokeColor)
          .attr('width', this._squareLength)
          .attr('height', this._squareLength)
          .attr('fill', (d: Cell) => d.alive ? this.livingColor : this.deadColor),
        ),
      exit => exit.remove()
    );
  }

  public step(): void {
    this._grid.updateGrid();
    this.generateBoard();
  }

  public runGame(): void {
    if (this._grid.getFlattenedMatrix().filter((c: Cell) => c.alive).length > 0) {
      this.gameRunningInterval = setInterval(() => this.step(), this.speed.value);

    } else {
      this.showSelectLiveCellsError = true;
    }
  }

  public stopGame(): void {
    clearInterval(this.gameRunningInterval);
    this.gameRunningInterval = void(0);
  }
}
