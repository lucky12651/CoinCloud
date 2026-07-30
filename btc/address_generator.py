import secrets
import string
from bitcoinlib.wallets import Wallet
from bitcoinlib.mnemonic import Mnemonic


# Generate a random wallet name
def generate_random_name(length=8):
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(length))


passphrase = Mnemonic().generate()
print("Passphrase:", passphrase)

wallet_name = generate_random_name()
wallet = Wallet.create(wallet_name, keys=passphrase, network='bitcoin')
account_btc2 = wallet.new_account('Account BTC 2')
account_ltc1 = wallet.new_account('Account LTC', network='litecoin')


key_btc2 = wallet.get_key(account_btc2.account_id).address
key_ltc1 = wallet.get_key(account_ltc1.account_id).address

# Print the wallet name and the addresses associated with the first key of each account
print("Wallet Name:", wallet.name)
print("BTC Wallet Address:", key_btc2)
print("LTC Wallet Address:", key_ltc1)
