export interface Building {
    id?: number,
    building_number?: string
    hosingId?:number
    floor?: number
    unit_home?: number[];
    hosing_name?:string;
}

export interface Person_building {
    person_id?: number
    building_id?: number
    room_number?: string
    residence_type?: string
    is_huji?: number
    user_id?: number
    is_host?: number
    insert_time?: string
}

export interface Work {
    id?: number
    building_id?: number
    room_number?: string
    result?: number
    result_message?: string
    user_id?: number
    insert_time?: number
    use_for?:string
}

export interface Hosing {
    id?:number
    station?:string
    community?:string
    hosing_name?:string
}


export enum TableName {
    collect_hosing = 'collect_hosing',
    collect_building = 'collect_building',
    people = 'people',
    person_building = 'collect_building_person',
    collect_work = 'collect_work'
}