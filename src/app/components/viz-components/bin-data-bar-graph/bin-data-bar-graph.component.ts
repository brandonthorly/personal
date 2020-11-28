import {AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {BaseType, Selection} from 'd3-selection';

@Component({
  selector: 'app-bin-data-bar-graph',
  templateUrl: './bin-data-bar-graph.component.html',
  styleUrls: ['./bin-data-bar-graph.component.scss']
})
export class BinDataBarGraphComponent implements AfterViewInit, OnChanges {
  @Input() title: string;
  @Input() values: number[];

  // viz variables
  private _data: any;
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

  @ViewChild('binGraph') binGraphElemRef: ElementRef;

  constructor() { }

  ngAfterViewInit(): void {
    this._hostElement = this.binGraphElemRef.nativeElement;
    this.prepSvg();
    this.generateGraph();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this._hostElement) this.generateGraph();
  }

  private generateGraph(): void {
    if (this.values.length > 0) {
      this.createXScale();
      this.prepData();
      this.createYScale();
      this.createPlotArea();
      this.createAxes();
      this.createRects();
    }
  }

  private prepData(): void {
    const histogram = d3.histogram()
      .thresholds(this._xScale.ticks(10))
      ;

    this._data = histogram(this.values);
  }

  private prepSvg(): void {
    this._svg = d3.select(this._hostElement).select('svg');

    this._svg.attr('viewBox', `0, 0, ${this._hostElement.offsetWidth}, ${this._hostElement.offsetHeight}`);

    this._svgWidth = this._hostElement.offsetWidth - (this._margin * 2);
    this._svgHeight = this._hostElement.offsetHeight - (this._margin * 2);
  }

  private createXScale(): void {
    const xMin = d3.min(this.values);
    const xMax = d3.max(this.values);

    this._xScale = d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([0, this._svgWidth])
      .nice()
      ;
  }

  private createYScale(): void {
    const yMax = +d3.max(this._data, (d: any) => d.length);

    this._yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([this._svgHeight, 0])
      ;

  }

  private createAxes(): void {
    this._xAxis = d3.axisBottom(this._xScale);
    this._yAxis = d3.axisLeft(this._yScale).ticks(2, 'f');

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

  private createRects(): void {
    const binRectSelector = 'bin-rect';
    const binRects = this._plotArea
      .selectAll(`.${binRectSelector}`)
      .data(this._data)
      ;

    binRects.join(
      enter => enter
        .append('rect')
          .attr('class', binRectSelector)
          .style('cursor', 'pointer')
          .attr('width', (d: any) => this._xScale(d.x1) - this._xScale(d.x0) - 1)
          .attr('height', (d: any) => this._svgHeight - this._yScale(d.length))
          .attr('x', (d: any) => this._xScale(d.x0))
          .attr('y', (d: any) => this._yScale(d.length))
          .attr('fill', '#66BB6A'),
      update => update
        .call(u => u.transition(d3.transition().ease(d3.easeSinInOut).delay(0).duration(300))
          .attr('x', (d: any) => this._xScale(d.x0))
          .attr('y', (d: any) => this._yScale(d.length))
          .attr('width', (d: any) => this._xScale(d.x1) - this._xScale(d.x0) - 1)
          .attr('height', (d: any) => this._svgHeight - this._yScale(d.length)),
        ),
      exit => exit.remove()
    );
  }
}
