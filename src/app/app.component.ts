import { Component, OnInit } from '@angular/core';
import { ShareDataService } from './services/share-data/share-data.service';
import { Booking } from './interfaces/bookingdate.interface';
import { DatePipe } from '@angular/common';
import * as moment from 'moment'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  currentDate: Date = new Date()
  bookingDate = {
    start: Number(moment().startOf('day')),
    end: Number(moment().startOf('day')) + 86400000 * 90
  }

  constructor(public shareDataService: ShareDataService, private datePipe: DatePipe) { }

  ngOnInit() {
    this.getBooking()
  }

  // fn to populate datepicker
  getFormattedDate(ms: number) {
    let time = this.datePipe.transform(new Date(ms), 'yyyy-MM-dd')
    return time
  }

  // Get booking for tabular data
  getBooking() {
    this.shareDataService.runCalenderObserver.subscribe(() => {
      this.shareDataService.getBookings(this.bookingDate.start, this.bookingDate.end).subscribe((data: Array<Booking>) => {
        //console.log(data)
        this.shareDataService.bookings = data
        this.shareDataService.date.fromDate = null;
        this.shareDataService.date.toDate = null
      })
    })
  }

  // change event for calender selection
  datePicked(n: number, e: any) {
    //console.log(e)
    let value = e.target.valueAsNumber
    if (n == 1) {
      this.bookingDate.start = value
    } else {
      this.bookingDate.end = value
    }

    if (this.bookingDate.end < this.bookingDate.start) {
      alert("'To' date has to after 'From' date.")
      return
    }
    this.getBooking()
  }

}
