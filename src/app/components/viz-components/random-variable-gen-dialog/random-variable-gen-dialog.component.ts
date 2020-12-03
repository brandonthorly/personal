import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {RandomVariable} from '../grocery-queue/models/random-variable';
import {EDensityFn} from '../shared/density-fn.enum';

interface RvGenData {
  title: string;
  current: RandomVariable;
}

@Component({
  selector: 'app-random-variable-gen-dialog',
  templateUrl: './random-variable-gen-dialog.component.html',
  styleUrls: ['./random-variable-gen-dialog.component.scss']
})
export class RandomVariableGenDialogComponent implements OnInit {

  public density: EDensityFn;
  public alpha: number;
  public beta: number;
  public shift: number;

  public showErrors = false;
  public densityFnList = [EDensityFn.NORMAL, EDensityFn.GAMMA];

  constructor(private dialogRef: MatDialogRef<RandomVariableGenDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: RvGenData) { }

  ngOnInit(): void {
    if (this.data.current) {
      const currentRv: RandomVariable = this.data.current;
      this.density = currentRv.densityFn;
      this.alpha = currentRv.fnParams.alpha;
      this.beta = currentRv.fnParams.beta;
    }
  }

  public getAlphaLabel(): string {
    switch (this.density) {
      case EDensityFn.NORMAL:
        return 'Mean';

      case EDensityFn.GAMMA:
        return 'Shape';

      default:
        return 'Alpha';
    }
  }

  public getBetaLabel(): string {
    switch (this.density) {
      case EDensityFn.NORMAL:
        return 'Std. Dev.';

      case EDensityFn.GAMMA:
        return 'Scale';

      default:
        return 'Beta';
    }
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  public saveRV(): void {
    if (this.density && this.alpha && this.beta) {
      this.dialogRef.close(new RandomVariable(this.density, {alpha: this.alpha, beta: this.beta}));
    } else {
      this.showErrors = true;
    }
  }
}
