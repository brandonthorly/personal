import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {StoreModule} from '@ngrx/store';
import {ColorPickerModule} from 'ngx-color-picker';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MenuComponent} from './components/menu/menu.component';
import {NavComponent} from './components/nav/nav.component';
import {CompetitionSimComponent} from './components/viz-components/competition-sim/competition-sim.component';
import {GameOfLifeComponent} from './components/viz-components/game-of-life/game-of-life.component';
import {LofVizComponent} from './components/viz-components/lof-viz/lof-viz.component';
import {PlotGraphComponent} from './components/viz-components/plot-graph/plot-graph.component';
import {MaterialModules} from './material.modules';
import { AntiobioticResistanceComponent } from './components/viz-components/antiobiotic-resistance/antiobiotic-resistance.component';
import { GroceryQueueComponent } from './components/viz-components/grocery-queue/grocery-queue.component';
import { BinDataBarGraphComponent } from './components/viz-components/bin-data-bar-graph/bin-data-bar-graph.component';
import { DistributionCurveComponent } from './components/viz-components/distribution-curve/distribution-curve.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    GameOfLifeComponent,
    CompetitionSimComponent,
    PlotGraphComponent,
    LofVizComponent,
    MenuComponent,
    AntiobioticResistanceComponent,
    GroceryQueueComponent,
    BinDataBarGraphComponent,
    DistributionCurveComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({}, {}),
    MaterialModules,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    ColorPickerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
