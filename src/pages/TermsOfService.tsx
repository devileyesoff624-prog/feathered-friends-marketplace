import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container max-w-3xl py-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-6">Terms of Service</h1>
          <div className="prose prose-sm text-muted-foreground space-y-4">
            <p className="text-sm text-muted-foreground">Last updated: March 9, 2026</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">1. Acceptance of Terms</h2>
            <p>By accessing and using Bird Bazaar, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">2. Use of Platform</h2>
            <p>Bird Bazaar is a marketplace for buying and selling birds. You must be at least 18 years old to use this platform. You are responsible for maintaining the confidentiality of your account.</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">3. Listings</h2>
            <p>All listings must comply with local wildlife laws and regulations. Selling protected, endangered, or restricted species is strictly prohibited. We reserve the right to remove any listing that violates our policies.</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">4. Transactions</h2>
            <p>Bird Bazaar facilitates connections between buyers and sellers. We are not responsible for the quality, safety, or legality of items listed. All transactions are between the buyer and seller directly.</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">5. Prohibited Conduct</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Posting false or misleading listings</li>
              <li>Harassing other users</li>
              <li>Attempting to circumvent platform safety measures</li>
              <li>Selling protected or endangered species</li>
              <li>Creating multiple accounts for fraudulent purposes</li>
            </ul>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">6. Account Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms without prior notice.</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">7. Limitation of Liability</h2>
            <p>Bird Bazaar is provided "as is" without warranties. We are not liable for any damages arising from your use of the platform.</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">8. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
