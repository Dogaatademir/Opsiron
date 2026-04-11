const { Resend } = require('resend');

// Güvenlik notu: Canlıya alırken bunu process.env.RESEND_API_KEY yapmayı unutma.
const resend = new Resend('re_66qmQHBm_NjexMpi1zn6m4tWJW7ZGKAwt');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Sadece POST istekleri kabul edilir.' }),
    };
  }

  try {
    const { name, company, email, service, message } = JSON.parse(event.body);

    const data = await resend.emails.send({
      from: 'Opsiron Studio <noreply@opsiron.com>', 
      to: 'info@opsiron.com', 
      reply_to: email, 
      subject: `PROJE TALEBİ // ${name.toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #F7F7F5; font-family: 'Inter', sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F7F7F5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #E4E4E7; padding: 40px;">
                  
                  <tr>
                    <td style="padding-bottom: 40px; border-bottom: 1px solid #F4F4F5;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: #A1A1AA; font-weight: 600;">
                            Opsiron — New Inquiry
                          </td>
                          <td align="right" style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #D4D4D8;">
                            ${new Date().toLocaleDateString('tr-TR')}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px 0;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.05em; color: #0F0F10; line-height: 1.2;">
                        Yeni Proje<br/>Talebi Alındı.
                      </h1>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        ${[
                          { label: 'Müşteri', value: name },
                          { label: 'Şirket', value: company || 'Belirtilmedi' },
                          { label: 'E-posta', value: email },
                          { label: 'Hizmet', value: service }
                        ].map(item => `
                          <tr>
                            <td width="30%" style="padding: 15px 0; border-bottom: 1px solid #F4F4F5; font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; color: #A1A1AA; font-weight: 600;">
                              ${item.label}
                            </td>
                            <td style="padding: 15px 0; border-bottom: 1px solid #F4F4F5; font-size: 14px; color: #0F0F10; font-weight: 400;">
                              ${item.value}
                            </td>
                          </tr>
                        `).join('')}
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding-top: 40px;">
                      <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; color: #A1A1AA; font-weight: 600; margin-bottom: 15px;">
                        Proje Detayları
                      </div>
                      <div style="background-color: #F7F7F5; padding: 25px; font-size: 14px; line-height: 1.6; color: #3F3F46; border-left: 2px solid #0F0F10;">
                        ${message.replace(/\n/g, '<br/>')}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding-top: 60px; font-size: 10px; color: #A1A1AA; line-height: 1.8; text-align: center;">
                      Bu e-posta <strong>opsiron.com</strong> iletişim formu aracılığıyla gönderilmiştir.<br/>
                      © ${new Date().getFullYear()} Opsiron Web Design Studio
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Resend API Hatası:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Bilinmeyen bir hata oluştu' }),
    };
  }
};