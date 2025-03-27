// @ts-nocheck
import { useState } from "react";
import "./QRGenerator.css";

export function QRGenerator() {
  const [showQR, setShowQR] = useState(false);
  const [qrImage, setQrImage] = useState("");

  const generateTicketQR = async () => {
    try {
      // Primero, generar el ticket
      const ticketData = {
        ticketNumber: "T" + Math.floor(Math.random() * 10000),
        items: [
          { name: "Producto 1", quantity: 2, price: 99.99 },
          { name: "Producto 2", quantity: 1, price: 149.99 },
          { name: "Producto 3", quantity: 3, price: 29.99 }
        ]
      };

      // Enviar datos del ticket al backend
      const ticketResponse = await fetch('https://lynx-prueba-2.onrender.com/generate-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });ic

      const ticketResult = await ticketResponse.json();
      
      if (ticketResult.url) {
        // Generar QR con la URL del ticket
        const qrResponse = await fetch('https://lynx-prueba-2.onrender.com/generate-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          
          body: JSON.stringify({ text: ticketResult.url }),
        });

        const qrResult = await qrResponse.json();
        if (qrResult.qrCode) {
          setQrImage(qrResult.qrCode);
          setShowQR(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <view className="qr-container">
      <view className="qr-box">
        {showQR && qrImage ? (
          <view className="qr-result">
            <image
              src={qrImage}
              style={{
                width: "250px",
                height: "250px"
              }}
            />
            <text style={{ marginTop: "10px", color: "#666" }}>
              Escanea el código QR para ver el ticket
            </text>
          </view>
        ) : (
          <text style={{ color: "#666", fontSize: "16px" }}>
            Click el botón para generar el ticket QR
          </text>
        )}
      </view>
      <view
        bindtap={generateTicketQR}
        className="qr-button"
      >
        <text className="qr-button-text">Generar Ticket QR</text>
      </view>
    </view>
  );
}
