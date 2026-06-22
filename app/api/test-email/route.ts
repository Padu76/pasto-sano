// E:\pasto-sano\app\api\test-email\route.ts
// Endpoint diagnostico per verificare la configurazione EmailJS.
// Uso: GET /api/test-email?send=admin (manda email di test all'admin)
//      GET /api/test-email                (solo report config)

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const send = url.searchParams.get('send');

  const config = {
    EMAILJS_SERVICE_ID: !!process.env.EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID: !!process.env.EMAILJS_TEMPLATE_ID,
    EMAILJS_PUBLIC_KEY: !!process.env.EMAILJS_PUBLIC_KEY,
    EMAILJS_PRIVATE_KEY: !!process.env.EMAILJS_PRIVATE_KEY,
    NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL || '(default: info@pastosano.it)',
  };

  const allSet = config.EMAILJS_SERVICE_ID && config.EMAILJS_TEMPLATE_ID
    && config.EMAILJS_PUBLIC_KEY && config.EMAILJS_PRIVATE_KEY;

  if (send === 'admin' || send === 'test') {
    if (!allSet) {
      return NextResponse.json({
        ok: false,
        config,
        error: 'Configurazione incompleta. Vedi quali env vars mancano.',
      });
    }

    try {
      const testEmail = url.searchParams.get('email') || process.env.NOTIFICATION_EMAIL || 'info@pastosano.it';
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          accessToken: process.env.EMAILJS_PRIVATE_KEY,
          template_params: {
            to_email: testEmail,
            subject: '🧪 Test Email Pasto Sano',
            order_type: 'TEST',
            customer_name: 'Test User',
            customer_phone: 'N/A',
            customer_email: testEmail,
            pickup_date: new Date().toLocaleDateString('it-IT'),
            payment_method: 'Test',
            payment_status: 'TEST',
            total_amount: '€0,00',
            items_list: '• Test item',
            total_items: '1',
            special_notes: 'Questa è una mail di test per verificare la configurazione EmailJS.',
            order_notes: 'Test',
            order_date: new Date().toLocaleDateString('it-IT'),
            order_time: new Date().toLocaleTimeString('it-IT'),
            order_id: `TEST-${Date.now()}`,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({
          ok: false,
          config,
          emailjsStatus: response.status,
          emailjsError: errorText,
          sentTo: testEmail,
        });
      }

      return NextResponse.json({
        ok: true,
        config,
        message: `Email di test inviata a ${testEmail}`,
        sentTo: testEmail,
      });
    } catch (err: any) {
      return NextResponse.json({
        ok: false,
        config,
        error: err.message,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    config,
    allConfigured: allSet,
    usage: {
      report: '/api/test-email',
      sendTest: '/api/test-email?send=admin',
      sendTestCustom: '/api/test-email?send=admin&email=mio@dominio.it',
    },
  });
}
