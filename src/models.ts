// 声明 window.ethereum 类型
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
  }
}

export interface TransferForm {
  recipient: string;
  amount: string;
}
