import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SITE } from '../data/site'

const Page = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mx-auto max-w-3xl px-4 py-12 text-royal-800 leading-relaxed">
    <h1 className="font-display text-4xl text-royal-800">{title}</h1>
    <p className="text-sm text-royal-500 mt-1">Last updated: {SITE.updated}</p>
    <div className="mt-6 space-y-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-royal-800 [&_h2]:mt-8 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:underline [&_a]:text-royal-600">
      {children}
    </div>
  </section>
)

const Contact = () => (
  <p>{SITE.churchName}, {SITE.addressLines.join(', ')}. Phone <a href={`tel:${SITE.phoneLink}`}>{SITE.phone}</a>. Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
)

export function Terms() {
  return (
    <Page title="Terms and Conditions">
      <p>These terms apply to your use of the {SITE.storeName} (the "Store"), operated by {SITE.churchName} ("we", "us"). By buying from the Store you agree to them.</p>
      <h2>1. What we sell</h2>
      <p>We sell digital books in PDF format. No physical goods are sold or shipped. All prices are shown in South African Rand (ZAR).</p>
      <h2>2. Orders and payment</h2>
      <ul>
        <li>Payments are processed securely by PayFast. We never see or store your card details.</li>
        <li>An order is complete once PayFast confirms your payment to us.</li>
        <li>You must give a valid email address so PayFast can send your payment receipt.</li>
      </ul>
      <h2>3. Delivery</h2>
      <p>After payment is confirmed, your order page shows a Download PDF button. The download link is personal to your order. Please keep the order page address safe. Each order allows up to 5 downloads.</p>
      <h2>4. Licence and acceptable use</h2>
      <p>When you buy a book you receive a personal, non-transferable licence to read it for your own use. You may not copy, resell, share, upload or distribute the file, or any part of it, without our written permission. All content remains the property of the author and {SITE.churchName}.</p>
      <h2>5. Refunds</h2>
      <p>Because digital books are delivered instantly, our <Link to="/refunds">Refund and Cancellation Policy</Link> applies.</p>
      <h2>6. Availability</h2>
      <p>We try to keep the Store available at all times, but we do not promise it will be uninterrupted or error free. We may change prices or remove books at any time. The price you pay is the price shown at checkout.</p>
      <h2>7. Liability</h2>
      <p>The books are spiritual and educational resources. To the extent the law allows, we are not liable for indirect or consequential loss arising from use of the Store. Nothing in these terms limits your rights under the Consumer Protection Act or the Electronic Communications and Transactions Act where they apply.</p>
      <h2>8. Governing law</h2>
      <p>These terms are governed by the laws of the Republic of South Africa.</p>
      <h2>9. Contact</h2>
      <Contact />
    </Page>
  )
}

export function Privacy() {
  return (
    <Page title="Privacy Policy">
      <p>{SITE.churchName} ("we", "us") respects your privacy. This policy explains what personal information the {SITE.storeName} collects and how we handle it, in line with South Africa's Protection of Personal Information Act (POPIA).</p>
      <h2>1. What we collect</h2>
      <ul>
        <li>Your email address and, if you give it, your first name, when you check out.</li>
        <li>Order details: which book you bought, the amount, the date, and the payment status.</li>
      </ul>
      <p>We do not collect or store your card or bank details. These are entered on PayFast's secure payment page.</p>
      <h2>2. Why we collect it</h2>
      <ul>
        <li>To process your order and deliver your book.</li>
        <li>To let you download your purchase and help you if something goes wrong.</li>
        <li>To keep records of sales, as required for accounting.</li>
      </ul>
      <h2>3. Who we share it with</h2>
      <p>We share only what is needed with our service providers: PayFast (payments), Supabase (secure database and file storage) and Netlify (website hosting). We do not sell your information or use it for marketing without your consent.</p>
      <h2>4. How long we keep it</h2>
      <p>We keep order records for as long as needed for the purposes above and to meet legal and tax requirements, then delete or anonymise them.</p>
      <h2>5. Security</h2>
      <p>The site uses HTTPS, book files are stored privately, and downloads are only available through your personal order link after payment is confirmed.</p>
      <h2>6. Your rights</h2>
      <p>You may ask to see the personal information we hold about you, to correct it, or to have it deleted, subject to legal record-keeping duties. Contact us using the details below. You may also complain to the Information Regulator of South Africa.</p>
      <h2>7. Cookies</h2>
      <p>We do not use advertising or tracking cookies.</p>
      <h2>8. Contact</h2>
      <Contact />
    </Page>
  )
}

export function Refunds() {
  return (
    <Page title="Refund and Cancellation Policy">
      <p>This policy applies to all purchases from the {SITE.storeName}.</p>
      <h2>1. Digital products</h2>
      <p>Our books are digital PDF files made available for download immediately after payment. Because a downloaded file cannot be returned, all sales are final once the download link has been issued, except as set out below.</p>
      <h2>2. Cancellation</h2>
      <p>You can cancel at any time before paying by closing the PayFast payment page or choosing cancel. You will not be charged. Once payment is confirmed, the order cannot be cancelled.</p>
      <h2>3. When we will refund you</h2>
      <ul>
        <li>You were charged but could not download the book and we cannot fix the problem.</li>
        <li>The file is damaged, empty or is not the book that was advertised.</li>
        <li>You were charged more than once for the same order.</li>
      </ul>
      <h2>4. How to ask for a refund</h2>
      <p>Email or phone us within 7 days of your purchase with the email address you used and the name of the book. We will reply within 3 business days. Approved refunds are paid back to the original payment method through PayFast, and your bank may take several days to show it.</p>
      <h2>5. Your legal rights</h2>
      <p>Nothing in this policy limits any rights you have under South African consumer law.</p>
      <h2>6. Contact</h2>
      <Contact />
    </Page>
  )
}
