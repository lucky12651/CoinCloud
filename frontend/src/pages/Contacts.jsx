import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { WALLET_COINS } from '../lib/coins'
import { useWalletStore } from '../store/useWalletStore'
import { copyText, shortAddress } from '../lib/utils'
import CoinIcon from '../components/vortex/CoinIcon'
import BinancePage, { Faq } from '../components/layout/BinancePage'

export default function Contacts() {
  const contacts = useWalletStore((s) => s.contacts)
  const addContact = useWalletStore((s) => s.addContact)
  const removeContact = useWalletStore((s) => s.removeContact)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [coin, setCoin] = useState('ETH')

  const onAdd = (e) => {
    e.preventDefault()
    if (!name.trim() || !address.trim()) {
      toast.error('Name and address required')
      return
    }
    addContact({ name, address, coin })
    toast.success('Contact saved')
    setName('')
    setAddress('')
  }

  return (
    <BinancePage
      crumb="Address book"
      title="Address Management"
      sub="Save recipients and pick them when you withdraw."
      aside={
        <Faq
          items={[
            { q: 'Where are contacts stored?', a: 'On this device only. They are not uploaded to CoinCloud servers.' },
            { q: 'How do I use a contact?', a: 'Open Withdraw and tap the name chip under Address.' },
          ]}
        />
      }
    >
      <form className="bn-panel" onSubmit={onAdd} style={{ marginBottom: 16 }}>
        <div className="bn-row">
          <div className="bn-label">Name</div>
          <input className="bn-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Label" />
        </div>
        <div className="bn-row">
          <div className="bn-label">Coin</div>
          <div className="bn-coins">
            {WALLET_COINS.map((c) => (
              <button key={c} type="button" className={`bn-coin${coin === c ? ' on' : ''}`} onClick={() => setCoin(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="bn-row">
          <div className="bn-label">Address</div>
          <input className="bn-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Wallet address" />
        </div>
        <button type="submit" className="bn-submit">Add address</button>
      </form>

      <div className="bn-table-wrap">
        <table className="bn-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Coin</th>
              <th>Address</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: 'var(--text-dimmer)' }}>No saved addresses</td>
              </tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 700 }}>{c.name}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <CoinIcon symbol={c.coin} /> {c.coin}
                  </span>
                </td>
                <td className="font-mono">{shortAddress(c.address, 12, 8)}</td>
                <td>
                  <Link to="/app/send" className="bn-link" style={{ marginRight: 10 }}>Withdraw</Link>
                  <button type="button" className="bn-link" onClick={async () => { await copyText(c.address); toast.success('Copied') }}>Copy</button>
                  <button type="button" className="bn-link" style={{ marginLeft: 10, color: 'var(--red)' }} onClick={() => removeContact(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BinancePage>
  )
}
