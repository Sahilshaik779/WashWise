// src/components/common/Modals.jsx
import React, { useState } from 'react';

export const PaymentModal = ({ isOpen, onClose, paymentDetails, onConfirmPayment }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  if (!isOpen) return null;

  const isSubscription = paymentDetails.type === 'subscription';

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmPayment(isSubscription ? paymentDetails.plan.name : paymentDetails.order.id);
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-backdrop payment-modal-backdrop">
      <div className="modal-content payment-modal-content">
        <button className="modal-close" onClick={onClose} disabled={isProcessing}>×</button>
        <h3>{isSubscription ? 'Complete Your Purchase' : 'Confirm Payment'}</h3>
        
        {isSubscription ? (
          <div className="plan-summary">
            <span>You are purchasing the</span>
            <strong>{paymentDetails.plan.label} Plan</strong>
            <div className="plan-price-summary">₹{paymentDetails.plan.price}/year</div>
          </div>
        ) : (
          <div className="plan-summary">
            <span>You are paying for</span>
            <strong>Order #{paymentDetails.order.id.substring(0, 8)}</strong>
            <div className="plan-price-summary">₹{paymentDetails.order.total_cost.toFixed(2)}</div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
          <div className="form-group"><label>Card Number</label><input type="text" placeholder="**** **** **** 1234" disabled={isProcessing} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Expiry Date</label><input type="text" placeholder="MM / YY" disabled={isProcessing} required /></div>
            <div className="form-group"><label>CVC</label><input type="text" placeholder="123" disabled={isProcessing} required /></div>
          </div>
          <button type="submit" className="btn-primary btn-pay" disabled={isProcessing}>
            {isProcessing ? <div className="mini-spinner"></div> : `Pay ₹${isSubscription ? paymentDetails.plan.price : paymentDetails.order.total_cost.toFixed(2)}`}
          </button>
        </form>
      </div>
      <style jsx>{`
        .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.75); display: flex; justify-content: center; align-items: center; z-index: 2000; }
        .modal-content { position: relative; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); max-width: 500px; width: 90%; }
        .modal-close { position: absolute; top: 10px; right: 15px; font-size: 2rem; color: #555; background: none; border: none; cursor: pointer; line-height: 1; }
        .payment-modal-backdrop { z-index: 2001; }
        .payment-modal-content { max-width: 420px; }
        .plan-summary { text-align: center; background-color: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
        .plan-price-summary { font-size: 1.1rem; font-weight: 600; color: #48C9B0; }
        .form-row { display: flex; gap: 15px; }
        .form-row .form-group { flex: 1; }
        .btn-pay { width: 100%; margin-top: 10px; display: flex; justify-content: center; align-items: center; min-height: 48px; }
        .mini-spinner { width: 20px; height: 20px; border: 3px solid rgba(255, 255, 255, 0.3); border-top: 3px solid #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export const ImageModal = ({ src, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>×</button>
      <img src={src} alt="Enlarged QR Code" className="modal-image" />
    </div>
    <style jsx>{`
      .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.75); display: flex; justify-content: center; align-items: center; z-index: 2000; }
      .modal-content { position: relative; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); max-width: 500px; width: 90%; }
      .modal-close { position: absolute; top: 10px; right: 15px; font-size: 2rem; color: #555; background: none; border: none; cursor: pointer; line-height: 1; }
      .modal-image { display: block; width: 100%; height: auto; border-radius: 8px; }
    `}</style>
  </div>
);