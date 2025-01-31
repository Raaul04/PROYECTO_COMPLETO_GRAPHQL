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
type ArgsDelete={
    id:string
}

export const resolvers = {


    Aeropuerto:{
        id:(parent:AeropuertoModel):string => {
            return parent._id!.toString()
       },
         //Resolver encadenado para obtener zona horaria
         horaActual:async(parent:any)=>{
            const api=Deno.env.get("API_KEY")
            const url = `https://api.api-ninjas.com/v1/timezone?lat=${parent.latitude}&lon=${parent.longitude}`;
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
            const api = Deno.env.get("API_KEY");
            if (!api) {
                throw new GraphQLError("No va a la API");
            }
    
            const url = `https://api.api-ninjas.com/v1/airports?name=${args.name}`;
            const data = await fetch(url, {
                headers: {
                    'X-Api-Key': api
                },
            });
            console.log("Respuesta de la API:", data);  // Verificar si la respuesta es correcta
    
            if (data.status !== 200) {
                console.error("Error en la API, status:", data.status);
                throw new GraphQLError("Error de petición");
            }
    
            const response: API_AIRPORT[] = await data.json();
            console.log("Datos obtenidos de la API:", response);  // Verificar los datos recibidos
    
            if (!response || response.length === 0) {
                throw new GraphQLError("No se ha encontrado ningún aeropuerto con ese nombre");
            }
    
            const airport = response[0];  // Extraer el primer aeropuerto
            console.log("Aeropuerto encontrado:", airport);  // Imprimir el aeropuerto encontrado



            const timezoneUrl=`https://api.api-ninjas.com/v1/timezone?lat=${airport.latitude}&lon=${airport.longitude}`
            const dataTimezone= await fetch(timezoneUrl,{
                headers: {
                    'X-Api-Key': api
                  },
            })
            //console.log(dataTimezone)
       
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

        },
        deleteAirport:async(_:unknown,args:ArgsDelete,ctx:Contexto):Promise<boolean>=>{
            const {deletedCount}= await ctx.AeropuertoCollecion.deleteOne({_id:new ObjectId(args.id)})
            console.log(deletedCount)
            return deletedCount===1;
        }

    }

}