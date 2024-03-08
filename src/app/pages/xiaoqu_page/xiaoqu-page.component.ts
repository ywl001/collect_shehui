import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, MessageType } from '../../services/data.service';
import { Location } from '@angular/common';

import { MatDialog } from '@angular/material/dialog';
import { GVar } from '../../global-variables';

import { Subscription, map } from 'rxjs';
import { DbService } from '../../services/db.service';
import { Building } from '../../app-type';

@Component({
  selector: 'app-buildings',
  standalone: true,
  imports: [NgFor, MatButtonModule],
  templateUrl: './xiaoqu-page.component.html',
  styleUrl: './xiaoqu-page.component.scss'
})
export class XiaoquPageComponent {

  buildings = []
  hosingId;
  hosingName;
  constructor(private dataService: DataService,
    private router: Router,
    private route:ActivatedRoute,
    private dbService:DbService,
    private location: Location) {
    console.log('xiaoqu construstor')
    this.hosingId = this.route.snapshot.paramMap.get('xqId');
    this.hosingName = this.route.snapshot.paramMap.get('xqName')
    // this.hosing = GVar.current_hosing
    // this.hosingId = this.hosing.id
  }

  private sub1:Subscription= null;
  ngOnInit(): void {
    this.getBuildings(this.hosingId);
    this.sub1 = this.dataService.message$.subscribe(res => {
      if (res == MessageType.addBuilding || res== MessageType.editBuilding) {
        console.log('refresh buildings')
        this.getBuildings(this.hosingId);
      }
    })
  }

  ngOnDestroy(){
    if(this.sub1)
      this.sub1.unsubscribe();
  }

  private getBuildings(hosingId) {
    this.dbService.getHosingBuildings(hosingId)
    .subscribe(res => {
      this.buildings = res;
    })
  }

  onSelectBuilding(building: Building) {
    GVar.current_building = building;
    GVar.panelIndex = -1;
    GVar.savedScrollPosition = 0;

    // building.hosing_name = this.hosingName
    
    this.router.navigate(['building',encodeURIComponent(JSON.stringify(building))])
  }
  onBack() {
    this.location.back()
  }

}
