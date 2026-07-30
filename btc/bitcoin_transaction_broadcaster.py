from bitcoinlib.wallets import Wallet
import requests

def create_signed_raw_transaction(wallet_name, to_address, amount_btc, fee_btc):
    try:
        # Access wallet
        wallet = Wallet(wallet_name)

        # Convert BTC to satoshis
        amount_in_satoshis = int(amount_btc * 100_000_000)
        fee_in_satoshis = int(fee_btc * 100_000_000)

        # Create transaction
        tx = wallet.transaction_create([(to_address, amount_in_satoshis)], fee=fee_in_satoshis)

        # Sign transaction
        tx.sign()

        # Get raw signed transaction hex
        raw_tx_hex = tx.raw_hex()

        # Save raw transaction to a file
        with open("raw_signed_transaction.txt", "w") as file:
            file.write(raw_tx_hex)

        print("\nTransaction Details:")
        print(f"Input Address: {tx.inputs[0].address}")
        print(f"To Address: {to_address}")
        print(f"Amount: {amount_btc} BTC")
        print(f"Fee: {fee_btc} BTC")
        print(f"Raw Signed Transaction HEX: {raw_tx_hex}")
        print("\nSigned transaction saved in 'raw_signed_transaction.txt'. Broadcasting now...")

        return raw_tx_hex

    except Exception as e:
        print(f"Error creating transaction: {str(e)}")
        return None
    
def broadcast_transaction(raw_tx_hex):
    try:
        url = "https://mempool.space/api/tx"
        response = requests.post(url, data=raw_tx_hex)

        if response.status_code == 200:
            print("Transaction successfully broadcasted!")
            print("Transaction ID:", response.text)
        else:
            print("Error broadcasting transaction:", response.text)

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    # Transaction parameters
    WALLET_NAME = ''
    TO_ADDRESS = ''
    AMOUNT_BTC = 0.00001
    FEE_BTC = 0.0000024

    raw_signed_tx = create_signed_raw_transaction(WALLET_NAME, TO_ADDRESS, AMOUNT_BTC, FEE_BTC)

    if raw_signed_tx:
        broadcast_transaction(raw_signed_tx)