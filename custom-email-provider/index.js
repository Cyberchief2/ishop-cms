'use strict';

module.exports = {
  init(providerOptions) {
    const apiKey = providerOptions.apiKey;

    if (!apiKey) {
      throw new Error('Brevo API key is required in providerOptions.apiKey');
    }

    return {
      async send(options) {
        const { from, to, cc, bcc, replyTo, subject, text, html } = options;

        const parseAddress = (addr) => {
          if (!addr) return undefined;
          const match = String(addr).match(/^(.*?)\s*<(.+?)>$/);
          if (match) return { name: match[1].trim(), email: match[2].trim() };
          return { email: String(addr).trim() };
        };

        const payload = {
          sender: parseAddress(from),
          to: [{ email: to }],
          subject,
        };

        if (html) payload.htmlContent = html;
        if (text) payload.textContent = text;
        if (cc) payload.cc = [{ email: cc }];
        if (bcc) payload.bcc = [{ email: bcc }];
        if (replyTo) payload.replyTo = parseAddress(replyTo);

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Brevo API error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        return data;
      },
    };
  },
};