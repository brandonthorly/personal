import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CompetitionSimComponent} from './components/viz-components/competition-sim/competition-sim.component';
import {GroceryQueueComponent} from './components/viz-components/grocery-queue/grocery-queue.component';
import {LofVizComponent} from './components/viz-components/lof-viz/lof-viz.component';

const routes: Routes = [
  { path: 'line-of-flight', component: LofVizComponent },
  { path: 'competition-sim', component: CompetitionSimComponent },
  { path: 'grocery-queue', component: GroceryQueueComponent },
  { path: '', redirectTo: '/grocery-queue', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
