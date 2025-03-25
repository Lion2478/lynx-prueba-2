export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
}

// Base de datos simulada
export const products: Product[] = [
  {
    id: 1,
    name: "Laptop Gaming Pro",
    price: 1299.99,
    description: "Laptop gaming de alta gama con RTX 4060",
    stock: 10,
    category: "Computadoras"
  },
  {
    id: 2,
    name: "Smartphone X15",
    price: 799.99,
    description: "Último modelo con cámara de 108MP",
    stock: 15,
    category: "Móviles"
  },
  {
    id: 3,
    name: "Auriculares Pro",
    price: 199.99,
    description: "Cancelación de ruido activa y sonido premium",
    stock: 20,
    category: "Audio"
  },
  {
    id: 4,
    name: "Monitor 4K",
    price: 499.99,
    description: "32 pulgadas, 144Hz, HDR",
    stock: 8,
    category: "Monitores"
  },
  {
    id: 5,
    name: "Teclado Mecánico RGB",
    price: 129.99,
    description: "Switches Cherry MX, retroiluminación personalizable",
    stock: 25,
    category: "Periféricos"
  }
];
