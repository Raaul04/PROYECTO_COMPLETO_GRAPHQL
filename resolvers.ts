import { AeropuertoModel,API_AIRPORT,API_TIME } from "./types.ts"
import { GraphQLError } from "graphql";
import { ObjectId,Collection } from "mongodb";
type Contexto={
    AeropuertoCollecion:Collection<AeropuertoModel>
}
type ArgsDeGetAirport={
    id:string
}

export const resolvers = {


    Aeropuerto:{
        id:(parent:AeropuertoModel):string => {
            return parent._id!.toString()
       }

    },
    Query: {
        getAirport:async(_:unknown,args:ArgsDeGetAirport,ctx:Contexto):Promise<AeropuertoModel|null> =>{
            return await ctx.AeropuertoCollecion.findOne({_id:new ObjectId(args.id)})
        },
        getAirports:async(_:unknown,__:unknown, ctx:Contexto): Promise<AeropuertoModel[]>=>{
            return await ctx.AeropuertoCollecion.find().toArray();
        }
    }

}