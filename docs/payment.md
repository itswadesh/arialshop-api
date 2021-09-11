# Online payment

## Payment init + transaction complete

Paid -> true -> Always available

## Payment Success

These 2 additional fields get inserted

Captured -> true -> Only after pay success
Status -> SUCCESS -> Only after pay success

# COD Payment

Will not touch payment table

# Order Table

Payment Status -> Created (COD)
-> SUCCESS (Gateway)

Paid (After pay success) -> true (COD)
-> false (COD)

# Important fields

- amountPaid:number
- codPaid:number
- amountDue:number
- amountRefunded:number
- paymentStatus:string
- paid:boolean

All above fields need to be present in orderItems model because we place the order 1st then initiate the payment, hence all stats need to be there in case payment fails
