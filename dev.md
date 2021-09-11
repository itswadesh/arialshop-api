# Fields renamed on 23-Apr-2021

`db.orders.updateMany( { }, { $rename: { 'payment_order_id': 'paymentOrderId', 'payment_mode': 'paymentMode','payment_amount':'paymentAmount','payment_currency':'paymentCurrency','payment_txStatus':'paymentTxStatus','payment_referenceId':'paymentReferenceId','cod_paid':'codPaid','user_firstName':'userFirstName','user_lastName':'userLastName','user_phone':'userPhone','payment_id':'paymentId' } } )`

`db.categories.updateMany( { }, { $rename: { 'category_id': 'categoryId' } } )`

`db.products.updateMany( {}, { $rename: { 'size_group': 'sizeGroup','color_group':'colorGroup','discount_percent':'discountPercent','age_min':'ageMin','age_max':'ageMax','age_unit':'ageUnit','style_code':'styleCode','ean_no':'eanNo','article_code':'articleCode','product_master_id':'productMasterId','country_of_origin':'countryOfOrigin','return_info':'returnInfo','key_features':'keyFeatures','product_details':'productDetails' } } )`

## Remove Field

`db.products.updateMany({},{$unset:{colorGroup:'', sizeGroup:''}})`
