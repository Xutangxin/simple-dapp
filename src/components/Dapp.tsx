/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { Button, Card, Spin, notification, Popconfirm } from "antd";
import { WalletOutlined } from "@ant-design/icons";

import Trans from "./Trans";
import AccountInfo from "./AccountInfo";

const IS_CONNECT_KEY = "isConnect";

const Dapp: React.FC = () => {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const isConnect = useRef(false);
  const [api, contextHolder] = notification.useNotification();

  const check = () => {
    if (!window.ethereum) {
      api.error({
        message: "错误",
        description: "请安装 MetaMask!",
      });
      return false;
    }
    console.log("chainId: ", window.ethereum.networkVersion);
    return true;
  };

  const connectWallet = async () => {
    if (!check()) return;
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      setAccount(account);
      isConnect.current = true;
      sessionStorage.setItem(IS_CONNECT_KEY, "true");

      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));

      const signer = await provider.getSigner();
      setSigner(signer);
    } catch (error) {
      api.error({
        message: "连接钱包失败",
        description: (error as any).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const close = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
      setAccount("");
      isConnect.current = false;
    } catch (e) {
      console.warn("revoke failed", e);
    }
  };

  const handleChainChanged = () => {
    if (isConnect.current) {
      connectWallet();
    }
  };

  const handleAccountsChange = (accounts: string[]) => {
    if (accounts.length) {
      connectWallet();
    } else {
      sessionStorage.setItem(IS_CONNECT_KEY, "");
      location.reload();
    }
  };

  useEffect(() => {
    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("accountsChanged", handleAccountsChange);
    return () => {
      window.ethereum.removeListener("chainChanged", handleChainChanged);
      window.ethereum.removeListener("accountsChanged", handleAccountsChange);
    };
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(IS_CONNECT_KEY) && !isConnect.current) {
      connectWallet();
    }
  }, []);

  return (
    <>
      <Spin spinning={loading}>
        <div className="max-w-[700px] mx-auto mt-[5vh]">
          {contextHolder}
          <Card>
            <p className="mb-[20px] text-[26px] font-bold">Simple DApp</p>
            {!account ? (
              <Button
                type="primary"
                onClick={connectWallet}
                icon={<WalletOutlined />}
                size="large"
              >
                连接钱包
              </Button>
            ) : (
              <>
                <Popconfirm
                  title="确认"
                  description="确定断开连接吗？"
                  onConfirm={close}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button danger className="mb-[12px]">
                    断开连接
                  </Button>
                </Popconfirm>
                <AccountInfo account={account} balance={balance} />
                <Trans
                  account={account}
                  provider={provider}
                  signer={signer}
                  setBalance={setBalance}
                />
              </>
            )}
          </Card>
        </div>
      </Spin>
    </>
  );
};

export default Dapp;
