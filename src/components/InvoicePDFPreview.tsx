import React, { useRef, useState } from 'react';
import type { Invoice, CompanySettings } from '../services/types';
import { Download, Printer, X, Award, Palette, MessageSquare } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoicePDFPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  companySettings: CompanySettings;
}

interface Theme {
  name: string;
  dotColor: string;
  primaryText: string;
  accentGradient: string;
  qrColor: string;
  accentBar: string;
}

const THEMES: Record<string, Theme> = {
  teal: {
    name: 'Teal Classic',
    dotColor: '#0d9488',
    primaryText: 'text-teal-700',
    accentGradient: 'from-teal-500 to-emerald-600',
    qrColor: '0D9488',
    accentBar: 'bg-gradient-to-r from-teal-500 to-emerald-600'
  },
  blue: {
    name: 'Royal Blue',
    dotColor: '#2563eb',
    primaryText: 'text-blue-700',
    accentGradient: 'from-blue-600 to-indigo-700',
    qrColor: '2563EB',
    accentBar: 'bg-gradient-to-r from-blue-600 to-indigo-700'
  },
  rose: {
    name: 'Sunset Rose',
    dotColor: '#e11d48',
    primaryText: 'text-rose-700',
    accentGradient: 'from-pink-500 to-rose-600',
    qrColor: 'E11D48',
    accentBar: 'bg-gradient-to-r from-pink-500 to-rose-600'
  },
  gold: {
    name: 'Golden Hour',
    dotColor: '#d97706',
    primaryText: 'text-amber-700',
    accentGradient: 'from-amber-500 to-orange-600',
    qrColor: 'D97706',
    accentBar: 'bg-gradient-to-r from-amber-500 to-orange-600'
  },
  charcoal: {
    name: 'Charcoal Minimal',
    dotColor: '#334155',
    primaryText: 'text-slate-800',
    accentGradient: 'from-slate-700 to-slate-900',
    qrColor: '334155',
    accentBar: 'bg-gradient-to-r from-slate-700 to-slate-900'
  }
};

const formatPhoneForWhatsApp = (phone: string) => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = '91' + cleaned.substring(1);
  }
  return cleaned;
};

