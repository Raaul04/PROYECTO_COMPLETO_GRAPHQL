import { AeropuertoModel,API_AIRPORT,API_TIME } from "./types.ts"
import { GraphQLError } from "graphql";
import { ObjectId,Collection } from "mongodb";
type Contexto={
    AeropuertoCollecion:Collection<AeropuertoModel>
}
type ArgsDeGetAirport={
    id:string
}
type ArgsAddAirport={
    iata:string,
    name:string,
    ciudad:string,
    pais:string
}

export const resolvers = {


    Aeropuerto:{
        id:(parent:AeropuertoModel):string => {
            return parent._id!.toString()
       },
         //Resolver encadenado para obtener zona horaria
         horaActual:async(parent:any)=>{
            const api=Deno.env.get("API_KEY")
            const url=`https://api.api-ninjas.com/v1/timezone?latitude=${parent.latitude} &lon= ${parent.longitude}`
            const timeresponse= await fetch(url,{
                headers: {
                    'X-Api-Key': api
                  },
            })
            const timeData=await timeresponse.json()
            return timeData.datetime

         }


    },
    Query: {
        getAirport:async(_:unknown,args:ArgsDeGetAirport,ctx:Contexto):Promise<AeropuertoModel|null> =>{
            return await ctx.AeropuertoCollecion.findOne({_id:new ObjectId(args.id)})
        },
        getAirports:async(_:unknown,__:unknown, ctx:Contexto): Promise<AeropuertoModel[]>=>{
            return await ctx.AeropuertoCollecion.find().toArray();
        }
    },
    Mutation:{
        addAirport:async(_:unknown,args:ArgsAddAirport,ctx:Contexto):Promise<AeropuertoModel>=>{
            const api=Deno.env.get("API_KEY")
            if(!api){
                throw new GraphQLError("No va a la Api")
            }
            const {name}=args
            const nameExists= await ctx.AeropuertoCollecion.findOne({name})
            if(nameExists){
                throw new GraphQLError("El nombre ya esta en la base de datos")
            }

            // Llamar a la API de Ninja para obtener los datos del aeropuerto
            const url=`https://api.api-ninjas.com/v1/airports?name=${name}`
            const data= await fetch(url,{
                headers: {
                    'X-Api-Key': api
                  },
            })
            if(data.status!==200){throw new GraphQLError("Error de peticion")}
            
            const response:API_AIRPORT[]=await data.json()
            if(response.length===0){
                throw new GraphQLError("No se ha encontardo ningun aeropuerto con ese nombre")
            }
            const airport=response[0]//Extraemos el primer aeropuerto del array



            const timezoneUrl=`https://api.api-ninjas.com/v1/timezone?latitude=${airport.latitude} &lon= ${airport.longitude}`
            const dataTimezone= await fetch(timezoneUrl,{
                headers: {
                    'X-Api-Key': api
                  },
            })
            if(dataTimezone.status!==200){throw new GraphQLError("Error de peticion de Timezone")}

            const timeData:API_TIME= await dataTimezone.json()

            const newAirport:AeropuertoModel={
                iata: args.iata,
                name: args.name,
                ciudad:args.ciudad,
                pais: args.pais,
                latitude: airport.latitude,
                longitude: airport.longitude,
                timezone: timeData.timezone
            }
            
            //Insertar en el MongoDB
            const resultado= await ctx.AeropuertoCollecion.insertOne(newAirport)
            if(!resultado){
                throw new GraphQLError("Error en la inserccion en la base de datos")
            }

            return newAirport

        }

    }

}