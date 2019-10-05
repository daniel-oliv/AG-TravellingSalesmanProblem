import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

//ng2-charts
import { ChartsModule } from 'ng2-charts';
import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { ConfigPainelComponent } from './config-painel/config-painel.component';
import { SliderModule } from 'primeng/slider';
import {ChartModule} from 'primeng/chart';
import {TableModule} from 'primeng/table';
import {AccordionModule} from 'primeng/accordion';
import {RadioButtonModule} from 'primeng/radiobutton';
import {CheckboxModule} from 'primeng/checkbox';
import { ScatterComponent } from './scatter/scatter.component';
import { MapAgmComponent } from './map-agm/map-agm.component';



@NgModule({
  declarations: [
    AppComponent,
    ConfigPainelComponent,
    ScatterComponent,
    MapAgmComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    SliderModule,
    BrowserAnimationsModule,
    ChartModule,
    TableModule,
    AccordionModule,
    RadioButtonModule,
    CheckboxModule,
    ChartsModule,
    AgmCoreModule.forRoot({
      // please get your own API key here:
      // https://developers.google.com/maps/documentation/javascript/get-api-key?hl=en
      apiKey: 'XXXXXXXXXXXXXXXXX'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