export const InvoicePDFPreview: React.FC<InvoicePDFPreviewProps> = ({
  isOpen,
  onClose,
  invoice,
  companySettings,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [themeKey, setThemeKey] = useState<string>('teal');
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const activeTheme = THEMES[themeKey] || THEMES.teal;

  const upiUrl = `upi://pay?pa=${encodeURIComponent(companySettings.upi_id)}&pn=${encodeURIComponent(
    companySettings.company_name
  )}&am=${invoice.total_amount}&tn=${encodeURIComponent(invoice.invoice_number)}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    upiUrl
  )}&color=${activeTheme.qrColor}&bgcolor=FFFFFF`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);

    try {
      const element = invoiceRef.current;
      const originalWidth = element.style.width;
      const originalMinWidth = element.style.minWidth;
      
      element.style.width = '800px';
      element.style.minWidth = '800px';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 800,
      });

      element.style.width = originalWidth;
      element.style.minWidth = originalMinWidth;

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${invoice.invoice_number}.pdf`);
    } catch (error) {
      console.error('PDF download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);

    try {
      const element = invoiceRef.current;
      const originalWidth = element.style.width;
      const originalMinWidth = element.style.minWidth;
      
      element.style.width = '800px';
      element.style.minWidth = '800px';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 800,
      });

      element.style.width = originalWidth;
      element.style.minWidth = originalMinWidth;

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], `${invoice.invoice_number}.pdf`, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: `Invoice ${invoice.invoice_number}`,
          text: `Dear Customer, please find attached your invoice ${invoice.invoice_number} from ${companySettings.company_name}.`,
        });
      } else {
        pdf.save(`${invoice.invoice_number}.pdf`);
        alert("Direct PDF sharing is not supported by your browser/device. The PDF has been downloaded to your device instead. You can now manually attach and send it on WhatsApp.");
      }
    } catch (error) {
      console.error('PDF sharing error:', error);
      alert('Failed to share PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsAppTextAlert = () => {
    const formattedPhone = formatPhoneForWhatsApp(invoice.customer_mobile || '');
    const message = `Hello ${invoice.customer_name},\n\nYour invoice *${invoice.invoice_number}* from *${companySettings.company_name}* is ready.\n\n*Amount Due*: ₹${invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n*Status*: ${invoice.payment_status}\n\nYou can pay using UPI ID: ${companySettings.upi_id}\n\nThank you!\n- Powered by Xivora`;
    
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-5xl bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 no-print">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Invoice Preview</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Color Palette Selector */}
            <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-700 pr-4 mr-2">
              <Palette className="h-3.5 w-3.5 text-slate-400" />
              <div className="flex items-center gap-1.5">
                {Object.keys(THEMES).map((key) => (
                  <button
                    key={key}
                    onClick={() => setThemeKey(key)}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      themeKey === key 
                        ? 'ring-2 ring-offset-2 ring-teal-550 ring-emerald-500 scale-110' 
                        : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: THEMES[key].dotColor }}
                    title={THEMES[key].name}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleWhatsAppTextAlert}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="Send WhatsApp Text Alert"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp Alert</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-all"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.446L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.116-2.905-6.993C16.554 1.87 14.079.841 11.443.84 6.008.84 1.585 5.26 1.581 10.7c-.001 1.77.464 3.497 1.348 5.016l-.993 3.626 3.712-.973zm11.514-6.182c-.303-.153-1.78-.878-2.057-.978-.277-.1-.478-.153-.679.153-.202.302-.782.978-.96 1.181-.177.202-.355.226-.658.074-.303-.152-1.28-.471-2.438-1.503-.9-.802-1.507-1.793-1.684-2.097-.177-.302-.019-.465.132-.616.136-.135.303-.352.454-.529.152-.177.202-.303.303-.505.1-.202.05-.379-.025-.53-.076-.153-.679-1.637-.93-2.247-.244-.587-.492-.507-.679-.516-.174-.008-.373-.01-.572-.01-.199 0-.525.075-.799.375-.274.3-.1.583-.1 1.258 0 2.053 1.494 4.036 1.7 4.313.205.277 2.937 4.485 7.114 6.29 1 .43 1.777.687 2.383.879 1.002.318 1.916.273 2.638.165.803-.12 1.78-.727 2.03-1.402.25-.675.25-1.253.175-1.378-.075-.125-.275-.202-.578-.354z"/>
              </svg>
              <span>Share</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-white transition-colors ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-900 flex justify-center">
          <div
            ref={invoiceRef}
            className="w-full max-w-[800px] bg-white text-slate-900 font-sans flex flex-col justify-between min-h-[1050px] shadow-[0_0_40px_rgba(0,0,0,0.05)] overflow-hidden relative"
            style={{ colorScheme: 'light' }}
          >
            {/* Top Accent Bar */}
            <div className={`h-2 w-full ${activeTheme.accentBar} absolute top-0 left-0 right-0`}></div>
            
            <div className="px-12 pt-14 pb-10 flex flex-col flex-1">
              {/* Header Section */}
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-1 max-w-[50%]">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">INVOICE</h1>
                  <p className="text-sm font-medium text-slate-500 tracking-wider">#{invoice.invoice_number}</p>
                </div>
                <div className="text-right">
                  <h2 className={`text-2xl font-extrabold ${activeTheme.primaryText} tracking-tight`}>{companySettings.company_name}</h2>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-[250px] ml-auto">{companySettings.address}</p>
                  <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                    {companySettings.mobile_number && <p>{companySettings.mobile_number}</p>}
                    {companySettings.email && <p>{companySettings.email}</p>}
                    {companySettings.gst_number && <p className="font-semibold text-slate-700 mt-1">GSTIN: {companySettings.gst_number}</p>}
                  </div>
                </div>
              </div>

              {/* Billing & Details Section */}
              <div className="flex justify-between items-end border-b border-slate-200 pb-8 mb-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">Billed To</p>
                  <h3 className="text-base font-bold text-slate-900">{invoice.customer_name}</h3>
                  <p className="mt-1 text-xs text-slate-600 max-w-[250px] leading-relaxed">{invoice.customer_address}</p>
                  <p className="mt-1.5 text-xs text-slate-600">
                    <span className="font-medium text-slate-500">Mobile:</span> {invoice.customer_mobile}
                  </p>
                  {invoice.customer_plan && (
                    <p className="mt-0.5 text-xs text-slate-600">
                      <span className="font-medium text-slate-500">Plan:</span> {invoice.customer_plan}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-right">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-1">Date</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(invoice.invoice_date).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-1">Status</p>
                    <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      invoice.payment_status === 'Paid' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {invoice.payment_status}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-1">Amount Due</p>
                    <p className="text-2xl font-bold text-slate-900">₹{invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="flex-1">
                <table className="w-full text-sm mb-8">
                  <thead>
                    <tr className="border-b-2 border-slate-800">
                      <th className="py-3 text-left text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold w-1/2">Description</th>
                      <th className="py-3 text-center text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Qty</th>
                      <th className="py-3 text-right text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Rate</th>
                      <th className="py-3 text-right text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item, idx) => (
                      <tr key={item.id || idx} className="border-b border-slate-100">
                        <td className="py-4 font-medium text-slate-800">{item.description}</td>
                        <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-4 text-right text-slate-600">₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 text-right font-semibold text-slate-900">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Section */}
                <div className="flex justify-end">
                  <div className="w-72 space-y-3">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-900">₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {(invoice.gst_amount ?? invoice.tax ?? 0) > 0 && (
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>GST {invoice.gst_percentage ? `(${invoice.gst_percentage}%)` : ''}</span>
                        <span className="font-medium text-slate-900">₹{(invoice.gst_amount ?? invoice.tax ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t-2 border-slate-800 pt-3 mt-3">
                      <span className="text-base font-bold text-slate-900 uppercase tracking-wide">Total</span>
                      <span className="text-xl font-bold text-slate-900">₹{invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="bg-slate-50 px-12 py-10 mt-auto border-t border-slate-200">
              <div className="flex justify-between items-end gap-8">
                
                {/* Bank Details & QR */}
                <div className="flex gap-8 items-center">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                    <img src={qrCodeUrl} alt="UPI QR Code" className="w-20 h-20 object-contain" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-2">Payment Details</p>
                    <p className="text-sm font-bold text-slate-800">{companySettings.bank_name}</p>
                    {companySettings.company_name && (
                      <p className="text-xs text-slate-600 mt-0.5"><span className="font-medium text-slate-500">Account Holder:</span> {companySettings.company_name}</p>
                    )}
                    {companySettings.account_number && (
                      <p className="text-xs text-slate-600 mt-0.5"><span className="font-medium text-slate-500">A/C:</span> {companySettings.account_number}</p>
                    )}
                    {companySettings.ifsc_code && (
                      <p className="text-xs text-slate-600 mt-0.5"><span className="font-medium text-slate-500">IFSC:</span> {companySettings.ifsc_code}</p>
                    )}
                    {companySettings.upi_id && (
                      <p className="text-xs text-slate-600 mt-0.5"><span className="font-medium text-slate-500">UPI ID:</span> {companySettings.upi_id}</p>
                    )}
                  </div>
                </div>

                {/* Signature */}
                <div className="text-right flex flex-col items-end">
                  {companySettings.signature_url ? (
                    <img src={companySettings.signature_url} alt="Signature" className="h-14 object-contain mb-2 mix-blend-multiply" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />
                  ) : (
                    <div className="h-14 w-32 border-b border-slate-300 mb-2"></div>
                  )}
                  <p className="text-xs font-bold text-slate-800">{companySettings.company_name}</p>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400 mt-1">Authorized Signatory</p>
                </div>
                
              </div>
              
              <div className="mt-10 text-center border-t border-slate-200 pt-6">
                <p className="text-[10px] text-slate-500 tracking-wider">Thank you for your business. Please retain this invoice for your records.</p>
                <p className="text-[10px] text-slate-500 tracking-wider">Powered by XIVORA</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #root {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          div[ref] {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          div[ref] * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
};
