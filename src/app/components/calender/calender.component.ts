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
    this.shareDataService.runCalenderObserver.subscribe((bool: boolean) => {
      if (this.viewInited) {
        this.prepareDatesToAccomodate()
      }
    })
  }

  ngAfterViewInit() {
    this.viewInited = true
    this.prepareDatesToAccomodate()
  }

  increaseMonth() {
    this.selectedMonthIndex++
    if (this.selectedMonthIndex > 11) {
      this.selectedMonthIndex = 0
      this.selectedYear++
    }
    this.selectedMonth = this.monthList[this.selectedMonthIndex]
    this.prepareDatesToAccomodate()
  }

  decreaseMonth() {
    this.selectedMonthIndex--
    if (this.selectedMonthIndex < 0) {
      this.selectedMonthIndex = 11
      this.selectedYear--
    }
    this.selectedMonth = this.monthList[this.selectedMonthIndex]
    this.prepareDatesToAccomodate()
  }

  prepareDatesToAccomodate() {
    let currentMonthStartingDay = (new Date(this.selectedYear, this.selectedMonthIndex, 1)).getDay()
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
    let currentRowSize = 0
    let tr: HTMLElement
    let headerTr = document.createElement("tr")
    this.dayList.forEach(d => {
      let th = document.createElement("th")
      th.innerText = d.substr(0, 3)
      headerTr.appendChild(th)
    })
    table.appendChild(headerTr)
    while (i <= currentMonthDays) {
      if (currentRowSize == 0) {
        tr = document.createElement("tr")
        table.appendChild(tr)
      }
      if (i == 1) {
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

      td.classList.add("hover-cursor", "hover-bg")
      td.onclick = () => {
        this.dateClicked(td)
      }
      td.innerText = i.toString()
      tr.appendChild(td)
      currentRowSize++
      // changing row
      if (currentRowSize == 7) {
        currentRowSize = 0
      }
      i++
    }
    this.getBookings()
  }

  getDayNumbersInMonth(): Array<number> {
    let febDays = 28
    if (this.selectedYear % 400 == 0 || (this.selectedYear % 100 != 0 && this.selectedYear % 4 == 0)) {
      febDays = 29
    }
    return [31, febDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  }

  dateClicked(el: HTMLElement) {
    //console.log(el.innerText)
    if (el.classList.contains("selected-date")) {
      el.classList.remove("selected-date")
    } else {
      el.classList.add("selected-date")
    }

    let clickedDate = +el.innerText
    let formattedDate = Number(new Date(this.selectedYear, this.selectedMonthIndex, clickedDate))
    //console.log(formattedDate, this.todayDateMs)
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
    this.shareDataService.date.fromDate = null;
    this.shareDataService.date.toDate = null
    this.prepareDatesToAccomodate()
  }

  getBookings() {
    let d1 = Number(new Date(this.selectedYear, this.selectedMonthIndex, 1))
    let dn = Number(new Date(this.selectedYear, this.selectedMonthIndex, this.getDayNumbersInMonth()[this.selectedMonthIndex]))
    //console.log(dn)
    this.httpClient.get<Array<Booking>>(environment.domain + "/reserve/" + d1 + '/' + dn).subscribe(data => {
      let elements = [...this.calenderContainer.nativeElement.getElementsByTagName('td')]
      //console.log(elements)
      elements.forEach(el => {
        let dateNow = Number(new Date(this.selectedYear, this.selectedMonthIndex, +el.innerText))
        //console.log(dateNow)
        data.forEach(o => {
          //console.log(o)
          if (dateNow >= o.fromDate && dateNow <= o.toDate && el.innerText) {
            el.classList.add("booked-date")
            el.title = o.tenantName
          }
        })
      })
    })
  }
}