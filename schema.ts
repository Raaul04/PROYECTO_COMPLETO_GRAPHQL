export const schema = `#graphql
    type Aeropuerto{
        id:ID!,
        iata:String!,
        name:String!,
        ciudad:String!,
        pais:String!,
        latitude:String!,
        longitude:String!,
        timezone:String!,
        hora:String!,
    }
    type Query{
        getAirport(id:ID!):Aeropuerto
        getAirports:[Aeropuerto]!
    },

    type Mutation{
        addAirport(iata:String!,name:String!,ciudad:String!,pais:String!):Aeropuerto!
        updateAirport

    }

`;