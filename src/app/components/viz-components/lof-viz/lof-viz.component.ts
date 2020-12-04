import {AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import * as d3 from 'd3';
import {FlightDetailsDialogComponent, IFlightAction} from '../flight-details-dialog/flight-details-dialog.component';
import {Flight} from './models/flight';
import {Schedule} from './models/schedule';

@Component({
  selector: 'app-lof-viz',
  templateUrl: './lof-viz.component.html',
  styleUrls: ['./lof-viz.component.scss']
})
export class LofVizComponent implements AfterViewInit, OnChanges {
  private _initialized = false;

  // viz variables
  private _schedule: Schedule;
  private _flattenedSchedule: Flight[];
  private _actualMin: Date;
  private _actualMax: Date;
  private _hostElement: HTMLElement;
  private _margin: any = { top: 1, right: 1, bottom: 1, left: 1 };
  private _markerHeight = 20; // Change height
  private _labelHeight = 16;
  private _lofHeight = 40;
  private _plotArea: any;
  private _scheduleWidth: number;
  private _scheduleHeight: number;
  private _svg: any;
  private _transition;
  private _xAxis: any;
  private _xAxisContainer: any;
  private _xAxisContainerOffset = 30;
  private _xScale: any;
  private _xTranslated = 0;

  @ViewChild('scheduleElem') scheduleElemRef: ElementRef;

  @HostListener('window:resize', [])
  private onResize(): void {
    if (this._initialized) {
      this.createViz();
    }
  }

  constructor(private matDialog: MatDialog) {
    this._schedule = new Schedule();
    this.prepData();
  }

  ngAfterViewInit(): void {
    this._hostElement = this.scheduleElemRef.nativeElement;
    this.createViz();
  }

  ngOnChanges(): void {
    if (this._hostElement) this.createViz();
  }

  private prepData(): void {
    this._flattenedSchedule = [].concat(...Object.values(this._schedule.lofs));
  }

  private createViz(): void {
    this.prepSvg();
    this.createPlotArea();
    this.makeDraggable();
    this.createScales();
    this.createAxis();
    this.createStationLines();
    this.createFlightRects();
    this.createFlightLabels();
    this.createStationLabels();
  }

  private getDomain(): [Date, Date] {
    const minDate = new Date(this._schedule.startDate.setHours(0, 0, 0, 0));
    const maxDate = new Date(new Date(minDate).setDate(minDate.getDate() + 1));

    this._actualMin = minDate;
    this._actualMax = new Date(new Date(this._schedule.endDate).setHours(this._schedule.endDate.getHours() + 36));

    return [minDate, maxDate < this._actualMax ? maxDate : this._actualMax];
  }

  private prepSvg(): void {
    this._svg = d3.select(this._hostElement).select('svg');
    this._transition = this._svg.transition().ease(d3.easeSinInOut).delay(0).duration(300);

    this._svg.attr('viewBox', `0, 0, ${this._hostElement.offsetWidth}, ${this._hostElement.offsetHeight}`);

    this._scheduleWidth = this._hostElement.offsetWidth - this._margin.left - this._margin.right;
    this._scheduleHeight = this._hostElement.offsetHeight - this._margin.top - this._margin.bottom;
  }

  private createScales(): void {
    const xDomain = this.getDomain();

    this._xScale = d3
      .scaleTime()
      .domain(xDomain)
      .range([0, this._scheduleWidth])
      .nice()
      ;
  }

  private createAxis(): void {
    this._xAxis = d3.axisTop(this._xScale);

    if (!this._xAxisContainer) {
      this._xAxisContainer = this._svg
        .append('g')
          .classed('x-axis', true)
          .attr('transform', `translate(0, ${this._xAxisContainerOffset})`)
          ;
    }

    this._xAxisContainer.call(this._xAxis);
  }

  private createPlotArea(): void {
    if (!this._plotArea) {
      this._plotArea = this._svg
        .append('g')
          .classed('plot-area', true)
          .classed('dragme', true)
          .attr('cursor', 'grab')
          .attr('transform', `translate(${this._margin.left}, ${this._margin.top})`)
          ;
    }
  }

  createFlightRects(): void {
    const flightRectSelector = 'flight-rect';
    const flightRects = this._plotArea
      .selectAll(`.${flightRectSelector}`)
      .data(this._flattenedSchedule)
      ;

    flightRects.join(
      enter => enter
        .append('rect')
          .on('click', (e: MouseEvent, d: Flight) => {
            if (d.cancelled) return;

            this.matDialog.open(FlightDetailsDialogComponent, {
              height: 'auto',
              panelClass: 'personal-site-modal',
              data: d
            }).afterClosed().subscribe((flightAction: IFlightAction) => {
              if (flightAction.cancel) {
                this.cancelFlight(d);
              } else if (flightAction.retime) {
                this.retimeFlight(d, flightAction.retime);
              }
            });
          })
          .attr('class', flightRectSelector)
          .style('cursor', 'pointer')
          .attr('width', (d: Flight) => this._xScale(d.inGMT) - this._xScale(d.outGMT))
          .attr('height', this._markerHeight)
          .attr('x', (d: Flight) => this._xScale(d.outGMT))
          .attr('y', (d: Flight) => this._xAxisContainerOffset + 20 + d.acId * this._lofHeight)
          .attr('rx', 2)
          .attr('ry', 2)
          .attr('stroke', '#000000')
          .attr('stroke-width', 1)
          .attr('fill', (d: Flight) => d.cancelled ? '#E53935' : '#66BB6A'),
      update => update
        .call(u => u.transition(this._transition)
          .attr('x', (d: Flight) => this._xScale(d.outGMT))
          .attr('y', (d: Flight) => this._xAxisContainerOffset + 20 + d.acId * this._lofHeight)
          .attr('width', (d: Flight) => this._xScale(d.inGMT) - this._xScale(d.outGMT))
          .attr('fill', (d: Flight) => d.cancelled ? '#E53935' : '#66BB6A'),
        ),
      exit => exit.remove()
    );
  }

  private createStationLines(): void {
    const stationLinesSelector = 'station-lines';
    const stationLines = this._plotArea
      .selectAll(`.${stationLinesSelector}`)
      .data(Object.keys(this._schedule.lofs))
      ;

    stationLines.join(
      enter => enter
        .append('line')
          .attr('class', stationLinesSelector)
          .attr('x1', 0)
          .attr('x2', this._xScale(this._actualMax))
          .attr('y1', (d: number) => this._xAxisContainerOffset + 20 + d * this._lofHeight + (this._markerHeight / 2))
          .attr('y2', (d: number) => this._xAxisContainerOffset + 20 + d * this._lofHeight + (this._markerHeight / 2))
          .attr('stroke', '#000000')
          .attr('stroke-width', 2),
      update => update
        .call(u => u.transition(this._transition)
          .attr('x1', 0)
          .attr('x2', this._xScale(this._actualMax))
          .attr('y1', (d: number) => this._xAxisContainerOffset + 20 + d * this._lofHeight + (this._markerHeight / 2))
          .attr('y2', (d: number) => this._xAxisContainerOffset + 20 + d * this._lofHeight + (this._markerHeight / 2))
        ),
      exit => exit.remove()
    );
  }

  private createFlightLabels(): void {
    const flightLabelSelector = 'flight-label';
    const flightLabels = this._plotArea
      .selectAll(`.${flightLabelSelector}`)
      .data(this._flattenedSchedule)
      ;

    flightLabels.join(
      enter => enter
        .append('text')
          .on('click', (e: MouseEvent, d: Flight) => {
            if (d.cancelled) return;

            this.matDialog.open(FlightDetailsDialogComponent, {
              height: 'auto',
              panelClass: 'personal-site-modal',
              data: d
            }).afterClosed().subscribe((flightAction: IFlightAction) => {
              if (flightAction.cancel) {
                this.cancelFlight(d);
              } else if (flightAction.retime) {
                this.retimeFlight(d, flightAction.retime);
              }
            });
          })
          .attr('class', flightLabelSelector)
          .style('text-anchor', 'middle')
          .style('font-family', '"Arial Narrow", Arial, Helvetica, sans-serif')
          .style('font-size', `${this._labelHeight}px`)
          .attr('x', (d: Flight) => {
            return this._xScale(d.outGMT) + ((this._xScale(d.inGMT) - this._xScale(d.outGMT)) * 0.5);
          })
          .attr('y', (d: Flight) => {
            return this._xAxisContainerOffset + 20 + d.acId * this._lofHeight + (this._markerHeight / 2) + 5;
          })
          .attr('fill', '#FFFFFF')
          .text((d: Flight) => d.flightId),
      update => update
        .call(u => u.transition(this._transition)
          .attr('x', (d: Flight) => {
            return this._xScale(d.outGMT) + ((this._xScale(d.inGMT) - this._xScale(d.outGMT)) * 0.5);
          })
          .attr('y', (d: Flight) => {
            return this._xAxisContainerOffset + 20 + d.acId * this._lofHeight + (this._markerHeight / 2) + 5;
          })
        ),
      exit => exit.remove()
    );
  }

  private createStationLabels(): void {
    const stationLabelSelector = 'station-label';
    const stationLabels = this._plotArea
      .selectAll(`.${stationLabelSelector}`)
      .data(this._flattenedSchedule)
      ;

    stationLabels.join(
      enter => enter
        .append('text')
          .attr('class', stationLabelSelector)
          .style('text-anchor', 'middle')
          .style('font-family', '"Arial Narrow", Arial, Helvetica, sans-serif')
          .style('font-size', '0.6rem')
          .attr('x', (d: Flight) => {
            if (d.previousInGMT) {
              return this._xScale(d.outGMT) - (this._xScale(d.outGMT) - this._xScale(d.previousInGMT)) / 2;
            } else {
              return this._xScale(d.outGMT) - (this._xScale(d.outGMT) - this._xScale(this._actualMin)) / 2;
            }
          })
          .attr('y', (d: Flight) => {
            return this._xAxisContainerOffset + 20 + d.acId * this._lofHeight + (this._markerHeight / 2) - 5;
          })
          .text((d: Flight) => d.origin),
      update => update
        .call(u => u.transition(this._transition)
          .attr('x', (d: Flight) => {
            if (d.previousInGMT) {
              return this._xScale(d.outGMT) - (this._xScale(d.outGMT) - this._xScale(d.previousInGMT)) / 2;
            } else {
              return this._xScale(d.outGMT) - (this._xScale(d.outGMT) - this._xScale(this._actualMin)) / 2;
            }
          })
          .attr('y', (d: Flight) => {
            return this._xAxisContainerOffset + 20 + d.acId * this._lofHeight + (this._markerHeight / 2) - 5;
          })
        ),
      exit => exit.remove()
    );
  }

  private retimeFlight(flight: Flight, retimeMinutes: number): void {
    const lof = this._schedule.lofs[flight.acId];
    const f = lof.find(fl => fl.flightId === flight.flightId);

    if (f) {
      const newOut = this.addMinutes(f.outGMT, retimeMinutes);
      const newIn = this.addMinutes(f.inGMT, retimeMinutes);

      f.outGMT = newOut >= f.previousInGMT ? newOut : f.previousInGMT;
      f.inGMT = newIn <= f.nextOutGMT ? newIn : f.nextOutGMT;
    }

    this.prepData();
    this.createViz();
  }

  private cancelFlight(flight: Flight): void {
    const lof = this._schedule.lofs[flight.acId];

    let cancelFlight = false;

    for (const f of lof) {
      if (f.flightId === flight.flightId) {
        cancelFlight = true;
      } else if (cancelFlight && f.origin === flight.origin) {
        cancelFlight = false;
      }

      f.cancelled = cancelFlight;
    }

    this.prepData();
    this.createViz();
  }

  private addMinutes(dt: Date, minutes: number): Date {
    const newDate = new Date(dt);

    return new Date(newDate.setMinutes(newDate.getMinutes() + minutes));
  }

  private makeDraggable(): void {
    this._svg.call(
      d3.drag().on('drag', this.drag.bind(this))
    );
  }

  private drag(event): void {
    this._xTranslated += event.dx;

    if (this._xTranslated > 0 || this._xTranslated < -(this._plotArea.node().getBBox().width - this._scheduleWidth)) return;

    const newMinDate = this._xScale.invert(-this._xTranslated);
    const newMaxDate = this._xScale.invert(this._scheduleWidth - this._xTranslated);

    d3.selectAll('.dragme').attr('transform', `translate(${this._xTranslated}, 1)`);

    const newScale = d3.scaleTime()
      .domain([newMinDate, newMaxDate])
      .range([0, this._scheduleWidth])
      ;

    const xAxis = d3.axisTop(newScale);
    d3.select('.x-axis').call(xAxis);
  }
}
