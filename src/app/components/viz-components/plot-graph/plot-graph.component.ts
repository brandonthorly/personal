import {AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {BaseType, Selection} from 'd3-selection';
import {ICoordinates} from '../shared/coordinate.interface';

@Component({
  selector: 'app-plot-graph',
  templateUrl: './plot-graph.component.html',
  styleUrls: ['./plot-graph.component.scss']
})
export class PlotGraphComponent implements AfterViewInit, OnChanges {
  @Input() dataPoints: number[] | ICoordinates[];
  @Input() plotColor = '#66BB6A';
  @Input() plotRadius = 2;
  @Input() title;
  @Input() xMin;
  @Input() xMax;
  @Input() yMin;
  @Input() yMax;

  // viz variables
  private _hostElement: HTMLElement;
  private _margin = 30;
  private _plotArea: Selection<BaseType, any, null, undefined>;
  private _svg: Selection<BaseType, any, null, undefined>;
  private _svgWidth: number;
  private _svgHeight: number;
  private _xScale: any;
  private _xAxis: any;
  private _xAxisContainer: any;
  private _yScale: any;
  private _yAxis: any;
  private _yAxisContainer: any;

  @ViewChild('plotGraph') plotGraphElemRef: ElementRef;

  constructor() { }

  ngAfterViewInit(): void {
    this._hostElement = this.plotGraphElemRef.nativeElement;
    this.prepSvg();
    this.generateGraph();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this._hostElement) this.generateGraph();
  }

  private generateGraph(): void {
    this.createScales();
    this.createPlotArea();
    this.createAxes();
    this.createPlots();
  }

  private prepSvg(): void {
    this._svg = d3.select(this._hostElement).select('svg');

    this._svg.attr('viewBox', `0, 0, ${this._hostElement.offsetWidth}, ${this._hostElement.offsetHeight}`);

    this._svgWidth = this._hostElement.offsetWidth - (this._margin * 2);
    this._svgHeight = this._hostElement.offsetHeight - (this._margin * 2);
  }

  private createScales(): void {
    const xMin = this.xMin ? this.xMin : 0;
    let xMax;

    if (this.xMax) {
      xMax = this.xMax;
    } else {
      xMax = this.dataPoints.length > 10 ? this.dataPoints.length : 10;
    }

    this._xScale = d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([0, this._svgWidth])
      .nice()
      ;

    const yMin = this.yMin ? this.yMin : 0;
    let yMax;

    if (this.yMax) {
      yMax = this.yMax;
    } else {
      if (typeof this.dataPoints[0] === 'number') {
        const points = this.dataPoints as number[];
        yMax = d3.max(points);
      } else {
        const points = this.dataPoints as ICoordinates[];
        yMax = d3.max(points.map((c: ICoordinates) => c.y));
      }
    }

    yMax = yMax + (yMax * 0.5);

    this._yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([this._svgHeight, 0])
      .nice()
      ;
  }

  private createAxes(): void {
    this._xAxis = d3.axisBottom(this._xScale);
    this._yAxis = d3.axisLeft(this._yScale);

    if (!this._xAxisContainer) {
      this._xAxisContainer = this._plotArea
        .append('g')
          .classed('x-axis', true)
          .attr('transform', `translate(0, ${this._svgHeight})`)
          ;
    }

    if (!this._yAxisContainer) {
      this._yAxisContainer = this._plotArea
        .append('g')
          .classed('y-axis', true)
          .attr('transform', `translate(0, 0)`)
          ;
    }

    this._xAxisContainer.call(this._xAxis);
    this._yAxisContainer.call(this._yAxis);
  }

  private createPlotArea(): void {
    if (!this._plotArea) {
      this._plotArea = this._svg
        .append('g')
          .attr('class', 'plot-area plot-graph')
          .attr('transform', `translate(${this._margin}, ${this._margin})`)
          ;
    }
  }

  private createPlots(): void {
    const plotSelector = 'plot-point';

    let data;
    if (typeof this.dataPoints[0] === 'number') {
      data = this.dataPoints as number[];

    } else {
      data = this.dataPoints as ICoordinates[];
    }

    const plotPoints = this._plotArea
      .selectAll(`.${plotSelector}`)
      .data(data)
      ;

    plotPoints.join(
      enter => enter
        .append('circle')
          .attr('class', plotSelector)
          .attr('r', this.plotRadius)
          .attr('cx', (d: number | ICoordinates, i: number) => {
            return typeof d === 'number' ? this._xScale(i) : this._xScale(d.x);
          })
          .attr('cy', (d: number | ICoordinates) => {
            return typeof d === 'number' ? this._yScale(d) : this._yScale(d.y);
          })
          .attr('fill', this.plotColor),
      update => update
        .call(u => u.transition(d3.transition().ease(d3.easeSinInOut).delay(0).duration(300))
          .attr('r', this.plotRadius)
          .attr('cx', (d: number | ICoordinates, i: number) => {
            return typeof d === 'number' ? this._xScale(i) : this._xScale(d.x);
          })
          .attr('cy', (d: number | ICoordinates) => {
            return typeof d === 'number' ? this._yScale(d) : this._yScale(d.y);
          })
          .attr('fill', this.plotColor),
        ),
      exit => exit.remove()
    );
  }

}
