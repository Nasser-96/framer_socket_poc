import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`min-h-screen bg-slate-900`}>
      <Component {...pageProps} />
    </main>
  );
}
