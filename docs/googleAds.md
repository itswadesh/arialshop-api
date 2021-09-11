# Google shoping content api

## how it works

Step 1:: Get Auth Code

> Click on this link with your credintial(replace CAPITAL values)

<!-- const scope = 'https://www.googleapis.com/auth/content' //Read/write access -->

---

https://accounts.google.com/o/oauth2/v2/auth?
scope=GOOGLE_SHOPPING_SCOPE&
access_type=offline&
include_granted_scopes=true&
state=state_parameter_passthrough_value&
response_type=code&
redirect_uri=GOOGLE_REDIRECT_URI&
client_id=GOOGLE_CLIENT_ID

---

> After step 1 user consent , it will redirect to domain and in domain we get code(in query parameter), extract it and make a request to google for token, response will be like
> http://localhost:7774/auth/google/callback?state=state_parameter_passthrough_value&code=4%2F0AX4XfWjoNdk1c5I_7hCYe8tCw2bzTHeNYYZAO5SCQtxJs0vkMqH8g4pHxMArOrujKloC1Q&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcontent+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&authuser=1&prompt=consent#

Step 2:: Get token from Google

> After get code , make an api post request

curl \
--request POST \
--data "code=4/0AX4XfWgGR0Pyao78lVKA9U8AKMkXDxcgxQmODeU1NEffSSCyFdqcu0zJQmJULgLnkl7Qtw&client_id=414060469322-n4raqj2rdbjhegvrtdk6mhbdm4sd0oc7.apps.googleusercontent.com&client_secret=5jPjW4zURd7T61MeeyUjUSzY&redirect_uri=http://localhost:7774/auth/google/callback&grant_type=authorization_code" \
https://accounts.google.com/o/oauth2/token

> Now in response we will get response like it

{
"access_token": "ya29a0ARrdaM_iqqTmgd8gPViNwji9o6t4Y5YrWb6r2R-qiNYnJdHFPNggE4PShCbHx7t9s_LxTLwn4clxmyjyL_mR_LRqgC1JxsNlkPovfJsBktl8GZ7bNYxjmSirR3W4GJbKWRP2BEQ7R-5bAx2-77c8xsrKQB5H",
"expires_in": 3599,
"refresh_token": "1//0gOoYf5T-h-TUCgYIARAAGBASNQF-L9IrtV-ZDSK87eNerey4gE2otIe9ZbE-k1fcs7ZA2KoQqFk6pXoPNRGRU2bCKyvPdcAg",
"scope": "https://www.googleapis.com/auth/content openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
"token_type": "Bearer",
"id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ2Mjk0OTE3NGYxZWVkZjRmOWY5NDM0ODc3YmU0ODNiMzI0MTQwZjUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNDE0MDYwNDY5MzIyLW40cmFxajJyZGJqaGVndnJ0ZGs2bWhiZG00c2Qwb2M3LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNDE0MDYwNDY5MzIyLW40cmFxajJyZGJqaGVndnJ0ZGs2bWhiZG00c2Qwb2M3LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTEzMDA5OTA4OTcxOTQ0MTQwNDg5IiwiZW1haWwiOiIybGVzc29uc0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Im5ZMTBIV241bk5HRmRDTUJpelIyR0EiLCJpYXQiOjE2MjkwODcxMDksImV4cCI6MTYyOTA5MDcwOX0.03tqS5Y5eXV8RZ3Pu4qs3JtqukLqRDXLfDpGh7zuv-TcTCfQ2zEm-Z4ni37PmWQngAbuRCuNLwGXQDIQRUwOKGTfbOHbc2c4a_S0vr0ayirK4AZAgaefs1uzwIZ_VOExRXr6dstgN7UCCEQ6DKtBq6eaBd2_qLcKpt4samKL-3wYxr2qZKddyJ1jCuC6yDAg3SWbiWheZJ1AVbOoqGBzjKJ2M84z6CzR5dYEt7iD5dcO1Qup2zSq7GfONW0lu5gq14EQdc_8htkvefQSFoxeJtXPc6_Op4r3xh9M8qN4bgL0pm0aYoWHRjwY6Kj12j-5Q2KHXv4GahnlNq5CVdDgIA"
}

Step 3:: now we get access token and its type , we can make any api request through endpoints

> format of insert product

## https://developers.google.com/shopping-content/reference/rest/v2.1/products#Product.FIELDS.channel

kind: 'content#product',
offerId: 'book123', //product ID assigned by merchant
title: 'Google Tee Green',
description: '100% cotton jersey fabric sets this Google t-shirt abov',
link: 'http://my.site.com/greentee/',
imageLink: 'https://shop.example.com/.../images/GGOEGXXX0906.jpg',
contentLanguage: 'en', <!--   The two-letter ISO 639-1 language code for the item -->
targetCountry: 'US', <!-- https://github.com/unicode-org/cldr/blob/latest/common/main/en.xml -->
channel: 'online',
ageGroup: 'adult',
availability: 'in stock',
availabilityDate: '2019-01-25T13:00:00-08:00',
brand: 'Google',
color: 'green',
condition: 'new',
gender: 'male',
googleProductCategory: '1604',<!-- https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt -->
gtin: '608802531649',
itemGroupId: 'google_tee',
mpn: '608802531649',
price: {
value: '21.99',
currency: 'USD',
},
sizes: ['Medium'],
shipping: [
{
country: 'GB',
service: 'Standard shipping',
price: {
value: '0.99',
currency: 'GBP',
},
},
],
shippingWeight: {
value: '200',
unit: 'grams',
},

---
