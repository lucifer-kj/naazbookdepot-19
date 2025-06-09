import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

const OTP_LENGTH = 6;
const RESEND_TIME = 60; // seconds

const OTPPage: React.FC = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_TIME);
  const [resendActive, setResendActive] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (timer > 0 && !resendActive) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setResendActive(true);
    }
  }, [timer, resendActive]);

  const handleChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setTimer(RESEND_TIME);
    setResendActive(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-naaz-green/10 to-naaz-gold/10 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <img src="/lovable-uploads/logo.png" alt="Brand Logo" className="w-20 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-center text-naaz-green mb-2">2FA Verification</h2>
        <p className="text-center text-gray-600 mb-4">Enter the 6-digit code sent to your email</p>
        <div className="flex justify-center gap-2 mb-4">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => (inputsRef.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-12 text-center border rounded-lg text-xl font-bold focus:ring-2 focus:ring-naaz-green outline-none"
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onFocus={e => e.target.select()}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>00:{timer.toString().padStart(2, '0')}</span>
          <button
            type="button"
            className={`ml-2 ${resendActive ? 'text-naaz-green hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
            onClick={handleResend}
            disabled={!resendActive}
          >
            Resend Code
          </button>
        </div>
        <Button className="w-full bg-naaz-green hover:bg-naaz-green/90 text-white py-2 rounded-lg font-medium mt-2">Verify</Button>
      </div>
    </div>
  );
};

export default OTPPage;
