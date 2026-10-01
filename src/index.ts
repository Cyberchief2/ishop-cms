import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // ============================================
    // 1. Override email service to send via Brevo HTTP API
    // ============================================
    const emailService = strapi.plugin('email').service('email') as any;

    emailService.send = async (options: any) => {
      const { from, to, cc, bcc, replyTo, subject, text, html } = options;

      const parseAddress = (addr: string) => {
        if (!addr) return undefined;
        const match = String(addr).match(/^(.*?)\s*<(.+?)>$/);
        if (match) return { name: match[1].trim(), email: match[2].trim() };
        return { email: String(addr).trim() };
      };

      const payload: any = {
        sender: parseAddress(from),
        to: [{ email: to }],
        subject,
      };

      if (html) payload.htmlContent = html;
      if (text) payload.textContent = text;
      if (cc) payload.cc = [{ email: cc }];
      if (bcc) payload.bcc = [{ email: bcc }];
      if (replyTo) payload.replyTo = parseAddress(replyTo);

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': process.env.BREVO_API_KEY || '',
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        strapi.log.error(`Brevo API error ${res.status}: ${errText}`);
        throw new Error(`Brevo API error ${res.status}: ${errText}`);
      }

      const data: any = await res.json();
      strapi.log.info(`✉️  Email sent via Brevo to ${to} (messageId: ${data.messageId})`);
      return data;
    };

    strapi.log.info('✅ Brevo email provider registered');

    // ============================================
    // 2. Register HTTP endpoint for Express to trigger emails
    // ============================================
    strapi.server.routes([
      {
        method: 'POST',
        path: '/api/email-test',
        handler: async (ctx: any) => {
          try {
            const { to, subject, html } = ctx.request.body;

            if (!to || !subject || !html) {
              return ctx.badRequest('Missing required fields: to, subject, html');
            }

            await strapi.plugin('email').service('email').send({
              to,
              from: 'noreply@ishop.com.ng',
              replyTo: 'support@ishop.com.ng',
              subject,
              html,
            });

            return ctx.send({ ok: true });
          } catch (err: any) {
            strapi.log.error('Email send failed:', err.message);
            return ctx.internalServerError(err.message);
          }
        },
        config: {
          auth: false,
        },
      },
    ]);

    strapi.log.info('✅ Email endpoint registered at /api/email-test');
  },
};