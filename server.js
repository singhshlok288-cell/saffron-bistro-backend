const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

app.get('/', (req, res) => {
  res.send('Saffron Bistro Backend is running!');
});

app.post('/api/order', async (req, res) => {
  try {
    const { name, phone, items, total } = req.body;
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A:F',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[new Date().toLocaleString(), name, phone, items, total, 'Pending']],
      },
    });

    res.json({ success: true, message: 'Order received!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});