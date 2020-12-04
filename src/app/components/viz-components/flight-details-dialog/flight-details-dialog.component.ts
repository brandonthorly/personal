import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Flight} from '../lof-viz/models/flight';

export interface IFlightAction {
  retime?: number;
  cancel?: boolean;
}

@Component({
  selector: 'app-flight-details-dialog',
  templateUrl: './flight-details-dialog.component.html',
  styleUrls: ['./flight-details-dialog.component.scss']
})
export class FlightDetailsDialogComponent implements OnInit {
  public flight: Flight;
  public retime = 0;

  constructor(private dialogRef: MatDialogRef<FlightDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Flight) {
    this.flight = data;
  }

  ngOnInit(): void {
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  public retimeFlight(): void {
    this.dialogRef.close({retime: this.retime});
  }

  public cancelFlight(): void {
    this.dialogRef.close({cancel: true});
  }

}
