// @ts-nocheck
import { useState } from "react";
import "./Products.css";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Smartphone X",
    price: 699.99,
    description: "El último modelo con características increíbles",
    image: "https://via.placeholder.com/200x200?text=Smartphone"
  },
  {
    id: 2,
    name: "Laptop Pro",
    price: 1299.99,
    description: "Potente laptop para profesionales",
    image: "https://via.placeholder.com/200x200?text=Laptop"
  },
  {
    id: 3,
    name: "Auriculares Premium",
    price: 199.99,
    description: "Sonido de alta calidad con cancelación de ruido",
    image: "https://via.placeholder.com/200x200?text=Auriculares"
  },
  {
    id: 4,
    name: "Smartwatch Sport",
    price: 299.99,
    description: "Tu compañero perfecto para el ejercicio",
    image: "https://via.placeholder.com/200x200?text=Smartwatch"
  }
];

export function Products() {
  const [qrCodes, setQrCodes] = useState<{ [key: number]: string }>({});

  const generateQR = async (product: Product) => {
    try {
      const response = await fetch('http://localhost:3001/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: `Producto: ${product.name}\nPrecio: $${product.price}\n${product.description}` 
        }),
      });

      const data = await response.json();
      if (data.qrCode) {
        setQrCodes(prev => ({
          ...prev,
          [product.id]: data.qrCode
        }));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <view className="products-container">
      <view className="products-header">
        <text className="products-title">Nuestros Productos</text>
      </view>
      <view className="products-grid">
        {products.map(product => (
          <view key={product.id} className="product-card">
            <image
              src={product.image}
              className="product-image"
            />
            <text className="product-name">{product.name}</text>
            <text className="product-price">${product.price}</text>
            <text className="product-description">{product.description}</text>
            <view 
              className="qr-button"
              bindtap={() => generateQR(product)}
            >
              <text style={{ color: "white" }}>
                {qrCodes[product.id] ? 'Regenerar QR' : 'Generar QR'}
              </text>
            </view>
            {qrCodes[product.id] && (
              <view className="qr-code">
                <image
                  src={qrCodes[product.id]}
                  style={{
                    width: "150px",
                    height: "150px"
                  }}
                />
              </view>
            )}
          </view>
        ))}
      </view>
    </view>
  );
}
