import express from 'express';
import cors from 'cors';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { products, Product } from './models/Product';

const app = express();
const port = process.env.PORT || 3001;

// Configuración de CORS
app.use(cors({
  origin: '*', // Permite todas las origenes en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.static('public'));

// Crear directorio para tickets si no existe
const ticketsDir = path.join(__dirname, '..', 'public', 'tickets');
if (!fs.existsSync(ticketsDir)) {
  fs.mkdirSync(ticketsDir, { recursive: true });
}

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

// GET /products - Obtener todos los productos
app.get('/products', (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  
  let filteredProducts = [...products];

  // Filtrar por categoría
  if (category) {
    filteredProducts = filteredProducts.filter(
      p => p.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  // Filtrar por precio mínimo
  if (minPrice) {
    filteredProducts = filteredProducts.filter(
      p => p.price >= Number(minPrice)
    );
  }

  // Filtrar por precio máximo
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(
      p => p.price <= Number(maxPrice)
    );
  }

  res.json(filteredProducts);
});

// GET /products/:id - Obtener un producto por ID
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json(product);
});

// GET /products/category/:category - Obtener productos por categoría
app.get('/products/category/:category', (req, res) => {
  const categoryProducts = products.filter(
    p => p.category.toLowerCase() === req.params.category.toLowerCase()
  );
  res.json(categoryProducts);
});

// GET /categories - Obtener todas las categorías únicas
app.get('/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
});

app.post('/generate-ticket', (req, res) => {
  try {
    const ticketData: TicketData = req.body;
    
    // Calcular totales
    const subtotal = ticketData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    // Formatear items para HTML
    const itemsHtml = ticketData.items.map(item => `
      <div style="display: flex; justify-content: space-between; margin: 5px 0;">
        <span>${item.quantity}x ${item.name}</span>
        <span>$${(item.quantity * item.price).toFixed(2)}</span>
      </div>
    `).join('');

    // Leer plantilla
    let template = fs.readFileSync(path.join(__dirname, 'ticket-template.html'), 'utf8');

    // Obtener fecha y hora actual
    const now = new Date();
    const date = ticketData.date || now.toLocaleDateString();
    const time = ticketData.time || now.toLocaleTimeString();

    // Reemplazar variables en la plantilla
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

    // Guardar archivo HTML
    const fileName = `ticket-${ticketData.ticketNumber}.html`;
    const filePath = path.join(ticketsDir, fileName);
    fs.writeFileSync(filePath, ticketHtml);

    // Devolver URL del ticket
    const ticketUrl = `${req.protocol}://${req.get('host')}/tickets/${fileName}`;
    res.json({ url: ticketUrl });
  } catch (error) {
    console.error('Error generating ticket:', error);
    res.status(500).json({ error: 'Error generating ticket' });
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
  console.log(`Server running at http://localhost:${port}`);
});
