from bitcoinlib.wallets import Wallet

wallet_name = input('Enter wallet name: ')


# Assuming you've already created the wallet and have its instance
wallet = Wallet(wallet_name)

# Replace 'account_ltc1' with the actual integer account ID or name of the account
 # Replace with your actual account ID or name

# Get the Litecoin address for the specified account
address_ltc1 = wallet.get_key(0).address

print(address_ltc1)
