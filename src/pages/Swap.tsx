import { motion } from "motion/react";
import { ArrowDown, RefreshCw, Settings2, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "../context/WalletContext";
import { getSolBalance } from "../lib/solana";
import { VersionedTransaction } from "@solana/web3.js";
import { SolanaLogo, USDCLogo, USDTLogo } from "../components/icons/TokenLogos";

const TOKENS = [
  { symbol: "SOL", mint: "So11111111111111111111111111111111111111112", decimals: 9, Logo: SolanaLogo },
  { symbol: "USDC", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6, Logo: USDCLogo },
  { symbol: "USDT", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6, Logo: USDTLogo },
];

interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: Array<{ swapInfo: { ammKey: string; label: string } }>;
}

export default function Swap() {
  const { address, isConnected, signAndSendTransaction, walletType, openModal } = useWallet();
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isConnected && address && walletType === "phantom") {
      getSolBalance(address).then(setSolBalance).catch(() => setSolBalance(0));
    }
  }, [isConnected, address, walletType]);

  const fetchQuote = useCallback(async (amount: string, input: typeof TOKENS[0], output: typeof TOKENS[0]) => {
    if (!amount || parseFloat(amount) <= 0) {
      setToAmount("");
      setQuote(null);
      return;
    }

    setLoadingQuote(true);
    setError("");

    try {
      const inputAmount = Math.round(parseFloat(amount) * Math.pow(10, input.decimals));
      const params = new URLSearchParams({
        inputMint: input.mint,
        outputMint: output.mint,
        amount: inputAmount.toString(),
        slippageBps: "50",
      });

      const response = await fetch(`https://lite-api.jup.ag/swap/v1/quote?${params}`);
      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(errBody || "Failed to fetch quote");
      }

      const data: QuoteResponse = await response.json();
      setQuote(data);
      const outAmt = parseInt(data.outAmount) / Math.pow(10, output.decimals);
      setToAmount(outAmt.toFixed(output.decimals > 6 ? 6 : output.decimals));
    } catch (err: any) {
      setError(err?.message || "Failed to fetch quote. Try again.");
      setToAmount("");
      setQuote(null);
    } finally {
      setLoadingQuote(false);
    }
  }, []);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setSuccess("");
    setError("");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchQuote(value, fromToken, toToken);
    }, 500);
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount("");
    setToAmount("");
    setQuote(null);
    setError("");
    setSuccess("");
  };

  const selectFromToken = (token: typeof TOKENS[0]) => {
    if (token.mint === toToken.mint) {
      setToToken(fromToken);
    }
    setFromToken(token);
    setShowFromDropdown(false);
    setFromAmount("");
    setToAmount("");
    setQuote(null);
  };

  const selectToToken = (token: typeof TOKENS[0]) => {
    if (token.mint === fromToken.mint) {
      setFromToken(toToken);
    }
    setToToken(token);
    setShowToDropdown(false);
    if (fromAmount) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      fetchQuote(fromAmount, fromToken, token);
    }
  };

  const handleSwap = async () => {
    if (!isConnected || !address || !quote) return;

    setLoadingSwap(true);
    setError("");
    setSuccess("");

    try {
      const swapResponse = await fetch("https://lite-api.jup.ag/swap/v1/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: address,
          wrapAndUnwrapSol: true,
        }),
      });

      if (!swapResponse.ok) {
        const errBody = await swapResponse.text();
        throw new Error(errBody || "Failed to build swap transaction");
      }

      const { swapTransaction } = await swapResponse.json();
      const swapTransactionBuf = Buffer.from(swapTransaction, "base64");

      const versionedTx = VersionedTransaction.deserialize(swapTransactionBuf);
      const signature = await signAndSendTransaction(versionedTx);

      setSuccess(`Swap successful! Signature: ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      setFromAmount("");
      setToAmount("");
      setQuote(null);

      if (address) {
        getSolBalance(address).then(setSolBalance).catch(() => {});
      }
    } catch (err: any) {
      setError(err?.message || "Swap failed. Please try again.");
    } finally {
      setLoadingSwap(false);
    }
  };

  const getRate = () => {
    if (!quote) return null;
    const inAmt = parseInt(quote.inAmount) / Math.pow(10, fromToken.decimals);
    const outAmt = parseInt(quote.outAmount) / Math.pow(10, toToken.decimals);
    if (inAmt === 0) return null;
    return (outAmt / inAmt).toFixed(6);
  };

  const getPriceImpact = () => {
    if (!quote) return null;
    return parseFloat(quote.priceImpactPct).toFixed(4);
  };

  const TokenIcon = ({ token, size = "w-5 h-5" }: { token: typeof TOKENS[0]; size?: string }) => (
    <token.Logo className={size} />
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="p-6 rounded-2xl bg-white border border-black/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black">Swap</h2>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {!isConnected || walletType !== "phantom" ? (
          <div className="text-center py-8 text-gray-500 space-y-4">
            <p>
              {walletType === "metamask"
                ? "MetaMask is not supported. Please connect a Phantom wallet."
                : "Connect your wallet to swap tokens"}
            </p>
            <button
              onClick={openModal}
              className="px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-bold transition-all"
            >
              Connect Phantom Wallet
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2 relative">
              <div className="p-4 rounded-xl bg-gray-50 border border-black/5 hover:border-black/10 transition-colors">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-400">From</span>
                  <span className="text-xs text-gray-400">
                    {fromToken.symbol === "SOL" ? `Balance: ${solBalance.toFixed(4)}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="w-full bg-transparent text-3xl font-bold focus:outline-none text-black"
                  />
                  <div className="relative">
                    <button 
                      onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/10 hover:bg-gray-100 transition-colors font-bold text-black"
                    >
                      <TokenIcon token={fromToken} />
                      {fromToken.symbol}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showFromDropdown && (
                      <div className="absolute right-0 top-full mt-2 bg-white border border-black/10 rounded-xl overflow-hidden z-20 min-w-[140px] shadow-lg">
                        {TOKENS.map((t) => (
                          <button
                            key={t.mint}
                            onClick={() => selectFromToken(t)}
                            className="flex items-center gap-2 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left text-black"
                          >
                            <TokenIcon token={t} size="w-4 h-4" />
                            <span className="font-medium">{t.symbol}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <button 
                  onClick={handleSwapTokens}
                  className="p-2 rounded-xl bg-white border border-black/10 hover:border-black/20 hover:bg-gray-50 transition-all text-black"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-black/5 hover:border-black/10 transition-colors">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-400">To</span>
                  {loadingQuote && <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />}
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    placeholder="0.0"
                    value={toAmount}
                    readOnly
                    className="w-full bg-transparent text-3xl font-bold focus:outline-none text-gray-500"
                  />
                  <div className="relative">
                    <button 
                      onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/10 hover:bg-gray-100 transition-colors font-bold text-black"
                    >
                      <TokenIcon token={toToken} />
                      {toToken.symbol}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showToDropdown && (
                      <div className="absolute right-0 top-full mt-2 bg-white border border-black/10 rounded-xl overflow-hidden z-20 min-w-[140px] shadow-lg">
                        {TOKENS.map((t) => (
                          <button
                            key={t.mint}
                            onClick={() => selectToToken(t)}
                            className="flex items-center gap-2 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left text-black"
                          >
                            <TokenIcon token={t} size="w-4 h-4" />
                            <span className="font-medium">{t.symbol}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {quote && (
                <div className="p-3 rounded-lg bg-gray-50 text-xs space-y-2">
                  <div className="flex justify-between text-gray-500">
                    <span>Rate</span>
                    <span className="text-black">1 {fromToken.symbol} = {getRate()} {toToken.symbol}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Price Impact</span>
                    <span className="text-black">{getPriceImpact()}%</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Slippage</span>
                    <span className="text-black">0.5%</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
                  {success}
                </div>
              )}

              <button 
                onClick={handleSwap}
                disabled={!quote || loadingSwap || loadingQuote || !fromAmount}
                className="w-full py-4 bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loadingSwap ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  <>
                    Swap Assets
                    <RefreshCw className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
