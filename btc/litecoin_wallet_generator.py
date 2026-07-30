from bitcoinlib.wallets import Wallet, wallet_delete
from bitcoinlib.mnemonic import Mnemonic

# Specify wallet details
wallet_name = "litecoin"

# Generate a mnemonic passphrase
passphrase = Mnemonic().generate()
print(f"Mnemonic Passphrase: {passphrase}")

# Create a wallet with the legacy address format
wallet = Wallet.create(wallet_name, keys=passphrase, network='litecoin', witness_type='legacy')

# Fetch the legacy address
address = wallet.get_key().address

print(f"Wallet '{wallet_name}' created successfully!")
print(f"Legacy Address: {address}")