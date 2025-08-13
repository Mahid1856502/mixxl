import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Terms & Conditions
            </h1>
            <p className="text-xl text-gray-300">
              Last updated: January 29, 2025
            </p>
          </div>

          <div className="space-y-8">
            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  By accessing and using Mixxl FM, you accept and agree to be bound by the terms and 
                  provision of this agreement. If you do not agree to these terms, you should not use this service.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Description of Service</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Mixxl FM is an independent music streaming platform that allows artists to upload, 
                  stream, and monetize their music while connecting with fans through various social features including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Music uploading and streaming</li>
                  <li>Live radio broadcasting</li>
                  <li>Real-time messaging and chat</li>
                  <li>Live streaming capabilities</li>
                  <li>Payment processing and tips</li>
                  <li>Social networking features</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">User Accounts</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  To use certain features of Mixxl FM, you must create an account. You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and current information</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Content and Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Artists retain full ownership of their uploaded content. By uploading content to Mixxl FM, you grant us:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>A non-exclusive license to host, stream, and distribute your content</li>
                  <li>The right to use your content for promotional purposes</li>
                  <li>The ability to generate thumbnails and previews</li>
                </ul>
                <p className="mt-4">
                  You represent and warrant that you own or have the necessary rights to all content you upload.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Prohibited Uses</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>You may not use Mixxl FM to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Upload copyrighted material without permission</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Distribute malware or harmful code</li>
                  <li>Engage in fraudulent activities</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Impersonate others or provide false information</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Artists can monetize their content through our platform. Payment terms include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Artists keep 97% of earnings (3% payment processing fee)</li>
                  <li>No platform commission on sales or tips</li>
                  <li>90-day free trial for new artists</li>
                  <li>Monthly subscription of £10 after trial period</li>
                  <li>Payments processed securely through Stripe</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Termination</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We may terminate or suspend your account immediately, without prior notice, for any reason, 
                  including if you breach these Terms. You may also terminate your account at any time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Mixxl FM is provided "as is" without warranties of any kind. We shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Privacy</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs 
                  your use of the service, to understand our practices.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                  we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about these Terms & Conditions, please contact us at:
                </p>
                <div className="mt-4">
                  <p><strong>Email:</strong> legal@mixxl.fm</p>
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