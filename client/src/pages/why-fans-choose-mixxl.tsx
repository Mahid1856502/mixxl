import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Radio, 
  MessageCircle, 
  Users, 
  Music, 
  Star,
  Play,
  ArrowRight,
  PoundSterling,
  Gift,
  Video,
  Headphones,
  Globe
} from "lucide-react";
import { Link } from "wouter";

const fanBenefits = [
  {
    icon: Gift,
    title: "Free Forever",
    description: "Discover and stream music without any subscription fees or hidden costs",
    color: "text-green-400",
    bgGradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    icon: Heart,
    title: "Support Local Artists",
    description: "Every stream, tip, and purchase directly supports independent musicians",
    color: "text-pink-400", 
    bgGradient: "from-pink-500/20 to-red-500/20"
  },
  {
    icon: PoundSterling,
    title: "Artists Keep 97%",
    description: "Your support goes directly to artists - only payment processing fees deducted",
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 to-orange-500/20"
  },
  {
    icon: MessageCircle,
    title: "Message Artists",
    description: "Connect directly with your favorite musicians through private messaging",
    color: "text-blue-400",
    bgGradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    icon: Users,
    title: "Live Chat Community",
    description: "Join real-time conversations with other music lovers during radio sessions",
    color: "text-purple-400",
    bgGradient: "from-purple-500/20 to-indigo-500/20"
  },
  {
    icon: Radio,
    title: "Independent Radio",
    description: "24/7 radio playing only independent artists from the Mixxl community",
    color: "text-orange-400",
    bgGradient: "from-orange-500/20 to-red-500/20"
  },
  {
    icon: Video,
    title: "Watch Artists Go Live",
    description: "Experience intimate live performances and support artists with real-time tips",
    color: "text-teal-400",
    bgGradient: "from-teal-500/20 to-green-500/20"
  },
  {
    icon: Globe,
    title: "Discover New Music",
    description: "Find your next favorite artist from a global community of independent musicians",
    color: "text-indigo-400",
    bgGradient: "from-indigo-500/20 to-purple-500/20"
  }
];

const communityFeatures = [
  {
    title: "Real-Time Radio Chat",
    description: "Chat with other fans while discovering new music together",
    icon: MessageCircle
  },
  {
    title: "Artist Live Streams",
    description: "Watch exclusive live performances and acoustic sessions",
    icon: Video
  },
  {
    title: "Direct Artist Support",
    description: "Send tips and purchase tracks knowing artists get maximum benefit",
    icon: Heart
  },
  {
    title: "Curated Playlists",
    description: "Create and share playlists featuring your favorite independent artists",
    icon: Music
  }
];

export default function WhyFansChooseMixxl() {
  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            Fan-First Experience
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Fans Choose Mixxl
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join a community where music lovers discover incredible independent artists 
            and directly support the creators they love - completely free.
          </p>
        </div>

        {/* Main Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {fanBenefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card key={index} className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${benefit.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 ${benefit.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-300 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Supporting Artists Section */}
        <Card className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border-pink-500/30 backdrop-blur-sm mb-16">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Your Support Makes a Real Difference
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Unlike other platforms that take huge cuts, Mixxl ensures artists keep 97% of what you spend. 
              No platform commission means your support goes directly to the creators you love.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">97%</div>
                <p className="text-gray-300">Artists keep of your support</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">0%</div>
                <p className="text-gray-300">Platform commission taken</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">3%</div>
                <p className="text-gray-300">Only payment processing fees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Join the Music Community
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Connect with artists and fellow music lovers in ways other platforms don't offer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {communityFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
                  <CardContent className="p-8 flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Live Experience Section */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-600/10 border-purple-500/30 backdrop-blur-sm mb-16">
          <CardContent className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-red-500 text-white">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  LIVE
                </Badge>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Experience Live Music Like Never Before
                </h2>
                <p className="text-gray-300 mb-6">
                  Watch artists perform live from their studios, homes, or venues. 
                  Chat with other fans, request songs, and support artists with real-time tips during their performances.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Interactive live chat during streams</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Send tips and support in real-time</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Request songs and interact with artists</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Exclusive acoustic sessions and performances</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-80 h-48 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <div className="text-center">
                    <Video className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-300">Live streaming experience</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Radio Section */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-pink-600/10 border-orange-500/30 backdrop-blur-sm mb-16">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Radio className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              24/7 Independent Music Radio
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Discover new music constantly with our community radio that exclusively plays 
              tracks from independent artists on Mixxl. Chat with other listeners and discover your next favorite song.
            </p>
            <Link href="/radio">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold">
                <Headphones className="w-5 h-5 mr-2" />
                Listen to Radio
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border-pink-500/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Discover Amazing Music?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of music lovers who support independent artists while discovering incredible new music every day.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  Join as Fan - Free Forever
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              
              <Link href="/discover">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-pink-500 text-pink-400 hover:bg-pink-500/10 px-8 py-3 text-lg"
                >
                  Discover Music Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}