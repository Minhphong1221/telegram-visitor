import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Chỉ chấp nhận POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Lấy dữ liệu từ body
  const { message } = req.body;

  // Lấy token và chat ID từ biến môi trường
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  // Kiểm tra biến môi trường
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).json({ error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' });
  }

  // URL gửi tin nhắn Telegram
  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML' // Hỗ trợ định dạng HTML
      }),
    });

    const data = await response.json();

    // In log
    console.log('✅ Telegram API response:', data);

    // Trả lỗi nếu Telegram trả về lỗi
    if (!response.ok) {
      return res.status(response.status).json({ error: data.description || 'Telegram API error' });
    }

    // Thành công
    return res.status(200).json({ success: true, telegram_response: data });
  } catch (error) {
    console.error('❌ Telegram API failed:', error);
    return res.status(500).json({ error: 'Failed to send message to Telegram' });
  }
}
