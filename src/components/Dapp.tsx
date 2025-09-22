/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button, Card, Typography, notification } from "antd";
import { WalletOutlined } from "@ant-design/icons";

import styles from "../Dapp.module.css";
import { ConnectResult } from "./ConnectResult";

import { type TransferForm } from "../models";
const { Title } = Typography;

const Dapp: React.FC = () => {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [txHash, setTxHash] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [api, contextHolder] = notification.useNotification();

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setAccount(account);

        // 获取balance
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));

        // 获取signer
        const signer = await provider.getSigner();
        setSigner(signer);
      } else {
        api.error({
          message: "错误",
          description: "请安装 MetaMask!",
        });
      }
    } catch (error) {
      api.error({
        message: "连接钱包失败",
        description: (error as any).message,
      });
      console.error("连接钱包失败:", error);
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
      console.error("转账失败:", error);
      api.error({
        message: "转账失败",
        description: (error as any).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  useEffect(() => {
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <>
      <div className={styles.dapp}>
        {contextHolder}
        <Card>
          <Title level={2}>简易 dApp 示例</Title>
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
            <ConnectResult
              account={account}
              balance={balance}
              isLoading={isLoading}
              txHash={txHash}
              sendTransaction={sendTransaction}
            />
          )}
        </Card>
      </div>
    </>
  );
};

export default Dapp;
