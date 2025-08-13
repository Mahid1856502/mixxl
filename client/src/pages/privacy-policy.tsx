import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-300">
              Last updated: January 29, 2025
            </p>
          </div>

          <div className="space-y-8">
            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  At Mixxl FM, we collect information you provide directly to us, such as when you create an account, 
                  upload music, or communicate with us. This includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Account information (username, email address, password)</li>
                  <li>Profile information (bio, profile picture, social media links)</li>
                  <li>Music content (tracks, metadata, artwork)</li>
                  <li>Communication data (messages, comments, support requests)</li>
                  <li>Payment information (processed securely through Stripe)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Enable music streaming and social features</li>
                  <li>Communicate with you about your account and our services</li>
                  <li>Protect against fraud and ensure platform security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Information Sharing</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We do not sell, rent, or share your personal information with third parties except:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>With your consent</li>
                  <li>To process payments through Stripe</li>
                  <li>To comply with legal requirements</li>
                  <li>To protect our rights and safety</li>
                  <li>In connection with a business transfer</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Data Security</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encrypted data transmission (HTTPS)</li>
                  <li>Secure password hashing</li>
                  <li>Regular security audits</li>
                  <li>Limited access to personal data</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data</li>
                  <li>Opt out of certain communications</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at privacy@mixxl.fm
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We use cookies and similar technologies to enhance your experience, analyze usage, 
                  and remember your preferences. You can control cookies through your browser settings.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Mixxl FM is not intended for children under 13 years of age. We do not knowingly 
                  collect personal information from children under 13.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="mt-4">
                  <p><strong>Email:</strong> privacy@mixxl.fm</p>
                  <p><strong>Address:</strong> Mixxl FM, [Your Address]</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}