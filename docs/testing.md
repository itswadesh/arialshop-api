Here we have data about the testing cases

# CATEGORY

## saveCategory

case -1 changes child category to root catgory(parent pass as null in saveCate..)
obserbations : child category level changes ,now child category parent is null, child cate removed from its parent(children field), child category slugs chaged,children of child level changed

# BANNER

## bannerGroup

- save the banner with the groupTitle and groupId, and then pass groupId in bannerGroup.gql and its worked

# fileUploadFromUrl

- tested for invlaid and not acccesible url,those will save as it is.and not break the server.

# Checking Memory Leakage

src/app.ts

1. with browser take 1 min 20 sec
2. without browser take 1 min 7 sec
3. comment typeDefs and resolvers in app.ts take 1 min 2 sec
4. passport not effecting time
5. commented morgan use and it reduces 2-3 sec
6. commented schemaDirectives use and it reduce 2-3 sec
7. commented graphqlUploadExpress and it increases 7 sec
8. import oAuthRoutes from './oauth'
   import exportRoutes from './export'
   import esRoutes from './es'
   import payRoutes from './pay'
   commented but its reduces only 3 seconds
9. commented BASIC_LOGGING and it increases 7 sec
10. commented typedef, resolvers, server.applyMiddleware({ app, cors: false }) reduce 7 sec
11. commented server and reduce 8-10 sec

src/index.ts

1.  commented whole uses and its going 4 min and continue(i break it )
2.  commented seedMandatory and it take 2 min more
3.  mongoose commented takes 10 more second and then crashed after 5 sec

# not commented

express
ApolloServer
import { v4 as uuidv4 } from 'uuid'
import { Request, Response } from './types'
