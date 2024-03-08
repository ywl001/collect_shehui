import { NgFor } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval, of } from 'rxjs';
import { DataService, MessageType } from '../../services/data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { GVar } from '../../global-variables';
import { LongPressDirective } from '../../longpress';
import { DbService } from '../../services/db.service';

@Component({
  selector: 'app-hosings',
  standalone: true,
  imports: [NgFor, MatButtonModule,LongPressDirective],
  templateUrl: './xiaoqu-list-page.component.html',
  styleUrl: './xiaoqu-list-page.component.scss'
})
export class XiaoquListPageComponent {

  hosings: any[] = []

  @Output()
  buildings = new EventEmitter()

  constructor(private dataService: DataService,
    private dialog: MatDialog,
    // private sql: SqlService,
    private dbService:DbService,
    private router: Router) {

  }

  private sub1:Subscription
  ngOnInit() {
    this.getAllHosing();
    this.sub1 = this.dataService.message$.subscribe(res => {
      if (res == MessageType.addHosing) {
        this.getAllHosing();
      }
    })
  }

  ngOnDestroy(){
    if(this.sub1)
      this.sub1.unsubscribe();
  }

  private getAllHosing() {
    this.dbService.getAllHosing().subscribe(res => {
      this.hosings = res
    })
  }

  onSelectHosing(hosing: any) {
    console.log(hosing)
    GVar.current_hosing = hosing;
    this.router.navigate(['/xiaoqu',{xqId:hosing.id,xqName:hosing.hosing_name}])
  }

}
