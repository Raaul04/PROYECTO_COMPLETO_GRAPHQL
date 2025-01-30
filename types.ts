import { OptionalId } from "mongodb";

export type AeropuertoModel=OptionalId<{
    iata:string,
    name:string,
    ciudad:string,
    pais:string,
    latitude:number,
    longitude:number,
    timezone:string,
}>

//https://api.api-ninjas.com/v1/airports
export type API_AIRPORT={
    latitude:number,
    longitude:number
}
//https://api.api-ninjas.com/v1/timezone
export type API_TIME={
    hora:string
}