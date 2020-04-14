const { google } = require('googleapis');
const FacebookAPI = require('fb');
// const callback = " http://localhost:3000/auth/login/social/callback";

const profileGetters = {
  facebook(accessToken) {
    return FacebookAPI.api('/me', {
      fields: ['name', 'email', 'picture'],
      access_token: accessToken,
    }).then((auth) => {
      return {
        id: auth.id,
        name: auth.name,
        email: auth.email || null,
        thumbnail: auth.picture.data.url,
      };
    });
  },
  async google(accessToken) {
    const people = google.people('v1');
    const profile = await people.people.get({
      access_token: accessToken,
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,photos',
    });
    const { data } = profile;
    // console.log(data);
    const socialProfile = {
      email: data.emailAddresses[0].value || null,
      name: data.names[0].displayName || 'emptyname',
      thumbnail: data.photos[0].url || null,
      id: data.resourceName.replace('people/', ''),
    };
    return socialProfile;
  }
};

exports.getSocialProfile = async (provider, accessToken) => {
   return profileGetters[provider](accessToken);
}