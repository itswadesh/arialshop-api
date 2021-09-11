# Return/Replace a product

process
return or replacement is type of order return and replace

1.  replacement

- reason for it
- new item will be placed
- old item pick-up process initate

2.  return

- reason for it
- item pick-up process initate
- after pick-up money refund initate
- refund id

OBSERB

1.  return time period in days in product (currently using )
2.  amazon not allowing item for return in replacement case , only allowed after two replacements of item(because this one have replacement policy only)
3.  return order not allowed rate and reviews
4.  refund status like - Refund Completed

need to create -
a. create a endpoint for return

add field in product -
returnAllowed
replaceAllowed
returnValidityInDays
replaceValidityInDays

also add field in csv import
returnOrReplace
