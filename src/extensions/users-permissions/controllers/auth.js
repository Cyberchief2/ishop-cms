'use strict';

const { ApplicationError } = require('@strapi/utils').errors;

module.exports = {
  async googleCallback(ctx) {
    const accessToken = ctx.query.access_token;

    if (!accessToken) {
      return ctx.badRequest('Missing access_token');
    }

    try {
      const userInfo = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
      ).then((res) => res.json());

      if (!userInfo || !userInfo.email) {
        return ctx.badRequest('Could not get email from Google');
      }

      const email = userInfo.email.toLowerCase();
      const username = userInfo.name || email.split('@')[0];

      // Find existing user with this email
      let user = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { email } });

      if (user) {
        strapi.log.info(`🔗 Linking Google login to existing user: ${email}`);
      } else {
        strapi.log.info(`✅ Creating new Google user: ${email}`);

        const pluginStore = strapi.store({
          type: 'plugin',
          name: 'users-permissions',
        });
        const grantSettings = await pluginStore.get({ key: 'grant' });
        const defaultRoleType = (grantSettings && grantSettings.google && grantSettings.google.default_role) || 'authenticated';

        const defaultRole = await strapi
          .query('plugin::users-permissions.role')
          .findOne({ where: { type: defaultRoleType } });

        user = await strapi.plugin('users-permissions').service('user').add({
          username: username,
          email: email,
          provider: 'google',
          confirmed: true,
          blocked: false,
          role: defaultRole ? defaultRole.id : null,
        });
      }

      const jwt = strapi.plugin('users-permissions').service('jwt').issue({
        id: user.id,
      });

      return ctx.send({
        jwt,
        user: {
          id: user.id,
          documentId: user.documentId,
          username: user.username,
          email: user.email,
          provider: user.provider,
          confirmed: user.confirmed,
          blocked: user.blocked,
        },
      });
    } catch (error) {
      strapi.log.error('Google callback error:', error);
      return ctx.badRequest(error.message);
    }
  },
};