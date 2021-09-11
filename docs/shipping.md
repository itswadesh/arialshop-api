# Shippo

## createOrderOnShippo

- This function used for create order on shippo , we have to send relevent data to api , and in responce it will give data, and it will give object_id and object_id in line-items
  we will save these object_id in our databse, and it will use for access SHIPPO endpoint's

## retrieveAnOrderOnShippo

- This function used for access a perticular order on shippo , in params we will send the object_id, which we received in createOrderOnShippo , make sure send the unique object_id , please don't send line_items object_id

## listAllOrdersOnShippo

- This function used for get list of all the order on shippo order

## packingslipOnShippo

- This function used to get the slip in pdf, here we will get url for download slip

## purchaseLabelForAnOrder

- This funciton used to get the label

# Shiprocket

## All available couriers, along with their codes, are mentioned below:

Note: The couriers marked '#' are for international shipments, and the ones marked '##' are for return orders.

COURIER NAME COURIER CODE
Blue Dart 1
FedEx 2
FEDEX PACKAGING# 7
DHL Packet International# 8
Delhivery 10
FedEx Surface 10 Kg 12
Ecom Express 14
Dotzot 16
Xpressbees 33
Aramex International# 35
DHL PACKET PLUS INTERNATIONAL# 37
DHL PARCEL INTERNATIONAL DIRECT# 38
Delhivery Surface 5 Kgs 39
Gati Surface 5 Kg 40
FedEx Flat Rate 41
FedEx Surface 5 Kg 42
Delhivery Surface 43
Delhivery Surface 2 Kgs 44
Ecom Express Reverse## 45
Shadowfax Reverse## 46
Ekart Logistics 48
Wow Express 50
Xpressbees Surface 51
RAPID DELIVERY 52
Gati Surface 1 Kg 53
Ekart Logistics Surface 54
Blue Dart Surface 55
DHL Express International 56
Professional 57
Shadowfax Surface 58
Ecom Express ROS 60
FedEx Surface 1 Kg 62
Delhivery Flash 63
Delhivery Essential Surface 68
Delhivery Reverse QC 80
Shadowfax Local 95
Shadowfax Essential Surface 96
Dunzo Local 97
Ecom Express ROS Reverse 99
Delhivery Surface 10 Kgs 100
Delhivery Surface 20 Kgs 101
Delhivery Essential Surface 5Kg 102
Xpressbees Essential Surface 103
Delhivery Essential Surface 2Kg 104
Wefast Local 106
Wefast Local 5 Kg 107
Ecom Express Essential 108
Ecom Express ROS Essential 109
Delhivery Essential 110
Delhivery Non Essential 111
