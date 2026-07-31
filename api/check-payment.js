// =============================================================
// BloxVault - API: Verificar Status de Pagamento
// Vercel Serverless Function - /api/check-payment.js
// =============================================================

const ASAAS_BASE_URL = process.env.ASAAS_ENV === 'sandbox'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET.' });

  const { paymentId } = req.query;
  if (!paymentId) return res.status(400).json({ error: 'paymentId é obrigatório.' });

  try {
    const response = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}`, {
      headers: {
        'access_token': ASAAS_API_KEY,
        'User-Agent': 'BloxVault/1.0'
      }
    });

    const data = await response.json();

    // Status possíveis: PENDING, RECEIVED, CONFIRMED, OVERDUE, REFUNDED, CANCELLED
    const isConfirmed = ['RECEIVED', 'CONFIRMED'].includes(data.status);

    return res.status(200).json({
      paymentId: data.id,
      status: data.status,
      valor: data.value,
      confirmed: isConfirmed
    });
  } catch (error) {
    console.error('Erro em check-payment:', error);
    return res.status(500).json({ error: error.message });
  }
};
