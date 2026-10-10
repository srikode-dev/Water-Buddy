"use client";

import React from 'react';
import { ProformaData } from '@/types';
import { X, Printer } from 'lucide-react';

export interface ProformaModalProps {
  data: ProformaData | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const ProformaModal: React.FC<ProformaModalProps> = ({ data, onClose, onToast }) => {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0c141f] border border-white/20 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 text-slate-200 font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close invoice"
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Invoice Header */}
        <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
              <h3 className="text-lg font-bold text-white tracking-tight">WATER BUDDY TECHNOLOGIES LTD</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Lavelle Road, Shanthala Nagar, Bengaluru, Karnataka 560001
              <br />
              <span className="font-mono text-slate-300">GSTIN: 29AABCB1234F1Z8 • SAC: 997331</span>
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 font-semibold inline-block mb-1">
              FORMAL PROFORMA TAX INVOICE
            </span>
            <div className="text-white font-medium">{data.invoiceNumber}</div>
            <div className="text-slate-400">Date: {data.invoiceDate}</div>
          </div>
        </div>

        {/* Billed To */}
        <div className="bg-[#070f19] border border-white/5 rounded-xl p-4 text-xs font-mono grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">BILLED TO (BUYER):</span>
            <strong className="text-white text-sm block mt-0.5">{data.companyName}</strong>
            <span className="text-slate-400 block mt-1">{data.address}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">BUYER GST CREDENTIALS:</span>
            <span className="text-emerald-400 font-semibold block mt-0.5">{data.gstin}</span>
            <span className="text-slate-400 block mt-1">Place of Supply: Karnataka (State Code 29)</span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Description & Kernel Tier</th>
                <th className="py-2.5 px-3 text-center">HSN</th>
                <th className="py-2.5 px-3 text-center">Seats</th>
                <th className="py-2.5 px-3 text-right">Unit Rate</th>
                <th className="py-2.5 px-3 text-right">Net Taxable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr>
                <td className="py-3 px-3">
                  <span className="text-white font-medium block">Water Buddy Studio Pro — Multi-Seat License</span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    Includes offline cryptographic deployment key & MDM telemetry profile.
                  </span>
                </td>
                <td className="py-3 px-3 text-center text-slate-400">997331</td>
                <td className="py-3 px-3 text-center text-white">{data.seats}</td>
                <td className="py-3 px-3 text-right">₹{data.unitPrice.toLocaleString()}</td>
                <td className="py-3 px-3 text-right text-white">₹{data.subtotal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-xs font-mono">
          <div className="text-slate-400 text-[11px] space-y-1">
            <span className="text-white font-semibold block">SETTLEMENT INSTRUCTIONS:</span>
            <div>Bank: HDFC Bank Ltd • Branch: Lavelle Road</div>
            <div>A/C: 50200088914210 • IFSC: HDFC0000043</div>
            <div>Account Name: Water Buddy Technologies Ltd</div>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 pt-2 border-t sm:border-t-0 border-white/10 text-right">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span>₹{data.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>CGST (9%):</span>
              <span>₹{Math.round(data.gstAmount / 2).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>SGST (9%):</span>
              <span>₹{Math.round(data.gstAmount / 2).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-white pt-2 border-t border-white/10">
              <span>Total Payable:</span>
              <span className="text-[#38bdf8]">₹{data.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-[#38bdf8] text-[#070f19] font-semibold text-xs font-mono hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-[#38bdf8]/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProformaModal;
