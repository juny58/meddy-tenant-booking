import { Injectable } from '@angular/core';
import { BookingDate, Booking } from 'src/app/interfaces/bookingdate.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment"
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {

  domain = environment.domain

  date: BookingDate = {
    fromDate: null,
    toDate: null
  }

  bookings: Array<Booking> = []

  runCalenderAccessor = new BehaviorSubject(null)
  runCalenderObserver = this.runCalenderAccessor.asObservable()

  constructor(public httpClient: HttpClient) { }

  getCurrentTime() {
    return this.httpClient.get<Date>(`${this.domain}/now`)
  }

  getBookings(startDate: number, endDate: number) {
    return this.httpClient.get<Array<Booking>>(`${this.domain}/reserve/${startDate}/${endDate}`)
  }

  runCalender() {
    this.runCalenderAccessor.next(true)
  }
}
