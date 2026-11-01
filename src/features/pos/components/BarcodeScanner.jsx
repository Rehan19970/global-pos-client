import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, ScanLine, Camera, CheckCircle2 } from 'lucide-react';

const BarcodeScanner = ({ onScanSuccess, onClose }) => {
  const [error, setError] = useState(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [isCameraMode, setIsCameraMode] = useState(false);
  
  const inputRef = useRef(null);
  const scannerRef = useRef(null);

  // ✅ 1. Check karein ke device mein camera available hai ya nahi
  useEffect(() => {
    const checkCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          setHasCamera(true);
        }
      } catch (err) {
        setHasCamera(false);
      }
    };
    checkCamera();
  }, []);

  // ✅ 2. Camera Start & Auto-Stop Logic (Bohut Zaroori Fix)
  useEffect(() => {
    let isMounted = true;
    
    if (isCameraMode && hasCamera) {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        { 
          fps: 10, 
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.0 
        },
        (decodedText) => {
          // ✅ SCAN SUCCESSFUL
          if (!isMounted) return;
          
          // Pehle camera foran band karein
          html5QrCode.stop().then(() => {
            onScanSuccess({ barcode: decodedText });
            onClose();
          }).catch((err) => {
            console.error("Camera stop error:", err);
            // Agar stop mein masla ho tab bhi barcode bhej dein
            onScanSuccess({ barcode: decodedText });
            onClose();
          });
        },
        (err) => { /* Scanning errors ignore karein */ }
      ).catch(err => {
        setError("Camera access denied. Please allow camera permissions.");
      });

      // ✅ Cleanup: Jab component band ho ya mode change ho, camera stop karein
      return () => {
        isMounted = false;
        if (scannerRef.current) {
          scannerRef.current.stop().catch(e => console.log("Cleanup error:", e));
        }
      };
    }
  }, [isCameraMode, hasCamera, onScanSuccess, onClose]);

  // ✅ 3. USB Scanner Input Focus
  useEffect(() => {
    if (!isCameraMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCameraMode]);

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

  const handleManualSubmit = () => {
    if (scannedCode.trim() !== '') {
      onScanSuccess({ barcode: scannedCode.trim() });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-sm sm:text-base">
            <ScanLine size={18} className="sm:w-5 sm:h-5" /> Scan Barcode
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-red-500 transition">
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-slate-50 relative min-h-[300px] sm:min-h-[350px] overflow-y-auto custom-scrollbar">
          
          {error && (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 text-red-400 p-4 sm:p-6 text-center font-bold text-sm sm:text-base z-20">
               {error}
             </div>
          )}

          {/* ✅ CAMERA MODE */}
          {isCameraMode && hasCamera ? (
            <div className="w-full">
              <div id="reader" className="w-full rounded-xl overflow-hidden bg-black min-h-[250px] max-h-[40vh]"></div>
              <button 
                onClick={() => setIsCameraMode(false)} 
                className="w-full mt-3 sm:mt-4 bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-sm"
              >
                Switch to USB Scanner / Manual
              </button>
            </div>
          ) : (
            <>
              {/* Scanner Graphic */}
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 shrink-0">
                <ScanLine size={32} className="sm:w-12 sm:h-12" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-800 text-center mb-1 sm:mb-2">
                {hasCamera ? "Choose Scan Method" : "Please Scan the Product"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 text-center mb-4 sm:mb-6 px-2">
                {hasCamera 
                  ? "Use your camera or connect a USB scanner." 
                  : "Point your USB Barcode Scanner at the product."}
              </p>

              {/* ✅ Sirf tab dikhega jab camera available ho */}
              {hasCamera && (
                <button 
                  onClick={() => setIsCameraMode(true)}
                  className="w-full bg-[#0f766e] text-white font-bold py-2.5 sm:py-3 rounded-xl mb-4 sm:mb-6 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 text-sm sm:text-base shrink-0"
                >
                  <Camera size={18} className="sm:w-5 sm:h-5" /> Open Camera
                </button>
              )}

              {/* USB Scanner / Manual Input */}
              <div className="w-full bg-white p-2.5 sm:p-3 rounded-xl border-2 border-teal-500 shadow-sm relative shrink-0">
                <label className="text-[9px] sm:text-[10px] font-bold text-teal-600 uppercase mb-1 block">
                  {hasCamera ? "Or Type Manually" : "Waiting for USB Scanner..."}
                </label>
                <div className="flex gap-1.5 sm:gap-2">
                  <input 
                    ref={inputRef}
                    type="text"
                    placeholder="Barcode number..."
                    className="flex-1 min-w-0 outline-none text-base sm:text-lg font-mono font-bold text-slate-800 bg-transparent"
                    onChange={(e) => setScannedCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    value={scannedCode}
                  />
                  <button 
                    onClick={handleManualSubmit}
                    className="bg-teal-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm shrink-0"
                  >
                    Enter
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
        
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 text-center text-[10px] sm:text-xs text-slate-400 font-medium flex items-center justify-center gap-2 shrink-0">
          <CheckCircle2 size={12} className="text-green-500 sm:w-3.5 sm:h-3.5" /> Scanner Ready
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;