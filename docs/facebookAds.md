# Google shoping content api

User Interface for catalog : https://business.facebook.com/commerce/catalogs/442154933607012/products
--- can see all stuff of product and edit and delete in ui(called 'facebook commerse manager')

## how it works

### method 1: for access token

visit this : https://developers.facebook.com/tools/explorer
and permisstion and get a token and we can use this token to access the api's

### method 2

#### step 1: Get a Short-lived User Access Token

    docs:     https://developers.facebook.com/docs/graph-api/guides/explorer#get-token-dropdown
    get a token from here https://developers.facebook.com/tools/explorer

#### step 2: Get a Long-lived User Access Token

    we have to get request of it
    curl -i -X GET "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&
        client_id=APP-ID&
        client_secret=APP-SECRET&
        fb_exchange_token=SHORT-LIVED-USER-ACCESS-TOKEN"

OR
https://graph.facebook.com/oauth/access_token?
grant_type=fb_exchange_token&
client_id=APP-ID&
client_secret=APP-SECRET&
fb_exchange_token=SHORT-LIVED-USER-ACCESS-TOKEN

and response will be
{
"access_token": "LONG-LIVED-USER-ACCESS-TOKEN",
"token_type": "bearer",
"expires_in": SECONDS-UNTIL-TOKEN-EXPIRES
}

#### Get a Page Access Token

    We will request of access token for a specific page

    curl -i -X GET "https://graph.facebook.com/PAGE-ID?
    fields=access_token&
    access_token=USER-ACCESS-TOKEN"

and response will look like:
{
"access_token":"PAGE-ACCESS-TOKEN",
"id":"PAGE-ID"  
 }

NOTE:
-- If you used a short-lived User access token, the Page access token is valid for 1 hour.
-- If you used a long-lived User access token, the Page access token has no expiration date.

---------- with this access token we can access api's with passing access_token args

#### Get List Access Tokens of Pages You Manage

curl -i -X GET "https://graph.facebook.com/USER-ID/accounts?
fields=name,access_token&
access_token=USER-ACCESS-TOKEN"

response will give array of
{
"name": "Facebook Page 1",
"access_token": "PAGE-1-ACCESS-TOKEN",
"id": "PAGE-1-ID"
},

### get catalog id from Here

-- https://www.facebook.com/business/help/1275400645914358?id=725943027795860

### Product Operation

#### CREATE UPDATE AND DELETE

In case of insert products into our catalog we will use content api batch approach, we hit the api with data with contains array of request , like what we want to operate
for reference we are using {catalog_id}/batch routes
https://developers.facebook.com/docs/marketing-api/catalog-batch/reference#supported-fields-batch
--format

{
"access_token": "<ACCESS_TOKEN>",
"requests": [
{
"method": "DELETE",
"retailer_id": "retailer-1"
},
{
"method": "CREATE",
"retailer_id": "retailer-2",
"data": {
"availability": "in stock",
"brand": "Nike",
"category": "t-shirts",
"description": "product description",
"image_url": "http://www.images.example.com/t-shirts/1.png",
"name": "product name",
"price": "10.00",
"currency": "USD",
"shipping": [
{
"country": "US",
"region": "CA",
"service": "service",
"price_value": "10",
"price_currency": "USD"
}
],
"condition": "new",
"url":"http://www.images.example.com/t-shirts/1.png",
"retailer_product_group_id": "product-group-1"
}
"applinks": {
"android": [{
"app_name": "Electronic Example Android",
"package": "com.electronic",
"url": "example-android://electronic"
}],
"ios": [{
"app_name": "Electronic Example iOS",
"app_store_id": 2222,
"url": "example-ios://electronic"
}]
},
},
{
"method": "UPDATE",
"retailer_id": "retailer-3",
"data": {
"availability": "out of stock",
}
}
]
}

curl -X GET "https://graph.facebook.com/oauth/access_token
?client_id={your-app-id}
&client_secret={your-app-secret}
&grant_type=client_credentials"

curl -X GET "https://graph.facebook.com/oauth/access_token
?client_id=169430647069214
&client_secret=3685cb9708102492891a847c9d1730b8
&grant_type=client_credentials"

curl -i -X GET "https://graph.facebook.com/v11.0/442154933607012&access_token=846037096284356|465dfe1f4300a3ef1b21bfa7fc88890c"
