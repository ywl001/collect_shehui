// data.service.ts

import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { People } from '../Person';


export enum MessageType {
  delPersonFromBuilding = 'delPersonFromBuilding',
  startPickMapPoint = 'startMove',
  refreshMark = 'refreshMark',
  clickMap = 'clickMap',
  uploadFile = 'uploadFile',
  closePeoplePlanel = 'closePeoplePlanel',
  saveLocation = "saveLocation",
  changeLayer = 'changeLayer',
  addBuilding = 'addBuilding',
  editBuilding = 'editBuilding',
  clearSketchGraphic = 'clearSketchGraphic',
  uploadPhotoComplete='uploadPhotoComplete',
  addHosing = 'addHosing',
  getUserInfo = 'getUserInfo',
  login_success = 'login_success'
  // closeDialog = 'closeDialog'
}

@Injectable({
  providedIn: 'root',
})
export class DataService {

  // private _selectPersons = new Subject<any[]>();
  // selectPersons$ = this._selectPersons.asObservable();
  // selectPersons(data: any[]) {
  //   this._selectPersons.next(data);
  // }

  private _message = new Subject<MessageType>();
  message$ = this._message.asObservable();
  sendMessage(m:MessageType) {
    this._message.next(m);
  }

  private _person = new Subject<People>();
  person$ = this._person.asObservable();
  person(p:People) {
    this._person.next(p);
  }

  /**人员扩展信息改变，is_host,is_huji */
  private _personExtension = new Subject<People>();
  personExtension$ = this._personExtension.asObservable();
  personExtension(data:People) {
    this._personExtension.next(data);
  }

  /**删除人员 */
  private _deleteBuildingPerson = new Subject<number>();
  deleteBuildingPerson$ = this._deleteBuildingPerson.asObservable();
  deleteBuildingPerson(person_id:number) {
    this._deleteBuildingPerson.next(person_id);
  }

  private _selectDate = new Subject<any>();
  selectDate$ = this._selectDate.asObservable();
  selectDate(selectDate:any) {
    this._selectDate.next(selectDate);
  }

  // private routeData: any={};

  // setRouteData(key:string,data: any): void {
  //   this.routeData[key] = data;
  // }

  // getRouteData(key:string): any {
  //   return this.routeData[key];
  // }
}
