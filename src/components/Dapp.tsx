/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { Button, Card, Typography, notification } from "antd";
import { WalletOutlined } from "@ant-design/icons";

import styles from "../Dapp.module.css";

import { type TransferForm } from "../models";
import Trans from "./Trans";
import AccountInfo from "./AccountInfo";

const { Title } = Typography;

const IS_CONNECT_KEY = "isConnect";

const Dapp: React.FC = () => {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [txHash, setTxHash] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isConnect = useRef(false);

  const [api, contextHolder] = notification.useNotification();

  const connectWallet = async () => {
    if (!window.ethereum) {
      api.error({
        message: "错误",
        description: "请安装 MetaMask!",
      });
      return;
    }

    try {
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
    }
  };

  const sendTransaction = async (values: TransferForm) => {
    if (!signer) {
      api.error({
        message: "错误",
        description: "请先连接钱包",
      });
      return;
    }
    if (!ethers.isAddress(values.recipient)) {
      api.error({
        message: "不是一个有效的以太坊地址",
      });
      return;
    }

    try {
      setIsLoading(true);
      const tx = await signer.sendTransaction({
        to: values.recipient,
        value: ethers.parseEther(String(values.amount)),
      });
      setTxHash(tx.hash);
      api.success({
        message: `交易已发送: ${tx.hash}`,
      });

      await tx.wait();
      api.success({
        message: "交易已确认",
      });

      // 更新余额
      if (provider && account) {
        const newBalance = await provider.getBalance(account);
        setBalance(ethers.formatEther(newBalance));
      }
    } catch (error) {
      api.error({
        message: "转账失败",
        description: (error as any).message,
      });
    } finally {
      setIsLoading(false);
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
      <div className={styles.dapp}>
        {contextHolder}
        <Card>
          <Title
            level={3}
            style={{
              margin: "0 0 24px 0",
            }}
          >
            简易DApp示例
          </Title>
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
              <AccountInfo account={account} balance={balance} />
              <Trans
                isLoading={isLoading}
                txHash={txHash}
                sendTransaction={sendTransaction}
              />
            </>
          )}
        </Card>
      </div>
    </>
  );
};

export default Dapp;
