import {
  Button,
  Form,
  Input,
  Card,
  Typography,
  Space,
  Alert,
  InputNumber,
} from "antd";
const { Text } = Typography;

import { SendOutlined, LinkOutlined } from "@ant-design/icons";

import styles from "../Dapp.module.css";

import { type TransferForm } from "../models";

interface Props {
  isLoading: boolean;
  txHash: string;
  sendTransaction: (values: TransferForm) => Promise<void>;
}

export default function Trans({ isLoading, txHash, sendTransaction }: Props) {
  const [form] = Form.useForm<TransferForm>();
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Card title="发送 ETH" size="small">
        <Form form={form} onFinish={sendTransaction} layout="vertical">
          <Form.Item
            initialValue="0x817C6Ef5f2EF3CC56ce87942BF7ed74138EC284C"
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
            <Button
              className={styles.sendBtn}
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={isLoading}
              block
            >
              {isLoading ? "发送中" : "发送"}
            </Button>
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
