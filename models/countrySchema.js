const { Schema, model, Types } = require("mongoose");

const countrySchema = new Schema({
  country: { type: String },
  countryCurrency: { type: String },
  countryTimeZone: { type: String },
  countryName: {
    en: { type: String },
    ru: { type: String },
    es: { type: String },
  },
  countryAbbr: { type: String },
  capital: {
    en: { type: String },
    ru: { type: String },
    es: { type: String },
  },
  countryMainImg: { type: String },
  countryDescription: {
    en: { type: String },

    ru: { type: String },

    es: { type: String },
  },
  countryAttractions: [
    {
      attractionsImg: { type: String },
      attractionsName: {
        en: { type: String },
        ru: { type: String },
        es: { type: String },
      },
      attractionsDescr: {
        en: { type: String },

        ru: { type: String },

        es: { type: String },
      },
    },
  ],
  countryVideo: { type: String },
  countryCoordinate: { type: Array },
});


module.exports = model("Country", countrySchema);
