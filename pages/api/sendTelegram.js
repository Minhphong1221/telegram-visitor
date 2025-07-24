import fetch from 'node-fetch';
import FormData from 'form-data';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, image } = req.body;

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).json({ error: 'Missing bot token or chat ID' });
  }

  const baseApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

  try {
    // Gửi tin nhắn text
    const sendText = await fetch(`${baseApiUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      }),
    });

    if (!sendText.ok) {
      const textResponse = await sendText.json();
      return res.status(sendText.status).json({ error: textResponse.description || 'Failed to send text' });
    }

    // Gửi ảnh nếu có
    if (image) {
      const photoBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('photo', photoBuffer, {
        filename: 'photo.png',
        contentType: 'image/png',
      });

      const sendPhoto = await fetch(`${baseApiUrl}/sendPhoto`, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });

      if (!sendPhoto.ok) {
        const photoResponse = await sendPhoto.json();
        return res.status(sendPhoto.status).json({ error: photoResponse.description || 'Failed to send photo' });
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Telegram send error:', err);
    res.status(500).json({ error: 'Failed to send message or image' });
  }
}
