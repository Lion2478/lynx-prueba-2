// @ts-nocheck
import { useState } from "react";
import "./QRGenerator.css";

export function QRGenerator() {
  const [showQR, setShowQR] = useState(false);
  
  // URL de ejemplo de un código QR (puedes reemplazarla con tu propia URL)
  const qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://lynx.js.org";

  return (
    <view className="qr-container">
      <view className="qr-box">
        {showQR ? (
          <image
            src={qrImageUrl}
            style={{
              width: "250px",
              height: "250px"
            }}
          />
        ) : (
          <text style={{ color: "#666", fontSize: "16px" }}>
            Click the button to generate QR code
          </text>
        )}
      </view>
      <view
        bindtap={() => setShowQR(true)}
        className="qr-button"
      >
        <text className="qr-button-text">Generate QR</text>
      </view>
    </view>
  );
}
