# Vendor

- if settings have (isMultiVendor: true) then it will use csv fields vendor_phone and p.vendor_email,
  check existence and if not exist then create it(email, phone ,password: litekart)
  -- if vendor_phone and p.vendor_email empty then it will take the email of the uploading(logged in) party
  -- if vendor_phone , p.vendor_email passed as 'DELETE' then product will not save or update(show vendor not provided in importDetail)

- if settings have (isMultiVendor: false) then it will use parentBrand slug, check existence and if not exist then create it (like - goSport@litekart.in, password: litekart).
  -- if parentBrand not provided then it will take the email of the uploading(logged in) party
  When vendor exist, it will not update. It can only be modified by admin through admin panel

# Categories

The last category in the list of categories will become the primary category which will be used for breadcrumbs and specifications

# Images

Images url's must be a valid url, otherWise it will save the same url as u provided(both in azure and s3)
