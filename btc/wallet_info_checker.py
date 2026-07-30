from bitcoinlib.wallets import Wallet


wallet_name = input('Enter wallet name ')
wallet = Wallet(wallet_name)

# Get the first key (address) from the wallet
key1 = wallet.get_key()
wallet.scan()
wallet.utxos_update() 
wallet.info()

# Print the address associated with the first key
print("Wallet Address:", key1.address)