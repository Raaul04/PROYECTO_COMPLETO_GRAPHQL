import { OptionalId } from "mongodb";

export type AeropuertoModel=OptionalId<{
    iata:string,
    name:string,
    ciudad:string,
    pais:string,
    latitude:number,
    longitude:number,
    timezone: string; // Puede ser opcional, porque lo obtenemos después
}>

//https://api.api-ninjas.com/v1/airports
export type API_AIRPORT={
    latitude:number,
    longitude:number
}
//https://api.api-ninjas.com/v1/timezone
export type API_TIME={
    timezone:string,
    datetime: string;   // Hora y fecha actual en formato ISO (Ej: "2025-01-30T12:00:00Z")
}