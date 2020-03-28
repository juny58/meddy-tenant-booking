import { Component, OnInit, Input } from '@angular/core';
import { BookingDate, Booking } from 'src/app/interfaces/bookingdate.interface';
import { ShareDataService } from 'src/app/services/share-data/share-data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

  tenantName: string

  constructor(public shareDataService: ShareDataService, public httpClient: HttpClient) { }

  ngOnInit(): void { }

  // Room booking Api call
  bookroom(boolean: Boolean) {
    this.httpClient.post(environment.domain + "/reserve", {
      tenantName: this.tenantName,
      fromDate: this.shareDataService.date.fromDate,
      toDate: this.shareDataService.date.toDate,
      reserved: boolean
    }).subscribe(success => {
      this.shareDataService.date.toDate = null
      this.shareDataService.date.fromDate = null
      this.shareDataService.runCalender()
    }, err => {
      alert(err.error)
    })
  }

}
