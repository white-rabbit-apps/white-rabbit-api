app.controller 'ProductsCtrl', ($scope, Product) ->

  $scope.addProduct = ->
    $scope.newProduct.save().then (product) ->
      $scope.fetchProducts()
    $scope.newProduct = new Product

  $scope.removeProduct = (product) ->
    if confirm("Are you sure?  All data will be lost.")
      product.destroy().then () ->
        _.remove $scope.products, (product) ->
          product.objectId is null

  $scope.editingProduct = (product) ->
    product.editing = true

  $scope.editProduct = (product) ->
    if(product.image? && product.image.file?)
      name = product.image.filename || 'image.jpg'
      imageBase64= product.image.file.replace(/^data:image\/(png|jpeg);base64,/, "")
      file = new Parse.File(name, {
        base64: imageBase64
      }, "image/jpeg")
      product.saving = true
      file.save()
      .then (file) ->
        console.log("image uploaded: " + file)
        product.image = file
        product.save().then(
          (object) ->
            console.log("saved product")
            product.saving = false
            product.editing = false
          ,
          (error) ->
            console.log("error saving product")
        )
    else
      product.save()
      product.editing = false

    product.save()
    product.editing = false

  $scope.cancelEditing = (product) ->
    product.title = product._cache.title
    product.editing = false

  $scope.fetchProducts = ->
    Product.query()
    .then (products) ->
      $scope.products = products

  $scope.fetchProducts()
  $scope.newProduct = new Product
