import {
  Button,
  Form,
  Input,
  Card,
  Typography,
  Space,
  Alert,
  InputNumber,
  notification,
} from "antd";
const { Text } = Typography;

import { SendOutlined, LinkOutlined } from "@ant-design/icons";

import { type TransferForm } from "../models";
import { ethers } from "ethers";
import { useState } from "react";

interface Props {
  account: string;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  setBalance: (balance: string) => void;
}

export default function Trans({
  account,
  provider,
  signer,
  setBalance,
}: Props) {
  const [txHash, setTxHash] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [form] = Form.useForm<TransferForm>();
  const [api, contextHolder] = notification.useNotification();

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
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {contextHolder}
      <Card title="发送 ETH" size="small">
        <Form form={form} onFinish={sendTransaction} layout="vertical">
          <Form.Item
            initialValue="0x5bF9634a97fAdfCEDCE8fF81A293dFf0FA060ADa"
            name="recipient"
            label="接收地址"
            rules={[{ required: true, message: "请输入接收地址" }]}
          >
            <Input placeholder="0x..." disabled={isLoading} />
          </Form.Item>

          <Form.Item
            initialValue={0.001}
            name="amount"
            label="发送数量 (ETH)"
            rules={[{ required: true, message: "请输入发送数量" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="请输入要转账的地址"
              min={0.001}
              max={1}
              step={0.001}
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item>
            <div className="w-fit">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={isLoading}
                block
              >
                {isLoading ? "发送中" : "发送"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
      {txHash && (
        <Alert
          message="交易已发送"
          description={
            <Space>
              <Text>交易哈希: {txHash}</Text>
              <Button
                type="link"
                icon={<LinkOutlined />}
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
              >
                在 Etherscan 上查看
              </Button>
            </Space>
          }
          type="info"
          showIcon
        />
      )}
    </Space>
  );
}
