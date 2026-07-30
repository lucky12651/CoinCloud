from bitcoinlib.wallets import Wallet

# Use a masterkey WIF when creating a wallet
wif = ''
      
# Attempt to create the wallet


try:
    w = Wallet.create('jam', wif)
    print("Wallet 'jam' created successfully.")
except Exception as e:
    print("Error creating wallet:", e)
