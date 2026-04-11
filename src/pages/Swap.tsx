import { motion } from "motion/react";
import { ArrowDown, RefreshCw, Settings2, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "../context/WalletContext";
import { getSolBalance } from "../lib/solana";
import { VersionedTransaction } from "@solana/web3.js";
import { SolanaLogo, USDCLogo, USDTLogo } from "../components/icons/TokenLogos";

type Token = {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logoURI?: string;
};

const LEXA_TOKEN: Token = {
  symbol: "LEXA",
  name: "LexAgent",
  mint: "5pLCpJJRcNcXr24AQzMzEe4SERRbopKkFn1J1qZXpump",
  decimals: 6,
  logoURI: "/logo11.png",
};

const FALLBACK_TOKENS: Token[] = [
  { symbol: "SOL", name: "Solana", mint: "So11111111111111111111111111111111111111112", decimals: 9 },
  LEXA_TOKEN,
  { symbol: "USDC", name: "USD Coin", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  { symbol: "USDT", name: "Tether USD", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
];

const DESIRED_SYMBOLS = [
  "SOL", "USDC", "USDT", "JUP", "BONK", "WIF", "RAY", "PYTH", "JTO", "MNGO",
  "ORCA", "SRM", "MOBILE", "RNDR", "WEN", "HNT", "BOME", "POPCAT", "MEW", "AI16Z",
  "SAMO", "FIDA", "MSOL", "JITOSOL", "INF", "SNS", "SHDW", "TNSR", "PRCL", "KMNO",
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
  const [tokens, setTokens] = useState<Token[]>(FALLBACK_TOKENS);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [fromToken, setFromToken] = useState<Token>(FALLBACK_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(FALLBACK_TOKENS[1]);
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
    const loadTokens = async () => {
      try {
        const response = await fetch("https://api.jup.ag/tokens/v2/tag?query=verified");
        if (!response.ok) throw new Error("Failed loading token list");
        const list = await response.json();

        const bySymbol = new Map<string, any>();
        for (const t of list) {
          const symbol = String(t.symbol || "").toUpperCase();
          if (!symbol || bySymbol.has(symbol)) continue;
          bySymbol.set(symbol, t);
        }

        const curated: Token[] = DESIRED_SYMBOLS
          .map((s) => bySymbol.get(s))
          .filter(Boolean)
          .map((t) => ({
            symbol: String(t.symbol).toUpperCase(),
            name: String(t.name || t.symbol),
            mint: String(t.id || t.address),
            decimals: Number(t.decimals || 6),
            logoURI: t.icon ? String(t.icon) : (t.logoURI ? String(t.logoURI) : undefined),
          }));

        const dedupMap = new Map<string, Token>();
        [...curated, ...FALLBACK_TOKENS].forEach((t) => dedupMap.set(t.mint, t));
        // Ensure official LexAgent token is always present + pinned in visible list
        const withoutLexa = Array.from(dedupMap.values()).filter((t) => t.mint !== LEXA_TOKEN.mint);
        const finalList = [LEXA_TOKEN, ...withoutLexa].slice(0, 30);

        setTokens(finalList);
        const sol = finalList.find((t) => t.symbol === "SOL") || finalList[0];
        const lexa = finalList.find((t) => t.mint === LEXA_TOKEN.mint) || finalList[1] || finalList[0];
        setFromToken(sol);
        setToToken(lexa.mint === sol.mint ? (finalList[1] || sol) : lexa);
      } catch {
        setTokens(FALLBACK_TOKENS);
      } finally {
        setLoadingTokens(false);
      }
    };

    loadTokens();
  }, []);

  useEffect(() => {
    if (isConnected && address && walletType === "phantom") {
      getSolBalance(address).then(setSolBalance).catch(() => setSolBalance(0));
    }
  }, [isConnected, address, walletType]);

  const fetchQuote = useCallback(async (amount: string, input: Token, output: Token) => {
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

  const selectFromToken = (token: Token) => {
    if (token.mint === toToken.mint) {
      setToToken(fromToken);
    }
    setFromToken(token);
    setShowFromDropdown(false);
    setFromAmount("");
    setToAmount("");
    setQuote(null);
  };

  const selectToToken = (token: Token) => {
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

  const TokenIcon = ({ token, size = "w-5 h-5" }: { token: Token; size?: string }) => {
    if (token.symbol === "SOL") return <SolanaLogo className={size} />;
    if (token.symbol === "USDC") return <USDCLogo className={size} />;
    if (token.symbol === "USDT") return <USDTLogo className={size} />;
    if (token.logoURI) return <img src={token.logoURI} alt={token.symbol} className={`${size} rounded-full`} />;

    return (
      <div className={`${size} rounded-full bg-sky-200 text-blue-700 flex items-center justify-center text-[10px] font-bold`}>
        {token.symbol.slice(0, 2)}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="p-6 rounded-2xl bg-white border border-sky-200/70 relative overflow-visible">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-blue-700">Swap</h2>
          <button className="p-2 hover:bg-sky-100/70 rounded-lg transition-colors">
            <Settings2 className="w-5 h-5 text-blue-500" />
          </button>
        </div>

        {loadingTokens && (
          <div className="mb-4 text-xs text-blue-500 flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading token list...
          </div>
        )}

        {!isConnected || walletType !== "phantom" ? (
          <div className="text-center py-8 text-blue-600 space-y-4">
            <p>
              {walletType === "metamask"
                ? "MetaMask is not supported. Please connect a Phantom wallet."
                : "Connect your wallet to swap tokens"}
            </p>
            <button
              onClick={openModal}
              className="px-6 py-3 lex-accent-bg text-white rounded-lg font-bold transition-all"
            >
              Connect Phantom Wallet
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2 relative">
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/50 hover:border-sky-200/70 transition-colors">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-blue-500">From</span>
                  <span className="text-xs text-blue-500">
                    {fromToken.symbol === "SOL" ? `Balance: ${solBalance.toFixed(4)}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="w-full bg-transparent text-3xl font-bold focus:outline-none text-blue-700"
                  />
                  <div className="relative">
                    <button
                      onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-sky-200/70 hover:bg-sky-100/70 transition-colors font-bold text-blue-700"
                    >
                      <TokenIcon token={fromToken} />
                      {fromToken.symbol}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showFromDropdown && (
                      <div className="absolute right-0 top-full mt-2 bg-white border border-sky-200/70 rounded-xl overflow-y-auto z-20 min-w-[190px] max-h-72 shadow-lg">
                        {tokens.map((t) => (
                          <button
                            key={t.mint}
                            onClick={() => selectFromToken(t)}
                            className="flex items-center gap-2 w-full px-4 py-3 hover:bg-sky-50/70 transition-colors text-left text-blue-700"
                          >
                            <TokenIcon token={t} size="w-4 h-4" />
                            <div>
                              <div className="font-medium text-sm">{t.symbol}</div>
                              <div className="text-[10px] text-blue-500">{t.name}</div>
                            </div>
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
                  className="p-2 rounded-xl bg-white border border-sky-200/70 hover:border-sky-300/80 hover:bg-sky-50/70 transition-all text-blue-700"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/50 hover:border-sky-200/70 transition-colors">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-blue-500">To</span>
                  {loadingQuote && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={toAmount}
                    readOnly
                    className="w-full bg-transparent text-3xl font-bold focus:outline-none text-blue-600"
                  />
                  <div className="relative">
                    <button
                      onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-sky-200/70 hover:bg-sky-100/70 transition-colors font-bold text-blue-700"
                    >
                      <TokenIcon token={toToken} />
                      {toToken.symbol}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showToDropdown && (
                      <div className="absolute right-0 top-full mt-2 bg-white border border-sky-200/70 rounded-xl overflow-y-auto z-20 min-w-[190px] max-h-72 shadow-lg">
                        {tokens.map((t) => (
                          <button
                            key={t.mint}
                            onClick={() => selectToToken(t)}
                            className="flex items-center gap-2 w-full px-4 py-3 hover:bg-sky-50/70 transition-colors text-left text-blue-700"
                          >
                            <TokenIcon token={t} size="w-4 h-4" />
                            <div>
                              <div className="font-medium text-sm">{t.symbol}</div>
                              <div className="text-[10px] text-blue-500">{t.name}</div>
                            </div>
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
                <div className="p-3 rounded-lg bg-sky-50/70 text-xs space-y-2">
                  <div className="flex justify-between text-blue-600">
                    <span>Rate</span>
                    <span className="text-blue-700">1 {fromToken.symbol} = {getRate()} {toToken.symbol}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>Price Impact</span>
                    <span className="text-blue-700">{getPriceImpact()}%</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>Slippage</span>
                    <span className="text-blue-700">0.5%</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-green-200 text-green-600 text-sm">
                  {success}
                </div>
              )}

              <button
                onClick={handleSwap}
                disabled={!quote || loadingSwap || loadingQuote || !fromAmount}
                className="w-full py-4 bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-blue-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
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
