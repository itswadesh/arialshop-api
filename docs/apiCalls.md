# List out all the third party api calls

1. mongo
2. redis
3. facebook
4. google
5. stripe
6. razorpay
7. fast2sms
8. sendgrid
9. twilio
10. Nexmo
11. ES
12. agora,vimeo, zego, netease
13. s3 , azure,
14. cashfree
15. textlocal
16. lulu
17. shippo, shiprocket, wareIq

## google Api

1. https://api.postalpincode.in/pincode/${args.zip} : resolver/address/getLocationFromZip
2. https://maps.googleapis.com/maps/api/geocode/json?key=${GOOGLE_MAPS_KEY}&components=postal_code:${args.zip} : resolver/address/getCoordinatesFromZip
3. https://maps.googleapis.com/maps/api/geocode/json?latlng=${args.lat},${args.lng}&sensor=true&key=${GOOGLE_MAPS_KEY} : resolver/address/getLocation
4. https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin_lat},${origin_lng}&destinations=${destinations_lat},${destinations_lng}&key=${GOOGLE_MAPS_KEY}: resolver/address/getNearbyVendors(NOT USING NOW)

## azure service bus

1. using in resolver/address/getCoordinatesFromZip
2. using in resolver/address/getLocationFromZip
3. using in resolver/address/getLocation
4. using in resolver/order/returnOrReplace
5. using in resolver/payment/OrderRefund
6. using in utils/order/base/confirmOrder
7. utils/user/lulu/addCustomerInLulu
8. utils/user/lulu/requestOTP

## liveStream

1. https://api.agora.io/dev/v1/channel/${AGORA_APP_ID}: resolver/channel/channelList
2. ${ZEGO_TOKEN_SERVER}/token?app_id=${zego.appID}&id_name=${zego.userID} : resolver/channel/zego
3. ${ZEGO_TOKEN_SERVER}/token?app_id=${zego.appID}&id_name=${zego.userID} : resolver/channel/zegoWhiteBoard

## netease

1. https://vcloud.163.com/app/vod/video/get : utils/getNeteaseVideoInfo
2. https://vcloud.163.com/app/vod/video/list : utils/getAllNeteaseVideos
3. https://logic-dev.netease.im/v2/api/rooms/${cid}/task: utils/deleteNeteaseTask
4. https://logic-dev.netease.im/v2/api/rooms/${cid}/tasks: utils/getAllNeteaseTasks
5. https://logic-dev.netease.im/v2/api/room : utils/createNeteaseRoom
6. https://vcloud.163.com/app/channel/create : utils/createNeteaseChannel
7. https://vcloud.163.com/app/channel/delete : utils.deleteNeteaseChannel
8. https://api.netease.im/nimserver/user/getToken.action: utils/getNeteaseToken

## fetchVimeoPlaylist

1. https://api.vimeo.com/me/videos/${videoID}/m3u8_playback : fetchVimeoPlaylist

## lulu

1. ${ORVILLE_URL}/hbapi/v1_0/auth/token : utils/user/lulu/generateLuluToken
2. ${ORVILLE_URL}/hbapi/v1_1/customer/add: utils/user/lulu/addCustomerInLulu

## resolver/fcmToken/notifyFirebase

## shipping

### shippo

1. https://api.goshippo.com/orders/ : utils/shipping/shippo/createOrderOnShippo
2. https://api.goshippo.com/orders/${object_id} : utils/shipping/shippo/retrieveAnOrderOnShippo
3. https://api.goshippo.com/orders/ : utils/shipping/shippo/listAllOrdersOnShippo
4. https://api.goshippo.com/orders/${objectId}/packingslip/ : utils/shipping/shippo/packingslipOnShippo
5. https://api.goshippo.com/transactions/: utils/shipping/shippo/purchaseLabelForAnOrder

### shiprocket

1. ${SHIPROCKET_BASE_URL}/auth/login : shipRokectToken
2. ${SHIPROCKET_BASE_URL}/orders/create/adhoc: createOrderOnShipRocket
3. ${SHIPROCKET_BASE_URL}/courier/assign/awb: generateAWBForShipment
4. ${SHIPROCKET_BASE_URL}/courier/serviceability: serviceability
5. ${SHIPROCKET_BASE_URL}/courier/international/serviceability: internationalServiceability
6. ${SHIPROCKET_BASE_URL}/courier/generate/pickup: requestForShipmentPickup

### wareIq

1. oders/api : create and instance and hitting api

## media

1. S3 : utils/media/uploaders/aws3
2. cloudinary: utils/media/uploaders/cloudinary
3. microsoftBlob: utils/media/uploaders/microsoftBlob
4. s3: utils/media/image

## payment

1. https://api.cashfree.com/api/v1/order/refund : resolver/payment/OrderRefund

2. http://tablezware-dev.tablez.com/api/v1/order/return : resolver/payment/OrderRefund

3. https://api.cashfree.com/api/v1/order/info/status : resolver/payment/paymentConfirmation

## email and sms

1. sendgrid for email sending: utils/email
2. nexmo: utils/sms
3. myvfirst: utils/sms
4. twilio: utils/sms
5. textlocal: utils/sms
6. fast2sms: utils/sms

### s3:

1. using s3 in: utils/emailTemplate
2. invoice/generatePDFAndUpload

### azure blob

1. file upload
2. invoice/generatePDFAndUpload
3. service bus : insertServiceBusQueue and getServiceBusQueue
