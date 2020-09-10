const axios = require('axios')

const HttpError = require('../models/http-error')

const getCoordsForAddress = async (address) => {
    let data;
    try {
      const url = 'https://api.mapbox.com/geocoding/v5';
      const endpoint = 'mapbox.places';
      const searchText = encodeURIComponent(address);
      const API_KEY = 'pk.eyJ1IjoiZWR5ODYiLCJhIjoiY2sycWs4YmV2MGVxNjNocWxzc2l5ZmdjYSJ9.kOHR2MXj13qkF0AC7Vmy-w';
   
      const response = await axios({
        method: 'GET',
        url: `${url}/${endpoint}/${searchText}.json/?access_token=${API_KEY}`,
      });
      data = response.data;
    } catch (e) {
      throw new HttpError('Something went wrong', 500);
    }
   
    if (!data || data.status === 'ZERO_RESULTS') {
      throw new HttpError(
        'Could not find location for the specified address.',
        422
      );
    }
   
    const [lng, lat] = data.features[0].center;
   //vratiti kao niz i redosljed okrenuti?? objekat je u originalu
    return  [lat, lng] ;
  };

  module.exports = getCoordsForAddress