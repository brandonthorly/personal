import {AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {BaseType, Selection} from 'd3-selection';
import jStat from 'jstat';
import {IRVParams} from '../grocery-queue/models/rv-params.interface';
import {EDensityFn} from '../shared/density-fn.enum';

interface IDistData {
  q: number;
  p: number;
}

@Component({
  selector: 'app-distribution-curve',
  templateUrl: './distribution-curve.component.html',
  styleUrls: ['./distribution-curve.component.scss']
})
export class DistributionCurveComponent implements AfterViewInit, OnChanges {
  @Input() title: string;
  @Input() densityFn: EDensityFn;
  @Input() params: IRVParams;

  // viz variables
  private _data: IDistData[];
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

  @ViewChild('distCurve') distCurveElemRef: ElementRef;

  constructor() { }

  ngAfterViewInit(): void {
    this._hostElement = this.distCurveElemRef.nativeElement;
    this.prepSvg();
    this.generateGraph();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this._hostElement) this.generateGraph();
  }

  private generateGraph(): void {
    this.prepData();
    this.createScales();
    this.createPlotArea();
    this.createAxes();
    this.createLine();
  }

  private prepData(): void {
      this._data = [];

      const shift = this.params.shift || 0;

      if (this.densityFn === EDensityFn.NORMAL) {
        const min = this.params.alpha - 4 * this.params.beta;
        const max = this.params.alpha + 4 * this.params.beta;

        for (let q = min; q < max; q++) {
          this._data.push({q: q + shift, p: jStat.normal.pdf(q, this.params.alpha, this.params.beta)});
        }
      } else if (this.densityFn === EDensityFn.GAMMA) {
        const approximateMax = 30 + shift;

        for (let q = 0; q < approximateMax; q++) {
          this._data.push({q, p: jStat.gamma.pdf(q - shift, this.params.alpha, this.params.beta / (this.params.beta + 1))});
        }
      }

  }

  private prepSvg(): void {
    this._svg = d3.select(this._hostElement).select('svg');

    this._svg.attr('viewBox', `0, 0, ${this._hostElement.offsetWidth}, ${this._hostElement.offsetHeight}`);

    this._svgWidth = this._hostElement.offsetWidth - (this._margin * 2);
    this._svgHeight = this._hostElement.offsetHeight - (this._margin * 2);
  }

  private createScales(): void {
    const xMin = d3.min(this._data,  (d: IDistData) => d.q);
    const xMax = d3.max(this._data,  (d: IDistData) => d.q);
    this._xScale = d3.scaleLinear()
      .rangeRound([0, this._svgWidth])
      .domain([xMin, xMax])
      ;

    const yMax = d3.max(this._data, (d: IDistData) => d.p);

    this._yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([this._svgHeight, 0])
      ;

  }

  private createAxes(): void {
    this._xAxis = d3.axisBottom(this._xScale);

    if (!this._xAxisContainer) {
      this._xAxisContainer = this._plotArea
        .append('g')
          .classed('x-axis', true)
          .attr('transform', `translate(0, ${this._svgHeight})`)
          ;
    }

    this._xAxisContainer.call(this._xAxis);
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

  private createLine(): void {
    const line = d3.line()
      .curve(d3.curveBasis)
      .x((d: any) => this._xScale(d.q))
      .y((d: any) => this._yScale(d.p))
      ;

    const pathSelector = 'dist-line';

    const existing = this._plotArea.select(`.${pathSelector}`);
    if (existing) existing.remove();

    this._plotArea.append('path')
          .datum(this._data)
          .attr('class', pathSelector)
          .attr('d', (d: any) => line(d))
          .attr('fill', '#66BB6A')
          .attr('stroke', '#000000')
          .attr('stroke-width', 1)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('opacity', '0.5')
          ;
  }

}
