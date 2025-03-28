import express from 'express';
import pagarme from 'pagarme';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

const PAGARME_API_KEY = process.env.PAGARME_API_KEY || 'sk_test_0015426553df494796c8268044d49cfd';

// Rota para criar checkout com redirecionamento
app.post('/api/pagar-me/checkout-redirect', async (req, res) => {
  try {
    const { amount, customer, items } = req.body;

    const client = await pagarme.client.connect({ api_key: PAGARME_API_KEY });

    // Cria uma transação com boleto ou cartão (redirecionamento)
    const transaction = await client.transactions.create({
      amount: amount * 100,
      payment_method: 'checkout', // Modificado para checkout
      async: true, // Processamento assíncrono
      postback_url: 'http://localhost:3000/api/pagar-me/webhook', // URL para notificações
      customer: {
        external_id: customer.id,
        name: customer.name,
        email: customer.email,
        type: 'individual',
        documents: [{ type: 'cpf', number: customer.cpf }],
      },
      billing: {
        name: customer.name,
        address: {
          country: 'br',
          state: customer.state,
          city: customer.city,
          street: customer.street,
          street_number: customer.number,
          zipcode: customer.zipcode,
        },
      },
      items: items.map(item => ({
        id: item.product.id,
        title: item.product.name,
        unit_price: item.product.price * 100,
        quantity: item.quantity,
        tangible: true
      })),
      metadata: {
        order_id: `ORD-${Date.now()}`
      }
    });

    // Retorna a URL para redirecionamento
    res.json({
      payment_url: transaction.boleto_url || transaction.card_payment_url,
      transaction_id: transaction.id
    });
  } catch (error) {
    console.error('Erro no pagamento:', error);
    res.status(500).json({ error: error.response?.errors || error.message });
  }
});

// Rota para webhook (opcional - para atualizações de status)
app.post('/api/pagar-me/webhook', (req, res) => {
  console.log('Webhook received:', req.body);
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));