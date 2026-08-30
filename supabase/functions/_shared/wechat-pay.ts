import { Wechatpay, Aes } from 'npm:wechatpay-axios-plugin';
import ShortUniqueId from 'npm:short-unique-id';

export function generateOrderNo(): string {
  const uid = new ShortUniqueId({ length: 8 });
  const yymmdd = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `ORD-${yymmdd}-${uid.rnd()}`;
}

export function generateRefundNo(): string {
  const uid = new ShortUniqueId({ length: 8 });
  const yymmdd = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `RFD-${yymmdd}-${uid.rnd()}`;
}

export async function createWechatPayUrl(
  MERCHANT_ID: string,
  MERCHANT_APP_ID: string,
  MCH_CERT_SERIAL_NO: string,
  MCH_PRIVATE_KEY: string,
  WECHAT_PAY_PUBLIC_KEY_ID: string,
  WECHAT_PAY_PUBLIC_KEY: string,
  outTradeNo: string,
  amount: number,
  notifyUrl: string,
) {
  try {
    const wxpay = new Wechatpay({
      mchid: MERCHANT_ID,
      serial: MCH_CERT_SERIAL_NO,
      privateKey: MCH_PRIVATE_KEY,
      certs: { [WECHAT_PAY_PUBLIC_KEY_ID]: WECHAT_PAY_PUBLIC_KEY },
    });
    const res = await wxpay.v3.pay.transactions.native.post({
      mchid: MERCHANT_ID,
      out_trade_no: outTradeNo,
      appid: MERCHANT_APP_ID,
      description: '芒得职训会员订阅',
      notify_url: notifyUrl,
      amount: { total: Math.round(amount * 100) },
    }, { headers: { 'Wechatpay-Serial': WECHAT_PAY_PUBLIC_KEY_ID } });
    if (res.data.code_url) {
      console.log(`[WeChatPay SUCCESS] outTradeNo=${outTradeNo}, url=${res.data.code_url}`);
      return { success: true, url: res.data.code_url };
    }
    console.error(`[WeChatPay FAILED] outTradeNo=${outTradeNo}, error=${res.data.message || JSON.stringify(res.data)}`);
    return { success: false, error: res.data.message || JSON.stringify(res.data) };
  } catch (err) {
    console.error(`[WeChatPay ERROR] outTradeNo=${outTradeNo}, error=${err?.message || String(err)}`);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function decryptTradeState(
  MCH_API_V3_KEY: string,
  associatedData: string,
  nonce: string,
  ciphertext: string,
): Promise<{ status: string; order_no: string }> {
  const plaintext = await Aes.AesGcm.decrypt(ciphertext, MCH_API_V3_KEY, nonce, associatedData);
  const obj = JSON.parse(plaintext);
  return {
    status: (obj.trade_state ?? '').toString() === 'SUCCESS' ? 'SUCCESS' : 'OTHERS',
    order_no: obj.out_trade_no ?? '',
  };
}

export async function createWechatRefund(
  MERCHANT_ID: string,
  MCH_CERT_SERIAL_NO: string,
  MCH_PRIVATE_KEY: string,
  WECHAT_PAY_PUBLIC_KEY_ID: string,
  WECHAT_PAY_PUBLIC_KEY: string,
  outTradeNo: string,
  outRefundNo: string,
  refundAmount: number,
  totalAmount: number,
  notifyUrl: string,
  reason: string,
) {
  try {
    const wxpay = new Wechatpay({
      mchid: MERCHANT_ID,
      serial: MCH_CERT_SERIAL_NO,
      privateKey: MCH_PRIVATE_KEY,
      certs: { [WECHAT_PAY_PUBLIC_KEY_ID]: WECHAT_PAY_PUBLIC_KEY },
    });
    const { data } = await wxpay.v3.refund.domestic.refunds.post(
      {
        out_trade_no: outTradeNo,
        out_refund_no: outRefundNo,
        reason: reason || '退款',
        notify_url: notifyUrl,
        amount: {
          refund: Math.round(refundAmount * 100),
          total: Math.round(totalAmount * 100),
          currency: 'CNY',
        },
      },
      { headers: { 'Wechatpay-Serial': WECHAT_PAY_PUBLIC_KEY_ID } },
    );
    console.log(`[WeChatPay REFUND SUCCESS] outTradeNo=${outTradeNo}, outRefundNo=${outRefundNo}, refundId=${data.refund_id}`);
    return { success: true, data };
  } catch (err) {
    const status = err?.response?.status;
    const wxError = err?.response?.data;
    console.error(`[WeChatPay REFUND ERROR] outTradeNo=${outTradeNo} outRefundNo=${outRefundNo} status=${status} wxpayError=${wxError ? JSON.stringify(wxError) : 'N/A'} message=${err?.message || String(err)}`);
    return { success: false, error: wxError || err?.message || String(err) };
  }
}

export async function decryptRefundState(
  MCH_API_V3_KEY: string,
  associatedData: string,
  nonce: string,
  ciphertext: string,
): Promise<{ refundStatus: string; outTradeNo: string; outRefundNo: string }> {
  const plaintext = await Aes.AesGcm.decrypt(ciphertext, MCH_API_V3_KEY, nonce, associatedData);
  const obj = JSON.parse(plaintext);
  return {
    refundStatus: (obj.refund_status ?? '').toString() === 'SUCCESS' ? 'SUCCESS' : 'OTHERS',
    outTradeNo: obj.out_trade_no ?? '',
    outRefundNo: obj.out_refund_no ?? '',
  };
}

export function getPaymentSecrets() {
  return {
    MERCHANT_ID: Deno.env.get('MERCHANT_ID') || '',
    MERCHANT_APP_ID: Deno.env.get('MERCHANT_APP_ID') || '',
    MCH_CERT_SERIAL_NO: Deno.env.get('MCH_CERT_SERIAL_NO') || '',
    MCH_PRIVATE_KEY: Deno.env.get('MCH_PRIVATE_KEY') || '',
    WECHAT_PAY_PUBLIC_KEY_ID: Deno.env.get('WECHAT_PAY_PUBLIC_KEY_ID') || '',
    WECHAT_PAY_PUBLIC_KEY: Deno.env.get('WECHAT_PAY_PUBLIC_KEY') || '',
    MCH_API_V3_KEY: Deno.env.get('MCH_API_V3_KEY') || '',
  };
}

export function hasPaymentSecrets(): boolean {
  const s = getPaymentSecrets();
  return !!(s.MERCHANT_ID && s.MERCHANT_APP_ID && s.MCH_CERT_SERIAL_NO && s.MCH_PRIVATE_KEY && s.WECHAT_PAY_PUBLIC_KEY_ID && s.WECHAT_PAY_PUBLIC_KEY && s.MCH_API_V3_KEY);
}