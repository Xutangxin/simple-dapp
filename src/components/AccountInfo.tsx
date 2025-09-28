import { Alert, Typography } from "antd";

const { Text } = Typography;

interface Props {
  account: string;
  balance: string;
}

export default function AccountInfo({ account, balance }: Props) {
  return (
    <>
      <Alert
        message="钱包已连接"
        description={
          <>
            <Text strong>当前账户:</Text> {account}
            <br />
            <Text strong>账户余额:</Text> {balance} ETH
          </>
        }
        type="success"
        showIcon
      />
    </>
  );
}
