import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, ScanLine, Camera, CheckCircle2 } from 'lucide-react';

const BarcodeScanner = ({ onScanSuccess, onClose }) => {
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [isCameraMode, setIsCameraMode] = useState(false);
  
  const inputRef = useRef(null);
  const scannerRef = useRef(null);

  // 🚨 Check karein ke Mobile hai ya Laptop
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/android|iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        setIsMobile(true);
      }
    };
    checkDevice();
  }, []);

  // 🚨 Mobile Camera Logic
  useEffect(() => {
    if (isCameraMode && isMobile) {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          html5QrCode.stop().then(() => {
            onScanSuccess({ barcode: decodedText });
            onClose();
          });
        },
        (err) => { /* ignore errors */ }
      ).catch(err => {
        setError("Camera access denied. Please allow camera permissions.");
      });

      return () => {
        if (scannerRef.current) {
          scannerRef.current.stop().catch(e => console.log(e));
        }
      };
    }
  }, [isCameraMode, isMobile, onScanSuccess, onClose]);

  // 🚨 USB Scanner Logic (Keyboard Input Capture)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (scannedCode.trim() !== '') {
        onScanSuccess({ barcode: scannedCode.trim() });
        setScannedCode('');
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-teal-700 font-bold">
            <ScanLine size={20} /> Scan Barcode
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-red-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-50 relative min-h-[350px]">
          
          {error && (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-red-400 p-6 text-center font-bold z-20">
               {error}
             </div>
          )}

          {/* MOBILE CAMERA MODE */}
          {isMobile && isCameraMode ? (
            <div className="w-full">
              <div id="reader" className="w-full rounded-xl overflow-hidden bg-black"></div>
              <button 
                onClick={() => setIsCameraMode(false)} 
                className="w-full mt-4 bg-slate-200 text-slate-700 font-bold py-2 rounded-lg"
              >
                Switch to USB Scanner
              </button>
            </div>
          ) : (
            <>
              {/* Scanner Graphic */}
              <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6">
                <ScanLine size={48} />
              </div>

              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                {isMobile ? "Choose Scan Method" : "Please Scan the Product"}
              </h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                {isMobile 
                  ? "Use your phone camera or connect a USB scanner." 
                  : "Point your USB Barcode Scanner at the product."}
              </p>

              {/* Mobile Only: Open Camera Button */}
              {isMobile && (
                <button 
                  onClick={() => setIsCameraMode(true)}
                  className="w-full bg-[#0f766e] text-white font-bold py-3 rounded-xl mb-6 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  <Camera size={20} /> Open Mobile Camera
                </button>
              )}

              {/* USB Scanner / Manual Input */}
              <div className="w-full bg-white p-3 rounded-xl border-2 border-teal-500 shadow-sm relative">
                <label className="text-[10px] font-bold text-teal-600 uppercase mb-1 block">
                  {isMobile ? "Or Type Manually" : "Waiting for USB Scanner..."}
                </label>
                <div className="flex gap-2">
                  <input 
                    ref={inputRef}
                    type="text"
                    placeholder="Barcode number..."
                    className="flex-1 outline-none text-lg font-mono font-bold text-slate-800 bg-transparent"
                    onChange={(e) => setScannedCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    value={scannedCode}
                  />
                  <button 
                    onClick={() => {
                      if(scannedCode.trim() !== '') {
                        onScanSuccess({ barcode: scannedCode.trim() });
                        onClose();
                      }
                    }}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold text-sm"
                  >
                    Enter
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
        
        <div className="p-4 bg-white border-t border-slate-100 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
          <CheckCircle2 size={14} className="text-green-500" /> Scanner Ready
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;