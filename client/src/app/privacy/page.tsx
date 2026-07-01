import PublicLayout from '@/components/layout/PublicLayout'

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Privacy Policy / गोपनीयता नीति</h1>
        <p className="text-muted-foreground mb-8 text-center">
          We value your privacy and are committed to protecting your personal information.<br />
          हम आपकी गोपनीयता का सम्मान करते हैं और आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए प्रतिबद्ध हैं。
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect / हम कौन सी जानकारी एकत्र करते हैं</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <b>Personal Information:</b> Name, email, phone number, address (if provided).<br />
              <span className="text-slate-600">व्यक्तिगत जानकारी: नाम, ईमेल, फोन नंबर, पता (यदि दिया गया हो)।</span>
            </li>
            <li>
              <b>Usage Data:</b> Pages visited, actions taken, device/browser info.<br />
              <span className="text-slate-600">उपयोग डेटा: देखे गए पृष्ठ, की गई क्रियाएं, डिवाइस/ब्राउज़र जानकारी।</span>
            </li>
            <li>
              <b>Location Data:</b> If you allow, we may use your location to improve services.<br />
              <span className="text-slate-600">स्थान डेटा: यदि आप अनुमति देते हैं, तो हम आपकी लोकेशन सेवाओं को बेहतर बनाने के लिए उपयोग कर सकते हैं।</span>
            </li>
            <li>
              <b>Uploaded Content:</b> Photos, videos, and issue reports you submit.<br />
              <span className="text-slate-600">अपलोड की गई सामग्री: आपके द्वारा भेजी गई फ़ोटो, वीडियो और शिकायतें।</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information / हम आपकी जानकारी का उपयोग कैसे करते हैं</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <b>To provide and improve services</b> (e.g., issue tracking, notifications).<br />
              <span className="text-slate-600">सेवाएं प्रदान करने और सुधारने के लिए (जैसे, शिकायत ट्रैकिंग, सूचनाएं)।</span>
            </li>
            <li>
              <b>To communicate with you</b> about your reports or account.<br />
              <span className="text-slate-600">आपकी शिकायतों या खाते के बारे में आपसे संवाद करने के लिए।</span>
            </li>
            <li>
              <b>To ensure security and prevent misuse.</b><br />
              <span className="text-slate-600">सुरक्षा सुनिश्चित करने और दुरुपयोग रोकने के लिए।</span>
            </li>
            <li>
              <b>To analyze usage and improve the platform.</b><br />
              <span className="text-slate-600">उपयोग का विश्लेषण करने और प्लेटफ़ॉर्म को बेहतर बनाने के लिए।</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">3. Data Sharing & Disclosure / डेटा साझा करना और प्रकटीकरण</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <b>We do not sell your personal data.</b><br />
              <span className="text-slate-600">हम आपकी व्यक्तिगत जानकारी नहीं बेचते।</span>
            </li>
            <li>
              <b>Data may be shared with government authorities</b> for resolving civic issues.<br />
              <span className="text-slate-600">सरकारी अधिकारियों के साथ डेटा साझा किया जा सकता है ताकि नागरिक समस्याओं का समाधान किया जा सके।</span>
            </li>
            <li>
              <b>We may share data with service providers</b> (e.g., SMS/email providers) under strict confidentiality.<br />
              <span className="text-slate-600">हम सेवा प्रदाताओं (जैसे, एसएमएस/ईमेल प्रदाता) के साथ डेटा साझा कर सकते हैं, लेकिन पूरी गोपनीयता के साथ।</span>
            </li>
            <li>
              <b>We may disclose information if required by law.</b><br />
              <span className="text-slate-600">यदि कानून द्वारा आवश्यक हो, तो हम जानकारी साझा कर सकते हैं।</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">4. Data Security / डेटा सुरक्षा</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <b>We use industry-standard security measures</b> to protect your data.<br />
              <span className="text-slate-600">हम आपके डेटा की सुरक्षा के लिए इंडस्ट्री-स्टैंडर्ड सुरक्षा उपायों का उपयोग करते हैं।</span>
            </li>
            <li>
              <b>Despite our efforts, no system is 100% secure.</b><br />
              <span className="text-slate-600">हमारी पूरी कोशिश के बावजूद, कोई भी सिस्टम 100% सुरक्षित नहीं है।</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">5. Your Rights / आपके अधिकार</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <b>You can access, update, or delete your data</b> by contacting us.<br />
              <span className="text-slate-600">आप हमसे संपर्क करके अपनी जानकारी देख सकते हैं, अपडेट कर सकते हैं या हटा सकते हैं।</span>
            </li>
            <li>
              <b>You can opt out of communications</b> at any time.<br />
              <span className="text-slate-600">आप कभी भी सूचनाओं से बाहर निकल सकते हैं।</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">6. Children’s Privacy / बच्चों की गोपनीयता</h2>
          <p>
            Our platform is not intended for children under 13. We do not knowingly collect data from children.<br />
            हमारा प्लेटफ़ॉर्म 13 वर्ष से कम उम्र के बच्चों के लिए नहीं है। हम जानबूझकर बच्चों से डेटा एकत्र नहीं करते。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">7. Changes to this Policy / नीति में बदलाव</h2>
          <p>
            We may update this policy from time to time. Changes will be posted on this page.<br />
            हम समय-समय पर इस नीति को अपडेट कर सकते हैं। बदलाव इस पृष्ठ पर पोस्ट किए जाएंगे。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">8. Contact Us / संपर्क करें</h2>
          <p>
            If you have any questions or concerns, please contact us at <a href="mailto:support@nayiBareilly.in" className="text-emerald-600 underline">support@nayiBareilly.in</a>.<br />
            यदि आपके कोई प्रश्न या चिंता है, तो कृपया <a href="mailto:support@nayiBareilly.in" className="text-emerald-600 underline">support@nayiBareilly.in</a> पर संपर्क करें。
          </p>
        </section>
      </div>
    </PublicLayout>
  )
}
