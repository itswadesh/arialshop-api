# Specifiaction and Product Details

- These both used the same concept of features But both of these have defferent field of array type in product model, which contain mongoDB objectId
- Feature is based on module attribute(product type)

## Attribute

- Attribute is based on category, like- A category can have multiple attributes
  ex: electronic(category) have material,in the box(attributes)
- User have to add attributes for the category via saveAttribute
- When product is created or updated , that time user have to select the category and based on category it will show us the attributes available in that category

## ImportProduct Logic(specification and product details)

- both must be in format "size::XL|unit::1n"
- search fName in category (Attribute model) ,in case of not exist, create new
- now search with fName in product (Feature model)
  - in case of not exist create new feature
  - in case of exist, check current feature value exist in found feature value, if not then add current value in exist feature value and update the feature

NOTE: Don't be confused with featuresImportProduct function in importProduct , beacause we are not using it anymore,we are using syncFeature (new and current using)

## saveFeature

- This works normally , like user can create or update feature in saveFeature
