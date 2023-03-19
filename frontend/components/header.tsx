import React, { useEffect } from "react";
import { useMoralis } from "react-moralis";
import Link from "next/link";

const Header = () => {
  const {
    enableWeb3,
    isWeb3EnableLoading,
    isWeb3Enabled,
    account,
    Moralis,
    deactivateWeb3,
  } = useMoralis();

  function connectWallet() {
    enableWeb3();
    if (typeof window !== "undefined") {
      window.localStorage.setItem("connected", "injected");
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) return;
    if (
      typeof window !== "undefined" &&
      window.localStorage.getItem("connected")
    ) {
      enableWeb3();
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      if (account == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
      }
    });
  }, []);

  return (
    <div className="py-2 bg-gray-50">
      <header className="py-4 md:py-6">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0">
              <Link
                href="/"
                title="Home"
                className="flex rounded outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
              >
                <img
                  className="w-auto h-8"
                  src="https://d33wubrfki0l68.cloudfront.net/682a555ec15382f2c6e7457ca1ef48d8dbb179ac/f8cd3/images/logo.svg"
                  alt=""
                />
              </Link>
            </div>

            <div className="ml-auto flex items-center space-x-8 xl:space-x-10">
              {!isWeb3Enabled ? (
                <button
                  className="px-5 py-2 text-base font-bold leading-7 text-white transition-all duration-200 bg-gray-900 border border-transparent rounded-xl hover:bg-gray-600 font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  role="button"
                  onClick={connectWallet}
                  disabled={isWeb3EnableLoading}
                >
                  Connect Wallet
                </button>
              ) : (
                <button
                  className="px-5 py-2 text-base font-bold leading-7 text-white transition-all duration-200 bg-gray-900 border border-transparent rounded-xl hover:bg-gray-600 font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  role="button"
                  disabled={isWeb3EnableLoading}
                >
                  {account.slice(0, 5)}...{account.slice(account.length - 4)}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
