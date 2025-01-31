import { time } from "node:console";
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
type ArgsUpdateAirport={
    id:string,
    name?:string,
    pais?:string,
    ciudad?:string,

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
            //console.log(deletedCount)
            return deletedCount===1;
        },

        updateAirport:async(_:unknown,args:ArgsUpdateAirport,ctx:Contexto):Promise<AeropuertoModel>=>{
            const api=Deno.env.get("API_KEY")
            if(!api){
                throw new GraphQLError("No se encuentra la Api")
            }
            const{id,name,ciudad,pais}=args
            if(!name && !ciudad && !pais ){
                throw new GraphQLError("Al menos un valor se tiene que actualizar")
             }
             const existingAirport= await ctx.AeropuertoCollecion.findOne({_id:new ObjectId(id)})
             if(!existingAirport){throw new GraphQLError("El aeropuerto no existe en la base de datos")}

            // Si no se actualiza la ciudad ni el país, solo cambiamos el nombre
             if(!ciudad && !pais){
                const UpdatedAirport= await ctx.AeropuertoCollecion.findOneAndUpdate({
                    _id:new ObjectId(id)
                },
                {
                    $set:{name}

                });
                if(!UpdatedAirport){
                    throw new GraphQLError("Error al actualizar el Aeropuerto")
                }
                return UpdatedAirport

             }


            const url=`https://api.api-ninjas.com/v1/airports?name=${name||existingAirport.name}`
            const airportData=await fetch(url,{
                headers: {
                    'X-Api-Key': 'nyNihb/AhHFDFFdAk3RFiQ==KJaDgoIF9Y5rCoEo'
                  },
            })
            if(airportData.status!==200){throw new GraphQLError("Error en la Api")}

            const response:API_AIRPORT[]= await airportData.json()
            console.log(response)
            if(response.length===0){throw new GraphQLError("No se encontró información del aeropuerto")}
            const newAirport=response[0]


            // Obtener nueva zona horaria
            const timezoneUrl=`https://api.api-ninjas.com/v1/timezone?lat=${newAirport.latitude}&lon=${newAirport.longitude}`
            const timzoneData= await fetch(timezoneUrl,{
                headers: {
                    'X-Api-Key': 'nyNihb/AhHFDFFdAk3RFiQ==KJaDgoIF9Y5rCoEo'
                  },
            })
            if (timzoneData.status !== 200) throw new GraphQLError("Error en la API de Timezone");
            //✅ Convierte la respuesta JSON en un objeto TypeScript.
            const timezoneResponse:API_TIME= await timzoneData.json()

            const updatedAirport= await ctx.AeropuertoCollecion.findOneAndUpdate({
                _id:new ObjectId(id)

            },
            {
                $set:{
                    name:existingAirport.name||name,
                    pais:existingAirport.pais||pais,
                    ciudad:existingAirport.ciudad||ciudad,
                    latitude:newAirport.latitude,
                    longitude:newAirport.longitude,
                    timezone:timezoneResponse.timezone
                }
            }
        );
        console.log(updatedAirport)
        if(!updatedAirport){throw new GraphQLError("No se pudo Actualizar")}
        return updatedAirport
        }

    }

}