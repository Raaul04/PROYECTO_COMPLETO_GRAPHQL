export const schema = `#graphql
    type Aeropuerto{
        id:ID!,
        iata:String!,
        name:String!,
        ciudad:String!,
        pais:String!,
        latitude:Float!,
        longitude:FLoat!,
        timezone:String!,
        hora:String!,
    }
    type Query{
        getAirport(id:ID!):Aeropuerto
        getAirports:[Aeropuerto]!
    },

    type Mutation{
        addAirport(iata:String!,name:String!,ciudad:String!,pais:String!):Aeropuerto!
        updateAirport(id:ID!, name:String, ciudad:String, pais:String!):Aeropuerto!
        deleteAirport(id:ID!):Boolean!

    }

`;