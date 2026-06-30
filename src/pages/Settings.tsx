import React, { useState, useEffect } from 'react';

import type { CompanySettings } from '../services/types';
import { dbService } from '../services/db';
import { useToast } from '../components/Toast';
import { Save, Building, CreditCard, QrCode, Image } from 'lucide-react';

interface SettingsProps {
  companySettings: CompanySettings;
  setCompanySettings: (settings: CompanySettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  companySettings, 
  setCompanySettings 
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [gst, setGst] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Keep local form state in sync with loaded company settings
    const nextName = companySettings.company_name;
    const nextAddress = companySettings.address;
    const nextMobile = companySettings.mobile_number;
    const nextEmail = companySettings.email;
    const nextGst = companySettings.gst_number || '';
    const nextBankName = companySettings.bank_name || '';
    const nextAccountNumber = companySettings.account_number || '';
    const nextIfscCode = companySettings.ifsc_code || '';
    const nextUpiId = companySettings.upi_id || '';
    const nextLogoUrl = companySettings.logo_url || '';
    const nextSignatureUrl = companySettings.signature_url || '';

    // Use microtask to avoid react-hooks rule about setState in effect
    Promise.resolve().then(() => {
      setName(nextName);
      setAddress(nextAddress);
      setMobile(nextMobile);
      setEmail(nextEmail);
      setGst(nextGst);
      setBankName(nextBankName);
      setAccountNumber(nextAccountNumber);
      setIfscCode(nextIfscCode);
      setUpiId(nextUpiId);
      setLogoUrl(nextLogoUrl);
      setSignatureUrl(nextSignatureUrl);
    });
  }, [companySettings]);


  const [uploadError, setUploadError] = useState('');

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a valid signature image file (PNG, JPG, or SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSignatureUrl(reader.result);
        setUploadError('');
      }
    };
    reader.onerror = () => {
      setUploadError('Unable to read the uploaded file. Please try a different image.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !mobile || !email || !upiId) {
      showToast('Validation Error', 'Please fill in all required company fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload: CompanySettings = {
        ...companySettings,
        company_name: name,
        address,
        mobile_number: mobile,
        email,
        gst_number: gst,
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        upi_id: upiId,
        logo_url: logoUrl,
        signature_url: signatureUrl
      };

      const updated = await dbService.updateCompanySettings(payload);
      setCompanySettings(updated);
      showToast('Settings Saved', 'Company configurations have been updated successfully.', 'success');
    } catch {
      showToast('Save Failed', 'Failed to update company parameters.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Company Settings & Configuration
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Update your company details, banking information, UPI identifiers, and logos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Brand Info */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-2">
            <Building className="h-4.5 w-4.5 text-emerald-500" />
            <span>Company Identity & Contact</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Company Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">GSTIN Number (Optional)</label>
              <input
                type="text"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                placeholder="29AAAAA1111A1Z5"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Billing Office Address *</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Support Mobile *</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Billing Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bank Transfers */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-2">
            <CreditCard className="h-4.5 w-4.5 text-emerald-500" />
            <span>Bank Settlement Details</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 50100123"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="e.g. HDFC0000001"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              />
            </div>
          </div>
        </div>

        {/* Section 3: QR Settlement */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-2">
            <QrCode className="h-4.5 w-4.5 text-emerald-500" />
            <span>UPI Instant Settlements *</span>
          </h4>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Merchant UPI ID *</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. merchant@upi"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1 leading-normal font-sans">
              Used to dynamically construct payment QR codes directly printed on customer invoices.
            </p>
          </div>
        </div>

        {/* Section 4: Brand Logo */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-2">
            <Image className="h-4.5 w-4.5 text-emerald-500" />
            <span>Logo Configuration</span>
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Brand Logo Image URL</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Signature Image</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] items-end">
                <input
                  type="url"
                  value={signatureUrl}
                  onChange={(e) => setSignatureUrl(e.target.value)}
                  placeholder="Paste signature image URL or upload below"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
                />
                <label className="cursor-pointer inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSignatureUpload}
                  />
                </label>
              </div>
              {uploadError && (
                <p className="text-[10px] text-red-500 mt-2">{uploadError}</p>
              )}
              {signatureUrl && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Signature preview</p>
                  <img
                    src={signatureUrl}
                    alt="Signature preview"
                    className="max-h-20 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/15 disabled:opacity-50 transition-all cursor-pointer font-sans text-sm"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{loading ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
