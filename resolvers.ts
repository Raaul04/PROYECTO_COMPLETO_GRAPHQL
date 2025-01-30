import {  } from "./types.ts"
import { GraphQLError } from "graphql";
import { ObjectId,Collection } from "mongodb";


export const resolvers = {

    Query: {
        default : ():string =>{
            return "Hola Mundo"
        },
    },

}