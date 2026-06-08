import { NextResponse } from 'next/server';
import { 
  Keypair, 
  TransactionBuilder, 
  Operation, 
  Asset, 
  BASE_FEE 
} from '@stellar/stellar-sdk';
import { server, NETWORK_PASSPHRASE } from '@/lib/stellar';

/**
 * API Route to handle the payout from the Casino Pot.
 * FOR WORKSHOP USE ONLY — NOT SECURE FOR MAINNET.
 */
export async function POST(req: Request) {
  try {
    const { winnerAddress, amount } = await req.json();

    // 1. Get the Secret Key from Environment Variables
    const potSecret = process.env.POT_SECRET_KEY;
    
    if (!potSecret) {
      return NextResponse.json({ error: 'Pot Secret Key not configured on server' }, { status: 500 });
    }

    const sourceKeypair = Keypair.fromSecret(potSecret);

    // 2. Build the Payout Transaction
    const account = await server.getAccount(sourceKeypair.publicKey());
    
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: winnerAddress,
          asset: Asset.native(),
          amount: String(amount),
        })
      )
      .setTimeout(30)
      .build();

    // 3. Sign and Submit
    transaction.sign(sourceKeypair);
    const result = await server.sendTransaction(transaction);

    return NextResponse.json({ 
      success: true, 
      hash: result.hash 
    });

  } catch (error: any) {
    console.error('Payout failed:', error);
    return NextResponse.json({ 
      error: error.message || 'Payout transaction failed' 
    }, { status: 500 });
  }
}
