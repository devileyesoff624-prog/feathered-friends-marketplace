import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container max-w-3xl py-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
          <div className="prose prose-sm text-muted-foreground space-y-4">
            <p className="text-sm text-muted-foreground">Last updated: March 9, 2026</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">1. Information We Collect</h2>
            <p>We collect information you provide when creating an account, including your name, email address, phone number, and city. We also collect listing data and messages you send through the platform.</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To provide and maintain our marketplace service</li>
              <li>To facilitate communication between buyers and sellers</li>
              <li>To send important account notifications</li>
              <li>To enforce our terms and prevent fraud</li>
            </ul>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">3. Information Sharing</h2>
            <p>We do not sell your personal information. Your public profile (display name, city, bio) is visible to other users. Your phone number is only shared with users you interact with through listings.</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information. Messages between users are end-to-end encrypted. However, no method of electronic transmission is 100% secure.</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">5. Your Rights</h2>
            <p>You can update or delete your profile information at any time. You can request deletion of your account by contacting us.</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">6. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use tracking or advertising cookies.</p>

            <h2 className="font-display text-lg font-semibold text-foreground mt-6">7. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
