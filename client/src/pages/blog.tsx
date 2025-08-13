import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Calendar, User } from "lucide-react";

export default function Blog() {
  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Mixxl Blog
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the latest news, artist features, and insights from the independent music scene
            </p>
          </div>

          {/* Coming Soon Section */}
          <Card className="bg-gradient-to-r from-orange-500/10 to-pink-600/10 border-orange-500/30 backdrop-blur-sm mb-12">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Coming Soon
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                We're working on bringing you amazing content including artist interviews, 
                industry insights, platform updates, and tips for independent musicians. 
                Stay tuned for our official blog launch!
              </p>
              <Badge className="bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                Blog in Development
              </Badge>
            </CardContent>
          </Card>

          {/* Placeholder Content */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-6">What to Expect</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="w-5 h-5 mr-2 text-orange-400" />
                    Artist Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <p>
                    In-depth interviews and spotlights on independent artists making waves 
                    in the music industry through Mixxl FM.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-pink-400" />
                    Platform Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <p>
                    Latest feature releases, improvements, and announcements about 
                    new tools and capabilities on Mixxl FM.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Industry Insights</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <p>
                    Analysis of music industry trends, streaming economics, and how 
                    independent artists can thrive in the digital age.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Tips & Tutorials</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <p>
                    Practical guides for artists on music production, marketing, 
                    building a fanbase, and maximizing earnings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Newsletter Signup Placeholder */}
          <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm mt-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Get Notified When We Launch
              </h3>
              <p className="text-gray-300 mb-6">
                Be the first to read our latest articles and stay updated with the Mixxl community.
              </p>
              <div className="max-w-md mx-auto">
                <p className="text-sm text-gray-400">
                  Newsletter signup coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}