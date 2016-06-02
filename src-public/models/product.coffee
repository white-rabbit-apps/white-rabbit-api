app.factory 'Product', (Parse) ->
  class Product extends Parse.Model
    @configure "Product", "name", "active", "price", "description", "mainPhoto", "amazonUrl", "manufacturerName", "manufacturerUrl", "supplierPartName", "supplierUrl", "variationOf", "color", "size"
