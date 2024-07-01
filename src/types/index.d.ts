/// <reference path="../../node_modules/@types/w3c-web-serial/index.d.ts"/>
export interface TemplateData {
  id: number
  mission: string
}

export interface Coordinate {
  /**
   * 纬度
   */
  x: number
  /**
   * 经度
   */
  y: number
}

export interface PointData extends Coordinate {
  speed: number
}

export interface Car {
  id: number
  code: string
  name: string
  status: string
}

export interface CarInfo {
  robotid?: string
  rid?: string
  longitude: number
  latitude: number
  heading?: number | string
  robotCode?: string
  taskStatus?: 'start' | 'end'
  taskID?: number
}
