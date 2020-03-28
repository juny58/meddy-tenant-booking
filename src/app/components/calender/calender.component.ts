import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { ShareDataService } from 'src/app/services/share-data/share-data.service';
import { HttpClient } from '@angular/common/http';
import { Booking } from 'src/app/interfaces/bookingdate.interface';
import { environment } from 'src/environments/environment';
import * as $ from "jquery"
import * as moment from 'moment'

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.scss']
})
export class CalenderComponent implements OnInit, AfterViewInit {

  @ViewChild("calender") calenderContainer: ElementRef

  monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  dayList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  currentDate = (new Date())
  selectedYear = this.currentDate.getFullYear()
  selectedMonth = this.monthList[this.currentDate.getMonth()]
  todayDate = this.currentDate.getDate()
  selectedDay = this.dayList[this.currentDate.getDay()]
  selectedMonthIndex = this.currentDate.getMonth()
  selectedDayIndex = this.currentDate.getDay()
  viewInited = false
  todayDateMs = Number(moment().startOf('day'))

  constructor(public shareDataService: ShareDataService, private httpClient: HttpClient) { }

  ngOnInit() {
    // Run trigger for calender to watch new boking, cancell, accordingly highlight selected and booked dates
    this.shareDataService.runCalenderObserver.subscribe((bool: boolean) => {
      if (this.viewInited) {
        this.prepareDatesToAccomodate()
      }
    })
  }

  ngAfterViewInit() {
    this.viewInited = true // Trigger to know whether HTML is ready
    this.prepareDatesToAccomodate()
  }

  increaseMonth() {
    // Go to next month
    this.selectedMonthIndex++
    if (this.selectedMonthIndex > 11) {
      this.selectedMonthIndex = 0
      this.selectedYear++
    }
    this.selectedMonth = this.monthList[this.selectedMonthIndex]
    this.prepareDatesToAccomodate()
  }

  decreaseMonth() {
    // go to preveious month
    this.selectedMonthIndex--
    if (this.selectedMonthIndex < 0) {
      this.selectedMonthIndex = 11
      this.selectedYear--
    }
    this.selectedMonth = this.monthList[this.selectedMonthIndex]
    this.prepareDatesToAccomodate()
  }

  prepareDatesToAccomodate() {
    let currentMonthStartingDay = (new Date(this.selectedYear, this.selectedMonthIndex, 1)).getDay() // To get info on first date
    let currentMonthDays = this.getDayNumbersInMonth()[this.selectedMonthIndex]
    let oldTableElement = document.getElementById("calender-table")
    if (oldTableElement) {
      this.calenderContainer.nativeElement.removeChild(oldTableElement)
    }
    let table = document.createElement('table')
    this.calenderContainer.nativeElement.appendChild(table)
    table.classList.add('table', 'table-bordered', 'text-center')
    table.setAttribute("id", "calender-table")
    let i = 1
    let currentRowSize = 0 // max 7 items allowed in a row as there are 7 days in a week
    let tr: HTMLElement

    // Day row in the table
    let headerTr = document.createElement("tr")
    this.dayList.forEach(d => {
      let th = document.createElement("th")
      th.innerText = d.substr(0, 3)
      headerTr.appendChild(th)
    })
    table.appendChild(headerTr)

    // Looping inside the dates in a month
    while (i <= currentMonthDays) {
      if (currentRowSize == 0) { // creating new row when the size becomes 0 in a row or fills with 7 items
        tr = document.createElement("tr")
        table.appendChild(tr)
      }
      if (i == 1) { // populating the blank dates
        for (let j = 0; j < currentMonthStartingDay; j++) {
          let td = document.createElement("td")
          td.innerText = ""
          tr.appendChild(td)
          currentRowSize++
        }
      }

      let td = document.createElement("td")

      // Highlighting current date
      if (i == this.todayDate && this.selectedMonthIndex == this.currentDate.getMonth() && this.selectedYear == this.currentDate.getFullYear()) {
        td.classList.add('today-date')
      }

      // Highlighting selection
      let currentTime = Number(new Date(this.selectedYear, this.selectedMonthIndex, i))
      if ((this.shareDataService.date.fromDate && !this.shareDataService.date.toDate && currentTime == this.shareDataService.date.fromDate) || (this.shareDataService.date.fromDate && this.shareDataService.date.toDate && currentTime >= this.shareDataService.date.fromDate && currentTime <= this.shareDataService.date.toDate)) {
        td.classList.add("selected-date")
      }

      // Highlighting on hover
      td.classList.add("hover-cursor", "hover-bg")

      td.onclick = () => { // recording click for each dates
        this.dateClicked(td)
      }
      td.innerText = i.toString() // filling in with dates
      tr.appendChild(td)
      currentRowSize++ // increasing the size of each row, if reaches maximum, then size resets to 0
      // changing row
      if (currentRowSize == 7) {
        currentRowSize = 0
      }
      i++
    }
    this.getBookings() // Booking highlighting related function that calls bookings in a given month
  }

  getDayNumbersInMonth(): Array<number> {
    let febDays = 28
    // Finding if leap year
    if (this.selectedYear % 400 == 0 || (this.selectedYear % 100 != 0 && this.selectedYear % 4 == 0)) {
      febDays = 29
    }
    return [31, febDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  }

  dateClicked(el: HTMLElement) {
    // Highlighting selection
    if (el.classList.contains("selected-date")) {
      el.classList.remove("selected-date")
    } else {
      el.classList.add("selected-date")
    }

    let clickedDate = +el.innerText
    let formattedDate = Number(new Date(this.selectedYear, this.selectedMonthIndex, clickedDate))
    
    // Determining whether the selected date is in permissible range
    if (!this.shareDataService.date.fromDate) {
      if (formattedDate >= this.todayDateMs) {
        this.shareDataService.date.fromDate = formattedDate
      } else {
        el.classList.remove("selected-date")
        alert("Selected date has to be on or after today.")
      }
    } else {
      if (Number(this.shareDataService.date.fromDate) < Number(formattedDate)) {
        this.shareDataService.date.toDate = formattedDate
      } else {
        alert("Checkout date has to be greater than Checkin date.")
        el.classList.remove("selected-date")
      }
    }
    this.prepareDatesToAccomodate()
  }

  resetDate() {
    // Resets date to unselected for from date and todate
    this.shareDataService.date.fromDate = null;
    this.shareDataService.date.toDate = null
    this.prepareDatesToAccomodate()
  }

  getBookings() {
    // getting first and last date of month
    let d1 = Number(new Date(this.selectedYear, this.selectedMonthIndex, 1))
    let dn = Number(new Date(this.selectedYear, this.selectedMonthIndex, this.getDayNumbersInMonth()[this.selectedMonthIndex]))
    
    // Api call
    this.httpClient.get<Array<Booking>>(environment.domain + "/reserve/" + d1 + '/' + dn).subscribe(data => {
      let elements = [...this.calenderContainer.nativeElement.getElementsByTagName('td')]
      
      // Highlighting booked dates
      elements.forEach(el => {
        let dateNow = Number(new Date(this.selectedYear, this.selectedMonthIndex, +el.innerText))
        data.forEach(o => {
          if (dateNow >= o.fromDate && dateNow <= o.toDate && el.innerText) {
            el.classList.add("booked-date")
            el.title = o.tenantName
          }
        })
      })
    })
  }
}