import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from "@angular/forms"
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalenderComponent } from './components/calender/calender.component';
import { BookingComponent } from './components/booking/booking.component';
import { HttpClientModule } from "@angular/common/http"
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    CalenderComponent,
    BookingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
