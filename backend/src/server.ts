import express from 'express';
import cors from 'cors';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { products, Product } from './models/Product';

const app = express();
const port = process.env.PORT || 3001;

// Variable global segura para tickets en memoria
const generatedTickets: { [key: string]: string } = {};

// Configuración de CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.static('public'));

// Ruta raíz para probar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    endpoints: {
      products: {
        url: '/products',
        method: 'GET',
        query: {
          category: 'string',
          minPrice: 'number',
          maxPrice: 'number'
        }
      },
      product: {
        url: '/products/:id',
        method: 'GET',
        params: {
          id: 'number'
        }
      },
      productsByCategory: {
        url: '/products/category/:category',
        method: 'GET',
        params: {
          category: 'string'
        }
      },
      categories: {
        url: '/categories',
        method: 'GET'
      },
      generateTicket: {
        url: '/generate-ticket',
        method: 'POST',
        body: {
          ticketNumber: 'string',
          items: [{ name: 'string', quantity: 'number', price: 'number' }]
        }
      },
      generateQR: {
        url: '/generate-qr',
        method: 'POST',
        body: {
          text: 'string'
        }
      },
      getTicket: {
        url: '/ticket/:id',
        method: 'GET',
        params: {
          id: 'string'
        }
      }
    }
  });
});

interface TicketItem {
  name: string;
  quantity: number;
  price: number;
}

interface TicketData {
  ticketNumber: string;
  items: TicketItem[];
  date?: string;
  time?: string;
}

// Middleware para manejar preflight requests
app.options('*', cors());

app.get('/products', (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  let filteredProducts = [...products];
  if (category) {
    filteredProducts = filteredProducts.filter(
      p => p.category.toLowerCase() === (category as string).toLowerCase()
    );
  }
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
  }
  res.json(filteredProducts);
});

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

app.get('/products/category/:category', (req, res) => {
  const categoryProducts = products.filter(
    p => p.category.toLowerCase() === req.params.category.toLowerCase()
  );
  res.json(categoryProducts);
});

app.get('/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
});

// Nuevo flujo: generar ticket sin guardar archivo
app.post('/generate-ticket', (req, res) => {
  try {
    const ticketData: TicketData = req.body;
    const subtotal = ticketData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    const itemsHtml = ticketData.items.map(item => `
      <div style="display: flex; justify-content: space-between; margin: 5px 0;">
        <span>${item.quantity}x ${item.name}</span>
        <span>$${(item.quantity * item.price).toFixed(2)}</span>
      </div>
    `).join('');

    let template = fs.readFileSync(path.join(__dirname, 'ticket-template.html'), 'utf8');
    const now = new Date();
    const date = ticketData.date || now.toLocaleDateString();
    const time = ticketData.time || now.toLocaleTimeString();

    const ticketHtml = template
      .replace('{{companyName}}', 'Mi Empresa')
      .replace('{{address}}', 'Calle Principal #123')
      .replace('{{ticketNumber}}', ticketData.ticketNumber)
      .replace('{{date}}', date)
      .replace('{{time}}', time)
      .replace('{{items}}', itemsHtml)
      .replace('{{subtotal}}', subtotal.toFixed(2))
      .replace('{{tax}}', tax.toFixed(2))
      .replace('{{total}}', total.toFixed(2))
      .replace('{{footerMessage}}', '¡Vuelva pronto!');

    const ticketId = ticketData.ticketNumber;
    const fileName = `ticket-${ticketId}.html`;
    const filePath = path.join(__dirname, '..', 'public', 'tickets', fileName);
    fs.writeFileSync(filePath, ticketHtml);

    const ticketUrl = `${req.protocol}://${req.get('host')}/tickets/${fileName}`;
    res.json({ url: ticketUrl });

  } catch (error) {
    console.error('Error generating ticket:', error);
    res.status(500).json({ error: 'Error generating ticket' });
  }
});


app.get('/ticket/:id', (req, res) => {
  const ticketId = req.params.id;
  const html = generatedTickets[ticketId];

  if (html) {
    res.send(html);
  } else {
    res.status(404).send('<h1>Ticket no encontrado</h1>');
  }
});

app.post('/generate-qr', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: 250,
      margin: 1,
      errorCorrectionLevel: 'H'
    });

    res.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running locally at http://localhost:${port}`);
  console.log(`🌍 Or via Render at https://lynx-prueba-2.onrender.com`);
});
