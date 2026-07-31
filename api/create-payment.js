// =============================================================
// BloxVault - API: Criar Pagamento PIX via Asaas
// Vercel Serverless Function - /api/create-payment.js
// =============================================================

const ASAAS_BASE_URL = process.env.ASAAS_ENV === 'sandbox'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

module.exports = async (req, res) => {
  // Configurar CORS para aceitar requisições do frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Aceitar apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  if (!ASAAS_API_KEY) {
    return res.status(500).json({ error: 'Chave de API do Asaas não configurada no servidor.' });
  }

  try {
    const { valor, email, cpf, nomeCliente, descricao, nicknameRoblox } = req.body;

    // Validação dos campos obrigatórios
    if (!valor || !cpf || !nomeCliente) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes: valor, cpf, nomeCliente.'
      });
    }

    // PASSO 1: Criar ou buscar o cliente no Asaas
    const clientePayload = {
      name: nomeCliente,
      cpfCnpj: cpf.replace(/\D/g, ''), // Remove formatação do CPF
      email: email || undefined,
      observations: `Nickname Roblox: ${nicknameRoblox || 'Não informado'}`
    };

    const clienteResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
        'User-Agent': 'BloxVault/1.0'
      },
      body: JSON.stringify(clientePayload)
    });

    const clienteData = await clienteResponse.json();

    if (!clienteResponse.ok) {
      console.error('Erro ao criar cliente Asaas:', clienteData);
      return res.status(422).json({
        error: 'Erro ao cadastrar cliente no gateway.',
        details: clienteData.errors || clienteData
      });
    }

    const customerId = clienteData.id;

    // PASSO 2: Criar a cobrança PIX
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1); // Vencimento amanhã

    const cobrancaPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: parseFloat(valor),
      dueDate: dueDate.toISOString().split('T')[0], // Formato: YYYY-MM-DD
      description: descricao || `Compra de Robux - BloxVault`,
      externalReference: `BLOXVAULT-${nicknameRoblox}-${Date.now()}`,
      pixAddressKey: undefined // Asaas gera automaticamente
    };

    const cobrancaResponse = await fetch(`${ASAAS_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
        'User-Agent': 'BloxVault/1.0'
      },
      body: JSON.stringify(cobrancaPayload)
    });

    const cobrancaData = await cobrancaResponse.json();

    if (!cobrancaResponse.ok) {
      console.error('Erro ao criar cobrança Asaas:', cobrancaData);
      return res.status(422).json({
        error: 'Erro ao criar cobrança no gateway.',
        details: cobrancaData.errors || cobrancaData
      });
    }

    const paymentId = cobrancaData.id;

    // PASSO 3: Buscar o QR Code PIX da cobrança
    const pixResponse = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}/pixQrCode`, {
      method: 'GET',
      headers: {
        'access_token': ASAAS_API_KEY,
        'User-Agent': 'BloxVault/1.0'
      }
    });

    const pixData = await pixResponse.json();

    if (!pixResponse.ok) {
      console.error('Erro ao buscar QR Code PIX:', pixData);
      return res.status(422).json({
        error: 'Erro ao obter QR Code PIX.',
        details: pixData
      });
    }

    // Retornar dados de pagamento ao frontend (SEM a chave de API!)
    return res.status(200).json({
      success: true,
      paymentId: paymentId,
      status: cobrancaData.status,
      valor: cobrancaData.value,
      vencimento: cobrancaData.dueDate,
      pix: {
        qrCodeImage: pixData.encodedImage,   // Base64 do QR Code para exibir
        copiaCola: pixData.payload,          // Chave copia e cola
        expirationDate: pixData.expirationDate
      }
    });

  } catch (error) {
    console.error('Erro interno em create-payment:', error);
    return res.status(500).json({
      error: 'Erro interno no servidor. Tente novamente.',
      message: error.message
    });
  }
};
