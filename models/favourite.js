const mongoose = require('mongoose');
const schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const favouriteSchema = new schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dish: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish'
  }]},
  {
      timestamps: true
  }
);

var Favourites = mongoose.model('Favourite',favouriteSchema);

module.exports= Favourites;
