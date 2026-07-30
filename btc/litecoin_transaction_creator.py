from bitcoinlib.wallets import Wallet

def create_signed_raw_transaction(wallet_name, to_address, amount_ltc, fee_ltc):
    try:
        # Access wallet (ensure it's created for Litecoin)
        wallet = Wallet(wallet_name)

        # Verify if the wallet is on Litecoin network
        if wallet.network.name.lower() != "litecoin":
            raise ValueError("Wallet is not on the Litecoin network. Create the wallet with network='litecoin'.")

        # Convert LTC to litoshis (1 LTC = 100,000,000 litoshis)
        amount_in_litoshis = int(amount_ltc * 100_000_000)
        fee_in_litoshis = int(fee_ltc * 100_000_000)

        # Create transaction
        tx = wallet.transaction_create([(to_address, amount_in_litoshis)], fee=fee_in_litoshis)

        # Sign transaction
        tx.sign()

        # Get raw signed transaction hex
        raw_tx_hex = tx.raw_hex()

        # Save raw transaction to a file
        with open("raw_signed_transaction_ltc.txt", "w") as file:
            file.write(raw_tx_hex)

        print("\nTransaction Details:")
        print(f"Input Address: {tx.inputs[0].address}")
        print(f"To Address: {to_address}")
        print(f"Amount: {amount_ltc} LTC")
        print(f"Fee: {fee_ltc} LTC")
        print(f"Raw Signed Transaction HEX: {raw_tx_hex}")
        print("\nSigned transaction saved in 'raw_signed_transaction_ltc.txt'. You can manually broadcast it.")

        return raw_tx_hex

    except Exception as e:
        print(f"Error creating transaction: {str(e)}")
        return None

if __name__ == "__main__":
    # Transaction parameters
    WALLET_NAME = 'litecoin'
    TO_ADDRESS = 'MAPKQabvnjtETbMVLLfFxHkziMKpG7GKpU'
    AMOUNT_LTC = 0.0094
    FEE_LTC = 0.00019

    raw_signed_tx = create_signed_raw_transaction(WALLET_NAME, TO_ADDRESS, AMOUNT_LTC, FEE_LTC)