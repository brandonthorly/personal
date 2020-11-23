import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {StoreModule} from '@ngrx/store';
import {ColorPickerModule} from 'ngx-color-picker';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './components/home/home.component';
import {NavComponent} from './components/nav/nav.component';
import {CompetitionSimComponent} from './components/viz-components/competition-sim/competition-sim.component';
import {LofVizComponent} from './components/viz-components/lof-viz/lof-viz.component';
import {PlotGraphComponent} from './components/viz-components/plot-graph/plot-graph.component';
import {MaterialModules} from './material.modules';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    CompetitionSimComponent,
    PlotGraphComponent,
    LofVizComponent,
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
