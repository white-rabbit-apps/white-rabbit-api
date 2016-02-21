app.factory 'Product', (Parse) ->
  class Product extends Parse.Model
    @configure "Product", "name", "price", "description", "mainPhoto", "amazonUrl", "manufacturerName", "manufacturerUrl", "supplierPartName", "supplierUrl"
