interface EmailTemplateOptions {
  title: string;
  previewText?: string;
  content: string;
}

export function createEmailTemplate({ title, previewText, content }: EmailTemplateOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  ${previewText ? `<meta name="description" content="${previewText}">` : ''}
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, p, h1, h2, h3 { margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    
    /* Base styles */
    .body {
      background-color: #f5f5f5;
      width: 100%;
      padding: 20px 10px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      max-width: 600px;
      margin: 0 auto;
      padding: 30px;
    }
    .header {
      margin-bottom: 24px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
    }
    .content {
      color: #1f2937;
      font-size: 16px;
      line-height: 24px;
    }
    .content h1 {
      color: #111827;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    .content p {
      margin-bottom: 16px;
    }
    .content a {
      color: #2563eb;
      text-decoration: none;
    }
    .content a:hover {
      text-decoration: underline;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
      text-align: center;
    }
  </style>
</head>
<body>
  <table role="presentation" cellpadding="0" cellspacing="0" class="body">
    <tr>
      <td>&nbsp;</td>
      <td class="container">
        <div class="content">
          <div class="header">
            <div class="logo">HomeDocs</div>
          </div>
          ${content}
          <div class="footer">
            <p>This email was sent by HomeDocs</p>
            <p>© ${new Date().getFullYear()} HomeDocs. All rights reserved.</p>
          </div>
        </div>
      </td>
      <td>&nbsp;</td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
